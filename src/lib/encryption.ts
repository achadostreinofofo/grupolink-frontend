// RSA-OAEP client-side encryption for sensitive fields (password, CPF).
// The public key is cached per session. If the backend restarts (new key pair),
// the cache is automatically invalidated and the key is re-fetched.

let cachedKey: CryptoKey | null = null

async function fetchAndCacheKey(): Promise<CryptoKey> {
  cachedKey = null

  const res = await fetch('/api/security/public-key', { cache: 'no-store' })
  if (!res.ok) throw new Error('Falha ao obter chave de criptografia')

  const { publicKey } = await res.json() as { publicKey: string }
  const binary = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))

  cachedKey = await crypto.subtle.importKey(
    'spki',
    binary.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )

  return cachedKey
}

async function loadPublicKey(): Promise<CryptoKey> {
  return cachedKey ?? fetchAndCacheKey()
}

export async function encryptField(plaintext: string): Promise<string> {
  const key = await loadPublicKey()
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoded)
  const bytes = new Uint8Array(encrypted)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function clearPublicKeyCache(): void {
  cachedKey = null
}
