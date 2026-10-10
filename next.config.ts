import type { NextConfig } from "next";

type ImagesConfig = NonNullable<NextConfig["images"]>;

/**
 * Lets next/image optimise product images from the Storage emulator (lib/firebase/storage-url.ts
 * builds http://<host>:<port>/v0/b/<bucket>/o/<path>?alt=media). Only for a demo-* project with
 * NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true (M1.4 §1 Images, M1.6): the emulator listens on a
 * loopback IP, which Next 16 refuses to fetch from unless `dangerouslyAllowLocalIP` is true, so a
 * real project can never carry that flag. Next loads .env.local before this file (dev, build,
 * start). The production bucket's pattern arrives with the production web config.
 */
function storageEmulatorImages(
  env: NodeJS.ProcessEnv = process.env,
): Pick<ImagesConfig, "remotePatterns" | "dangerouslyAllowLocalIP"> {
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const match = /^([A-Za-z0-9.-]+):(\d{1,5})$/.exec(
    env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST?.trim() ?? "",
  );
  const [, hostname, port] = match ?? [];
  if (
    !projectId.startsWith("demo-") ||
    env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== "true" ||
    !hostname ||
    !port
  ) {
    return {};
  }
  return {
    remotePatterns: [
      {
        protocol: "http",
        hostname,
        port,
        pathname: `/v0/b/${projectId}.appspot.com/o/**`,
        search: "?alt=media",
      },
    ],
    dangerouslyAllowLocalIP: true,
  };
}

const nextConfig: NextConfig = {
  // Stop `next dev` from generating AGENTS.md in the repo root.
  agentRules: false,
  // `next dev` started without --hostname allows only localhost: let pages
  // opened at http://127.0.0.1 load HMR and the other dev-only endpoints too.
  allowedDevOrigins: ["127.0.0.1"],
  images: storageEmulatorImages(),
};

export default nextConfig;
