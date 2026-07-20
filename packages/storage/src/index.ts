export interface UploadOptions {
  contentType?: string;
}

export interface GetUrlOptions {
  /** Defaults to true — every object is private, so a signed URL is the normal way to read it back. */
  signed?: boolean;
  expiresInSeconds?: number;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface StorageDriver {
  upload(
    key: string,
    data: Buffer | Uint8Array,
    options?: UploadOptions,
  ): Promise<UploadResult>;
  getUrl(key: string, options?: GetUrlOptions): Promise<string>;
  delete(key: string): Promise<void>;
}

export class InMemoryStorage implements StorageDriver {
  private store = new Map<string, { data: Buffer; contentType?: string }>();

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    this.store.set(key, {
      data: Buffer.from(data),
      contentType: options?.contentType,
    });
    return { key, url: await this.getUrl(key) };
  }

  async getUrl(key: string): Promise<string> {
    if (!this.store.has(key)) {
      throw new Error(`No object stored for key "${key}"`);
    }
    return `memory://${key}`;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export { GcsStorage } from "./gcs.js";
export { createStorageDriver } from "./factory.js";
