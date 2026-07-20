import "dotenv/config";
import { createStorageDriver } from "@repo/storage";

const driver = createStorageDriver();
const key = `storage-smoke-test/${Date.now()}.txt`;
const body = Buffer.from(`GCS round-trip check at ${new Date().toISOString()}`);

console.log("Driver:", driver.constructor.name);

const { url: uploadUrl } = await driver.upload(key, body, {
  contentType: "text/plain",
});
console.log("Uploaded:", key);

const signedUrl = await driver.getUrl(key, { expiresInSeconds: 60 });
console.log("Signed URL:", signedUrl);

const res = await fetch(signedUrl);
if (!res.ok) {
  throw new Error(`Signed URL fetch failed: ${res.status} ${res.statusText}`);
}
const text = await res.text();
if (text !== body.toString()) {
  throw new Error(
    `Round-trip mismatch. Expected "${body}" got "${text}"`,
  );
}
console.log("Round-trip content matches.");

await driver.delete(key);
console.log("Deleted:", key);

const afterDelete = await fetch(signedUrl);
console.log(
  "Fetch after delete:",
  afterDelete.status,
  afterDelete.ok ? "(unexpected — object still exists)" : "(expected 404)",
);
