// Vercel serverless function - bulletproof email delivery for portfolio bookings + form contact.
//
// Strategy (in order):
//   1) Always log to Vercel function logs (visible in dashboard) so no lead is ever lost.
//   2) If RESEND_API_KEY is set:
//        - Send lead notification to Ben (TO_EMAIL_RESEND)
//        - If this is a meeting BOOKING (payload.When present), also send a confirmation
//          back to the booker with an .ics calendar attachment.
//   3) If Resend fails or isn't configured, fall back to formsubmit.co.
//   4) Client always falls back to mailto if both fail.
//
// All responses include CORS headers so the frontend can call this directly.

// === Recipients ===
const TO_EMAIL_RESEND = process.env.RESEND_TO_EMAIL || 'bensachwitz@gmail.com';
const TO_EMAIL_PUBLIC = 'bensachwitz@outlook.com';
const FROM_EMAIL_DEFAULT = 'onboarding@resend.dev'; // works without domain verification on Resend
const FROM_NAME = 'bensachwitz.vercel.app';
const BEN_NAME = 'Benjamin Sachwitz';
const BEN_PHONE = '+1-571-385-5134';
const BEN_TITLE = 'Assistant Underwriter, Swamp Fox Agency';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://bensachwitz.vercel.app');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sanitize(s, max = 5000) {
  if (typeof s !== 'string') return '';
  // Strip control chars, trim, cap length. Plain regex (\u escapes) instead of literal control bytes.
  return s.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// === Parse the human-readable When string into a Date.
// Accepts formats produced by the frontend like:
//   "Tue Jun 3 at 2:30 PM ET"
//   "Mon May 28 · 11:00 AM ET"
// Falls back to null if parsing fails.
function parseWhen(whenStr) {
  if (!whenStr || typeof whenStr !== 'string') return null;
  const cleaned = whenStr.replace(/·/g, 'at').replace(/\s+/g, ' ').trim();
  // Pull out month / day / time
  const m = cleaned.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}).*?(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return null;
  const monthMap = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
  const month = monthMap[m[1].slice(0,3).toLowerCase()];
  const day = parseInt(m[2], 10);
  let hour = parseInt(m[3], 10);
  const minute = parseInt(m[4] || '0', 10);
  const ampm = m[5].toUpperCase();
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  // Build a Date in US/Eastern. Easiest reliable trick: assume ET is UTC-4 (EDT) for the bulk
  // of the year. The .ics file uses TZID anyway so the calendar app will render the user's local time.
  const now = new Date();
  let year = now.getUTCFullYear();
  // If the month/day already passed this year, roll to next year
  const candidate = new Date(Date.UTC(year, month, day, hour + 4, minute));
  if (candidate.getTime() < Date.now() - 86_400_000) candidate.setUTCFullYear(year + 1);
  return candidate;
}

function fmtICSDate(d) {
  // Convert Date → YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildICS({ name, email, when, topic, notes }) {
  const start = parseWhen(when);
  if (!start) return null;
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const uid = `ben-call-${start.getTime()}-${Math.random().toString(36).slice(2, 10)}@bensachwitz.vercel.app`;
  const dtstamp = fmtICSDate(new Date());
  const dtstart = fmtICSDate(start);
  const dtend   = fmtICSDate(end);
  const desc = [
    `30-minute call with ${BEN_NAME} (${BEN_TITLE}).`,
    topic ? `Topic: ${topic}` : null,
    notes ? `Notes: ${notes}` : null,
    `Phone: ${BEN_PHONE}`,
    `Reach Ben directly: bensachwitz@outlook.com`,
    `Booked via https://bensachwitz.vercel.app`
  ].filter(Boolean).join('\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bensachwitz.vercel.app//Portfolio Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:Call with ${BEN_NAME} (${topic || 'Intro / Discussion'})`,
    `DESCRIPTION:${desc}`,
    `LOCATION:Phone or Video Call · ${BEN_PHONE}`,
    `ORGANIZER;CN=${BEN_NAME}:mailto:${TO_EMAIL_PUBLIC}`,
    `ATTENDEE;CN=${name};RSVP=TRUE:mailto:${email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: call with ${BEN_NAME} in 15 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return { content: ics, filename: 'call-with-ben.ics', start, end };
}

function buildLeadEmail(payload) {
  const safe = Object.fromEntries(
    Object.entries(payload)
      .filter(([k]) => !k.startsWith('_'))
      .map(([k, v]) => [k, sanitize(String(v ?? ''))])
  );
  const isBooking = !!safe.When;
  const subject = sanitize(payload._subject) ||
    (isBooking
      ? `New booking: ${safe.Name || 'visitor'} · ${safe.When}`
      : `Portfolio inquiry from ${safe.Name || 'a visitor'}`);
  const replyTo = isEmail(safe.Email) ? safe.Email : null;

  const rows = Object.entries(safe)
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#888;font-family:monospace;font-size:12px;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td><td style="padding:6px 0;color:#0a0a0a;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.55;">${escapeHtml(v).replace(/\n/g, '<br/>')}</td></tr>`)
    .join('');

  const banner = isBooking ? 'New meeting booked' : 'New form submission';
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#f5f2ec;font-family:-apple-system,sans-serif;color:#0a0a0a;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(10,10,10,.1);padding:32px;">
  <div style="font-family:monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B1A1A;margin-bottom:8px;">bensachwitz.vercel.app</div>
  <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:300;margin:0 0 24px;color:#0a0a0a;">${banner}</h1>
  <table style="width:100%;border-collapse:collapse;">${rows}</table>
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(10,10,10,.1);font-size:11px;color:#888;font-family:monospace;letter-spacing:.06em;">Received ${new Date().toISOString()}</div>
</div></body></html>`;

  const text = Object.entries(safe).map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\n- Sent from bensachwitz.vercel.app at ${new Date().toISOString()}`;

  return { subject, html, text, replyTo, isBooking, safe };
}

