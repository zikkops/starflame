// Preloaded (NODE_OPTIONS=--import) by the seed CLI test for a host that isn't loopback
// (tests/seed/seed.test.ts): any DNS lookup prints a marker to stderr and throws, so the test
// can show that the seed refused the host before resolving it. Node only.
import dns from "node:dns";

function refuse(name) {
  return (hostname) => {
    process.stderr.write(`[forbid-dns] ${name} ${String(hostname)}\n`);
    throw new Error(`forbid-dns: ${name} ${String(hostname)}`);
  };
}

dns.lookup = refuse("lookup");
dns.resolve = refuse("resolve");
dns.resolve4 = refuse("resolve4");
dns.resolve6 = refuse("resolve6");
dns.promises.lookup = refuse("promises.lookup");
dns.promises.resolve = refuse("promises.resolve");
