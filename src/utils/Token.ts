const fs = require('uxp').storage.localFileSystem;
export function GetTokenFor(key: string) {
  const savedToken = localStorage.getItem(key);
  return new Promise(async (resolve, reject) => {
    if (!savedToken) {
      reject('Not Exist');
      return null;
    }
    const newToken = await fs.getEntryForPersistentToken(savedToken);
    newToken.isFolder ? resolve(newToken) : reject('cant do that');
  });
}
export async function PickFolderFor(key: string) {
  return new Promise(async (resolve, reject) => {
    const fo_result = await fs.getFolder();
    const _token = await fs.createPersistentToken(fo_result);
    localStorage.setItem(key, _token);

    resolve(fo_result);
  });
}
