import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { apiValidateReferral } from '../api/client';
import { buildReferralUrl } from '../utils/referral';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
  initialIdentifier?: string;
}

export const ChunkerHubModal: React.FC<Props> = ({ isOpen, onClose, lang, initialIdentifier = '' }) => {
  const [code, setCode] = useState(initialIdentifier);
  const [result, setResult] = useState<{ code: string; name: string } | null>(null);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);
    try {
      const referral = await apiValidateReferral(code);
      if (!referral.valid || !referral.chunkerName) throw new Error('Invalid code');
      setResult({ code: referral.referralCode, name: referral.chunkerName });
    } catch {
      setError(lang === 'vi' ? 'Mã chưa được cấp hoặc dịch vụ tạm không khả dụng.' : 'Code not provisioned or service unavailable.');
    }
  };
  const url = result ? buildReferralUrl(result.code) : '';
  return (
    <div role="dialog" aria-modal="true" aria-label="Referral link" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white p-8 max-w-md w-full space-y-5">
        <div className="flex justify-between items-center"><h2 className="font-semibold text-lg">{lang === 'vi' ? 'Link giới thiệu' : 'Referral link'}</h2><button onClick={onClose} aria-label="Close">✕</button></div>
        <p className="text-sm">{lang === 'vi' ? 'Nhập mã đã được đội ngũ CHUNKS cấp. Không nhập email hoặc số điện thoại.' : 'Enter a code issued by CHUNKS operations. Do not enter an email or phone number.'}</p>
        <form onSubmit={lookup} className="flex gap-2"><input aria-label="Referral code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={30} className="border p-2 flex-1" /><button className="bg-black text-white px-4">{lang === 'vi' ? 'Tra cứu' : 'Look up'}</button></form>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {result && <div className="space-y-3"><p>{result.name} · {result.code}</p><QRCodeCanvas value={url} size={148} /><p className="break-all text-sm">{url}</p><button onClick={() => navigator.clipboard.writeText(url)} className="border px-4 py-2">{lang === 'vi' ? 'Sao chép link' : 'Copy link'}</button></div>}
      </div>
    </div>
  );
};
