import React, { useState, useEffect } from 'react';
import { Globe, QrCode, LogOut, ArrowUpRight } from 'lucide-react';
import { User } from 'firebase/auth';

export type AppView = 'booking' | 'chunker' | 'admin';

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
      const testEl = document.getElementById('test-options');
      const bookingEl = document.getElementById('booking-form');

      if (faqEl && scrollY >= faqEl.offsetTop - 240) {
        setActiveSection('faq');
      } else if (testEl && scrollY >= testEl.offsetTop - 240) {
        setActiveSection('test-options');
      } else if (bookingEl && scrollY >= bookingEl.offsetTop - 240) {
        setActiveSection('booking-form');
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md hairline-b">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between gap-4">
        {/* Brand Lockup: Red 15px square + CHUNKS wordmark */}
        <div
          onClick={() => {
            onSelectView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div
            className="w-[15px] h-[15px] rounded-[2px] bg-[#ff3b30] mt-[1px] shrink-0 group-hover:bg-[#c81e16] transition-colors"
            aria-hidden="true"
          />
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
              CHUNKS
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
              TEST 100
            </span>
          </div>
        </div>

        {/* Center: Customer-Facing Campaign Navigation Links (Compact Sleek Segmented Tabs) */}
        {currentView !== 'admin' ? (
          <nav className="hidden md:flex items-center p-0.5 bg-[#f4f4f5] border border-black/[0.06] rounded-full text-[11px] font-medium tracking-tight gap-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <button
              type="button"
              onClick={() => scrollToSection('booking-form')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                activeSection === 'booking-form'
                  ? 'bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a] hover:bg-white/50'
              }`}
            >
              {lang === 'vi' ? 'Đăng ký' : 'Register'}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('test-options')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                activeSection === 'test-options'
                  ? 'bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a] hover:bg-white/50'
              }`}
            >
              Green &amp; Red
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                activeSection === 'faq'
                  ? 'bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a] hover:bg-white/50'
              }`}
            >
              FAQ
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#c81e16] border border-[#c81e16]/30 px-3 py-1 bg-rose-50/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c81e16]" />
            <span>ADMIN OPERATIONS · RESTRICTED GATEWAY</span>
          </div>
        )}

        {/* Right Tools: Subtle Chunker Gateway Button & Language Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView !== 'admin' ? (
            <>
              {/* Subtle Clean Call-To-Action Button for Chunkers */}
              <button
                type="button"
                onClick={onOpenChunkerHub}
                className="text-[12.5px] font-medium text-[#0a0a0a]/80 hover:text-[#0a0a0a] border border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a] hover:bg-slate-50 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                title="Lấy link & mã QR cho người giới thiệu"
              >
                <QrCode className="w-3.5 h-3.5 text-[#c81e16]" />
                <span>
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
            className="text-[12px] font-semibold text-[#0a0a0a]/75 hover:text-[#0a0a0a] border border-[rgba(10,10,10,0.14)] rounded-full px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
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
