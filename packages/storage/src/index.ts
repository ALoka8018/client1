export interface StorageDriver {
  put(key: string, data: Buffer | Uint8Array): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

export class InMemoryStorage implements StorageDriver {
  private store = new Map<string, Buffer>();

  async put(key: string, data: Buffer | Uint8Array): Promise<void> {
    this.store.set(key, Buffer.from(data));
  }

  async get(key: string): Promise<Buffer | null> {
    return this.store.get(key) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
