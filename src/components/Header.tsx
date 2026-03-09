import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  UserCog,
  Crown,
  Key,
  Headset,
  FileText,
  LogOut,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import './Header.css'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()
  const { toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/auth')
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`
  const avatarUrlLg = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=72`

  return (
    <header className="header">
      <button className="menu-toggle" onClick={onMenuToggle}>
        <Menu size={20} />
      </button>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-bar">
          <span className="search-icon">
            <Search size={18} />
          </span>
          <input type="text" placeholder="Search files..." autoComplete="off" />
          <span className="search-shortcut">Ctrl+K</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Language Toggle */}
        <button className="header-btn" title="Toggle Language" onClick={toggleLanguage}>
          <span className="lang-en" style={{ fontSize: '11px', fontWeight: 700 }}>বাং</span>
          <span className="lang-bn" style={{ fontSize: '11px', fontWeight: 700 }}>EN</span>
        </button>

        {/* Theme Toggle */}
        <button className="header-btn" title="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Profile Wrapper */}
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <div className="user-profile" onClick={() => setDropdownOpen(prev => !prev)}>
            <img
              className="user-avatar"
              src={avatarUrl}
              alt="User"
            />
            <span className="user-name">{displayName}</span>
            <ChevronDown size={12} />
          </div>

          {/* User Dropdown */}
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <img
                  className="user-dropdown-avatar"
                  src={avatarUrlLg}
                  alt="User"
                />
                <div className="user-dropdown-name">{displayName}</div>
                <div className="user-dropdown-email">{user?.email || ''}</div>
              </div>
              <div className="user-dropdown-menu">
                <button className="user-dropdown-item" type="button">
                  <UserCog size={16} />
                  <span className="lang-en">Account Settings</span>
                  <span className="lang-bn">অ্যাকাউন্ট সেটিংস</span>
                </button>
                <button className="user-dropdown-item" type="button">
                  <Crown size={16} />
                  <span className="lang-en">Subscription</span>
                  <span className="lang-bn">সাবস্ক্রিপশন</span>
                </button>
                <button className="user-dropdown-item" type="button">
                  <Key size={16} />
                  <span className="lang-en">Change PIN</span>
                  <span className="lang-bn">পিন পরিবর্তন</span>
                </button>
                <div className="user-dropdown-divider" />
                <button className="user-dropdown-item" type="button">
                  <Headset size={16} />
                  <span className="lang-en">Help &amp; Support</span>
                  <span className="lang-bn">সাহায্য ও সাপোর্ট</span>
                </button>
                <button className="user-dropdown-item" type="button">
                  <FileText size={16} />
                  <span className="lang-en">Terms of Service</span>
                  <span className="lang-bn">সেবার শর্তাবলী</span>
                </button>
                <div className="user-dropdown-divider" />
                <button className="user-dropdown-item danger" type="button" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span className="lang-en">Logout</span>
                  <span className="lang-bn">লগআউট</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
