import { HardDrive, Files, Folder, Share2 } from 'lucide-react'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon storage"><HardDrive size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">0 MB</div>
            <div className="stat-label">
              <span className="lang-en">Storage Used</span>
              <span className="lang-bn">স্টোরেজ ব্যবহার</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon files"><Files size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">0</div>
            <div className="stat-label">
              <span className="lang-en">Total Files</span>
              <span className="lang-bn">মোট ফাইল</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon folders"><Folder size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">0</div>
            <div className="stat-label">
              <span className="lang-en">Folders</span>
              <span className="lang-bn">ফোল্ডার</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon shared"><Share2 size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">0</div>
            <div className="stat-label">
              <span className="lang-en">Shared</span>
              <span className="lang-bn">শেয়ার করা</span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-empty">
        <HardDrive size={48} />
        <p>
          <span className="lang-en">Welcome to Nakib Cloud! Upload files to get started.</span>
          <span className="lang-bn">Nakib Cloud এ স্বাগতম! শুরু করতে ফাইল আপলোড করুন।</span>
        </p>
      </div>
    </div>
  )
}
