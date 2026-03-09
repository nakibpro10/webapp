import { useState } from 'react'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Check,
  Circle,
  Loader,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Cloud } from 'lucide-react'
import './Auth.css'

/* ── Google SVG icon (inline to avoid external deps) ── */
function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09a6.97 6.97 0 0 1 0-4.18V7.07H2.18A11.01 11.01 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* ── Password strength helper ── */
function getStrength(pw: string) {
  const has = {
    length: pw.length >= 6,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
  }
  const score = Object.values(has).filter(Boolean).length
  return { ...has, score }
}

export default function Auth() {
  const navigate = useNavigate()

  /* ── state ── */
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  // login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // signup
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [tosAgree, setTosAgree] = useState(false)
  const [showSignupPw, setShowSignupPw] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState('')

  const [googleLoading, setGoogleLoading] = useState(false)

  const { login, signup, loginWithGoogle } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const en = language === 'en'
  const strength = getStrength(signupPassword)
  const showCriteria = signupPassword.length > 0

  /* ── handlers ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      await login(loginEmail.trim(), loginPassword, rememberMe)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/user-not-found')
        setLoginError(en ? 'No account found with this email' : 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই')
      else if (code === 'auth/wrong-password')
        setLoginError(en ? 'Incorrect password' : 'ভুল পাসওয়ার্ড')
      else if (code === 'auth/invalid-email')
        setLoginError(en ? 'Invalid email address' : 'অবৈধ ইমেইল এড্রেস')
      else if (code === 'auth/too-many-requests')
        setLoginError(en ? 'Too many attempts. Try again later.' : 'অনেক চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।')
      else if (code === 'auth/invalid-credential')
        setLoginError(en ? 'Invalid email or password' : 'ভুল ইমেইল বা পাসওয়ার্ড')
      else setLoginError(en ? 'Login failed' : 'লগইন ব্যর্থ')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSignupError('')

    if (!tosAgree) {
      setSignupError(en ? 'Please agree to the Terms of Service' : 'সেবার শর্তাবলীতে সম্মত হন')
      return
    }
    if (signupPassword !== signupConfirm) {
      setSignupError(en ? 'Passwords do not match' : 'পাসওয়ার্ড মেলেনি')
      return
    }
    if (signupPassword.length < 6) {
      setSignupError(en ? 'Password must be at least 6 characters' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }

    setSignupLoading(true)
    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/email-already-in-use')
        setSignupError(en ? 'Email already in use' : 'ইমেইল ইতিমধ্যে ব্যবহৃত')
      else if (code === 'auth/invalid-email')
        setSignupError(en ? 'Invalid email address' : 'অবৈধ ইমেইল এড্রেস')
      else if (code === 'auth/weak-password')
        setSignupError(en ? 'Password is too weak' : 'পাসওয়ার্ড অনেক দুর্বল')
      else setSignupError(en ? 'Sign up failed' : 'সাইন আপ ব্যর্থ')
    } finally {
      setSignupLoading(false)
    }
  }

  async function handleGoogle() {
    setLoginError('')
    setSignupError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code !== 'auth/popup-closed-by-user') {
        const msg = en ? 'Google sign in failed' : 'Google সাইন ইন ব্যর্থ'
        if (tab === 'login') setLoginError(msg)
        else setSignupError(msg)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  /* ── render ── */
  return (
    <>
      {/* Top controls */}
      <div className="auth-top-controls">
        <button className="lang-toggle-btn" onClick={toggleLanguage} title="Toggle Language">
          <span className="lang-en">বাং</span>
          <span className="lang-bn">EN</span>
        </button>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Cloud size={28} />
            </div>
            <span className="auth-logo-text">Nakib Cloud</span>
          </div>
          <h1>
            <span className="lang-en">{tab === 'login' ? 'Welcome Back' : 'Create Account'}</span>
            <span className="lang-bn">{tab === 'login' ? 'স্বাগতম' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
          </h1>
          <p>
            <span className="lang-en">
              {tab === 'login'
                ? 'Sign in to continue to Nakib Cloud'
                : 'Sign up to start using Nakib Cloud'}
            </span>
            <span className="lang-bn">
              {tab === 'login'
                ? 'Nakib Cloud-এ চালিয়ে যেতে সাইন ইন করুন'
                : 'Nakib Cloud ব্যবহার শুরু করতে সাইন আপ করুন'}
            </span>
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => { setTab('login'); setLoginError(''); setSignupError('') }}
            >
              <span className="lang-en">Sign In</span>
              <span className="lang-bn">সাইন ইন</span>
            </button>
            <button
              className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
              onClick={() => { setTab('signup'); setLoginError(''); setSignupError('') }}
            >
              <span className="lang-en">Sign Up</span>
              <span className="lang-bn">সাইন আপ</span>
            </button>
          </div>

          {/* ─── LOGIN FORM ─── */}
          <form className={`auth-form${tab === 'login' ? ' active' : ''}`} onSubmit={handleLogin}>
            {/* Email */}
            <div className="input-group">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder=" "
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <Mail size={18} className="input-icon" />
              <label className="input-label">
                <span className="lang-en">Email Address</span>
                <span className="lang-bn">ইমেইল এড্রেস</span>
              </label>
            </div>

            {/* Password */}
            <div className="input-group">
              <input
                type={showLoginPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder=" "
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Lock size={18} className="input-icon" />
              <label className="input-label">
                <span className="lang-en">Password</span>
                <span className="lang-bn">পাসওয়ার্ড</span>
              </label>
              <button type="button" className="password-toggle" onClick={() => setShowLoginPw(!showLoginPw)}>
                {showLoginPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="checkbox-custom"><Check size={12} /></span>
                <span className="lang-en">Remember me</span>
                <span className="lang-bn">মনে রাখুন</span>
              </label>
              <button type="button" className="forgot-link">
                <span className="lang-en">Forgot Password?</span>
                <span className="lang-bn">পাসওয়ার্ড ভুলে গেছেন?</span>
              </button>
            </div>

            {loginError && <div className="auth-error">{loginError}</div>}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loginLoading}>
              {loginLoading ? <Loader size={18} className="spinner" /> : <LogIn size={18} />}
              <span className="lang-en">{loginLoading ? 'Signing in…' : 'Sign In'}</span>
              <span className="lang-bn">{loginLoading ? 'সাইন ইন হচ্ছে…' : 'সাইন ইন'}</span>
            </button>

            <div className="auth-divider">
              <span className="lang-en">or continue with</span>
              <span className="lang-bn">অথবা</span>
            </div>

            <button type="button" className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
              <GoogleIcon />
              <span className="lang-en">Continue with Google</span>
              <span className="lang-bn">Google দিয়ে চালিয়ে যান</span>
            </button>
          </form>

          {/* ─── SIGNUP FORM ─── */}
          <form className={`auth-form${tab === 'signup' ? ' active' : ''}`} onSubmit={handleSignup}>
            {/* Name */}
            <div className="input-group">
              <input
                type="text"
                required
                autoComplete="name"
                placeholder=" "
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
              <User size={18} className="input-icon" />
              <label className="input-label">
                <span className="lang-en">Full Name</span>
                <span className="lang-bn">পুরো নাম</span>
              </label>
            </div>

            {/* Email */}
            <div className="input-group">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder=" "
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <Mail size={18} className="input-icon" />
              <label className="input-label">
                <span className="lang-en">Email Address</span>
                <span className="lang-bn">ইমেইল এড্রেস</span>
              </label>
            </div>

            {/* Password */}
            <div className="input-group">
              <input
                type={showSignupPw ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder=" "
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <Lock size={18} className="input-icon" />
              <label className="input-label">
                <span className="lang-en">Password</span>
                <span className="lang-bn">পাসওয়ার্ড</span>
              </label>
              <button type="button" className="password-toggle" onClick={() => setShowSignupPw(!showSignupPw)}>
                {showSignupPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength bars */}
            <div className={`password-strength${showCriteria ? ' show' : ''}`}>  
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`strength-bar${
                    strength.score >= i
                      ? strength.score <= 1
                        ? ' weak'
                        : strength.score <= 2
                        ? ' medium'
                        : ' strong'
                      : ''
                  }`}
                />
              ))}
            </div>

            {/* Criteria */}
            <div className={`password-criteria${showCriteria ? ' show' : ''}`}>  
              <div className={`criteria-item${strength.length ? ' valid' : ''}`}>  
                <Circle size={10} />
                <span className="lang-en">At least 6 characters</span>
                <span className="lang-bn">কমপক্ষে ৬টি অক্ষর</span>
              </div>
              <div className={`criteria-item${strength.upper ? ' valid' : ''}`}>  
                <Circle size={10} />
                <span className="lang-en">One uppercase letter</span>
                <span className="lang-bn">একটি বড় হাতের অক্ষর</span>
              </div>
              <div className={`criteria-item${strength.lower ? ' valid' : ''}`}>  
                <Circle size={10} />
                <span className="lang-en">One lowercase letter</span>
                <span className="lang-bn">একটি ছোট হাতের অক্ষর</span>
              </div>
              <div className={`criteria-item${strength.number ? ' valid' : ''}`}>  
                <Circle size={10} />
                <span className="lang-en">One number</span>
                <span className="lang-bn">একটি সংখ্যা</span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder=" "
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
              />
              <Lock size={18} className="input-icon" />
              <label className="input-label">
                <span className="lang-en">Confirm Password</span>
                <span className="lang-bn">পাসওয়ার্ড নিশ্চিত করুন</span>
              </label>
            </div>

            {/* TOS */}
            <label className="tos-agree">
              <input type="checkbox" checked={tosAgree} onChange={(e) => setTosAgree(e.target.checked)} />
              <span className="checkbox-custom"><Check size={11} /></span>
              <span>
                <span className="lang-en">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </span>
                <span className="lang-bn">
                  আমি <a href="#">সেবার শর্তাবলী</a> এবং <a href="#">গোপনীয়তা নীতি</a>-তে সম্মত
                </span>
              </span>
            </label>

            {signupError && <div className="auth-error">{signupError}</div>}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={signupLoading}>
              {signupLoading ? <Loader size={18} className="spinner" /> : <UserPlus size={18} />}
              <span className="lang-en">{signupLoading ? 'Creating account…' : 'Create Account'}</span>
              <span className="lang-bn">{signupLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে…' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
            </button>

            <div className="auth-divider">
              <span className="lang-en">or continue with</span>
              <span className="lang-bn">অথবা</span>
            </div>

            <button type="button" className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
              <GoogleIcon />
              <span className="lang-en">Continue with Google</span>
              <span className="lang-bn">Google দিয়ে চালিয়ে যান</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <div className="auth-footer-links">
            <a href="#">
              <span className="lang-en">Help</span>
              <span className="lang-bn">সাহায্য</span>
            </a>
            <a href="#">
              <span className="lang-en">Privacy</span>
              <span className="lang-bn">গোপনীয়তা</span>
            </a>
            <a href="#">
              <span className="lang-en">Terms</span>
              <span className="lang-bn">শর্তাবলী</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}