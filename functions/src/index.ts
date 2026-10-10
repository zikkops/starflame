import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";

// Cap scale-out for every function in this codebase (cost guard).
setGlobalOptions({ maxInstances: 10 });

/**
 * Liveness probe. Returns a constant body: no Firestore, Auth, env or request data.
 * `cors: false` stops the emulator from reflecting any Origin, so it matches production.
 */
export const health = onRequest({ cors: false }, (req, res) => {
  if (req.method !== "GET") {
    res.set("Allow", "GET").status(405).end();
    return;
  }
  res.set("Cache-Control", "no-store").json({ status: "ok" });
});
