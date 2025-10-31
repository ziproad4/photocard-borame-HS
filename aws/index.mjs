// aws/index.mjs
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'ap-northeast-2' });

export const handler = async (event) => {
  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString()
      : event.body;
    const data = JSON.parse(body || '{}');

    const {
      site = '',
      vd   = '',    // YYYY-MM-DD
      vt   = '',    // HH:mm (시작)
      vtLabel = '', // "HH:mm ~ HH:mm" or etc.
      name = '',
      phone = '',
      ts
    } = data;

    // 간단 봇 방지: 너무 빠른 전송 차단
    const delta = Date.now() - Number(ts || 0);
    if (!Number.isFinite(delta) || delta < 1000) {
      return resp(400, { error: 'Too fast submission' });
    }

    // 필수값 검증
    if (!site || !vd || !vt || !vtLabel || !name || !phone) {
      return resp(400, { error: 'Missing required fields' });
    }

    const to = process.env.MAIL_TO;
    const from = process.env.MAIL_FROM;
    if (!to || !from) return resp(500, { error: 'Server mail config missing' });

    const subject = `[방문예약] ${safe(site)} - ${safe(name)} (${safe(phone)})`;

    const html = `
      <div style="font-family:system-ui,-apple-system,'Noto Sans KR',sans-serif;font-size:15px;line-height:1.7;color:#111">
        <p><strong>현장이름:</strong> ${safe(site)}</p>
        <p><strong>날짜:</strong> ${safe(vd)}</p>
        <p><strong>시간:</strong> ${safe(vtLabel)}</p>
        <p><strong>이름:</strong> ${safe(name)}</p>
        <p><strong>연락처:</strong> ${safe(phone)}</p>
      </div>
    `.trim();

    const text =
`현장이름: ${site}
날짜: ${vd}
시간: ${vtLabel}
이름: ${name}
연락처: ${phone}`;

    const cmd = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Source: from,
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: { Data: text, Charset: 'UTF-8' }
        }
      }
    });

    await ses.send(cmd);
    return resp(200, { ok: true });
  } catch (e) {
    console.error(e);
    return resp(500, { error: 'Mail send failed' });
  }
};

const resp = (code, obj) => ({
  statusCode: code,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  },
  body: JSON.stringify(obj)
});

function safe(str=''){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
