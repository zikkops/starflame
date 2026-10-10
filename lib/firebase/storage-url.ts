import { readPublicFirebaseEnv, type PublicFirebaseEnv } from "./env.public";

/**
 * Public URL of a Storage object, e.g. a ProductImage.storagePath. Documents store the path,
 * never a URL, so one data set works against the emulator and, later, production.
 * Both forms use the Storage REST API with public read rules (M1.5), so no download token:
 *   emulator:   http://<NEXT_PUBLIC_STORAGE_EMULATOR_HOST>/v0/b/<bucket>/o/<path>?alt=media
 *   production: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?alt=media
 * The production branch arrives with the production web config: readPublicFirebaseEnv() only
 * accepts demo projects (emulators) until the user approves a real one.
 */
export function storageObjectUrl(
  storagePath: string,
  env: PublicFirebaseEnv = readPublicFirebaseEnv(),
): string {
  const { host, port } = env.emulators.storage;
  const bucket = encodeURIComponent(env.storageBucket);
  const object = encodeURIComponent(storagePath);
  return `http://${host}:${port}/v0/b/${bucket}/o/${object}?alt=media`;
}
