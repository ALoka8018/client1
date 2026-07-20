import { Storage } from "@google-cloud/storage";
import type {
  GetUrlOptions,
  StorageDriver,
  UploadOptions,
  UploadResult,
} from "./index.js";

const DEFAULT_SIGNED_URL_TTL_SECONDS = 15 * 60;

export interface GcsStorageConfig {
  projectId: string;
  bucketName: string;
  /** Parsed service-account key JSON (client_email + private_key). */
  credentials: { client_email: string; private_key: string };
}

export class GcsStorage implements StorageDriver {
  private bucket;

  constructor(config: GcsStorageConfig) {
    const storage = new Storage({
      projectId: config.projectId,
      credentials: config.credentials,
    });
    this.bucket = storage.bucket(config.bucketName);
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const file = this.bucket.file(key);
    await file.save(Buffer.from(data), {
      contentType: options?.contentType,
      resumable: false,
    });
    return { key, url: await this.getUrl(key) };
  }

  async getUrl(key: string, options?: GetUrlOptions): Promise<string> {
    const signed = options?.signed ?? true;
    const file = this.bucket.file(key);

    if (!signed) {
      return `https://storage.googleapis.com/${this.bucket.name}/${key}`;
    }

    const expiresInSeconds =
      options?.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS;
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  }

  async delete(key: string): Promise<void> {
    await this.bucket.file(key).delete({ ignoreNotFound: true });
  }
}
