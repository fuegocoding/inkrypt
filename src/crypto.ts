const SALT_NAME = 'inkrypt-salt'
const CHECK_NAME = 'inkrypt-check'
let cachedKey: CryptoKey | null = null

function strToUint8(str: string): Uint8Array {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

function uint8ToStr(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8))
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const passKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey', 'deriveBits']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function digestKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey('raw', key)
  const hash = await crypto.subtle.digest('SHA-256', raw)
  return new Uint8Array(hash)
}

export async function initKey(passphrase: string): Promise<boolean> {
  const saltStr = localStorage.getItem(SALT_NAME)
  const checkStr = localStorage.getItem(CHECK_NAME)

  if (saltStr && checkStr) {
    const salt = strToUint8(saltStr)
    const key = await deriveKey(passphrase, salt)
    const hash = uint8ToStr(await digestKey(key))
    if (hash !== checkStr) {
      return false
    }
    cachedKey = key
    return true
  }

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(passphrase, salt)
  const hash = await digestKey(key)
  localStorage.setItem(SALT_NAME, uint8ToStr(salt))
  localStorage.setItem(CHECK_NAME, uint8ToStr(hash))
  cachedKey = key
  return true
}

async function getKey(): Promise<CryptoKey> {
  if (!cachedKey) throw new Error('Key not initialized')
  return cachedKey
}

export async function encryptText(text: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(text)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const result = new Uint8Array(iv.length + cipher.byteLength)
  result.set(iv)
  result.set(new Uint8Array(cipher), iv.length)
  return uint8ToStr(result)
}

export async function decryptText(payload: string): Promise<string> {
  const bytes = strToUint8(payload)
  const iv = bytes.slice(0, 12)
  const cipher = bytes.slice(12)
  const key = await getKey()
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
  return new TextDecoder().decode(plain)
}
