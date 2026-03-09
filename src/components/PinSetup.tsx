import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, AlertTriangle, Unlock, Loader } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { hashPin, deriveKeyFromPin } from '../services/crypto'
import './PinSetup.css'

export interface PinSetupProps {
  /** true = first-time setup (show confirm field); false = verification only */
  isSetup: boolean
  /** User UID used as salt for key derivation */
  userId: string
  /** For verification mode: stored hash to compare against */
  storedPinHash?: string
  /** For verification mode: stored salt used when the PIN was set */
  storedPinSalt?: string
  /** Called on success with the derived CryptoKey */
  onSuccess: (encryptionKey: CryptoKey) => void
  /** Optional: called to provide salt + hash to parent during setup */
  onSetup?: (pinSalt: string, pinHash: string) => void
}

/** Generate a random id for the salt (matches original generateId logic). */
function generateSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function PinSetup({
  isSetup,
  userId,
  storedPinHash,
  storedPinSalt,
  onSuccess,
  onSetup,
}: PinSetupProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { language } = useLanguage()
  const en = language === 'en'

  const pinRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => pinRef.current?.focus(), 300)
    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit() {
    setError('')

    // Validate length
    if (pin.length < 4 || pin.length > 6) {
      setError(en ? 'PIN must be 4-6 digits' : 'পিন ৪-৬ সংখ্যার হতে হবে')
      return
    }

    // Validate digits only
    if (!/^\d+$/.test(pin)) {
      setError(en ? 'PIN must contain only numbers' : 'পিনে শুধু সংখ্যা থাকতে হবে')
      return
    }

    setLoading(true)

    try {
      if (isSetup) {
        /* ── Setup mode ── */
        if (pin !== confirmPin) {
          setError(en ? 'PINs do not match' : 'পিন মেলেনি')
          setLoading(false)
          return
        }

        const pinSalt = generateSalt()
        const pinHashValue = await hashPin(pin, pinSalt)
        const encryptionKey = await deriveKeyFromPin(pin, userId)

        onSetup?.(pinSalt, pinHashValue)
        onSuccess(encryptionKey)
      } else {
        /* ── Verify mode ── */
        if (!storedPinSalt || !storedPinHash) {
          setError(en ? 'An error occurred' : 'একটি ত্রুটি হয়েছে')
          setLoading(false)
          return
        }

        const pinHashValue = await hashPin(pin, storedPinSalt)

        if (pinHashValue !== storedPinHash) {
          setError(en ? 'Incorrect PIN' : 'ভুল পিন')
          setPin('')
          pinRef.current?.focus()
          setLoading(false)
          return
        }

        const encryptionKey = await deriveKeyFromPin(pin, userId)
        onSuccess(encryptionKey)
      }
    } catch (err) {
      console.error('PIN operation failed:', err)
      setError(en ? 'An error occurred' : 'একটি ত্রুটি হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  function handlePinKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (isSetup && confirmRef.current) {
        confirmRef.current.focus()
      } else {
        handleSubmit()
      }
    }
  }

  function handleConfirmKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="pin-overlay">
      <div className="pin-modal">
        <div className="pin-modal-body">
          {/* Icon */}
          <div className="pin-icon">
            <ShieldCheck size={40} />
          </div>

          {/* Title */}
          <h2 className="pin-title">
            {isSetup ? (
              <>
                <span className="lang-en">Set up Security PIN</span>
                <span className="lang-bn">সিকিউরিটি পিন সেট করুন</span>
              </>
            ) : (
              <>
                <span className="lang-en">Enter Security PIN</span>
                <span className="lang-bn">সিকিউরিটি পিন দিন</span>
              </>
            )}
          </h2>

          {/* Subtitle */}
          <p className="pin-subtitle">
            {isSetup ? (
              <>
                <span className="lang-en">
                  Create a 4-6 digit PIN to encrypt your files. You'll need this
                  PIN every time you access your files.
                </span>
                <span className="lang-bn">
                  আপনার ফাইল এনক্রিপ্ট করতে ৪-৬ সংখ্যার পিন তৈরি করুন। প্রতিবার
                  ফাইল অ্যাক্সেস করতে এই পিন লাগবে।
                </span>
              </>
            ) : (
              <>
                <span className="lang-en">
                  Enter your PIN to decrypt and access your files.
                </span>
                <span className="lang-bn">
                  আপনার ফাইল ডিক্রিপ্ট ও অ্যাক্সেস করতে পিন দিন।
                </span>
              </>
            )}
          </p>

          {/* PIN input */}
          <div className="pin-input-wrapper">
            <input
              ref={pinRef}
              type="password"
              className="pin-input"
              maxLength={6}
              placeholder="••••••"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={handlePinKeyDown}
            />
          </div>

          {/* Confirm PIN (setup only) */}
          {isSetup && (
            <div className="pin-input-wrapper">
              <input
                ref={confirmRef}
                type="password"
                className="pin-input"
                maxLength={6}
                placeholder={en ? 'Confirm PIN' : 'পিন নিশ্চিত করুন'}
                inputMode="numeric"
                autoComplete="off"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                onKeyDown={handleConfirmKeyDown}
              />
            </div>
          )}

          {/* Warning */}
          <div className="pin-warning">
            <AlertTriangle size={18} />
            <span>
              <strong className="lang-en">Important: </strong>
              <strong className="lang-bn">গুরুত্বপূর্ণ: </strong>
              <span className="lang-en">
                Don't forget this PIN! If lost, your encrypted files cannot be
                recovered.
              </span>
              <span className="lang-bn">
                এই পিন ভুলবেন না! হারিয়ে গেলে আপনার এনক্রিপ্টেড ফাইল পুনরুদ্ধার
                করা যাবে না।
              </span>
            </span>
          </div>

          {/* Error */}
          {error && <div className="pin-error">{error}</div>}

          {/* Submit */}
          <button
            className="pin-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader size={18} className="spinner" /> : <Unlock size={18} />}
            {isSetup ? (
              <>
                <span className="lang-en">{loading ? 'Processing…' : 'Set PIN & Continue'}</span>
                <span className="lang-bn">{loading ? 'প্রসেস হচ্ছে…' : 'পিন সেট করুন ও চালিয়ে যান'}</span>
              </>
            ) : (
              <>
                <span className="lang-en">{loading ? 'Processing…' : 'Unlock Files'}</span>
                <span className="lang-bn">{loading ? 'প্রসেস হচ্ছে…' : 'ফাইল আনলক করুন'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
