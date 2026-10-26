'use strict';
/* بررسی وضعیت تنظیمات هوش مصنوعی. هیچ درخواستی به سرویس هوش مصنوعی ارسال نمی‌کند.
   وابستگی‌ها تزریق می‌شوند تا بدون Firebase هم بتوان آن را آزمود. */
const { loadConfig, publicView } = require('./config');
const logger = require('./logger');

function createStatusHandler(deps) {
  const verifyIdToken = deps.verifyIdToken;
  const getMember = deps.getMember;
  const getEnv = deps.getEnv || (() => process.env);
  const mgrLogin = String((getEnv().AI_MANAGER_LOGIN_EMAIL) || 'manager@class-league-6c89f.firebaseapp.com').toLowerCase();

  const send = (res, status, code, message, extra) =>
    res.status(status).json(Object.assign({ ok: false, code, message }, extra || {}));

  return async function aiStatus(req, res) {
    res.set('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.set('Allow', 'POST');
      return send(res, 405, 'method_not_allowed', 'فقط درخواست POST پذیرفته می‌شود.');
    }
    const m = /^Bearer\s+(\S+)$/.exec(String((req.headers && req.headers.authorization) || ''));
    if (!m) return send(res, 401, 'auth_required', 'ورود لازم است.');

    let decoded;
    try {
      decoded = await verifyIdToken(m[1]);
    } catch (e) {
      logger.warn('ai_status_bad_token', { error: e });
      return send(res, 401, 'invalid_token', 'نشست ورود معتبر نیست؛ دوباره وارد شوید.');
    }

    const email = String((decoded && decoded.email) || '').toLowerCase();
    const verified = decoded && (decoded.email_verified === true || email === mgrLogin);
    if (!email || !verified) return send(res, 403, 'not_allowed', 'این حساب اجازه‌ی دسترسی ندارد.');

    let member;
    try {
      member = await getMember(email);
    } catch (e) {
      logger.error('ai_status_member_lookup_failed', { error: e });
      return send(res, 500, 'internal', 'خطای داخلی سرور.');
    }
    if (!member || member.active === false) return send(res, 403, 'not_member', 'این حساب عضو مدرسه نیست.');

    const role = member.role === 'manager' ? 'manager' : 'teacher';
    const cfg = loadConfig(getEnv());
    logger.info('ai_status_checked', { role, configured: cfg.ok, enabled: cfg.enabled });
    return res.status(200).json(Object.assign({ ok: true, role }, publicView(cfg, { detailed: role === 'manager' })));
  };
}

module.exports = { createStatusHandler };