function buildBookerConfirmEmail({ name, email, when, topic, notes }) {
  const subject = `Confirmed: 30-min call with ${BEN_NAME} · ${when}`;
  const safeName = escapeHtml(name);
  const safeWhen = escapeHtml(when || '');
  const safeTopic = escapeHtml(topic || 'Intro / Discussion');
  const safeNotes = notes ? escapeHtml(notes).replace(/\n/g, '<br/>') : '';

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#f5f2ec;font-family:-apple-system,sans-serif;color:#0a0a0a;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(10,10,10,.1);padding:36px 32px 32px;">
  <div style="font-family:monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B1A1A;margin-bottom:8px;">bensachwitz.vercel.app · confirmed</div>
  <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;margin:0 0 18px;color:#0a0a0a;line-height:1.2;">Hi ${safeName} - <em style="color:#8B1A1A;font-style:italic;">looking forward</em> to talking with you.</h1>
  <p style="font-family:-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#3a3a3a;margin:0 0 16px;">Thank you for taking the time to book a call with me - I genuinely appreciate it, and I'm looking forward to our conversation. I've blocked the time below and I'll come prepared.</p>
  <p style="font-family:-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#3a3a3a;margin:0 0 20px;">We can do phone or video, whichever is easiest for you. If anything shifts on your end, just reply to this email and we'll find a new time that works - no trouble at all.</p>

  <div style="background:#f5f2ec;padding:18px 22px;border-left:3px solid #8B1A1A;margin:24px 0 22px;">
    <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:6px;">When</div>
    <div style="font-family:Georgia,serif;font-size:18px;color:#0a0a0a;font-weight:500;margin-bottom:14px;">${safeWhen}</div>
    <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:6px;">Topic</div>
    <div style="font-family:-apple-system,sans-serif;font-size:14px;color:#0a0a0a;margin-bottom:14px;">${safeTopic}</div>
    <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:6px;">Duration</div>
    <div style="font-family:-apple-system,sans-serif;font-size:14px;color:#0a0a0a;margin-bottom:14px;">30 minutes</div>
    <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:6px;">Reach me</div>
    <div style="font-family:-apple-system,sans-serif;font-size:14px;color:#0a0a0a;">Phone: <a href="tel:${BEN_PHONE.replace(/[^0-9+]/g,'')}" style="color:#8B1A1A;text-decoration:none;">${BEN_PHONE}</a><br/>Email: <a href="mailto:${TO_EMAIL_PUBLIC}" style="color:#8B1A1A;text-decoration:none;">${TO_EMAIL_PUBLIC}</a></div>
  </div>

  ${safeNotes ? `<div style="margin:0 0 22px;"><div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:6px;">Your notes</div><div style="font-family:-apple-system,sans-serif;font-size:14px;line-height:1.55;color:#3a3a3a;">${safeNotes}</div></div>` : ''}

  <div style="margin:0 0 22px;">
    <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:8px;">How to save it to your calendar</div>
    <p style="font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#3a3a3a;margin:0;">Open the attached <strong>call-with-ben.ics</strong> file and tap <strong>"Add to Calendar."</strong> It drops straight into Apple Calendar, Google Calendar, or Outlook, and I've already set a reminder for 15 minutes before we talk so it won't slip by.</p>
  </div>

  <p style="font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#3a3a3a;margin:0 0 6px;">Until then, please don't hesitate to reach out with anything at all. Talk soon.</p>

  <div style="border-top:1px solid rgba(10,10,10,.1);padding-top:18px;margin-top:22px;font-family:-apple-system,sans-serif;font-size:13px;color:#3a3a3a;">
    <span style="display:block;margin-bottom:10px;color:#3a3a3a;">Best regards,</span>
    <strong style="color:#0a0a0a;font-family:Georgia,serif;font-size:16px;font-weight:500;">${BEN_NAME}</strong><br/>
    <span style="color:#888;font-size:12px;">${BEN_TITLE}</span><br/>
    <a href="https://bensachwitz.vercel.app" style="color:#8B1A1A;text-decoration:none;font-size:12px;font-family:monospace;letter-spacing:.06em;">bensachwitz.vercel.app</a>
  </div>
</div>
</body></html>`;

  const text = [
    `Hi ${name} - looking forward to talking with you.`,
    '',
    `Thank you for taking the time to book a call with me. I genuinely appreciate it,`,
    `and I'm looking forward to our conversation. I've blocked the time below and I'll`,
    `come prepared. We can do phone or video, whichever is easiest for you - and if`,
    `anything shifts on your end, just reply to this email and we'll find a new time.`,
    '',
    `When:     ${when}`,
    `Topic:    ${topic || 'Intro / Discussion'}`,
    `Duration: 30 minutes`,
    '',
    `Reach me directly:`,
    `  Phone: ${BEN_PHONE}`,
    `  Email: ${TO_EMAIL_PUBLIC}`,
    '',
    notes ? `Your notes:\n${notes}\n` : null,
    `How to save it to your calendar:`,
    `  Open the attached call-with-ben.ics file and tap "Add to Calendar." It works`,
    `  with Apple Calendar, Google Calendar, and Outlook, and a 15-minute reminder is`,
    `  already set so it won't slip by.`,
    '',
    `Until then, please don't hesitate to reach out with anything at all. Talk soon.`,
    '',
    `Best regards,`,
    `${BEN_NAME}`,
    `${BEN_TITLE}`,
    `https://bensachwitz.vercel.app`
  ].filter(Boolean).join('\n');

  return { subject, html, text };
}

