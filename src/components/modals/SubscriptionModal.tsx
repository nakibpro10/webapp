import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { X, Crown, Check } from 'lucide-react'
import './modals.css'

interface Plan {
  id: string
  storage: string
  priceEn: string
  priceBn: string
  popular?: boolean
  features: { en: string; bn: string }[]
}

const PLANS: Plan[] = [
  {
    id: '1tb',
    storage: '1 TB',
    priceEn: '৳1,500/yr',
    priceBn: '৳১,৫০০/বছর',
    features: [
      { en: '1 TB Storage', bn: '১ টিবি স্টোরেজ' },
      { en: 'End-to-end encryption', bn: 'এন্ড-টু-এন্ড এনক্রিপশন' },
      { en: 'Priority support', bn: 'অগ্রাধিকার সহায়তা' },
    ],
  },
  {
    id: '2tb',
    storage: '2 TB',
    priceEn: '৳2,200/yr',
    priceBn: '৳২,২০০/বছর',
    popular: true,
    features: [
      { en: '2 TB Storage', bn: '২ টিবি স্টোরেজ' },
      { en: 'End-to-end encryption', bn: 'এন্ড-টু-এন্ড এনক্রিপশন' },
      { en: 'Priority support', bn: 'অগ্রাধিকার সহায়তা' },
      { en: 'Family sharing (5)', bn: 'পরিবার শেয়ারিং (৫)' },
    ],
  },
  {
    id: '3tb',
    storage: '3 TB',
    priceEn: '৳3,000/yr',
    priceBn: '৳৩,০০০/বছর',
    features: [
      { en: '3 TB Storage', bn: '৩ টিবি স্টোরেজ' },
      { en: 'End-to-end encryption', bn: 'এন্ড-টু-এন্ড এনক্রিপশন' },
      { en: 'Priority support', bn: 'অগ্রাধিকার সহায়তা' },
      { en: 'Family sharing (5)', bn: 'পরিবার শেয়ারিং (৫)' },
    ],
  },
  {
    id: '5tb',
    storage: '5 TB',
    priceEn: '৳3,700/yr',
    priceBn: '৳৩,৭০০/বছর',
    features: [
      { en: '5 TB Storage', bn: '৫ টিবি স্টোরেজ' },
      { en: 'End-to-end encryption', bn: 'এন্ড-টু-এন্ড এনক্রিপশন' },
      { en: 'Priority support', bn: 'অগ্রাধিকার সহায়তা' },
      { en: 'Family sharing (10)', bn: 'পরিবার শেয়ারিং (১০)' },
    ],
  },
]

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
}

export default function SubscriptionModal({ open, onClose }: SubscriptionModalProps) {
  const { language } = useLanguage()
  const en = language === 'en'
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <div
      className={`modal-overlay${open ? ' active' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal" style={{ maxWidth: 600 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #FFC107, #FF9800)', color: 'white' }}>
          <Crown size={28} />
        </div>

        <h2 className="modal-title">
          <span className="lang-en">Upgrade to Premium</span>
          <span className="lang-bn">প্রিমিয়ামে আপগ্রেড করুন</span>
        </h2>

        <p className="modal-subtitle">
          <span className="lang-en">Choose a plan that works for you</span>
          <span className="lang-bn">আপনার জন্য উপযুক্ত প্ল্যান বেছে নিন</span>
        </p>

        <div className="plan-cards">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card${selectedPlan === plan.id ? ' selected' : ''}${plan.popular ? ' popular' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="plan-storage">{plan.storage}</div>
              <div className="plan-price">{en ? plan.priceEn : plan.priceBn}</div>
              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <Check size={12} style={{ marginRight: 6, color: 'var(--primary)' }} />
                    {en ? f.en : f.bn}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>
            <span className="lang-en">Maybe Later</span>
            <span className="lang-bn">পরে হবে</span>
          </button>
          <button
            className="modal-btn modal-btn-primary"
            disabled={!selectedPlan}
            onClick={() => {
              // Payment flow would go here
              onClose()
            }}
          >
            <Crown size={16} />
            <span className="lang-en">Continue</span>
            <span className="lang-bn">চালিয়ে যান</span>
          </button>
        </div>
      </div>
    </div>
  )
}
