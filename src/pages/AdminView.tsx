import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  UserPlus,
  Phone,
  Mail,
  KeyRound,
  AlertCircle,
  RefreshCw,
  X,
  Bell,
  Send,
  Save,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInAdminWithGoogle,
  signOutAdmin,
  fetchNotificationSettings,
  saveNotificationSettings,
} from '../firebase/services';
import {
  apiGetAdminMetrics,
  apiGetAdminCandidates,
  apiUpdateCandidateStatus,
  apiCreateChunker,
  apiGetAdminChunkers,
  apiGetNotificationSettings,
  apiSaveNotificationSettings,
  apiSendTestNotification,
  apiResendConfirmationEmail,
  AdminMetricsResponse,
} from '../api/client';
import { generateCandidateEmailContent } from '../utils/candidateEmailTemplate';
import { ChunkerReferralAnalyticsCard } from '../components/ChunkerReferralAnalyticsCard';
import { Candidate, Chunker, CandidateStatus } from '../types';
import { buildReferralUrl, getActiveReferralDomain } from '../utils/referral';

interface Props {
  currentUser: User | null;
  lang: 'vi' | 'en';
}

const WHITELIST_EMAILS = [
  'le.ntmkh@gmail.com',
  'lucy2511kh@gmail.com',
  'admin@chunks.edu.vn',
  'operations@chunks.edu.vn',
];

