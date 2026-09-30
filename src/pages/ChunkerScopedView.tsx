import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Copy,
  Check,
  QrCode,
  Download,
  Share2,
  Users,
  Search,
  UserPlus,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  apiLookupChunkee,
  apiRegisterChunkee,
  ChunkeeLookupResponse,
  ChunkeeNotFoundError,
} from '../api/client';
import { isValidPhoneNumber, isValidEmailAddress } from '../schemas/validation';
import {
  buildReferralUrl,
  getDomainOptions,
  getActiveReferralDomain,
  setActiveReferralDomain,
  DEFAULT_PRODUCTION_DOMAIN,
  generateShareInviteMessage,
  normalizeDomain,
} from '../utils/referral';

interface Props {
  initialCode?: string;
  lang: 'vi' | 'en';
}

export const ChunkerScopedView: React.FC<Props> = ({ initialCode = '', lang }) => {
  const [identifier, setIdentifier] = useState(initialCode);
  const [stats, setStats] = useState<ChunkeeLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration for new Chunkee if not yet in system
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Domain selection state (defaults to chunkstest.ai.studio or active domain, NEVER localhost)
  const domainOptions = getDomainOptions();
  const [selectedDomain, setSelectedDomain] = useState<string>(() => getActiveReferralDomain());
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [showCustomDomainForm, setShowCustomDomainForm] = useState(false);

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Clean referral link guaranteed to never use localhost
  const activeReferralUrl = stats
    ? buildReferralUrl(stats.code, selectedDomain, stats.referralLink)
    : '';

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('code') || urlParams.get('ref');
      const urlEmail = urlParams.get('email');
      const query = urlCode || urlEmail || initialCode;
      if (query && query.trim()) {
        setIdentifier(query.toUpperCase());
        fetchStats(query);
      }
    } catch (e) {
      if (initialCode) fetchStats(initialCode);
    }
  }, []);

  const fetchStats = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setRegSuccessMsg(null);
    try {
      const data = await apiLookupChunkee(query.trim());
      setStats(data);
      setShowRegisterForm(false);
    } catch (err: any) {
      if (err instanceof ChunkeeNotFoundError || err.notFound) {
        if (query.includes('@')) setRegEmail(query);
        setShowRegisterForm(true);
        setError(err.message);
      } else {
        setError(
          err.message ||
            (lang === 'vi'
              ? 'Không tìm thấy thông tin Chunkee. Vui lòng kiểm tra lại mã hoặc email.'
              : 'Could not find Chunkee. Please check your code or email.')
        );
      }
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(identifier);
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

      setStats(result);
      setIdentifier(result.code);
      setShowRegisterForm(false);
      setError(null);
      setRegSuccessMsg(
        lang === 'vi'
          ? `Đăng ký thành công! Mã Chunkee của bạn là ${result.code}.`
          : `Registration successful! Your Chunkee code is ${result.code}.`
      );
    } catch (err: any) {
      setRegError(err.message || 'Đăng ký Chunkee thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!activeReferralUrl) return;
    navigator.clipboard.writeText(activeReferralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = stats
    ? generateShareInviteMessage(stats.chunkerName, stats.code, activeReferralUrl, lang)
    : '';

  const copyInviteMessage = () => {
    if (!shareText) return;
    navigator.clipboard.writeText(shareText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const downloadQrCode = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_CHUNKS_${stats?.code || 'REFERRAL'}.png`;
    link.href = url;
    link.click();
  };

  const handleSaveCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainInput.trim()) return;
    const normalized = normalizeDomain(customDomainInput);
    setSelectedDomain(normalized);
    setActiveReferralDomain(normalized);
    setShowCustomDomainForm(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16 text-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[rgba(10,10,10,0.14)] pb-8 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
            {lang === 'vi' ? 'CỔNG CHUNKEE · TRUY CẬP KHÔNG MẬT KHẨU' : 'CHUNKEE GATEWAY · ZERO-FRICTION ACCESS'}
          </span>
        </div>
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] leading-tight text-[#0a0a0a]">
          {lang === 'vi' ? 'Cổng Tra Cứu & Lấy QR Chunkee.' : 'Chunkee Referral & QR Hub.'}
        </h1>
        <p className="max-w-[50ch] text-[15.5px] text-[#0a0a0a]/65 font-light leading-relaxed mt-2">
          {lang === 'vi'
            ? 'Nhập Mã Chunkee hoặc Email/SĐT của bạn để lấy link mời riêng, tải mã QR và theo dõi số lượng ứng viên đăng ký theo thời gian thực.'
            : 'Enter your assigned Chunkee Code, Email or Phone to generate your personal link, QR code, and live registration metrics.'}
        </p>
      </div>

      {/* Zero-Friction Input Box */}
      <div className="border border-[rgba(10,10,10,0.14)] p-6 bg-slate-50 space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
              {lang === 'vi' ? 'Mã Chunkee, Email hoặc Số điện thoại' : 'Chunkee Code, Email or Phone'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: NAM2026, nam.nguyen@chunks.edu.vn hoặc 0912..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] bg-white text-[14px] font-mono focus:outline-none focus:border-[#c81e16]"
              />
              <Search className="w-4 h-4 text-[#0a0a0a]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="sm:self-end flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-[#0a0a0a] hover:bg-[#c81e16] text-white font-semibold text-[13.5px] rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>{lang === 'vi' ? 'Đang tra cứu...' : 'Searching...'}</span>
                </>
              ) : (
                <span>{lang === 'vi' ? 'Tra Cứu & Xuất QR' : 'Get Link & QR'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowRegisterForm(!showRegisterForm);
                setRegError(null);
              }}
              className="py-2.5 px-4 border border-[rgba(10,10,10,0.2)] hover:border-[#0a0a0a] bg-white text-[13px] font-medium rounded-full flex items-center gap-1.5 transition-colors cursor-pointer text-[#0a0a0a]"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#c81e16]" />
              <span>{lang === 'vi' ? 'Đăng ký mới' : 'Sign Up'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#c81e16] text-[13px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">{error}</div>
              {!showRegisterForm && (
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(true)}
                  className="text-[12px] underline mt-1 font-semibold text-[#0a0a0a] hover:text-[#c81e16] cursor-pointer"
                >
                  {lang === 'vi'
                    ? 'Bấm vào đây để nhập thông tin đăng ký Chunkee ngay →'
                    : 'Click here to register as a new Chunkee →'}
                </button>
              )}
            </div>
          </div>
        )}

        {regSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{regSuccessMsg}</span>
          </div>
        )}

        {/* Inline Registration Form if Chunkee is not yet in system */}
        {showRegisterForm && (
          <div className="p-5 border border-[rgba(10,10,10,0.18)] bg-white mt-4 space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c81e16]">
                {lang === 'vi' ? 'ĐĂNG KÝ CHUNKEE MỚI' : 'REGISTER NEW CHUNKEE'}
              </span>
              <h3 className="text-[16px] font-bold text-[#0a0a0a] mt-0.5">
                {lang === 'vi'
                  ? 'Nhập Email, Họ Tên & Số Điện Thoại để nhận Link'
                  : 'Enter Email, Full Name & Phone Number for instant link'}
              </h3>
              <p className="text-[12.5px] text-[#0a0a0a]/65 font-light">
                {lang === 'vi'
                  ? 'Nếu bạn chưa có mã trong hệ thống, vui lòng nhập 3 thông tin cơ bản bên dưới để được cấp mã và link ngay tức thì.'
                  : 'If you are not yet in the system, enter the fields below to receive your code and link.'}
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
                  {lang === 'vi' ? 'Tạo mã tự động từ tên của bạn' : 'Auto code assignment from name'}
                </span>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="px-6 py-2.5 bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13px] font-bold rounded-full transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {regLoading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'vi' ? 'Đang tạo...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'vi' ? 'Tạo Link & Mã QR Ngay' : 'Generate Link & QR Now'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Output Content */}
      {stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Identity & Live Metric Counter */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7 p-6 border border-[rgba(10,10,10,0.14)] bg-white">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#c81e16]">
                {lang === 'vi' ? 'THÔNG TIN CHUNKEE' : 'CHUNKEE PROFILE'}
              </div>
              <div className="text-[22px] font-bold text-[#0a0a0a] mt-1">{stats.chunkerName}</div>
              <div className="text-[13px] font-mono text-[#0a0a0a]/60 mt-1">
                MÃ REF: <span className="font-bold text-[#c81e16]">{stats.code}</span> · {stats.email}
              </div>
              {stats.phone && (
                <div className="text-[12px] font-mono text-[#0a0a0a]/50 mt-0.5">
                  SĐT: {stats.phone}
                </div>
              )}
            </div>

            <div className="col-span-12 md:col-span-5 p-6 border border-[rgba(10,10,10,0.14)] bg-white flex flex-col justify-between">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60">
                {lang === 'vi' ? 'SỐ ỨNG VIÊN ĐÃ ĐĂNG KÝ' : 'CANDIDATES REGISTERED'}
              </div>
              <div className="my-2">
                <span className="text-[36px] font-bold tabular-nums text-[#0a0a0a] leading-none">
                  {stats.totalReferred}
                </span>
                <span className="text-[13px] font-normal text-[#0a0a0a]/50 ml-2">
                  {lang === 'vi' ? 'ứng viên' : 'registered'}
                </span>
              </div>
              <div className="text-[12px] font-mono text-[#0a0a0a]/60 pt-2 border-t border-[rgba(10,10,10,0.08)]">
                {stats.breakdown.greenTest} Green (%c) · {stats.breakdown.redTest} Red (%r)
              </div>
            </div>
          </div>

          {/* Referral Link & Instant Copy */}
          <div className="p-6 border border-[rgba(10,10,10,0.14)] bg-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]">
                  {lang === 'vi' ? 'LINK MỜI ĐỘC QUYỀN' : 'YOUR UNIQUE REFERRAL LINK'}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedDomain.includes('chunkstest.ai.studio')
                    ? 'chunkstest.ai.studio'
                    : lang === 'vi'
                      ? 'Domain Thật'
                      : 'Real Domain'}
                </span>
              </div>

              {/* Domain Switcher */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-[#0a0a0a]/60" />
                <span className="text-[#0a0a0a]/60 hidden sm:inline">
                  {lang === 'vi' ? 'Domain:' : 'Domain:'}
                </span>
                <select
                  value={selectedDomain}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setShowCustomDomainForm(true);
                      setCustomDomainInput(selectedDomain);
                    } else {
                      setSelectedDomain(val);
                      setActiveReferralDomain(val);
                      setShowCustomDomainForm(false);
                    }
                  }}
                  className="bg-white border border-[rgba(10,10,10,0.2)] text-[#0a0a0a] font-mono text-[11px] px-2 py-0.5 rounded-none cursor-pointer focus:outline-none focus:border-[#c81e16]"
                >
                  <option value={DEFAULT_PRODUCTION_DOMAIN}>
                    chunkstest.ai.studio (Chính Thức)
                  </option>
                  {domainOptions
                    .filter((opt) => opt.url !== DEFAULT_PRODUCTION_DOMAIN)
                    .map((opt) => (
                      <option key={opt.id} value={opt.url}>
                        {opt.label}
                      </option>
                    ))}
                  <option value="CUSTOM">+ {lang === 'vi' ? 'Tùy chỉnh domain...' : 'Custom domain...'}</option>
                </select>
              </div>
            </div>

            {/* Custom Domain Input Form */}
            {showCustomDomainForm && (
              <form
                onSubmit={handleSaveCustomDomain}
                className="flex items-center gap-2 p-2 bg-slate-50 border border-[rgba(10,10,10,0.18)]"
              >
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="VD: https://chunkstest.ai.studio"
                  className="flex-1 text-[12px] font-mono px-2 py-1 border border-slate-200 focus:outline-none focus:border-[#c81e16] bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#0a0a0a] text-white text-[11px] font-semibold cursor-pointer"
                >
                  {lang === 'vi' ? 'Áp dụng' : 'Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomDomainForm(false)}
                  className="px-2 py-1 text-[11px] text-[#0a0a0a]/60 hover:text-[#0a0a0a] cursor-pointer"
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
              </form>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-50 border border-[rgba(10,10,10,0.16)] font-mono text-[13.5px] text-[#0a0a0a] truncate select-all font-semibold">
                {activeReferralUrl}
              </div>
              <button
                type="button"
                onClick={copyReferralLink}
                className={`px-6 py-3 text-[13.5px] font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  copiedLink
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-[#c81e16] hover:bg-[#ff3b30] text-white border-[#c81e16]'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{lang === 'vi' ? 'Đã sao chép!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{lang === 'vi' ? 'Sao chép link' : 'Copy link'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11.5px] text-[#0a0a0a]/55 font-light">
              {lang === 'vi'
                ? 'Link đã được liên kết với domain thực tế, đảm bảo ứng viên truy cập trực tiếp từ mọi thiết bị (máy tính & điện thoại).'
                : 'Link is connected to your live domain, accessible by candidates from any device.'}
            </div>
          </div>

          {/* Dynamic QR Code Section */}
          <div className="p-6 border border-[rgba(10,10,10,0.14)] bg-white flex flex-col sm:flex-row items-center gap-8">
            <div
              ref={qrCanvasRef}
              className="p-4 bg-white border border-[rgba(10,10,10,0.18)] shrink-0 shadow-sm"
            >
              <QRCodeCanvas
                value={activeReferralUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#c81e16] block mb-1">
                  DYNAMIC QR CODE
                </span>
                <h3 className="text-[18px] font-semibold text-[#0a0a0a]">
                  {lang === 'vi' ? 'Mã QR Giới Thiệu Trực Quan' : 'Shareable Referral QR Code'}
                </h3>
                <p className="text-[13px] text-[#0a0a0a]/65 font-light leading-relaxed mt-1">
                  {lang === 'vi'
                    ? 'Quét mã để mở thẳng form đăng ký với mã giới thiệu đã được điền sẵn. Tải mã về máy để chia sẻ trên Zalo hoặc story mạng xã hội.'
                    : 'Scanning opens the candidate registration form with your referral code auto-filled. Download to post on chats or stories.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={downloadQrCode}
                  className="px-5 py-2.5 border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white text-[13px] font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#c81e16]" />
                  <span>{lang === 'vi' ? 'Tải mã QR (.png)' : 'Download QR Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={copyInviteMessage}
                  className="px-5 py-2.5 border border-[rgba(10,10,10,0.2)] hover:border-[#0a0a0a] text-[13px] font-medium rounded-full flex items-center gap-2 transition-colors cursor-pointer text-[#0a0a0a]"
                >
                  {copiedMsg ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'vi' ? 'Đã chép tin nhắn!' : 'Copied template!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#c81e16]" />
                      <span>{lang === 'vi' ? 'Sao chép mẫu mời Zalo' : 'Copy invite message'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Masked Candidate Roster (Real Data Only, Empty State Handling) */}
          <div className="border border-[rgba(10,10,10,0.14)] p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(10,10,10,0.1)] pb-3">
              <div>
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60 block">
                  {lang === 'vi' ? 'DANH SÁCH ỨNG VIÊN GIỚI THIỆU' : 'REFERRED CANDIDATES'}
                </span>
                <h4 className="text-[16px] font-semibold text-[#0a0a0a] mt-0.5">
                  {lang === 'vi' ? 'Tiến Độ Đánh Giá Của Ứng Viên' : 'Candidate Assessment Status'}
                </h4>
              </div>
              <span className="text-xs font-mono text-[#0a0a0a]/50">
                {stats.totalReferred} {lang === 'vi' ? 'hồ sơ' : 'records'}
              </span>
            </div>

            {(!stats.candidates || stats.candidates.length === 0) ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-[rgba(10,10,10,0.15)] bg-slate-50/50">
                <Users className="w-8 h-8 text-[#0a0a0a]/30 mx-auto stroke-1" />
                <div className="text-[14px] font-semibold text-[#0a0a0a]">
                  {lang === 'vi' ? 'Chưa có ứng viên nào đăng ký' : 'No registrations yet'}
                </div>
                <p className="text-[12.5px] text-[#0a0a0a]/60 max-w-sm mx-auto font-light">
                  {lang === 'vi'
                    ? 'Hãy chia sẻ link hoặc mã QR ở trên đến các ứng viên tiềm năng để kích hoạt buổi đánh giá 1-on-1.'
                    : 'Share your referral link or QR code with prospective candidates to start their 1-on-1 session.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[rgba(10,10,10,0.1)] text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/50">
                      <th className="py-2.5 pr-4">Candidate</th>
                      <th className="py-2.5 pr-4">Test</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(10,10,10,0.06)]">
                    {stats.candidates.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-[#0a0a0a]">{c.maskedName}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 border ${
                              c.testType === 'green'
                                ? 'border-emerald-600/30 text-emerald-800 bg-emerald-50/40'
                                : 'border-[#c81e16]/30 text-[#c81e16] bg-rose-50/40'
                            }`}
                          >
                            {c.testType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-[12px] capitalize text-[#0a0a0a]/80 font-mono">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[12px] font-mono text-[#0a0a0a]/50">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
