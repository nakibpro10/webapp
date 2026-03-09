/**
 * Derive an AES-GCM encryption key from a PIN using PBKDF2.
 */
export async function deriveKeyFromPin(
  pin: string,
  salt: string
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-GCM.
 * Prepends the 12-byte IV to the ciphertext.
 */
export async function encryptData(
  data: Blob | ArrayBuffer,
  encryptionKey: CryptoKey
): Promise<Blob> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const buffer = data instanceof Blob ? await data.arrayBuffer() : data

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    buffer
  )

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  return new Blob([combined], { type: 'application/octet-stream' })
}

/**
 * Decrypt an AES-GCM encrypted blob.
 * Expects the first 12 bytes to be the IV.
 */
export async function decryptData(
  encryptedBlob: Blob,
  encryptionKey: CryptoKey
): Promise<Blob> {
  const buffer = await encryptedBlob.arrayBuffer()
  const iv = buffer.slice(0, 12)
  const data = buffer.slice(12)

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      encryptionKey,
      data
    )
    return new Blob([decryptedBuffer])
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Decryption failed. Wrong PIN?')
  }
}

/**
 * Hash a PIN with a salt using SHA-256 and return hex string.
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(pin + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
