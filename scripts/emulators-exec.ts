// Runs a tsx command under `firebase emulators:exec` and exits with that command's own code
// (M1.20b). Usage: tsx scripts/emulators-exec.ts --only <emulators> -- <tsx arguments...>
// e.g. `--only firestore,storage -- --test tests/rules/a.test.ts` runs `tsx --test ...`.
//
// Why: firebase-tools 15 awaits its usage tracking with a 5s timeout after the script has
// exited (lib/command.js, utils.withTimeout); when that times out it reports "An unexpected
// error has occurred" and exits 2, even though every test passed. So the inner command records
// its exit code in a file, and this script exits with the recorded code. Only a firebase failure
// with no recorded code (the emulators did not start, or the script never ran) fails as itself.
// The command and the result travel in a temp folder (EMULATORS_EXEC_DIR), not on the inner
// command line, which firebase runs through a shell: no quoting on any platform.
//
// Interrupts. Ctrl+C reaches every process in the console: this script then waits for firebase
// to stop its emulators (no-op listeners, and an async spawn: tsx's own CLI process kills a child
// whose event loop cannot answer the signal), removes the folder and exits non-zero. Ctrl+Break
// kills tsx's and npm's processes, and Windows takes their children with them, this one included:
// so each run first removes the folders of runs whose process is gone (the pid is in the name).
import { spawn } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");
const self = fileURLToPath(import.meta.url);
const tag = "[emulators-exec]";

let interrupted: string | undefined;
for (const signal of ["SIGINT", "SIGBREAK"] as const) {
  process.on(signal, () => {
    interrupted ??= signal;
  });
}

function spawnNode(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: "inherit",
      env,
    });
    child.on("error", (error) => {
      console.error(`${tag} ${error.message}`);
      resolve(1);
    });
    // A signal (code null) counts as a failure.
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0); // signal 0: an existence check, nothing is sent
    return true;
  } catch (error) {
    // EPERM: it exists but belongs to someone else.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function main(): Promise<number> {
  const dir = process.env.EMULATORS_EXEC_DIR;
  const args = process.argv.slice(2);

  if (args[0] === "--inner" && dir) {
    // Inside emulators:exec: run the command, record its code, exit with it.
    const command = JSON.parse(
      readFileSync(join(dir, "command.json"), "utf8"),
    ) as string[];
    const status = await spawnNode([tsxCli, ...command]);
    try {
      writeFileSync(join(dir, "result.json"), JSON.stringify({ status }));
    } catch {
      // The folder is gone: firebase stopped on Ctrl+C without waiting for this command, and
      // the outer run has already cleaned up and exited non-zero.
    }
    return status;
  }

  const split = args.indexOf("--");
  const onlyAt = args.indexOf("--only");
  const only = onlyAt >= 0 && onlyAt < split ? args[onlyAt + 1] : undefined;
  if (split < 0 || !only || split === args.length - 1) {
    console.error(
      `${tag} usage: tsx scripts/emulators-exec.ts --only <emulators> -- <tsx arguments...>`,
    );
    return 1;
  }

  // Folders left by a killed run: starflames-emulators-exec-<pid>-*, that pid no longer running.
  const prefix = "starflames-emulators-exec-";
  for (const name of readdirSync(tmpdir())) {
    const pid = Number(new RegExp(`^${prefix}(\\d+)-`).exec(name)?.[1]);
    if (pid && !isRunning(pid)) {
      rmSync(join(tmpdir(), name), { recursive: true, force: true });
    }
  }
  const work = mkdtempSync(join(tmpdir(), `${prefix}${process.pid}-`));
  writeFileSync(
    join(work, "command.json"),
    JSON.stringify(args.slice(split + 1)),
  );
  // Absolute, quoted paths: firebase runs this line through a shell (cmd.exe on Windows),
  // and the Node path may contain spaces.
  const inner = `"${process.execPath}" "${tsxCli}" "${self}" --inner`;
  const firebase = await spawnNode(
    [
      require.resolve("firebase-tools/lib/bin/firebase.js"),
      "emulators:exec",
      "--project",
      "demo-starflames",
      "--only",
      only,
      inner,
    ],
    { ...process.env, EMULATORS_EXEC_DIR: work },
  );

  let recorded: number | undefined;
  try {
    const result = JSON.parse(
      readFileSync(join(work, "result.json"), "utf8"),
    ) as { status: number };
    recorded = result.status;
  } catch {
    recorded = undefined; // the command never finished
  }
  rmSync(work, { recursive: true, force: true });

  if (interrupted) {
    // The first non-zero of the recorded code and firebase's; never 0.
    const status = [recorded, firebase].find((s) => s !== undefined && s !== 0);
    console.error(
      `${tag} interrupted (${interrupted}); command ${recorded ?? "unrecorded"}, ` +
        `firebase ${firebase}`,
    );
    return status ?? 1;
  }
  if (recorded === undefined) {
    console.error(
      `${tag} firebase exited ${firebase} before the command recorded a result`,
    );
    return firebase === 0 ? 1 : firebase;
  }
  if (firebase !== 0 && recorded === 0) {
    console.log(
      `${tag} the command passed; firebase exited ${firebase} after it ` +
        "(its usage-tracking timeout, see this script's header), so that exit is ignored",
    );
  }
  return recorded;
}

main().then(
  (status) => process.exit(status),
  (error: unknown) => {
    console.error(`${tag} ${String(error)}`);
    process.exit(1);
  },
);