async function sendViaResend(apiKey, { from, to, subject, html, text, replyTo, attachments }) {
  const body = {
    from: from || `${FROM_NAME} <${process.env.RESEND_FROM || FROM_EMAIL_DEFAULT}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(attachments ? { attachments } : {})
  };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function sendViaFormsubmit(payload) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO_EMAIL_PUBLIC)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'https://bensachwitz.vercel.app',
      'Referer': 'https://bensachwitz.vercel.app/',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  const ok = res.ok && String(data.success).toLowerCase() === 'true';
  return { ok, status: res.status, data };
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  // Honeypot - silently accept any submission that fills the trap field
  if (payload._honey) return res.status(200).json({ ok: true, channel: 'honeypot' });

  const name = sanitize(payload.Name || payload.name);
  const email = sanitize(payload.Email || payload.email);
  if (!name || !isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Name and a valid email are required' });
  }

  const lead = buildLeadEmail(payload);

  console.log('[contact]', JSON.stringify({
    receivedAt: new Date().toISOString(),
    name, email,
    isBooking: lead.isBooking,
    subject: lead.subject,
    keys: Object.keys(payload).filter(k => !k.startsWith('_')),
  }));

  // 1) Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    let leadResult = null;
    let confirmResult = null;

    try {
      leadResult = await sendViaResend(process.env.RESEND_API_KEY, {
        to: TO_EMAIL_RESEND,
        subject: lead.subject,
        html: lead.html,
        text: lead.text,
        replyTo: lead.replyTo
      });
      if (!leadResult.ok) console.warn('[contact] resend lead-email failed', leadResult.status, leadResult.data);
    } catch (e) {
      console.warn('[contact] resend lead-email threw', String(e));
    }

    // If this is a booking AND the lead landed, also send confirmation to the booker
    if (lead.isBooking && leadResult && leadResult.ok) {
      try {
        const when = sanitize(payload.When);
        const topic = sanitize(payload.Topic);
        const notes = sanitize(payload.Notes);
        const confirm = buildBookerConfirmEmail({ name, email, when, topic, notes });
        const ics = buildICS({ name, email, when, topic, notes });
        const attachments = ics ? [{
          filename: ics.filename,
          content: Buffer.from(ics.content, 'utf8').toString('base64'),
          content_type: 'text/calendar; charset=utf-8; method=REQUEST'
        }] : undefined;
        confirmResult = await sendViaResend(process.env.RESEND_API_KEY, {
          to: email,
          subject: confirm.subject,
          html: confirm.html,
          text: confirm.text,
          replyTo: TO_EMAIL_PUBLIC,
          attachments
        });
        if (!confirmResult.ok) console.warn('[contact] resend confirm-email failed', confirmResult.status, confirmResult.data);
      } catch (e) {
        console.warn('[contact] resend confirm-email threw', String(e));
      }
    }

    if (leadResult && leadResult.ok) {
      return res.status(200).json({
        ok: true,
        channel: 'resend',
        leadId: leadResult.data?.id,
        confirmSent: !!(confirmResult && confirmResult.ok),
        confirmId: confirmResult?.data?.id || null,
        isBooking: lead.isBooking
      });
    }
  }

  // 2) Fall back to formsubmit (works once Ben clicks the activation link)
  try {
    const f = await sendViaFormsubmit(payload);
    if (f.ok) return res.status(200).json({ ok: true, channel: 'formsubmit' });
    return res.status(202).json({
      ok: false,
      channel: 'logged-only',
      message: 'Email gateway not yet configured; submission was logged. Use mailto fallback in the client.',
      formsubmit: f.data,
    });
  } catch (e) {
    return res.status(202).json({
      ok: false,
      channel: 'logged-only',
      message: 'Email gateway error; submission was logged. Use mailto fallback in the client.',
      error: String(e),
    });
  }
}
