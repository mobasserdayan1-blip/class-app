'use strict';
/* ارتباط آزمایشی کم‌هزینه: فقط متن ثابت، فقط مدیر، بدون داده‌ی کاربر/دانش‌آموز. */
const { loadConfig } = require('./config');
const logger = require('./logger');

const TEST_PROMPT = 'Reply with exactly: CONNECTION_OK';
const TEST_MAX_TOKENS = 16;
const COOLDOWN_MS = 10_000;

function providerRequest(cfg, apiKey) {
  const { provider, baseUrl, model } = cfg.values;
  const headers = { 'Content-Type': 'application/json' };
  let url;
  let body;
  if (provider === 'anthropic') {
    url = baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '') + '/v1/messages';
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = { model, max_tokens: TEST_MAX_TOKENS, messages: [{ role: 'user', content: TEST_PROMPT }] };
  } else {
    url = baseUrl.replace(/\/+$/, '') + '/chat/completions';
    headers.Authorization = 'Bearer ' + apiKey;
    body = { model, max_tokens: TEST_MAX_TOKENS, temperature: 0, messages: [{ role: 'user', content: TEST_PROMPT }] };
  }
  return { url, headers, body };
}

function createTestHandler(deps) {
  const verifyIdToken = deps.verifyIdToken;
  const getMember = deps.getMember;
  const getEnv = deps.getEnv || (() => process.env);
  const reserveUse = deps.reserveUse || (async () => ({ allowed: true }));
  const fetchImpl = deps.fetch || global.fetch;
  const now = deps.now || (() => Date.now());
  const managerLogin = String((getEnv().AI_MANAGER_LOGIN_EMAIL) || 'manager@class-league-6c89f.firebaseapp.com').toLowerCase();
  const send = (res, status, code, message, extra) => res.status(status).json(Object.assign({ ok: false, code, message }, extra || {}));

  return async function aiTest(req, res) {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    if (req.method !== 'POST') { res.set('Allow', 'POST'); return send(res, 405, 'method_not_allowed', 'فقط درخواست POST پذیرفته می‌شود.'); }
    const auth = /^Bearer\s+(\S+)$/.exec(String((req.headers && req.headers.authorization) || ''));
    if (!auth) return send(res, 401, 'auth_required', 'ورود لازم است.');
    let decoded;
    try { decoded = await verifyIdToken(auth[1]); }
    catch (e) { logger.warn('ai_test_bad_token', { error: e }); return send(res, 401, 'invalid_token', 'نشست ورود معتبر نیست؛ دوباره وارد شوید.'); }
    const email = String((decoded && decoded.email) || '').toLowerCase();
    const verified = decoded && (decoded.email_verified === true || email === managerLogin);
    if (!email || !verified) return send(res, 403, 'not_allowed', 'این حساب اجازه‌ی اجرای آزمایش را ندارد.');
    let member;
    try { member = await getMember(email); }
    catch (e) { logger.error('ai_test_member_lookup_failed', { error: e }); return send(res, 500, 'internal', 'خطای داخلی سرور.'); }
    if (!member || member.active === false || member.role !== 'manager') return send(res, 403, 'manager_only', 'آزمایش اتصال فقط برای مدیر مجاز است.');

    const cfg = loadConfig(getEnv());
    if (!cfg.enabled) return send(res, 503, 'disabled', 'هوش مصنوعی روی سرور غیرفعال است.');
    if (!cfg.ok) return send(res, 400, 'not_configured', 'تنظیمات سرویس کامل یا معتبر نیست؛ ابتدا راهنمای تنظیم API را بررسی کنید.');
    if (typeof fetchImpl !== 'function') return send(res, 500, 'internal', 'محیط اجرا از درخواست امن پشتیبانی نمی‌کند.');

    const started = now();
    let quota;
    try { quota = await reserveUse({ uid: String(decoded.uid || decoded.sub || email), email, dailyLimit: cfg.values.dailyLimit, now: started, cooldownMs: COOLDOWN_MS }); }
    catch (e) { logger.error('ai_test_quota_failed', { error: e }); return send(res, 503, 'quota_unavailable', 'کنترل سقف درخواست‌ها در دسترس نیست؛ برای جلوگیری از هزینه، آزمایش انجام نشد.'); }
    if (!quota || !quota.allowed) {
      if (quota && quota.reason === 'daily_limit') return send(res, 429, 'daily_limit', 'سقف روزانه‌ی آزمایش اتصال پر شده است؛ فردا دوباره تلاش کنید.');
      return send(res, 429, 'cooldown', 'برای جلوگیری از درخواست تکراری، چند ثانیه صبر کنید و دوباره تلاش کنید.', { retryAfterSeconds: Math.max(1, Math.ceil(((quota && quota.retryAfterMs) || COOLDOWN_MS) / 1000)) });
    }

    const request = providerRequest(cfg, cfg.getApiKey());
    const controller = new AbortController();
    const timeoutMs = Math.min(cfg.values.timeoutMs, 30000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(request.body), signal: controller.signal, redirect: 'error' });
      if (response.status === 401 || response.status === 403) {
        logger.warn('ai_test_provider_auth_failed', { provider: cfg.values.provider, status: response.status });
        return send(res, 502, 'provider_auth', 'سرویس هوش مصنوعی کلید یا مجوز را نپذیرفت؛ کلید و دسترسی مدل را بررسی کنید.');
      }
      if (response.status === 429) return send(res, 502, 'provider_rate_limit', 'سرویس هوش مصنوعی فعلاً محدودیت درخواست اعمال کرده است؛ بعداً دوباره تلاش کنید.');
      if (!response.ok) {
        logger.warn('ai_test_provider_failed', { provider: cfg.values.provider, status: response.status });
        return send(res, 502, 'provider_error', 'سرویس هوش مصنوعی پاسخ موفق نداد (کد ' + response.status + ').');
      }
      // پاسخ را فقط برای تأیید موفقیت می‌خوانیم؛ متن تولیدشده به مرورگر برگردانده نمی‌شود.
      await response.text();
      logger.info('ai_test_success', { provider: cfg.values.provider, elapsedMs: Math.max(0, now() - started) });
      return res.status(200).json({ ok: true, code: 'connected', message: 'ارتباط آزمایشی موفق بود؛ پاسخ سرویس دریافت شد. هیچ اطلاعات دانش‌آموزی ارسال نشد.', provider: cfg.values.provider, model: cfg.values.model, elapsedMs: Math.max(0, now() - started) });
    } catch (e) {
      if (controller.signal.aborted || (e && e.name === 'AbortError')) return send(res, 504, 'timeout', 'مهلت انتظار تمام شد؛ زمان پاسخ سرویس بیش از حد بود.');
      logger.warn('ai_test_network_failed', { provider: cfg.values.provider, error: e });
      return send(res, 502, 'network_error', 'ارتباط با سرویس هوش مصنوعی برقرار نشد؛ اینترنت سرور، آدرس سرویس و تنظیمات را بررسی کنید.');
    } finally { clearTimeout(timer); }
  };
}

module.exports = { createTestHandler, providerRequest, TEST_PROMPT, TEST_MAX_TOKENS, COOLDOWN_MS };
