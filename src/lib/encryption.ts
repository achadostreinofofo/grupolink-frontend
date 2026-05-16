// RSA-OAEP client-side encryption for sensitive fields (password, CPF)
// Public key is fetched once per session and cached in memory.
// Even if TLS is the primary transport security, encrypting at the payload
// level means the plaintext never appears in server logs or intermediary layers.

let cachedKey: CryptoKey | null = null

async function loadPublicKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey

  const res = await fetch('/api/security/public-key')
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

export async function encryptField(plaintext: string): Promise<string> {
  const key = await loadPublicKey()
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoded)
  const bytes = new Uint8Array(encrypted)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

/** Call this when the user logs out or the page key should be invalidated. */
export function clearPublicKeyCache(): void {
  cachedKey = null
}
