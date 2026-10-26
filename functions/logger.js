'use strict';
/* لاگ امن: هر مقدار قبل از چاپ پاک‌سازی می‌شود تا کلید API، توکن و رمز در لاگ نیفتد.
   فقط از همین تابع برای لاگ استفاده کنید؛ هرگز req.headers، req.body یا env را کامل لاگ نکنید. */

const SENSITIVE_KEY = /(api[_-]?key|secret|token|password|authorization|cookie|bearer)/i;
const PATTERNS = [
  [/sk-[A-Za-z0-9_\-]{8,}/g, '[REDACTED]'],
  [/AIza[0-9A-Za-z_\-]{20,}/g, '[REDACTED]'],
  [/eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]*/g, '[REDACTED]'],
  [/Bearer\s+[A-Za-z0-9._~+\/\-]+=*/gi, 'Bearer [REDACTED]'],
  [/((?:api[_-]?key|secret|token|password|authorization)["']?\s*[:=]\s*["']?)[^\s"',;&]+/gi, '$1[REDACTED]']
];

function knownSecrets() {
  const list = [];
  const k = process.env.AI_API_KEY;
  if (typeof k === 'string' && k.trim().length >= 8) list.push(k.trim());
  return list;
}

function redactString(s) {
  let out = String(s);
  for (const sec of knownSecrets()) out = out.split(sec).join('[REDACTED]');
  for (const [re, rep] of PATTERNS) out = out.replace(re, rep);
  return out;
}

function redact(v, depth) {
  depth = depth || 0;
  if (v == null) return v;
  if (typeof v === 'string') return redactString(v);
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  if (v instanceof Error) return { name: v.name, code: v.code, message: redactString(v.message) };
  if (depth >= 4) return '[TRUNCATED]';
  if (Array.isArray(v)) return v.slice(0, 20).map(x => redact(x, depth + 1));
  if (typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).slice(0, 30)) o[k] = SENSITIVE_KEY.test(k) ? '[REDACTED]' : redact(v[k], depth + 1);
    return o;
  }
  return '[UNSUPPORTED]';
}

function log(severity, event, fields) {
  const line = JSON.stringify(Object.assign({ severity, event }, redact(fields || {})));
  (severity === 'ERROR' || severity === 'WARNING' ? console.error : console.log)(line);
}

module.exports = {
  redact,
  info: (e, f) => log('INFO', e, f),
  warn: (e, f) => log('WARNING', e, f),
  error: (e, f) => log('ERROR', e, f)
};
