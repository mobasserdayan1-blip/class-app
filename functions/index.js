'use strict';
/* نقطه‌ی ورود Cloud Functions.
   فعلاً فقط aiStatus وجود دارد (بررسی تنظیمات). ارسال درخواست واقعی به هوش مصنوعی در مرحله‌ی بعد اضافه می‌شود.
   کلید API فقط به‌صورت Secret سرور (AI_API_KEY) به تابع وصل می‌شود: firebase functions:secrets:set AI_API_KEY */
const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { createStatusHandler } = require('./status-handler');
const { createTestHandler } = require('./test-handler');

admin.initializeApp();
setGlobalOptions({ region: process.env.AI_REGION || 'europe-west1', maxInstances: 3 });

// مبداهای مجاز مرورگر: دامنه‌ی Firebase + هر چیزی که در AI_ALLOWED_ORIGINS (جداشده با ویرگول) بیاید، مثل آدرس GitHub Pages
const origins = ['https://class-league-6c89f.web.app', 'https://class-league-6c89f.firebaseapp.com']
  .concat(String(process.env.AI_ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean));

const handler = createStatusHandler({
  verifyIdToken: t => admin.auth().verifyIdToken(t),
  getMember: async email => {
    const snap = await admin.firestore().doc('members/' + email).get();
    return snap.exists ? snap.data() : null;
  }
});

exports.aiStatus = onRequest(
  { secrets: ['AI_API_KEY'], cors: origins, invoker: 'public', timeoutSeconds: 15, memory: '256MiB' },
  handler
);

// درخواست آزمایشی واقعی؛ فقط مدیر و با سقف روزانه/فاصله‌ی بین درخواست‌ها.
const testHandler = createTestHandler({
  verifyIdToken: t => admin.auth().verifyIdToken(t),
  getMember: async email => {
    const snap = await admin.firestore().doc('members/' + email).get();
    return snap.exists ? snap.data() : null;
  },
  reserveUse: async ({ uid, dailyLimit, now, cooldownMs }) => {
    const date = new Date(now).toISOString().slice(0, 10);
    const safeUid = require('node:crypto').createHash('sha256').update(uid).digest('hex').slice(0, 32);
    const ref = admin.firestore().doc('ai_test_usage/' + date + '_' + safeUid);
    return admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : {};
      const count = Number(data.count || 0);
      const last = Number(data.lastRequestAt || 0);
      if (dailyLimit <= 0 || count >= dailyLimit) return { allowed: false, reason: 'daily_limit' };
      if (last && now - last < cooldownMs) return { allowed: false, reason: 'cooldown', retryAfterMs: cooldownMs - (now - last) };
      tx.set(ref, { count: count + 1, lastRequestAt: now, uidHash: safeUid, date }, { merge: true });
      return { allowed: true };
    });
  }
});

exports.aiTest = onRequest(
  { secrets: ['AI_API_KEY'], cors: origins, invoker: 'public', timeoutSeconds: 35, memory: '256MiB' },
  testHandler
);