export const AdminView: React.FC<Props> = ({ currentUser, lang }) => {
  // Access control
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [chunkers, setChunkers] = useState<Chunker[]>([]);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [testTypeFilter, setTestTypeFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Notification Email Settings state
  const [notificationEmailsInput, setNotificationEmailsInput] = useState('le.ntmkh@gmail.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);
  const [testingNotif, setTestingNotif] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [recentNotifLogs, setRecentNotifLogs] = useState<any[]>([]);

  // Candidate confirmation email resend & preview state
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [previewTestType, setPreviewTestType] = useState<'green' | 'red'>('green');
  const [previewTestLevel, setPreviewTestLevel] = useState<'easy' | 'hard'>('easy');

  // Add Chunker form
  const [showAddChunker, setShowAddChunker] = useState(false);
  const [newChunkerName, setNewChunkerName] = useState('');
  const [newChunkerCode, setNewChunkerCode] = useState('');
  const [newChunkerEmail, setNewChunkerEmail] = useState('');
  const [newChunkerSecret, setNewChunkerSecret] = useState('');
  const [newChunkerNotes, setNewChunkerNotes] = useState('');
  const [creatingChunker, setCreatingChunker] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Whitelist check
  const activeEmail = currentUser?.email || '';
  const isWhitelisted =
    activeEmail &&
    (WHITELIST_EMAILS.includes(activeEmail.toLowerCase()) ||
      activeEmail.toLowerCase().endsWith('@chunks.edu.vn'));

  const loadAdminData = async () => {
    if (!isWhitelisted) return;
    setLoading(true);
    setError(null);
    try {
      const [m, cRes, chRes, notifRes] = await Promise.all([
        apiGetAdminMetrics(activeEmail),
        apiGetAdminCandidates(activeEmail, {
          page,
          limit: 20,
          testType: testTypeFilter,
          status: statusFilter,
          search,
        }),
        apiGetAdminChunkers(activeEmail).catch(() => ({ chunkers: [] })),
        apiGetNotificationSettings(activeEmail).catch(async () => {
          const fallback = await fetchNotificationSettings();
          return { settings: fallback, recentLogs: [] };
        }),
      ]);

      setMetrics(m);
      // Filter candidates by level if needed
      let fetchedCandidates = cRes.candidates || [];
      if (levelFilter !== 'ALL') {
        fetchedCandidates = fetchedCandidates.filter(
          (c) => (c.testLevel || 'easy') === levelFilter
        );
      }
      setCandidates(fetchedCandidates);
      setTotalCandidates(cRes.total);
      setChunkers(chRes.chunkers || []);

      if (notifRes?.settings) {
        setNotificationEmailsInput(
          Array.isArray(notifRes.settings.notificationEmails)
            ? notifRes.settings.notificationEmails.join(', ')
            : 'le.ntmkh@gmail.com'
        );
        setNotificationsEnabled(notifRes.settings.enabled !== false);
        if (notifRes.recentLogs) {
          setRecentNotifLogs(notifRes.recentLogs);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWhitelisted) {
      loadAdminData();
    }
  }, [isWhitelisted, page, statusFilter, testTypeFilter, levelFilter, search]);

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotif(true);
    setNotifFeedback(null);
    try {
      const rawList = notificationEmailsInput
        .split(/[,;\n]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (rawList.length === 0) {
        throw new Error(lang === 'vi' ? 'Vui lòng nhập ít nhất 1 email hợp lệ' : 'Please provide at least 1 valid email');
      }

      await apiSaveNotificationSettings(activeEmail, {
        notificationEmails: rawList,
        enabled: notificationsEnabled,
      });

      // Also persist to Firestore
      await saveNotificationSettings({
        notificationEmails: rawList,
        enabled: notificationsEnabled,
        updatedBy: activeEmail,
      });

      setNotifFeedback({
        type: 'success',
        message:
          lang === 'vi'
            ? 'Đã lưu cấu hình email nhận thông báo thành công!'
            : 'Notification settings saved successfully!',
      });
    } catch (err: any) {
      setNotifFeedback({
        type: 'error',
        message: err.message || (lang === 'vi' ? 'Không thể lưu cài đặt' : 'Failed to save settings'),
      });
    } finally {
      setSavingNotif(false);
    }
  };

  const handleSendTestNotification = async () => {
    setTestingNotif(true);
    setNotifFeedback(null);
    try {
      const res = await apiSendTestNotification(activeEmail);
      if (res.testLog) {
        setRecentNotifLogs((prev) => [res.testLog, ...prev.slice(0, 9)]);
      }
      setNotifFeedback({
        type: 'success',
        message:
          lang === 'vi'
            ? `Đã gửi thông báo thử nghiệm thành công tới: ${notificationEmailsInput}`
            : `Test notification dispatched successfully to: ${notificationEmailsInput}`,
      });
    } catch (err: any) {
      setNotifFeedback({
        type: 'error',
        message: err.message || (lang === 'vi' ? 'Gửi thử thất bại' : 'Test dispatch failed'),
      });
    } finally {
      setTestingNotif(false);
    }
  };

  const handleResendConfirmation = async (candidateId: string) => {
    setResendingId(candidateId);
    setNotifFeedback(null);
    try {
      const res = await apiResendConfirmationEmail(activeEmail, candidateId);
      setNotifFeedback({
        type: 'success',
        message:
          res.message ||
          (lang === 'vi'
            ? 'Đã gửi lại email xác nhận thành công tới ứng viên!'
            : 'Candidate confirmation email resent successfully!'),
      });
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, confirmationEmailSent: true, confirmationEmailSentAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      setNotifFeedback({
        type: 'error',
        message: err.message || (lang === 'vi' ? 'Không thể gửi lại email xác nhận' : 'Failed to resend confirmation'),
      });
    } finally {
      setResendingId(null);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    setUpdatingId(candidateId);
    try {
      await apiUpdateCandidateStatus(activeEmail, candidateId, newStatus);
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateChunker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChunkerName.trim() || !newChunkerCode.trim() || !newChunkerEmail.trim()) return;
    setCreatingChunker(true);
    try {
      const res = await apiCreateChunker(activeEmail, {
        fullName: newChunkerName.trim(),
        code: newChunkerCode.trim().toUpperCase(),
        email: newChunkerEmail.trim(),
        secretToken: newChunkerSecret.trim() || `SEC-${newChunkerCode.trim().toUpperCase()}`,
        notes: newChunkerNotes.trim(),
      });
      setChunkers((prev) => [res.chunker, ...prev]);
      setShowAddChunker(false);
      setNewChunkerName('');
      setNewChunkerCode('');
      setNewChunkerEmail('');
      setNewChunkerSecret('');
      setNewChunkerNotes('');
    } catch (err: any) {
      alert(`Failed to add Chunker: ${err.message}`);
    } finally {
      setCreatingChunker(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/admin/export`, '_blank');
  };

  // Gatekeeper Screen if Not Logged In or Unauthorized
  if (!isWhitelisted) {
    return (
      <div className="w-full max-w-lg mx-auto py-20 px-4 text-[#0a0a0a]">
        <div className="border border-[rgba(10,10,10,0.16)] p-8 sm:p-10 bg-white space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-[15px] h-[15px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
              {lang === 'vi' ? 'KHU VỰC QUẢN TRỊ VIÊN' : 'ADMINISTRATIVE ACCESS GATEWAY'}
            </span>
          </div>

          <div>
            <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight text-[#0a0a0a]">
              {lang === 'vi' ? 'Quản Trị Chiến Dịch CHUNKS.' : 'Restricted Admin Operations.'}
            </h2>
            <p className="text-[14px] text-[#0a0a0a]/65 font-light leading-relaxed mt-2">
              {lang === 'vi'
                ? 'Khu vực bảo mật chỉ dành riêng cho điều phối viên chiến dịch. Vui lòng đăng nhập Google bằng email được ủy quyền để truy cập.'
                : 'This portal provides access to candidate PII and operations. Google Sign-In with an authorized administrator account is required.'}
            </p>
          </div>

          {currentUser && !isWhitelisted && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-[#c81e16] text-[12.5px] space-y-1">
              <div className="font-semibold">
                {lang === 'vi' ? 'Tài khoản chưa được phân quyền' : 'Account Unauthorized'}
              </div>
              <div className="font-mono text-xs text-[#0a0a0a]/70">
                {currentUser.email}
              </div>
              <p className="font-light text-[12px] text-[#0a0a0a]/60">
                {lang === 'vi'
                  ? 'Email này không nằm trong danh sách điều phối viên được cấp phép.'
                  : 'This email is not registered in the administrator whitelist.'}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            {!currentUser ? (
              <button
                type="button"
                onClick={signInAdminWithGoogle}
                className="w-full py-3.5 px-6 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[14px] font-semibold rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#ff3b30]" />
                <span>{lang === 'vi' ? 'Đăng nhập với Google' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={signOutAdmin}
                className="w-full py-2.5 px-4 border border-[rgba(10,10,10,0.2)] hover:border-[#c81e16] text-[#c81e16] text-[13px] font-semibold rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'vi' ? 'Đăng xuất tài khoản này' : 'Sign Out'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-16 text-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[rgba(10,10,10,0.14)] pb-8 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
              ADMIN OPERATIONS · FULL PRIVILEGE
            </span>
          </div>
          <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] leading-tight text-[#0a0a0a]">
            {lang === 'vi' ? 'Bảng Điều Phối Chiến Dịch.' : '100-Seat Campaign Dashboard.'}
          </h1>
          <p className="text-[14.5px] text-[#0a0a0a]/65 font-light leading-relaxed mt-1">
            {lang === 'vi'
              ? `Đang đăng nhập với tư cách điều phối viên: ${activeEmail}`
              : `Authenticated operator: ${activeEmail}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-2.5 border border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a] rounded-full transition-colors cursor-pointer text-[#0a0a0a]"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 border border-[rgba(10,10,10,0.2)] hover:border-[#0a0a0a] text-[13px] font-medium rounded-full flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#c81e16]" />
            <span>{lang === 'vi' ? 'Xuất CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setShowAddChunker(true)}
            className="px-5 py-2.5 bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13px] font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Thêm Chunkee' : 'Add Chunkee'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 100-Seat Target Gauge & Breakdown */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Progress */}
          <div className="border border-[rgba(10,10,10,0.14)] p-5 bg-white">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/50 block">
              100-SEAT PILOT TARGET
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[34px] font-bold text-[#c81e16] font-mono tabular-nums leading-none">
                {metrics.totalRegistered}
              </span>
              <span className="text-[14px] text-[#0a0a0a]/60 font-mono">/ {metrics.target}</span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-slate-100 h-1 mt-3">
              <div
                className="bg-[#c81e16] h-1"
                style={{ width: `${Math.min(100, (metrics.totalRegistered / metrics.target) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-[#0a0a0a]/50 font-mono tabular-nums mt-1.5 block">
              {Math.round((metrics.totalRegistered / metrics.target) * 100)}% capacity achieved
            </span>
          </div>

          {/* Green Test Count */}
          <div className="border border-[rgba(10,10,10,0.14)] p-5 bg-white">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/50 block">
              GREEN TEST (%C FOCUS)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[34px] font-bold text-[#0a0a0a] font-mono tabular-nums leading-none">
                {metrics.greenCount}
              </span>
              <span className="text-[12px] text-emerald-700 font-mono">
                {metrics.totalRegistered > 0
                  ? Math.round((metrics.greenCount / metrics.totalRegistered) * 100)
                  : 0}%
              </span>
            </div>
            <span className="text-[11.5px] text-[#0a0a0a]/60 font-light mt-2 block">
              Attention &amp; anti-habitual pressure
            </span>
          </div>

          {/* Red Test Count */}
          <div className="border border-[rgba(10,10,10,0.14)] p-5 bg-white">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/50 block">
              RED TEST (%R IMPROV)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[34px] font-bold text-[#0a0a0a] font-mono tabular-nums leading-none">
                {metrics.redCount}
              </span>
              <span className="text-[12px] text-[#c81e16] font-mono">
                {metrics.totalRegistered > 0
                  ? Math.round((metrics.redCount / metrics.totalRegistered) * 100)
                  : 0}%
              </span>
            </div>
            <span className="text-[11.5px] text-[#0a0a0a]/60 font-light mt-2 block">
              Intention &amp; cognitive agility
            </span>
          </div>

          {/* Active Chunkees */}
          <div className="border border-[rgba(10,10,10,0.14)] p-5 bg-white">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/50 block">
              ACTIVE CHUNKEES
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[34px] font-bold text-[#0a0a0a] font-mono tabular-nums leading-none">
                {chunkers.length}
              </span>
              <span className="text-[12px] text-[#0a0a0a]/50 font-mono">Referrers</span>
            </div>
            <span className="text-[11.5px] text-[#0a0a0a]/60 font-light mt-2 block">
              Invite-only recruitment pool
            </span>
          </div>
        </div>
      )}

      {/* Analytics Summary Card: Chunker Referral Distribution Bar Chart */}
      <ChunkerReferralAnalyticsCard
        chunkers={chunkers}
        candidates={candidates}
        lang={lang}
      />

      {/* Candidate Table Controls (Search & Status Filter) */}
      <div className="border border-[rgba(10,10,10,0.14)] p-6 bg-white space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/50">
              {lang === 'vi' ? 'HỒ SƠ ỨNG VIÊN (RAW PII)' : 'CANDIDATE ROSTER (RAW PII)'}
            </span>
            <h3 className="text-[20px] font-semibold text-[#0a0a0a] mt-0.5">
              {lang === 'vi' ? 'Danh Sách Điều Phối Lịch Thi' : 'Scheduling Operations'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={lang === 'vi' ? 'Tìm tên, SĐT, email...' : 'Search name, phone, email...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[rgba(10,10,10,0.2)] text-[12.5px] text-[#0a0a0a] focus:outline-none focus:border-[#c81e16] w-48 sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-[#0a0a0a]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[rgba(10,10,10,0.2)] text-[12.5px] text-[#0a0a0a] bg-white cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No Show</option>
            </select>

            {/* Test Type Filter */}
            <select
              value={testTypeFilter}
              onChange={(e) => setTestTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[rgba(10,10,10,0.2)] text-[12.5px] text-[#0a0a0a] bg-white cursor-pointer"
            >
              <option value="ALL">All Tests</option>
              <option value="GREEN">Green Test</option>
              <option value="RED">Red Test</option>
            </select>

            {/* Test Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[rgba(10,10,10,0.2)] text-[12.5px] text-[#0a0a0a] bg-white cursor-pointer"
            >
              <option value="ALL">{lang === 'vi' ? 'Tất cả Level' : 'All Levels'}</option>
              <option value="easy">{lang === 'vi' ? 'Level: Dễ' : 'Level: Easy'}</option>
              <option value="hard">{lang === 'vi' ? 'Level: Khó' : 'Level: Hard'}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(10,10,10,0.14)] text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/50">
                <th className="py-2.5 pr-3">Candidate</th>
                <th className="py-2.5 pr-3">Direct Contact</th>
                <th className="py-2.5 pr-3">Test &amp; Level</th>
                <th className="py-2.5 pr-3">Preferred Window</th>
                <th className="py-2.5 pr-3">Inviter</th>
                <th className="py-2.5 pr-3">Confirmation Email</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(10,10,10,0.08)]">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30] mx-auto mb-3" aria-hidden="true" />
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/50">
                        {lang === 'vi' ? 'HỆ THỐNG TRỰC TUYẾN SẴN SÀNG' : 'SYSTEM ONLINE & READY'}
                      </div>
                      <div className="text-[17px] font-bold text-[#0a0a0a]">
                        {lang === 'vi' ? 'Chưa có lượt đăng ký nào' : 'No registrations found'}
                      </div>
                      <p className="text-[13px] text-[#0a0a0a]/60 font-light leading-relaxed">
                        {lang === 'vi'
                          ? 'Dữ liệu ứng viên đăng ký 1-on-1 từ chiến dịch CHUNKS Test 100 sẽ hiển thị tại đây theo thời gian thực để bạn sắp xếp lịch đánh giá.'
                          : 'Candidate registrations from the CHUNKS Test 100 campaign will appear here in real-time for evaluation scheduling.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name & Occupation */}
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-[#0a0a0a]">{c.fullName}</div>
                      <div className="text-[11px] text-[#0a0a0a]/50">{c.occupation} · {c.ageRange}</div>
                    </td>

                    {/* Phone & Email (Raw PII) */}
                    <td className="py-3 pr-3 font-mono text-xs">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-[#0a0a0a] hover:text-[#c81e16] flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3 h-3 text-[#c81e16]" />
                        <span>{c.phone}</span>
                      </a>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-[#0a0a0a]/60 hover:text-[#0a0a0a] flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3 h-3 text-[#0a0a0a]/40" />
                        <span className="truncate max-w-[160px]">{c.email}</span>
                      </a>
                    </td>

                    {/* Test & Level */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 border ${
                            c.testType === 'green'
                              ? 'border-emerald-600/30 text-emerald-800 bg-emerald-50/40'
                              : 'border-[#c81e16]/30 text-[#c81e16] bg-rose-50/40'
                          }`}
                        >
                          {c.testType.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                            c.testLevel === 'hard'
                              ? 'border-rose-300 text-[#c81e16] bg-rose-50/60 font-semibold'
                              : 'border-blue-200 text-blue-700 bg-blue-50/60'
                          }`}
                        >
                          {c.testLevel === 'hard' ? (lang === 'vi' ? 'KHÓ' : 'HARD') : (lang === 'vi' ? 'DỄ' : 'EASY')}
                        </span>
                      </div>
                    </td>

                    {/* Preferred Slot */}
                    <td className="py-3 pr-3 text-[12px] text-[#0a0a0a]/70 max-w-[160px] truncate">
                      {c.preferredSlots}
                    </td>

                    {/* Inviter */}
                    <td className="py-3 pr-3 font-mono text-xs text-[#0a0a0a]/75">
                      {c.chunkerCode}
                    </td>

                    {/* Confirmation Email Status & Resend */}
                    <td className="py-3 pr-3">
                      <div className="flex flex-col gap-1">
                        {c.confirmationEmailSent ? (
                          <span
                            title={c.confirmationEmailSentAt ? new Date(c.confirmationEmailSentAt).toLocaleString() : ''}
                            className="text-[10px] font-mono px-1.5 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50/80 flex items-center gap-1 w-fit font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{lang === 'vi' ? 'ĐÃ GỬI' : 'SENT'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 border border-amber-300 text-amber-800 bg-amber-50/80 w-fit">
                            {lang === 'vi' ? 'CHỜ GỬI' : 'PENDING'}
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={resendingId === c.id}
                          onClick={() => handleResendConfirmation(c.id!)}
                          className="text-[11px] text-[#0a0a0a]/60 hover:text-[#c81e16] flex items-center gap-1 font-mono hover:underline cursor-pointer disabled:opacity-40"
                          title={lang === 'vi' ? 'Gửi lại email xác nhận cho ứng viên này' : 'Resend confirmation email to candidate'}
                        >
                          <Send className="w-2.5 h-2.5 text-[#c81e16]" />
                          <span>{resendingId === c.id ? (lang === 'vi' ? 'Đang gửi...' : 'Sending...') : (lang === 'vi' ? 'Gửi lại' : 'Resend')}</span>
                        </button>
                      </div>
                    </td>

                    {/* Inline Status Updater */}
                    <td className="py-3 pr-3">
                      <select
                        disabled={updatingId === c.id}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id!, e.target.value as CandidateStatus)}
                        className="px-2 py-1 text-xs border border-[rgba(10,10,10,0.18)] bg-white font-medium cursor-pointer"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="noshow">No-Show</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3 text-right font-mono text-xs text-[#0a0a0a]/50">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Notification Email Settings Section */}
      <div className="border border-[rgba(10,10,10,0.14)] p-6 bg-white space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#c81e16]" />
              <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#c81e16]">
                {lang === 'vi' ? 'CẤU HÌNH THÔNG BÁO TỰ ĐỘNG' : 'AUTOMATED NOTIFICATION DISPATCH'}
              </span>
            </div>
            <h3 className="text-[19px] font-semibold text-[#0a0a0a] mt-1">
              {lang === 'vi' ? 'Email Nhận Thông Báo Khi Có Người Đăng Ký Test Mới' : 'Booking Alert Email Recipients'}
            </h3>
            <p className="text-[13px] text-[#0a0a0a]/65 font-light mt-0.5 max-w-2xl">
              {lang === 'vi'
                ? 'Khi có ứng viên mới hoàn tất đăng ký giữ chỗ 1-on-1, hệ thống sẽ gửi thông báo chi tiết (Họ tên, SĐT, Email, Bài test Green/Red, Level Dễ/Khó, Khung giờ) tới các địa chỉ email được cấu hình bên dưới.'
                : 'Whenever a new candidate registers, the system dispatches an alert with candidate details, test type, level (Easy/Hard), and schedule.'}
            </p>
          </div>
        </div>

        {notifFeedback && (
          <div
            className={`p-3 text-[13px] flex items-center gap-2 border ${
              notifFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-[#c81e16]'
            }`}
          >
            {notifFeedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#c81e16] shrink-0" />
            )}
            <span>{notifFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveNotificationSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="col-span-12 md:col-span-8">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1.5">
                {lang === 'vi'
                  ? 'Danh sách email nhận thông báo (ngăn cách bằng dấu phẩy)'
                  : 'Recipient email addresses (separated by commas)'}
              </label>
              <input
                type="text"
                required
                value={notificationEmailsInput}
                onChange={(e) => setNotificationEmailsInput(e.target.value)}
                placeholder="le.ntmkh@gmail.com, operations@chunks.edu.vn"
                className="w-full px-3.5 py-2.5 border border-[rgba(10,10,10,0.2)] text-[13.5px] font-mono text-[#0a0a0a] focus:outline-none focus:border-[#c81e16]"
              />
              <span className="text-[11.5px] text-[#0a0a0a]/50 mt-1 block font-mono">
                {lang === 'vi'
                  ? 'Ví dụ: le.ntmkh@gmail.com, admin@chunks.edu.vn'
                  : 'e.g. le.ntmkh@gmail.com, admin@chunks.edu.vn'}
              </span>
            </div>

            <div className="col-span-12 md:col-span-4 pt-1 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#c81e16] rounded cursor-pointer"
                />
                <span className="text-[13px] font-medium text-[#0a0a0a]">
                  {lang === 'vi' ? 'Bật gửi thông báo tự động' : 'Enable automated alerts'}
                </span>
              </label>
              <span className="text-[11px] text-[#0a0a0a]/50 block mt-1">
                {lang === 'vi' ? 'Trạng thái: ' : 'Status: '}
                <strong className={notificationsEnabled ? 'text-emerald-700' : 'text-slate-500'}>
                  {notificationsEnabled ? (lang === 'vi' ? 'ĐANG KÍCH HOẠT' : 'ACTIVE') : (lang === 'vi' ? 'TẠM TẮT' : 'PAUSED')}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={savingNotif}
              className="px-6 py-2.5 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[13px] font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingNotif ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Lưu cấu hình email' : 'Save Email Setup')}</span>
            </button>

            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={testingNotif}
              className="px-5 py-2.5 border border-[rgba(10,10,10,0.22)] hover:border-[#0a0a0a] text-[13px] font-medium rounded-full flex items-center gap-2 transition-colors cursor-pointer text-[#0a0a0a] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#c81e16]" />
              <span>{testingNotif ? (lang === 'vi' ? 'Đang gửi thử...' : 'Dispatching...') : (lang === 'vi' ? 'Gửi email thông báo kiểm tra' : 'Send Test Notification')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEmailPreviewModal(true)}
              className="px-5 py-2.5 border border-[#c81e16]/30 bg-rose-50/50 hover:bg-rose-50 text-[13px] font-medium rounded-full flex items-center gap-2 transition-colors cursor-pointer text-[#c81e16]"
            >
              <Eye className="w-3.5 h-3.5 text-[#c81e16]" />
              <span>{lang === 'vi' ? 'Xem mẫu email gửi ứng viên' : 'Preview Candidate Email'}</span>
            </button>
          </div>
        </form>

        {/* Firebase Cloud Function Integration Badge */}
        <div className="p-4 bg-slate-50 border border-[rgba(10,10,10,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2 font-mono font-semibold text-[#0a0a0a]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Cloud Function Trigger:</span>
              <code className="text-[#c81e16] bg-rose-50 px-1.5 py-0.5 border border-rose-200">
                onDocumentCreated("candidates/&#123;candidateId&#125;")
              </code>
            </div>
            <p className="text-[#0a0a0a]/65 text-[12.5px] mt-1 font-light">
              {lang === 'vi'
                ? 'Tự động gửi email xác nhận chi tiết về Bài Test (%c hoặc %r), Level (Dễ / Khó), Khung giờ và hướng dẫn chuẩn bị phản xạ MSE tới ứng viên ngay khi đăng ký thành công.'
                : 'Automated email notification triggered on document creation, confirming candidate test type, level, and MSE guidelines.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEmailPreviewModal(true)}
            className="shrink-0 px-3.5 py-1.5 border border-[rgba(10,10,10,0.2)] bg-white hover:border-[#0a0a0a] text-[12px] font-medium text-[#0a0a0a] flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3 h-3 text-[#c81e16]" />
            <span>{lang === 'vi' ? 'Xem mẫu thử' : 'Test Preview'}</span>
          </button>
        </div>

        {/* Recent Notification Dispatches Log */}
        {recentNotifLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[rgba(10,10,10,0.1)] space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/50 block">
              {lang === 'vi' ? 'NHẬT KÝ THÔNG BÁO GẦN ĐÂY' : 'RECENT DISPATCH LOGS'}
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {recentNotifLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 border border-[rgba(10,10,10,0.08)] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 font-mono"
                >
                  <div>
                    <span className="font-bold text-[#0a0a0a]">{log.candidateName}</span>
                    <span className="text-[#0a0a0a]/60 ml-2">
                      ({log.testType} · Level: <strong className="text-[#c81e16]">{log.testLevel}</strong>)
                    </span>
                  </div>
                  <div className="text-[#0a0a0a]/50 text-[11px] flex items-center gap-2">
                    <span>To: {Array.isArray(log.recipients) ? log.recipients.join(', ') : log.recipient || 'admin'}</span>
                    <span>·</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chunker Accounts Table */}
      <div className="border border-[rgba(10,10,10,0.14)] p-6 bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/50">
              COMMUNITY DIRECTORY
            </span>
            <h3 className="text-[18px] font-semibold text-[#0a0a0a] mt-0.5">
              Chunkee Referral Accounts ({chunkers.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Domain: {getActiveReferralDomain()}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(10,10,10,0.14)] text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/50">
                <th className="py-2.5 pr-4">Chunkee Name</th>
                <th className="py-2.5 pr-4">Code</th>
                <th className="py-2.5 pr-4">Secret Token</th>
                <th className="py-2.5 pr-4">Email</th>
                <th className="py-2.5 pr-4">Link Giới Thiệu</th>
                <th className="py-2.5 text-right">Referral Tally</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(10,10,10,0.08)]">
              {chunkers.map((ch) => {
                const refLink = buildReferralUrl(ch.code);
                const isCopied = copiedLink === ch.code;
                return (
                  <tr key={ch.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-[#0a0a0a]">{ch.name}</td>
                    <td className="py-3 pr-4 font-mono font-bold text-[#c81e16]">{ch.code}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#0a0a0a]/60">
                      {ch.secretToken || `SEC-${ch.code}`}
                    </td>
                    <td className="py-3 pr-4 text-[#0a0a0a]/70 font-mono text-xs">{ch.email}</td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(refLink);
                          setCopiedLink(ch.code);
                          setTimeout(() => setCopiedLink(null), 2000);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-[#0a0a0a] border-[rgba(10,10,10,0.18)]'
                        }`}
                        title={refLink}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Đã chép link</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#c81e16]" />
                            <span>Sao chép link</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 text-right font-mono font-bold tabular-nums text-[#0a0a0a]">
                      {ch.referralCount || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Chunker Modal */}
      {showAddChunker && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-white border border-[rgba(10,10,10,0.14)] p-6 sm:p-8 relative">
            <div className="flex items-start justify-between border-b border-[rgba(10,10,10,0.14)] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]">
                  Provision New Chunkee
                </span>
              </div>
              <button
                onClick={() => setShowAddChunker(false)}
                className="text-[#0a0a0a]/50 hover:text-[#0a0a0a] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChunker} className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Lê Hoàng Nam"
                  value={newChunkerName}
                  onChange={(e) => setNewChunkerName(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgba(10,10,10,0.2)] text-[13.5px] focus:outline-none focus:border-[#c81e16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                  Unique Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="NAM2026"
                  value={newChunkerCode}
                  onChange={(e) => setNewChunkerCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-[rgba(10,10,10,0.2)] font-mono text-[13.5px] uppercase focus:outline-none focus:border-[#c81e16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nam.le@chunks.edu.vn"
                  value={newChunkerEmail}
                  onChange={(e) => setNewChunkerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgba(10,10,10,0.2)] text-[13.5px] focus:outline-none focus:border-[#c81e16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0a0a0a]/70 mb-1">
                  Custom Secret Token (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for auto SEC-{CODE}"
                  value={newChunkerSecret}
                  onChange={(e) => setNewChunkerSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgba(10,10,10,0.2)] font-mono text-[13.5px] focus:outline-none focus:border-[#c81e16]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChunker(false)}
                  className="px-4 py-2 border border-[rgba(10,10,10,0.2)] text-[12.5px] font-medium rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingChunker}
                  className="px-5 py-2 bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[12.5px] font-semibold rounded-full cursor-pointer disabled:opacity-50"
                >
                  {creatingChunker ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Confirmation Email Template Preview Modal */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full max-h-[92vh] flex flex-col border border-[rgba(10,10,10,0.2)] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[rgba(10,10,10,0.12)] flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#c81e16]">
                    FIREBASE CLOUD FUNCTION TRIGGER
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-[#0a0a0a] mt-0.5">
                  {lang === 'vi' ? 'Xem Trước Email Xác Nhận Gửi Ứng Viên' : 'Candidate Confirmation Email Preview'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1.5 hover:bg-slate-200 text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test & Level Controls */}
            <div className="p-4 bg-white border-b border-[rgba(10,10,10,0.08)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0a0a0a]/70">Bài Test:</span>
                <button
                  type="button"
                  onClick={() => setPreviewTestType('green')}
                  className={`px-3 py-1 text-xs font-mono font-semibold border cursor-pointer ${
                    previewTestType === 'green'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-[rgba(10,10,10,0.15)] text-[#0a0a0a]/70'
                  }`}
                >
                  Green Focus (%c)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTestType('red')}
                  className={`px-3 py-1 text-xs font-mono font-semibold border cursor-pointer ${
                    previewTestType === 'red'
                      ? 'border-[#c81e16] bg-rose-50 text-[#c81e16]'
                      : 'border-[rgba(10,10,10,0.15)] text-[#0a0a0a]/70'
                  }`}
                >
                  Red Improv (%r)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0a0a0a]/70">Level (Độ khó):</span>
                <button
                  type="button"
                  onClick={() => setPreviewTestLevel('easy')}
                  className={`px-3 py-1 text-xs font-mono font-semibold border cursor-pointer ${
                    previewTestLevel === 'easy'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-[rgba(10,10,10,0.15)] text-[#0a0a0a]/70'
                  }`}
                >
                  Level Dễ (Foundation)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTestLevel('hard')}
                  className={`px-3 py-1 text-xs font-mono font-semibold border cursor-pointer ${
                    previewTestLevel === 'hard'
                      ? 'border-[#c81e16] bg-rose-50 text-[#c81e16]'
                      : 'border-[rgba(10,10,10,0.15)] text-[#0a0a0a]/70'
                  }`}
                >
                  Level Khó (Advanced)
                </button>
              </div>
            </div>

            {/* Email Rendered Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              {(() => {
                const sampleContent = generateCandidateEmailContent({
                  candidateId: 'CAND-DEMO-100',
                  fullName: 'Nguyễn Phương Thảo',
                  phone: '0988 123 456',
                  email: 'thao.nguyen@example.com',
                  testType: previewTestType,
                  testLevel: previewTestLevel,
                  preferredSlots: 'Tối ngày trong tuần (19:00 - 21:00)',
                  chunkerCode: 'NAM2026',
                  chunkerName: 'Nam Nguyễn',
                });
                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-[rgba(10,10,10,0.12)] font-mono text-xs">
                      <div className="text-[#0a0a0a]/50 text-[11px]">SUBJECT:</div>
                      <div className="font-bold text-[#0a0a0a] mt-0.5">{sampleContent.subject}</div>
                    </div>
                    <div
                      className="border border-[rgba(10,10,10,0.12)] bg-white overflow-hidden shadow-sm"
                      dangerouslySetInnerHTML={{ __html: sampleContent.html }}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[rgba(10,10,10,0.12)] flex items-center justify-between text-xs text-[#0a0a0a]/60">
              <span className="font-mono">
                Function: onCandidateBookingCreated · Event: firestore.document.created
              </span>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-5 py-2 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[12px] font-semibold rounded-full cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
