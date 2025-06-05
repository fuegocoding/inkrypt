const KEY_NAME = 'inkrypt-key'

function strToUint8(str: string): Uint8Array {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

function uint8ToStr(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8))
}

async function getKey(): Promise<CryptoKey> {
  const existing = localStorage.getItem(KEY_NAME)
  if (existing) {
    const raw = strToUint8(existing)
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const raw = await crypto.subtle.exportKey('raw', key)
  localStorage.setItem(KEY_NAME, uint8ToStr(new Uint8Array(raw)))
  return key
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
