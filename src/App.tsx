/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppView } from './components/Navbar';
import { CandidateView } from './pages/CandidateView';
import { ChunkerScopedView } from './pages/ChunkerScopedView';
import { AdminView } from './pages/AdminView';
import { ChunksFooter } from './components/ChunksFooter';
import { ChunkerHubModal } from './components/ChunkerHubModal';
import { subscribeToAuth, signOutAdmin } from './firebase/services';
import { User } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('booking');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [referralCode, setReferralCode] = useState<string>('');
  const [isChunkerHubOpen, setIsChunkerHubOpen] = useState<boolean>(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 1. Initial URL Path Resolver (Admin is accessible ONLY via direct URL navigation to /admin)
  useEffect(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || urlParams.get('code');

      if (ref && ref.trim()) {
        setReferralCode(ref.trim().toUpperCase());
      } else {
        setReferralCode('');
      }

      if (path === '/admin') {
        setCurrentView('admin');
      } else if (path === '/ref-status' || path === '/chunker' || path.startsWith('/c/')) {
        setCurrentView('chunker');
      } else {
        // Default is Candidate Booking for Chunks Test 100
        setCurrentView('booking');
      }
    } catch (e) {
      setCurrentView('booking');
    }
  }, []);

  // 2. Sync URL when user switches view
  const handleSelectView = (view: AppView) => {
    setCurrentView(view);
    try {
      const url = new URL(window.location.href);
      if (view === 'booking') {
        url.pathname = '/';
        if (referralCode) url.searchParams.set('ref', referralCode);
      } else if (view === 'chunker') {
        url.pathname = '/chunker';
        if (referralCode) url.searchParams.set('code', referralCode);
      } else if (view === 'admin') {
        url.pathname = '/admin';
      }
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  // 3. Listen to Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user, adminStatus) => {
      setCurrentUser(user);
      setIsAdmin(adminStatus);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFaq = () => {
    const el = document.getElementById('faq');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--chunks-surface)] text-[var(--chunks-ink)] flex flex-col [font-family:var(--chunks-display)] selection:bg-[var(--chunks-accent)] selection:text-white">
      {/* Top Sticky Navbar with Customer-Facing Navigation & Subtle Chunker CTA */}
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        referralCode={referralCode}
        lang={lang}
        onToggleLang={handleToggleLang}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenChunkerHub={() => setIsChunkerHubOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full">
        {/* Route / : Candidate View (Form-First, Swiss Numbered FAQ, MSE Theory) */}
        {currentView === 'booking' && (
          <CandidateView
            initialReferralCode={referralCode}
            lang={lang}
            onOpenChunkerHub={(code) => {
              if (code) setReferralCode(code);
              setIsChunkerHubOpen(true);
            }}
          />
        )}

        {/* Route /chunker : Dedicated Chunker Scoped View */}
        {currentView === 'chunker' && (
          <div className="max-w-[1180px] mx-auto px-6 md:px-10 pt-10">
            <ChunkerScopedView initialCode={referralCode} lang={lang} />
          </div>
        )}

        {/* Route /admin : Strict Admin Isolation (Direct URL Only) */}
        {currentView === 'admin' && (
          <div className="max-w-[1180px] mx-auto px-6 md:px-10 pt-10">
            <AdminView currentUser={currentUser} lang={lang} />
          </div>
        )}
      </main>

      {/* Hairline Paper Footer */}
      <ChunksFooter
        onSelectView={handleSelectView}
        onOpenChunkerHub={() => setIsChunkerHubOpen(true)}
        lang={lang}
        onScrollToTop={scrollToTop}
        onScrollToFaq={scrollToFaq}
      />

      {/* Chunker Referral & Dynamic QR Code Modal Hub */}
      <ChunkerHubModal
        isOpen={isChunkerHubOpen}
        onClose={() => setIsChunkerHubOpen(false)}
        lang={lang}
        initialIdentifier={referralCode}
      />
    </div>
  );
}
