export async function getEncryptionKey(): Promise<CryptoKey> {
  const storedSalt = localStorage.getItem('encryptionSalt');
  const storedHash = localStorage.getItem('passphraseHash');
  let passphrase: string | null = null;
  let salt: Uint8Array;

  if (!storedSalt) {
    passphrase = prompt('Set a passphrase for encryption:') || '';
    salt = crypto.getRandomValues(new Uint8Array(16));
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...new TextEncoder().encode(passphrase)])
    );
    localStorage.setItem('encryptionSalt', arrayBufferToBase64(salt.buffer));
    localStorage.setItem('passphraseHash', arrayBufferToBase64(hashBuffer));
  } else {
    salt = base64ToUint8Array(storedSalt);
    passphrase = prompt('Enter your passphrase:') || '';
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...new TextEncoder().encode(passphrase)])
    );
    if (storedHash && arrayBufferToBase64(hashBuffer) !== storedHash) {
      throw new Error('Incorrect passphrase');
    }
  }

  return deriveKey(passphrase, salt);
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
