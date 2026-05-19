import { encryptField, clearPublicKeyCache } from '../encryption'

const mockEncryptedBuffer = new Uint8Array([72, 101, 108, 108, 111]).buffer

const mockCryptoKey = {} as CryptoKey

const mockCrypto = {
  subtle: {
    importKey: jest.fn().mockResolvedValue(mockCryptoKey),
    encrypt: jest.fn().mockResolvedValue(mockEncryptedBuffer),
  },
}

Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
  writable: true,
})

const mockPublicKey = btoa('fake-rsa-public-key-bytes')

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.clearAllMocks()
  clearPublicKeyCache()
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ publicKey: mockPublicKey }),
  })
})

describe('clearPublicKeyCache', () => {
  it('clears the cached key forcing a new fetch on next encryptField call', async () => {
    await encryptField('test')
    expect(mockFetch).toHaveBeenCalledTimes(1)

    clearPublicKeyCache()

    await encryptField('test2')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('encryptField', () => {
  it('fetches the public key on first call', async () => {
    await encryptField('password123')
    expect(mockFetch).toHaveBeenCalledWith('/api/security/public-key', { cache: 'no-store' })
  })

  it('reuses cached key on subsequent calls', async () => {
    await encryptField('first')
    await encryptField('second')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('imports key with RSA-OAEP SHA-256', async () => {
    await encryptField('test')
    expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
      'spki',
      expect.any(ArrayBuffer),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    )
  })

  it('encrypts with RSA-OAEP and the cached key', async () => {
    await encryptField('my-password')
    expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
      { name: 'RSA-OAEP' },
      mockCryptoKey,
      expect.anything()
    )
  })

  it('returns a base64 encoded string', async () => {
    const result = await encryptField('test')
    expect(typeof result).toBe('string')
    expect(() => atob(result)).not.toThrow()
  })

  it('throws when public key fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(encryptField('test')).rejects.toThrow('Falha ao obter chave de criptografia')
  })
})
