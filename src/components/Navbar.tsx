import React, { useState, useEffect } from 'react';
import { Globe, QrCode, LogOut, ArrowUpRight } from 'lucide-react';
import { User } from 'firebase/auth';

export type AppView = 'booking' | 'chunker' | 'admin' | 'about';

interface Props {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  referralCode: string;
  lang: 'vi' | 'en';
  onToggleLang: () => void;
  currentUser: User | null;
  isAdmin: boolean;
  onOpenChunkerHub: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onSelectView,
  lang,
  onToggleLang,
  currentUser,
  isAdmin,
  onOpenChunkerHub,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<string>('booking-form');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const faqEl = document.getElementById('faq');
      const mseEl = document.getElementById('mse-method') || document.getElementById('mse');
      const bookingEl = document.getElementById('booking-form');

      if (faqEl && scrollY >= faqEl.offsetTop - 240) {
        setActiveSection('faq');
      } else if (bookingEl && scrollY >= bookingEl.offsetTop - 240) {
        setActiveSection('booking-form');
      } else if (mseEl && scrollY >= mseEl.offsetTop - 240) {
        setActiveSection('mse-method');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (currentView !== 'booking') {
      onSelectView('booking');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[var(--chunks-rule)]">
      <div className="chunks-shell min-h-[72px] py-2 flex items-center justify-between gap-4">
        {/* Brand Lockup: Red square + CHUNKS wordmark */}
        <div
          onClick={() => {
            onSelectView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <img
            src="/logo.png"
            alt="CHUNKS Logo"
            className="w-[72px] sm:w-[86px] h-auto aspect-[500/215] block shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[17px] font-bold tracking-tight text-[var(--chunks-ink)] leading-none whitespace-nowrap">
              CHUNKS TEST
            </span>
            <span className="text-[9px] font-mono text-[var(--chunks-muted)] tracking-wider uppercase leading-none mt-1">
              Based on CHUNKS Theory
            </span>
          </div>
        </div>

        {/* Center: Customer-Facing Campaign Navigation Links (Compact Sleek Segmented Tabs) */}
        {currentView !== 'admin' ? (
          <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-full border border-[rgba(10,10,10,0.08)] text-[12.5px] font-medium gap-1">
            <button
              type="button"
              onClick={() => onSelectView('booking')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                currentView === 'booking'
                  ? 'bg-white text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
              }`}
            >
              {lang === 'vi' ? 'Đăng Ký Mini-Test' : 'Register 1-on-1'}
            </button>

            <button
              type="button"
              onClick={() => onSelectView('about')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                currentView === 'about'
                  ? 'bg-white text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
              }`}
            >
              {lang === 'vi' ? 'Về CHUNKS Theory' : 'About CHUNKS'}
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#c81e16] border border-[#c81e16]/30 px-3 py-1 bg-rose-50/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c81e16]" />
            <span>ADMIN OPERATIONS · RESTRICTED GATEWAY</span>
          </div>
        )}

        {/* Right Tools: Subtle Chunker Gateway Button & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentView !== 'admin' ? (
            <>
              {/* Subtle Clean Call-To-Action Button for Chunkers */}
              <button
                type="button"
                onClick={onOpenChunkerHub}
                className="text-[12.5px] font-medium text-[var(--chunks-ink)] border border-[var(--chunks-rule)] hover:border-[var(--chunks-accent)] px-2.5 sm:px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Lấy link & mã QR cho người giới thiệu"
              >
                <QrCode className="w-3.5 h-3.5 text-[var(--chunks-accent)]" />
                <span className="hidden sm:inline">
                  {lang === 'vi'
                    ? 'Bạn là Chunkee? Lấy link & QR'
                    : 'Chunkee Gateway (Link & QR)'}
                </span>
              </button>
            </>
          ) : (
            currentUser && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-[12px] font-medium text-[#c81e16] border border-[rgba(200,30,22,0.3)] hover:bg-[#c81e16] hover:text-white rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            )
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="text-[12px] font-semibold text-[var(--chunks-muted)] hover:text-[var(--chunks-ink)] border border-[var(--chunks-rule)] rounded-full px-2.5 py-2 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 text-[#c81e16]" />
            <span className="font-mono">{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
