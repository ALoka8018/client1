import { GcsStorage } from "./gcs.js";
import { InMemoryStorage, type StorageDriver } from "./index.js";

let cached: StorageDriver | undefined;

/**
 * Uses GCS when GCS_PROJECT_ID/GCS_BUCKET_NAME/GCS_CREDENTIALS_JSON are set,
 * otherwise falls back to in-memory storage (local dev / tests without credentials).
 */
export function createStorageDriver(): StorageDriver {
  if (cached) return cached;

  const projectId = process.env.GCS_PROJECT_ID;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const credentialsJson = process.env.GCS_CREDENTIALS_JSON;

  if (!projectId || !bucketName || !credentialsJson) {
    cached = new InMemoryStorage();
    return cached;
  }

  const credentials = JSON.parse(
    Buffer.from(credentialsJson, "base64").toString("utf8"),
  ) as { client_email: string; private_key: string };

  cached = new GcsStorage({ projectId, bucketName, credentials });
  return cached;
}
