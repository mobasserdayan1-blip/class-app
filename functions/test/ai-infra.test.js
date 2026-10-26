'use strict';
const test = require('node:test');
const assert = require('node:assert');
const util = require('node:util');
const { loadConfig, publicView } = require('../config');
const logger = require('../logger');
const { createStatusHandler } = require('../status-handler');

const KEY = 'sk-test-0123456789abcdefghijklmnop';
const good = { AI_PROVIDER: 'anthropic', AI_MODEL: 'some-model', AI_API_KEY: KEY };

test('تنظیمات خالی: همه‌ی موارد ناقص گزارش می‌شوند', () => {
  const c = loadConfig({});
  assert.strictEqual(c.ok, false);
  assert.deepStrictEqual(c.missing, ['AI_PROVIDER', 'AI_MODEL', 'AI_API_KEY']);
});

test('تنظیمات کامل معتبر است و مقدار پیش‌فرض اعمال می‌شود', () => {
  const c = loadConfig(good);
  assert.strictEqual(c.ok, true);
  assert.strictEqual(c.values.maxTokens, 1000);
  assert.strictEqual(c.values.baseUrl, 'https://api.anthropic.com');
});

test('openai_compatible بدون AI_BASE_URL ناقص است', () => {
  const c = loadConfig({ ...good, AI_PROVIDER: 'openai_compatible' });
  assert.ok(c.missing.includes('AI_BASE_URL'));
});

test('آدرس ناامن، دارای پارامتر یا رمز رد می‌شود', () => {
  for (const u of ['http://example.com/v1', 'https://u:p@example.com', 'https://example.com/v1?key=abc', 'not a url']) {
    const c = loadConfig({ ...good, AI_BASE_URL: u });
    assert.strictEqual(c.ok, false, u);
  }
  assert.strictEqual(loadConfig({ ...good, AI_BASE_URL: 'http://localhost:8080/v1' }).ok, true);
});

test('عدد نامعتبر یا خارج از بازه، کلید نمونه و سرویس ناشناخته', () => {
  assert.strictEqual(loadConfig({ ...good, AI_MAX_TOKENS: 'abc' }).ok, false);
  assert.strictEqual(loadConfig({ ...good, AI_TIMEOUT_MS: '5' }).ok, false);
  assert.strictEqual(loadConfig({ ...good, AI_API_KEY: 'YOUR_API_KEY_HERE_123' }).ok, false);
  assert.strictEqual(loadConfig({ ...good, AI_PROVIDER: 'foo' }).ok, false);
});

test('کلید غیرفعال با AI_ENABLED=false', () => {
  const c = loadConfig({ ...good, AI_ENABLED: 'false' });
  assert.strictEqual(c.ok, false);
  assert.strictEqual(publicView(c).enabled, false);
});

test('کلید API در JSON، inspect و نمای عمومی دیده نمی‌شود', () => {
  const c = loadConfig(good);
  assert.ok(!JSON.stringify(c).includes(KEY));
  assert.ok(!util.inspect(c, { depth: 5 }).includes(KEY));
  assert.ok(!JSON.stringify(publicView(c, { detailed: true })).includes(KEY));
  assert.strictEqual(c.getApiKey(), KEY);
});

test('نمای غیرمدیر جزئیات ندارد', () => {
  const v = publicView(loadConfig({}), { detailed: false });
  assert.strictEqual(v.issues, undefined);
  assert.strictEqual(v.provider, undefined);
});

test('لاگ کلید، Bearer و توکن را پاک می‌کند', () => {
  process.env.AI_API_KEY = KEY;
  const out = JSON.stringify(logger.redact({
    msg: 'خطا با کلید ' + KEY + ' و Authorization: Bearer abc.def.ghi',
    authorization: 'Bearer zzz', nested: { apiKey: 'x', note: 'token=abcdef123456' },
    err: new Error('failed key=' + KEY)
  }));
  delete process.env.AI_API_KEY;
  assert.ok(!out.includes(KEY));
  assert.ok(!out.includes('abcdef123456'));
  assert.ok(!out.includes('zzz'));
});

function run(handler, req) {
  return new Promise(resolve => {
    const res = { _h: {}, set(k, v) { this._h[k] = v; return this; }, status(s) { this._s = s; return this; }, json(b) { resolve({ status: this._s, body: b }); } };
    handler(req, res);
  });
}
const mk = (env, member, tok) => createStatusHandler({
  verifyIdToken: async t => { if (t === 'bad') throw new Error('bad token ' + t); return tok || { email: 'm@x.com', email_verified: true }; },
  getMember: async () => member,
  getEnv: () => env
});
const post = t => ({ method: 'POST', headers: t ? { authorization: 'Bearer ' + t } : {} });

test('endpoint: بدون توکن، توکن بد، غیرعضو', async () => {
  assert.strictEqual((await run(mk({}, null), { method: 'GET', headers: {} })).status, 405);
  assert.strictEqual((await run(mk({}, null), post())).status, 401);
  assert.strictEqual((await run(mk({}, null), post('bad'))).status, 401);
  assert.strictEqual((await run(mk({}, null), post('ok'))).status, 403);
  assert.strictEqual((await run(mk({}, { active: false }), post('ok'))).status, 403);
  assert.strictEqual((await run(mk({}, { role: 'manager' }, { email: 'm@x.com', email_verified: false }), post('ok'))).status, 403);
});

test('endpoint: مدیر جزئیات ناقصی را می‌بیند، معلم فقط پیام کلی', async () => {
  const m = await run(mk({}, { role: 'manager' }), post('ok'));
  assert.strictEqual(m.status, 200);
  assert.strictEqual(m.body.configured, false);
  assert.ok(m.body.issues.length === 3);
  const t = await run(mk({}, { role: 'teacher' }), post('ok'));
  assert.strictEqual(t.body.issues, undefined);
  const okc = await run(mk(good, { role: 'manager' }), post('ok'));
  assert.strictEqual(okc.body.configured, true);
  assert.ok(!JSON.stringify(okc.body).includes(KEY));
});
