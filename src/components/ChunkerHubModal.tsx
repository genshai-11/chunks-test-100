import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  QrCode,
  Users,
  UserPlus,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  apiLookupChunkee,
  apiRegisterChunkee,
  ChunkeeLookupResponse,
  ChunkeeNotFoundError,
} from '../api/client';
import { isValidPhoneNumber, isValidEmailAddress } from '../schemas/validation';

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
  // Mode: 'lookup' | 'register'
  const [activeTab, setActiveTab] = useState<'lookup' | 'register'>('lookup');

  // Lookup state
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Chunkee Data (Once resolved or registered)
  const [chunkeeData, setChunkeeData] = useState<ChunkeeLookupResponse | null>(null);

  // New Chunkee Registration State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Copy states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialIdentifier && initialIdentifier.trim()) {
      setIdentifier(initialIdentifier.trim().toUpperCase());
      handleLookup(initialIdentifier.trim().toUpperCase());
    }
  }, [isOpen, initialIdentifier]);

  const handleLookup = async (queryToSearch?: string) => {
    const q = (queryToSearch || identifier).trim();
    if (!q) {
      setLookupError(
        lang === 'vi'
          ? 'Vui lòng nhập Mã Chunkee hoặc Email đã đăng ký.'
          : 'Please enter your Chunkee code or registered email.'
      );
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setRegSuccessMsg(null);

    try {
      const data = await apiLookupChunkee(q);
      setChunkeeData(data);
    } catch (err: any) {
      if (err instanceof ChunkeeNotFoundError || err.notFound) {
        // Switch to registration mode and prefill if entered query was an email
        if (q.includes('@')) {
          setRegEmail(q);
        }
        setLookupError(err.message);
        setActiveTab('register');
      } else {
        setLookupError(err.message || 'Không tìm thấy thông tin Chunkee.');
      }
      setChunkeeData(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const name = regFullName.trim();
    const email = regEmail.trim();
    const phone = regPhone.trim();

    if (!name || name.length < 2) {
      setRegError(lang === 'vi' ? 'Vui lòng nhập họ và tên (ít nhất 2 ký tự).' : 'Full name is required.');
      return;
    }

    if (!email || !isValidEmailAddress(email)) {
      setRegError(
        lang === 'vi' ? 'Email không hợp lệ (VD: name@domain.com).' : 'Please enter a valid email address.'
      );
      return;
    }

    if (!phone || !isValidPhoneNumber(phone)) {
      setRegError(
        lang === 'vi'
          ? 'Số điện thoại không đúng định dạng (VD: 0912345678).'
          : 'Please enter a valid phone number.'
      );
      return;
    }

    setRegLoading(true);

    try {
      const result = await apiRegisterChunkee({
        fullName: name,
        email,
        phone,
      });

      setChunkeeData(result);
      setRegSuccessMsg(
        lang === 'vi'
          ? `Chúc mừng ${result.chunkerName}! Bạn đã nhận mã giới thiệu ${result.code}.`
          : `Welcome ${result.chunkerName}! Your referral code is ${result.code}.`
      );
      setActiveTab('lookup');
    } catch (err: any) {
      setRegError(err.message || 'Đăng ký Chunkee thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!chunkeeData) return;
    navigator.clipboard.writeText(chunkeeData.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getShareMessage = () => {
    if (!chunkeeData) return '';
    return lang === 'vi'
      ? `Chào bạn, mình gửi bạn thư mời tham gia kỳ đánh giá 1-on-1 "CHUNKS Test 100" (Lý thuyết MSE - Motion, Sound, Emotion). Bài test 45 phút trực tiếp cùng CiC. Đăng ký qua link riêng của mình tại: ${chunkeeData.referralLink}`
      : `Hello, here is your exclusive invitation to the 1-on-1 "CHUNKS Test 100" assessment (MSE Theory). 45-minute live session with CiC. Register via my link: ${chunkeeData.referralLink}`;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getShareMessage());
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_CHUNKS_${chunkeeData?.code || 'REFERRAL'}.png`;
    link.href = url;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white border border-[rgba(10,10,10,0.18)] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-[#0a0a0a] shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#0a0a0a]/60 hover:text-[#0a0a0a] border border-[rgba(10,10,10,0.12)] hover:border-[#0a0a0a] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[rgba(10,10,10,0.14)] pb-4 pr-8">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
              {lang === 'vi' ? 'CỔNG CHUNKEE · LẤY LINK & MÃ QR' : 'CHUNKEE GATEWAY · REFERRAL & QR'}
            </span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.03em] leading-tight text-[#0a0a0a]">
            {lang === 'vi'
              ? 'Lấy Link Giới Thiệu & Mã QR Chunkee'
              : 'Get Your Chunkee Referral Link & QR Code'}
          </h2>
          <p className="text-[13.5px] text-[#0a0a0a]/65 font-light mt-1">
            {lang === 'vi'
              ? 'Dành cho Chunkee tham gia giới thiệu ứng viên CHUNKS Test 100. Xuất link và mã QR cá nhân hóa trong vài giây.'
              : 'For Chunkees referring candidates to CHUNKS Test 100. Generate your link & QR code in seconds.'}
          </p>
        </div>

        {/* Tabs for Lookup vs Register */}
        <div className="flex items-center border-b border-[rgba(10,10,10,0.12)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('lookup');
              setLookupError(null);
            }}
            className={`pb-2.5 px-4 text-[13px] font-semibold tracking-wide uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'border-[#0a0a0a] text-[#0a0a0a]'
                : 'border-transparent text-[#0a0a0a]/50 hover:text-[#0a0a0a]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Đã có mã / email' : 'Existing Chunkee'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError(null);
            }}
            className={`pb-2.5 px-4 text-[13px] font-semibold tracking-wide uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-[#0a0a0a] text-[#0a0a0a]'
                : 'border-transparent text-[#0a0a0a]/50 hover:text-[#0a0a0a]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#c81e16]" />
            <span>{lang === 'vi' ? 'Chưa có thông tin? Đăng ký ngay' : 'New Chunkee Sign Up'}</span>
          </button>
        </div>

        {/* TAB 1: Existing Lookup Form */}
        {activeTab === 'lookup' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    lang === 'vi'
                      ? 'Nhập mã Chunkee (VD: NAM2026), email hoặc SĐT...'
                      : 'Enter Chunkee code (e.g. NAM2026), email or phone...'
                  }
                  className="w-full px-4 py-2.5 text-[14px] border border-[rgba(10,10,10,0.22)] focus:outline-none focus:border-[#c81e16] font-mono text-[#0a0a0a] uppercase placeholder:normal-case placeholder:font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-2.5 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[13.5px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {lookupLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{lang === 'vi' ? 'Lấy Link & QR' : 'Get Link & QR'}</span>
                )}
              </button>
            </form>

            {lookupError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#c81e16] text-[13px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{lookupError}</div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-[12px] underline mt-1 font-semibold text-[#0a0a0a] hover:text-[#c81e16] cursor-pointer"
                  >
                    {lang === 'vi'
                      ? 'Bấm vào đây để nhập họ tên, email, SĐT và tạo link ngay →'
                      : 'Click here to register your name, email & phone for instant link →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: New Chunkee Registration Form (Per user requirement: Nếu chunkee chưa có thông tin trong hệ thống - cần nhập email họ tên số điện thoại) */}
        {activeTab === 'register' && (
          <div className="p-5 border border-[rgba(10,10,10,0.14)] bg-slate-50 space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c81e16]">
                {lang === 'vi' ? 'ĐĂNG KÝ CHUNKEE MỚI' : 'REGISTER AS CHUNKEE'}
              </span>
              <h3 className="text-[17px] font-bold text-[#0a0a0a] mt-0.5">
                {lang === 'vi'
                  ? 'Nhập thông tin để nhận Link & Mã QR giới thiệu'
                  : 'Enter details to get your instant referral link'}
              </h3>
              <p className="text-[13px] text-[#0a0a0a]/65 font-light mt-0.5">
                {lang === 'vi'
                  ? 'Hệ thống sẽ cấp mã Chunkee độc quyền và tạo link giới thiệu ngay lập tức.'
                  : 'System will assign an exclusive Chunkee code and generate your link instantly.'}
              </p>
            </div>

            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#c81e16] text-[12.5px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a]/70 mb-1">
                  {lang === 'vi' ? 'Họ và tên *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  disabled={regLoading}
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2 border border-[rgba(10,10,10,0.2)] bg-white text-[13.5px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a]/70 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={regLoading}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2 border border-[rgba(10,10,10,0.2)] bg-white text-[13.5px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a]/70 mb-1">
                    {lang === 'vi' ? 'Số điện thoại *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={regLoading}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2 border border-[rgba(10,10,10,0.2)] bg-white text-[13.5px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11.5px] text-[#0a0a0a]/50">
                  {lang === 'vi' ? 'Tự động tạo mã và link' : 'Instant code assignment'}
                </span>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="px-6 py-2.5 bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13px] font-bold rounded-full transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {regLoading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'vi' ? 'Đang tạo mã...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'vi' ? 'Tạo Link & Mã QR Ngay' : 'Generate Link & QR Now'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {regSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{regSuccessMsg}</span>
          </div>
        )}

        {/* Instant Output State: Unique Link, Dynamic QR, Real Metric */}
        {chunkeeData && (
          <div className="space-y-6 pt-2 border-t border-[rgba(10,10,10,0.1)]">
            {/* Chunkee Identity Banner */}
            <div className="p-4 bg-slate-50 border border-[rgba(10,10,10,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a]/50">
                  {lang === 'vi' ? 'Chunkee Được Xác Thực' : 'Verified Chunkee'}
                </div>
                <div className="text-[17px] font-bold text-[#0a0a0a] mt-0.5">
                  {chunkeeData.chunkerName}
                </div>
                <div className="text-[12px] font-mono text-[#c81e16] mt-0.5">
                  MÃ CHUNKEE: {chunkeeData.code}
                </div>
                {chunkeeData.phone && (
                  <div className="text-[11.5px] text-[#0a0a0a]/60 font-mono">
                    SĐT: {chunkeeData.phone}
                  </div>
                )}
              </div>

              {/* Real Metric Counter */}
              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-[rgba(10,10,10,0.12)] sm:pl-5 pt-2 sm:pt-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a]/50">
                  {lang === 'vi' ? 'Ứng Viên Đã Đăng Ký' : 'Candidates Registered'}
                </div>
                <div className="text-[24px] font-bold tabular-nums text-[#0a0a0a] mt-0.5">
                  {chunkeeData.totalReferred}
                  <span className="text-[12px] font-normal text-[#0a0a0a]/60 ml-1">
                    {lang === 'vi' ? 'người' : 'total'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#0a0a0a]/60">
                  {chunkeeData.breakdown.greenTest} Green · {chunkeeData.breakdown.redTest} Red
                </div>
              </div>
            </div>

            {/* Unique Referral Link & Copy */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/60">
                {lang === 'vi' ? 'Link Giới Thiệu Của Bạn' : 'Your Unique Referral Link'}
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-[rgba(10,10,10,0.18)] font-mono text-[13px] text-[#0a0a0a] truncate select-all">
                  {chunkeeData.referralLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-5 py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border ${
                    copiedLink
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-[#c81e16] hover:bg-[#ff3b30] text-white border-[#c81e16]'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'vi' ? 'Đã sao chép' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'vi' ? 'Sao Chép Link' : 'Copy Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic QR Code & Download */}
            <div className="p-5 border border-[rgba(10,10,10,0.14)] bg-white flex flex-col sm:flex-row items-center gap-6">
              <div
                ref={qrCanvasRef}
                className="p-3 bg-white border border-[rgba(10,10,10,0.18)] shrink-0 shadow-sm"
              >
                <QRCodeCanvas
                  value={chunkeeData.referralLink}
                  size={148}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <h4 className="text-[15px] font-semibold text-[#0a0a0a]">
                    {lang === 'vi' ? 'Mã QR Giới Thiệu Động' : 'Dynamic Referral QR Code'}
                  </h4>
                  <p className="text-[12.5px] text-[#0a0a0a]/65 font-light mt-1">
                    {lang === 'vi'
                      ? 'Lưu mã QR vào thư viện ảnh để gửi trực tiếp qua Zalo, story Instagram hoặc dán vào slide giới thiệu.'
                      : 'Download QR code image to share on mobile chat apps, social stories, or presentation decks.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="px-4 py-2 border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white text-[12.5px] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c81e16]" />
                    <span>{lang === 'vi' ? 'Tải Mã QR (.png)' : 'Download QR Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-4 py-2 border border-[rgba(10,10,10,0.2)] hover:border-[#0a0a0a] text-[12.5px] font-medium flex items-center gap-2 transition-colors cursor-pointer text-[#0a0a0a]/80"
                  >
                    {copiedMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'vi' ? 'Đã chép tin nhắn' : 'Copied template!'}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#c81e16]" />
                        <span>{lang === 'vi' ? 'Chép mẫu tin nhắn Zalo' : 'Copy invite text'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
