import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    // 새 포맷 필드(있으면 사용)
    const site    = (body.site ?? '').toString().trim();
    const vd      = (body.vd ?? '').toString().trim();              // 날짜 (필수)
    const vt      = (body.vt ?? '').toString().trim();              // 시작시각(HH:mm) (선택)
    const vtLabel = (body.vtLabel ?? '').toString().trim();         // "HH:mm ~ HH:mm" (선택)
    const name    = (body.name ?? '').toString().trim();            // (필수)
    const phone   = String(body.phone ?? '').replace(/[^\d]/g, '');  // (필수)
    const ts      = body.ts;

    // 봇 방지: ts가 있을 때만 검사(구 포맷 호환)
    if (ts !== undefined) {
      const delta = Date.now() - Number(ts || 0);
      if (!Number.isFinite(delta) || delta < 800) {
        return res.status(400).json({ error: 'Too fast submission' });
      }
    }

    // 필수: 이름/연락처/날짜만 체크 (시간·현장명은 선택)
    if (!name || !phone || !vd) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,                 // e.g. smtp.gmail.com
      port: Number(process.env.MAIL_PORT || 465),  // 465(SSL)
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    await transporter.verify().catch(() => {});

    const subject = `[방문예약] ${site}`;

    const timeLine = vtLabel; // vtLabel만 사용 (항상 "10:00 ~ 11:00" 형식)

    const html = `
      <div style="font-family:system-ui,-apple-system,'Noto Sans KR',sans-serif;font-size:15px;line-height:1.7;color:#111">
        ${site ? `<p><strong>현장이름:</strong> ${escapeHtml(site)}</p>` : ''}
        <p><strong>날짜:</strong> ${escapeHtml(vd)}</p>
        ${timeLine ? `<p><strong>시간:</strong> ${escapeHtml(timeLine)}</p>` : ''}
        <p><strong>이름:</strong> ${escapeHtml(name)}</p>
        <p><strong>연락처:</strong> ${escapeHtml(phone)}</p>
      </div>
    `.trim();

    const text =
      `${site ? `현장이름: ${site}\n` : ''}` +
      `날짜: ${vd}\n` +
      `${timeLine ? `시간: ${timeLine}\n` : ''}` +
      `이름: ${name}\n` +
      `연락처: ${phone}`;

    const info = await transporter.sendMail({
      to: process.env.MAIL_TO,
      from: process.env.MAIL_FROM, // 지메일이면 보통 MAIL_USER와 동일 주소 권장
      subject,
      text,
      html,
    });

    return res.status(200).json({ message: 'Email sent', id: info.messageId });
  } catch (error) {
    console.error('메일 전송 오류:', error);
    return res.status(500).json({
      error:
        (error?.response && String(error.response)) ||
        error?.message ||
        'Failed to send email',
    });
  }
}

function escapeHtml(str=''){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
