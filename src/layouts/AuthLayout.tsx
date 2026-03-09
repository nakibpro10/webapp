import { Outlet } from 'react-router-dom'
import { Lock, CloudUpload, Shield, Smartphone } from 'lucide-react'
import './AuthLayout.css'

export default function AuthLayout() {
  return (
    <div className="auth-page">
      {/* Left Side - Decorative */}
      <div className="auth-left">
        <div className="auth-left-content">
          {/* Cloud Illustration SVG */}
          <svg className="auth-illustration" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="320" cy="220" rx="60" ry="30" fill="rgba(255,255,255,0.1)" />
            <ellipse cx="80" cy="180" rx="50" ry="25" fill="rgba(255,255,255,0.1)" />
            <path d="M300 180C300 140 270 110 230 110C220 80 190 60 155 60C110 60 75 95 75 140C75 145 75.5 150 76.5 155C45 165 25 195 25 230C25 275 60 310 105 310H270C305 310 335 280 335 245C335 215 315 190 290 182C295 180 300 175 300 180Z" fill="rgba(255,255,255,0.95)" />
            <path d="M180 240V160M180 160L150 190M180 160L210 190" stroke="#667eea" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="120" cy="130" r="8" fill="#667eea" opacity="0.6">
              <animate attributeName="cy" values="130;120;130" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="240" cy="100" r="6" fill="#764ba2" opacity="0.6">
              <animate attributeName="cy" values="100;90;100" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="280" cy="150" r="5" fill="#667eea" opacity="0.4">
              <animate attributeName="cy" values="150;140;150" dur="2s" repeatCount="indefinite" />
            </circle>
            <g transform="translate(290, 70)">
              <rect x="5" y="15" width="30" height="25" rx="3" fill="#ffd700" />
              <path d="M10 15V10C10 5 15 0 20 0C25 0 30 5 30 10V15" stroke="#ffd700" strokeWidth="4" fill="none" />
              <circle cx="20" cy="27" r="4" fill="#333" />
            </g>
          </svg>

          <h2>
            <span className="lang-en">Secure Cloud Storage</span>
            <span className="lang-bn">সুরক্ষিত ক্লাউড স্টোরেজ</span>
          </h2>
          <p>
            <span className="lang-en">Store your files securely with end-to-end encryption. Access anywhere, anytime.</span>
            <span className="lang-bn">এন্ড-টু-এন্ড এনক্রিপশন সহ আপনার ফাইল সুরক্ষিতভাবে সংরক্ষণ করুন। যেকোনো জায়গায়, যেকোনো সময় অ্যাক্সেস করুন।</span>
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <Lock size={14} />
              <span className="lang-en">E2E Encrypted</span>
              <span className="lang-bn">এনক্রিপ্টেড</span>
            </div>
            <div className="auth-feature">
              <CloudUpload size={14} />
              <span className="lang-en">Unlimited Upload</span>
              <span className="lang-bn">আনলিমিটেড আপলোড</span>
            </div>
            <div className="auth-feature">
              <Shield size={14} />
              <span className="lang-en">100% Secure</span>
              <span className="lang-bn">১০০% সুরক্ষিত</span>
            </div>
            <div className="auth-feature">
              <Smartphone size={14} />
              <span className="lang-en">Access Anywhere</span>
              <span className="lang-bn">যেকোনো জায়গায়</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form (child routes render here) */}
      <div className="auth-right">
        <Outlet />
      </div>
    </div>
  )
}
