'use strict';
/* بارگذاری و اعتبارسنجی تنظیمات هوش مصنوعی — فقط روی سرور اجرا می‌شود.
   همه‌ی مقدارها از متغیرهای محیطی خوانده می‌شوند. کلید API هرگز در خروجی عمومی، لاگ یا JSON قرار نمی‌گیرد:
   فقط از طریق تابع غیرقابل‌شمارش getApiKey() در دسترس است (برای مرحله‌ی بعد، ارسال درخواست). */

const PROVIDERS = {
  anthropic: { label: 'Anthropic', defaultBase: 'https://api.anthropic.com' },
  openai: { label: 'OpenAI', defaultBase: 'https://api.openai.com/v1' },
  openai_compatible: { label: 'سازگار با OpenAI (آدرس دلخواه)', defaultBase: null }
};

// [حداقل، حداکثر، پیش‌فرض]
const LIMITS = {
  AI_MAX_TOKENS: [1, 64000, 1000],
  AI_TIMEOUT_MS: [1000, 120000, 30000],
  AI_DAILY_LIMIT: [0, 10000, 50]
};

const MESSAGES = {
  missing: {
    AI_PROVIDER: 'AI_PROVIDER تنظیم نشده است (یکی از: ' + Object.keys(PROVIDERS).join(' ، ') + ').',
    AI_MODEL: 'AI_MODEL تنظیم نشده است (نام مدل مورد استفاده).',
    AI_API_KEY: 'AI_API_KEY تنظیم نشده است. کلید باید فقط به‌صورت Secret سرور ثبت شود (راهنما: AI-SETUP.md).',
    AI_BASE_URL: 'AI_BASE_URL برای این سرویس لازم است (آدرس https سرویس).'
  },
  problem: {
    unknown_provider: 'مقدار AI_PROVIDER معتبر نیست.',
    invalid_url: 'AI_BASE_URL یک آدرس معتبر نیست.',
    insecure_url: 'AI_BASE_URL باید با https شروع شود.',
    url_has_credentials: 'AI_BASE_URL نباید شامل نام کاربری یا رمز باشد.',
    url_has_query: 'AI_BASE_URL نباید شامل پارامتر (؟…) باشد؛ کلید را در آدرس نگذارید.',
    invalid_number: 'مقدار عددی تنظیم‌شده معتبر نیست.',
    out_of_range: 'مقدار عددی تنظیم‌شده خارج از بازه‌ی مجاز است.',
    invalid_key_format: 'قالب AI_API_KEY معتبر نیست (فاصله، خط جدید یا طول کم).',
    placeholder_key: 'AI_API_KEY هنوز مقدار نمونه (placeholder) است؛ کلید واقعی را ثبت کنید.'
  }
};

const str = v => (typeof v === 'string' ? v.trim() : '');

function readInt(env, name, problems) {
  const [lo, hi, def] = LIMITS[name];
  const raw = str(env[name]);
  if (raw === '') return def;
  if (!/^\d+$/.test(raw)) { problems.push({ name, code: 'invalid_number' }); return def; }
  const n = Number(raw);
  if (n < lo || n > hi) { problems.push({ name, code: 'out_of_range' }); return def; }
  return n;
}

function readBaseUrl(raw, problems) {
  let u;
  try { u = new URL(raw); } catch (e) { problems.push({ name: 'AI_BASE_URL', code: 'invalid_url' }); return ''; }
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) {
    problems.push({ name: 'AI_BASE_URL', code: 'insecure_url' }); return '';
  }
  if (u.username || u.password) { problems.push({ name: 'AI_BASE_URL', code: 'url_has_credentials' }); return ''; }
  if (u.search) { problems.push({ name: 'AI_BASE_URL', code: 'url_has_query' }); return ''; }
  return (u.origin + u.pathname).replace(/\/+$/, '');
}

function loadConfig(env) {
  env = env || process.env;
  const missing = [];
  const problems = [];

  const flag = str(env.AI_ENABLED).toLowerCase();
  const enabled = !['false', '0', 'no', 'off'].includes(flag);

  const provider = str(env.AI_PROVIDER).toLowerCase();
  if (!provider) missing.push('AI_PROVIDER');
  else if (!PROVIDERS[provider]) problems.push({ name: 'AI_PROVIDER', code: 'unknown_provider' });

  const model = str(env.AI_MODEL);
  if (!model) missing.push('AI_MODEL');

  const key = str(env.AI_API_KEY);
  if (!key) missing.push('AI_API_KEY');
  else if (key.length < 16 || /\s/.test(key)) problems.push({ name: 'AI_API_KEY', code: 'invalid_key_format' });
  else if (/^(your|xxx|changeme|placeholder|replace)/i.test(key) || /YOUR[_-]/i.test(key)) {
    problems.push({ name: 'AI_API_KEY', code: 'placeholder_key' });
  }

  let baseUrl = '';
  const rawBase = str(env.AI_BASE_URL);
  const spec = PROVIDERS[provider];
  if (rawBase) baseUrl = readBaseUrl(rawBase, problems);
  else if (spec && spec.defaultBase) baseUrl = spec.defaultBase;
  else if (spec && !spec.defaultBase) missing.push('AI_BASE_URL');

  const values = {
    provider,
    model,
    baseUrl,
    maxTokens: readInt(env, 'AI_MAX_TOKENS', problems),
    timeoutMs: readInt(env, 'AI_TIMEOUT_MS', problems),
    dailyLimit: readInt(env, 'AI_DAILY_LIMIT', problems)
  };

  const cfg = {
    ok: enabled && missing.length === 0 && problems.length === 0,
    enabled,
    missing,
    problems,
    values
  };
  // کلید در closure می‌ماند و در JSON.stringify / console.log دیده نمی‌شود
  Object.defineProperty(cfg, 'getApiKey', { value: () => key, enumerable: false });
  return cfg;
}

function describe(p) {
  return MESSAGES.problem[p.code] ? p.name + ': ' + MESSAGES.problem[p.code] : p.name + ': مقدار نامعتبر.';
}

/* نمای امن برای ارسال به مرورگر. detailed=true فقط برای مدیر (نام متغیرهای ناقص، بدون مقدار). */
function publicView(cfg, opts) {
  const detailed = !!(opts && opts.detailed);
  const view = { configured: cfg.ok, enabled: cfg.enabled };
  if (!cfg.enabled) view.message = 'هوش مصنوعی روی سرور غیرفعال است (AI_ENABLED=false).';
  else if (cfg.ok) view.message = 'تنظیمات هوش مصنوعی کامل است؛ برای آزمون واقعی، دکمهٔ «آزمایش واقعی اتصال» را بزنید.';
  else view.message = 'تنظیمات هوش مصنوعی روی سرور ناقص یا نامعتبر است.';
  if (detailed) {
    view.provider = cfg.values.provider || null;
    view.model = cfg.values.model || null;
    view.limits = {
      maxTokens: cfg.values.maxTokens,
      timeoutMs: cfg.values.timeoutMs,
      dailyLimit: cfg.values.dailyLimit
    };
    view.issues = cfg.missing.map(n => MESSAGES.missing[n] || n + ' تنظیم نشده است.')
      .concat(cfg.problems.map(describe));
  }
  return view;
}

module.exports = { loadConfig, publicView, PROVIDERS, LIMITS };
