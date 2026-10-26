'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestHandler, providerRequest, TEST_PROMPT, TEST_MAX_TOKENS } = require('../test-handler');
const KEY = 'sk-test-0123456789abcdefghijklmnop';
const env = { AI_PROVIDER: 'openai', AI_MODEL: 'gpt-test-model', AI_API_KEY: KEY, AI_TIMEOUT_MS: '1000', AI_DAILY_LIMIT: '2' };
function run(handler, req) {
  return new Promise(resolve => {
    const res = { headers: {}, set(k,v){this.headers[k]=v;return this;}, status(s){this.statusCode=s;return this;}, json(b){resolve({status:this.statusCode,body:b,headers:this.headers});} };
    handler(req,res);
  });
}
function mk(options={}) {
  return createTestHandler({
    getEnv:()=>options.env || env,
    verifyIdToken:async t=>{if(t==='bad')throw Error('invalid');return {uid:'u1',email:'manager@example.com',email_verified:true};},
    getMember:async()=>options.member===undefined?{role:'manager',active:true}:options.member,
    reserveUse:options.reserveUse || (async()=>({allowed:true})),
    fetch:options.fetch || (async()=>({ok:true,status:200,text:async()=>'{"ok":true}'})),
    now:options.now || (()=>100000)
  });
}
const post=(token='valid')=>({method:'POST',headers:token?{authorization:'Bearer '+token}:{}});

test('درخواست ساخته‌شده فقط متن ثابت و تعداد توکن بسیار کم دارد',()=>{
 const r=providerRequest(require('../config').loadConfig(env),KEY);
 assert.equal(TEST_PROMPT,'Reply with exactly: CONNECTION_OK');
 assert.equal(r.body.max_tokens,TEST_MAX_TOKENS);
 assert.deepEqual(r.body.messages,[{role:'user',content:TEST_PROMPT}]);
 assert.equal(r.url,'https://api.openai.com/v1/chat/completions');
 assert.equal(r.headers.Authorization,'Bearer '+KEY);
 assert.equal(r.url.includes(KEY),false);
 assert.equal(JSON.stringify(r.body).includes(KEY),false); // کلید فقط در هدر درخواست سمت سرور است
});

test('بدون ورود یا نقش مدیر درخواست به AI نمی‌رسد',async()=>{
 let calls=0;const fetch=async()=>{calls++;return {ok:true,status:200,text:async()=>''}};
 assert.equal((await run(mk({fetch}),post(''))).status,401);
 assert.equal((await run(mk({fetch,member:{role:'teacher',active:true}}),post())).status,403);
 assert.equal(calls,0);
});

test('موفقیت، کلید و پاسخ سرویس را به مرورگر برنمی‌گرداند',async()=>{
 let sent;
 const r=await run(mk({fetch:async(url,opts)=>{sent={url,opts};return {ok:true,status:200,text:async()=>'{"choices":[{"message":{"content":"CONNECTION_OK"}}]}'}}}),post());
 assert.equal(r.status,200);assert.equal(r.body.ok,true);assert.equal(r.body.code,'connected');
 assert.ok(!JSON.stringify(r.body).includes(KEY));assert.ok(!JSON.stringify(r.body).includes('CONNECTION_OK'));
 assert.equal(sent.opts.body.includes('دانش‌آموز'),false);assert.equal(sent.opts.headers.Authorization,'Bearer '+KEY);
});

test('خطای احراز هویت سرویس به شکل امن گزارش می‌شود',async()=>{
 const r=await run(mk({fetch:async()=>({ok:false,status:401,text:async()=>'{"error":"secret key"}'})}),post());
 assert.equal(r.status,502);assert.equal(r.body.code,'provider_auth');assert.ok(!JSON.stringify(r.body).includes(KEY));
});

test('قطع ارتباط و پایان زمان انتظار جداگانه مدیریت می‌شوند',async()=>{
 const net=await run(mk({fetch:async()=>{throw Object.assign(Error('offline'),{code:'ECONNRESET'})}}),post());
 assert.equal(net.body.code,'network_error');
 const timeout=await run(mk({fetch:async(_u,o)=>new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'}))))}),post());
 assert.equal(timeout.status,504);assert.equal(timeout.body.code,'timeout');
});

test('سقف روزانه، فاصله‌ی تکرار و غیرفعال بودن سرویس رعایت می‌شود',async()=>{
 const quota=await run(mk({reserveUse:async()=>({allowed:false,reason:'daily_limit'})}),post());assert.equal(quota.body.code,'daily_limit');
 const cool=await run(mk({reserveUse:async()=>({allowed:false,reason:'cooldown',retryAfterMs:3000})}),post());assert.equal(cool.body.code,'cooldown');
 const disabled=await run(mk({env:{...env,AI_ENABLED:'false'}}),post());assert.equal(disabled.body.code,'disabled');
});
