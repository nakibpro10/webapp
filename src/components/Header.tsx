import {
  Menu,
  Search,
  Moon,
  ChevronDown,
  UserCog,
  Crown,
  Key,
  Headset,
  FileText,
  LogOut,
} from 'lucide-react'
import './Header.css'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
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
        <button className="header-btn" title="Toggle Language">
          <span className="lang-en" style={{ fontSize: '11px', fontWeight: 700 }}>বাং</span>
          <span className="lang-bn" style={{ fontSize: '11px', fontWeight: 700 }}>EN</span>
        </button>

        {/* Theme Toggle */}
        <button className="header-btn" title="Toggle Theme">
          <Moon size={20} />
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <img
            className="user-avatar"
            src="https://ui-avatars.com/api/?name=U&background=667eea&color=fff"
            alt="User"
          />
          <span className="user-name">User</span>
          <ChevronDown size={12} />
        </div>

        {/* User Dropdown */}
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <img
              className="user-dropdown-avatar"
              src="https://ui-avatars.com/api/?name=U&background=667eea&color=fff&size=72"
              alt="User"
            />
            <div className="user-dropdown-name">User</div>
            <div className="user-dropdown-email">user@example.com</div>
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
            <button className="user-dropdown-item danger" type="button">
              <LogOut size={16} />
              <span className="lang-en">Sign Out</span>
              <span className="lang-bn">সাইন আউট</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
