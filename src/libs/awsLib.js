import { Storage } from "aws-amplify";

export async function s3FileUpload(file) {
  const filename = `${Date.now()}-${file.name}`;

  const stored = await Storage.vault.put(filename, file, {
    contentType: file.type
  });

  return stored.key;
}

export async function s3BlobUpload(fileName, blobData, fileType) {
  const fname = `${Date.now()}-${fileName}`;

  const stored = await Storage.vault.put(fname, blobData, fileType);

  return stored.key;
}

export async function s3Remove(fileName) {

  const result = await Storage.vault.remove(fileName);

  return result;
}

