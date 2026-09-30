import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, QrCode, Sparkles, Search, X } from 'lucide-react';
import { apiValidateReferral, apiSelfRegisterChunker } from '../api/client';
import { buildReferralUrl } from '../utils/referral';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
  initialIdentifier?: string;
}

export const ChunkerHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  initialIdentifier = '',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'lookup'>('create');

  // Create state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredCode, setPreferredCode] = useState('');
  const [creating, setCreating] = useState(false);

  // Lookup state
  const [code, setCode] = useState(initialIdentifier);
  const [lookingUp, setLookingUp] = useState(false);

  // Shared result & error
  const [result, setResult] = useState<{ code: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!fullName.trim() || !email.trim()) return;
    setCreating(true);
    try {
      const res = await apiSelfRegisterChunker({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        preferredCode: preferredCode.trim().toUpperCase() || undefined,
      });
      setResult(res.chunker);
    } catch (err: any) {
      setError(err.message || (lang === 'vi' ? 'Không thể tạo mã lúc này' : 'Failed to create code'));
    } finally {
      setCreating(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!code.trim()) return;
    setLookingUp(true);
    try {
      const referral = await apiValidateReferral(code);
      if (!referral.valid || !referral.chunkerName) {
        throw new Error(lang === 'vi' ? 'Mã giới thiệu không tồn tại hoặc chưa kích hoạt.' : 'Code does not exist or is inactive.');
      }
      setResult({ code: referral.referralCode, name: referral.chunkerName });
    } catch (err: any) {
      setError(err.message || (lang === 'vi' ? 'Mã chưa được cấp hoặc dịch vụ tạm gián đoạn.' : 'Code not found or service unavailable.'));
    } finally {
      setLookingUp(false);
    }
  };

  const url = result ? buildReferralUrl(result.code) : '';

  const copyUrl = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chunkee Referral Gateway"
      className="fixed inset-0 z-50 bg-[#0a0a0a]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-[rgba(10,10,10,0.14)] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(10,10,10,0.12)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c81e16] block">
                CHUNKEE REFERRAL GATEWAY
              </span>
              <h2 className="text-[20px] font-bold text-[#0a0a0a] tracking-tight mt-0.5">
                {lang === 'vi' ? 'Cổng Kết Nối Dành Cho Chunkee' : 'Chunkee Referral Link & QR'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#0a0a0a]/50 hover:text-[#0a0a0a] p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[rgba(10,10,10,0.12)] text-[12.5px] font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setError(null);
              setResult(null);
            }}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#c81e16] text-[#c81e16] font-semibold'
                : 'border-transparent text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Tự tạo link mới' : 'Create New Link'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('lookup');
              setError(null);
              setResult(null);
            }}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lookup'
                ? 'border-[#c81e16] text-[#c81e16] font-semibold'
                : 'border-transparent text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Đã có mã? Tra cứu QR' : 'Existing Code Lookup'}</span>
          </button>
        </div>

        {/* Result View (Shown upon create or lookup success) */}
        {result ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'vi'
                  ? `Mã giới thiệu của bạn (${result.code}) đã sẵn sàng hoạt động!`
                  : `Your referral code (${result.code}) is ready to share!`}
              </span>
            </div>

            <div className="border border-[rgba(10,10,10,0.14)] p-5 bg-slate-50 flex flex-col items-center text-center space-y-4">
              <div className="font-mono text-sm">
                <span className="font-bold text-[#0a0a0a] text-base">{result.name}</span>
                <span className="block text-[#c81e16] font-bold mt-0.5 tracking-wider">
                  MÃ: {result.code}
                </span>
              </div>

              <div className="p-3 bg-white border border-[rgba(10,10,10,0.14)] shadow-xs">
                <QRCodeCanvas value={url} size={150} />
              </div>

              <div className="w-full">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#0a0a0a]/50 block mb-1">
                  {lang === 'vi' ? 'Đường link giới thiệu' : 'Personal Referral Link'}
                </span>
                <div className="p-2.5 bg-white border border-[rgba(10,10,10,0.16)] font-mono text-[11.5px] text-[#0a0a0a] break-all select-all">
                  {url}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-5 py-2.5 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[12.5px] font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép link gửi bạn bè' : 'Copy Referral Link')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2 border border-[rgba(10,10,10,0.2)] hover:border-[#0a0a0a] text-[#0a0a0a] text-[12px] font-medium rounded-full cursor-pointer transition-colors"
                >
                  {lang === 'vi' ? 'Tạo / Tra cứu mã khác' : 'Switch / Reset'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tab 1: Create Form */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreate} className="space-y-4">
                <p className="text-[13px] text-[#0a0a0a]/70 font-light">
                  {lang === 'vi'
                    ? 'Bạn là Chunkee muốn mời bạn bè tham gia đánh giá Mini-Test 21 câu? Điền thông tin cơ bản để nhận link và mã QR cá nhân ngay lập tức.'
                    : 'Are you a Chunkee inviting candidates for the 21-question mini-test? Fill in your details to generate your personal referral link and QR code.'}
                </p>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[#c81e16] text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                    {lang === 'vi' ? 'Họ và tên của bạn' : 'Your Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Bảo Long"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] text-[13.5px] focus:outline-none focus:border-[#c81e16]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                    {lang === 'vi' ? 'Email của bạn' : 'Your Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="baolong@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] text-[13.5px] focus:outline-none focus:border-[#c81e16]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                      {lang === 'vi' ? 'Số điện thoại (Tùy chọn)' : 'Phone (Optional)'}
                    </label>
                    <input
                      type="tel"
                      placeholder="0903123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] text-[13.5px] focus:outline-none focus:border-[#c81e16]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                      {lang === 'vi' ? 'Mã mong muốn (Tùy chọn)' : 'Custom Code (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: LONG2026"
                      value={preferredCode}
                      onChange={(e) => setPreferredCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] font-mono text-[13.5px] uppercase focus:outline-none focus:border-[#c81e16]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3 px-5 bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13.5px] font-semibold rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{creating ? (lang === 'vi' ? 'Đang tạo mã...' : 'Creating...') : (lang === 'vi' ? 'Tạo link & mã QR giới thiệu' : 'Generate Link & QR Code')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Lookup Form */}
            {activeTab === 'lookup' && (
              <form onSubmit={handleLookup} className="space-y-4">
                <p className="text-[13px] text-[#0a0a0a]/70 font-light">
                  {lang === 'vi'
                    ? 'Nếu bạn đã có mã Chunkee được cấp trước đó, hãy nhập mã để lấy lại link và mã QR chính thức.'
                    : 'Enter your existing Chunkee referral code to retrieve your official link and QR code.'}
                </p>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[#c81e16] text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                    {lang === 'vi' ? 'Mã giới thiệu của bạn' : 'Your Referral Code'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: MINH2026"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] font-mono text-[14px] uppercase focus:outline-none focus:border-[#c81e16]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={lookingUp}
                    className="w-full py-3 px-5 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[13.5px] font-semibold rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                    <span>{lookingUp ? (lang === 'vi' ? 'Đang tra cứu...' : 'Looking up...') : (lang === 'vi' ? 'Tra cứu & Lấy mã QR' : 'Retrieve QR & Link')}</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
