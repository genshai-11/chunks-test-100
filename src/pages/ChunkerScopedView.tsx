import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { apiValidateReferral } from '../api/client';
import { buildReferralUrl } from '../utils/referral';

interface Props { initialCode?: string; lang: 'vi' | 'en' }

export const ChunkerScopedView: React.FC<Props> = ({ initialCode = '', lang }) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<{ code: string; name: string } | null>(null);
  const [error, setError] = useState('');
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
    <section className="max-w-xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-semibold">{lang === 'vi' ? 'Link giới thiệu Chunkee' : 'Chunkee referral link'}</h1>
      <p>{lang === 'vi' ? 'Mã giới thiệu được cấp bởi đội ngũ CHUNKS. Không có tra cứu ứng viên qua mã, email hoặc số điện thoại công khai.' : 'Referral codes are issued by CHUNKS operations. Candidate records are not publicly searchable by code, email, or phone.'}</p>
      <form onSubmit={lookup} className="flex gap-2"><input aria-label="Referral code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={30} className="border p-2 flex-1" /><button className="bg-black text-white px-4">{lang === 'vi' ? 'Tra cứu' : 'Look up'}</button></form>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {result && <div className="space-y-3"><p>{result.name} · {result.code}</p><QRCodeCanvas value={url} size={148} /><p className="break-all text-sm">{url}</p><button onClick={() => navigator.clipboard.writeText(url)} className="border px-4 py-2">{lang === 'vi' ? 'Sao chép link' : 'Copy link'}</button></div>}
    </section>
  );
};
