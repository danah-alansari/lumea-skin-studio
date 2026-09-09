/* ==========================================================================
   LUMEA — Skin Studio · front-end prototype
   No backend. All persistence via localStorage behind the Store facade, so
   each Store.* call maps 1:1 to a future REST/GraphQL endpoint.

   Module map
     Util      small DOM + format helpers
     Store     persistence, session, per-user state (swap for API layer)
     Catalog   product data (swap for /products)
     Engine    AI-assisted analysis + routine generation (swap for /analyze)
     Cart      basket maths
     Journey   stage/gating state machine
     UI        toasts, modals, reveal, curtain transitions
     Views     one function per screen
     Router    hash routing + guards
   ========================================================================== */
(function () {
'use strict';

/* ===================== UTIL ===================== */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const CUR = 'KD';
const money = (n) => CUR + ' ' + (Math.round(n * 1000) / 1000).toFixed(3);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid = (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
const DAY = 86400000;
const fmtDate = (ts, opt) => new Date(ts).toLocaleDateString('en-GB', opt || { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const hash = (str) => { let h = 2166136261; for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };
const debounce = (fn, ms) => { let t; return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), ms || 200); }; };
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

/* svg icon set */
const ico = {
  arrow:  '<svg class="btn__arrow" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 10h13M11.5 5.5 16 10l-4.5 4.5"/></svg>',
  check:  '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10.5l4 4 8-9"/></svg>',
  info:   '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.6"/></svg>',
  shield: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10 2.5 16.5 5v5c0 4-2.7 6.6-6.5 7.7C6.2 16.6 3.5 14 3.5 10V5L10 2.5Z"/><path d="M7.4 10.2 9.3 12l3.4-3.6"/></svg>',
  spark:  '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 2.6l1.5 4.3 4.3 1.6-4.3 1.6L10 14.4 8.5 10.1 4.2 8.5l4.3-1.6L10 2.6Z"/><path d="M15.6 13.4l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z"/></svg>',
  derm:   '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 11.5a4.1 4.1 0 0 0 4.1-4.1V3.2H5.9v4.2A4.1 4.1 0 0 0 10 11.5Z"/><path d="M10 11.5v3.1a2.8 2.8 0 1 0 5.6 0v-1"/><circle cx="15.9" cy="12.6" r="1.1"/></svg>',
  cam:    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 8.5A2 2 0 0 1 5 6.5h1.8l1.1-1.7h8.2l1.1 1.7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z"/><circle cx="12" cy="13" r="3.4"/></svg>',
  upload: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
  send:   '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 10 17 3l-4.6 14L10 11.4 3 10Z"/></svg>',
  clip:   '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12.5 6.5 7.2 11.8a2.3 2.3 0 0 0 3.3 3.3l5.6-5.6a4 4 0 0 0-5.7-5.7L4.6 9.6a5.7 5.7 0 0 0 8 8l4-4"/></svg>',
  lock:   '<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4.2" y="8.6" width="11.6" height="8.2" rx="1.6"/><path d="M7 8.6V6.4a3 3 0 0 1 6 0v2.2"/></svg>',
  x:      '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5.5 5.5l9 9m0-9-9 9"/></svg>',
  swap:   '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.5 7h11L11.8 4.3M16.5 13h-11l2.7 2.7"/></svg>',
  chat:   '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.2 9.4c0-3.1 3-5.6 6.8-5.6s6.8 2.5 6.8 5.6-3 5.6-6.8 5.6c-.9 0-1.7-.1-2.5-.4L4 16l.8-2.6a5.2 5.2 0 0 1-1.6-4Z"/></svg>',
  eye:    '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1.8 10S4.6 5.2 10 5.2 18.2 10 18.2 10 15.4 14.8 10 14.8 1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.2"/></svg>',
  drop:   '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 2.8c2.6 3.1 4.4 5.5 4.4 7.9A4.4 4.4 0 0 1 10 15.1a4.4 4.4 0 0 1-4.4-4.4c0-2.4 1.8-4.8 4.4-7.9Z"/></svg>',
  sun:    '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="10" cy="10" r="3.4"/><path d="M10 2.4v1.8M10 15.8v1.8M2.4 10h1.8M15.8 10h1.8M4.6 4.6l1.3 1.3M14.1 14.1l1.3 1.3M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3"/></svg>',
  moon:   '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M15.4 12.6A6.4 6.4 0 0 1 7.4 4.6a6.6 6.6 0 1 0 8 8Z"/></svg>',
  home:   '<svg viewBox="0 0 22 22" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.5 9.6 11 3.6l7.5 6v8a1.4 1.4 0 0 1-1.4 1.4H4.9a1.4 1.4 0 0 1-1.4-1.4v-8Z"/></svg>',
  scan:   '<svg viewBox="0 0 22 22" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.4 7.4V4.8a1.4 1.4 0 0 1 1.4-1.4h2.6M14.6 3.4h2.6a1.4 1.4 0 0 1 1.4 1.4v2.6M18.6 14.6v2.6a1.4 1.4 0 0 1-1.4 1.4h-2.6M7.4 18.6H4.8a1.4 1.4 0 0 1-1.4-1.4v-2.6M3.4 11h15.2"/></svg>',
  bottleI:'<svg viewBox="0 0 22 22" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8.6 3.4h4.8v2.2l1.6 2.2v10.4a.8.8 0 0 1-.8.8H7.8a.8.8 0 0 1-.8-.8V7.8l1.6-2.2V3.4Z"/></svg>',
  chartI: '<svg viewBox="0 0 22 22" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.4 18.6h15.2M6.6 18.6v-6M11 18.6V6.4M15.4 18.6v-9"/></svg>',
  userI:  '<svg viewBox="0 0 22 22" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="11" cy="8" r="3.6"/><path d="M4.4 19a6.6 6.6 0 0 1 13.2 0"/></svg>',
  bagI:   '<svg viewBox="0 0 22 22" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4.4 6.6h13.2l-1.1 11a1.6 1.6 0 0 1-1.6 1.4H7.1a1.6 1.6 0 0 1-1.6-1.4l-1.1-11Z"/><path d="M8.4 6.6V5.4a2.6 2.6 0 0 1 5.2 0v1.2"/></svg>'
};

/* ===================== STORE ===================== */
const KEY = 'lumea.db.v3';
const Store = {
  db: null,
  boot() {
    try { this.db = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { this.db = null; }
    if (!this.db || !this.db.users) this.db = { users: [], session: null, data: {}, seeded: false };
    /* pre-Supabase caches held local accounts and passwords; discard them */
    if (this.db.users.length || (this.db.session && /^usr_/.test(this.db.session.userId || ''))) {
      this.db.users = []; this.db.session = null;
      Object.keys(this.db.data).forEach(k => { if (/^usr_/.test(k)) delete this.db.data[k]; });
      this.save();
    }
    if (!this.db.seeded) { this.seed(); }
    return this.db;
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.db)); } catch (e) { UI.toast('Storage is full — some demo data may not persist.', 'warn'); } },
  reset() { localStorage.removeItem(KEY); this.db = null; this.boot(); },

  /* identities live in Supabase Auth now; nothing to seed locally */
  seed() { this.db.seeded = true; this.save(); },

  /* --- session: Supabase Auth is the authority; localStorage is a cache --- */
  /* Supabase Auth is the only authority — a leftover local session must never
     stand in for one, or clearing cookies would leave a ghost logged in */
  session() { return Cloud.user ? { userId: Cloud.user.id, remember: true } : null; },
  user() {
    if (Cloud.user) {
      const st = this.db.data[Cloud.user.id];
      return { id: Cloud.user.id,
               name: (st && st.profile && st.profile.name) || Cloud.user.email,
               email: Cloud.user.email,
               createdAt: Cloud.user.created_at ? new Date(Cloud.user.created_at).getTime() : now() };
    }
    return null;
  },
  state() { const u = this.user(); if (!u) return null; if (!this.db.data[u.id]) this.db.data[u.id] = blankState(u); return this.db.data[u.id]; },
  commit(mutator) {
    const st = this.state(); if (!st) return null;
    mutator(st); this.save(); Cloud.queue();
    return st;
  },

  findUser(email) { return this.db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase()) || null; },
  createUser({ name, email, password, goals }) {
    const u = { id: uid('usr'), name, email, password, createdAt: now() };
    this.db.users.push(u);
    const st = blankState(u);
    st.profile.goals = goals || '';
    this.db.data[u.id] = st;
    this.db.session = { userId: u.id, remember: true, at: now() };
    this.save();
    return u;
  },
  signIn(email, password, remember) {
    const u = this.findUser(email);
    if (!u || u.password !== password) return null;
    this.db.session = { userId: u.id, remember: !!remember, at: now() };
    this.save();
    return u;
  },
  signOut() { this.db.session = null; this.save(); }
};

function blankState(u) {
  return {
    profile: { name: u.name, email: u.email, phone: '', age: '', goals: '', address: null },
    photo: null, photoAt: null,
    concerns: [], priorities: [], notes: '',
    report: null,
    review: { status: 'none', notes: '', requests: [], confirmedAt: null, adjustments: [] },
    routine: null,
    cart: [], saved: [], orders: [],
    trial: null,
    subscription: null,
    messages: [],
    progress: [],
    reviews: {},
    clinicianReview: null,
    serviceReview: null,
    settings: { emailUpdates: true, shipReminders: true, dermAlerts: true, shareAnon: false },
    history: []
  };
}

const DERM = { name: 'Dr. Nadia Al-Sabah', title: 'Consultant Dermatologist', reg: 'MD · Board Certified · Reg. 41‑2287', years: 14 };

/* ===================== CLOUD (Supabase) =====================
   Supabase is the durable store. The in-memory state object keeps the same
   shape the views already expect, so rendering stays synchronous: we hydrate
   it once after sign-in, then write every change back.

   Reads/writes go through RLS as the signed-in member, so a member can only
   ever touch their own rows.
   ============================================================ */
const CLOUD = {
  url: 'https://jwfxasnjbyvodtfuymic.supabase.co',
  key: 'sb_publishable_NAV7BTaOmRJJEK2Celp2GQ_c8ATDJiY',
  bucket: 'skin-photos'
};

const Cloud = {
  sb: null,
  user: null,          /* the auth user */
  online: false,
  pushTimer: null,
  pushing: false,
  dirty: false,

  /* ---------- lifecycle ---------- */
  init() {
    if (this.sb) return true;
    if (!window.supabase || !window.supabase.createClient) return false;
    this.sb = window.supabase.createClient(CLOUD.url, CLOUD.key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
    });
    this.online = true;
    return true;
  },
  async session() {
    if (!this.init()) return null;
    const { data } = await this.sb.auth.getSession();
    return (data && data.session) || null;
  },

  /* ---------- auth ---------- */
  async signUp({ name, email, password, goals }) {
    if (!this.init()) return { error: 'Cloud storage is unavailable — check your connection and reload.' };
    const { data, error } = await this.sb.auth.signUp({
      email, password,
      options: { data: { full_name: name, skin_goals: goals || '' }, emailRedirectTo: location.origin + location.pathname + '#/confirmed' }
    });
    if (error) return { error: error.message };
    if (data.session) { this.user = data.user; return { user: data.user, confirmed: true }; }
    return { pendingEmail: email };      /* confirmation required */
  },
  async signIn(email, password) {
    if (!this.init()) return { error: 'Cloud storage is unavailable — check your connection and reload.' };
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (/not confirmed/i.test(error.message)) return { unconfirmed: true, email };
      if (/invalid login/i.test(error.message)) return { error: 'We couldn’t verify those details. Please check your email and password.' };
      return { error: error.message };
    }
    this.user = data.user;
    return { user: data.user };
  },
  async resend(email) {
    if (!this.init()) return { error: 'Cloud storage is unavailable.' };
    const { error } = await this.sb.auth.resend({
      type: 'signup', email,
      options: { emailRedirectTo: location.origin + location.pathname + '#/confirmed' }
    });
    return error ? { error: error.message } : { sent: true };
  },
  async signOut() {
    if (this.sb) await this.sb.auth.signOut();
    this.user = null;
  },
  async resetPassword(email) {
    if (!this.init()) return { error: 'Cloud storage is unavailable.' };
    const { error } = await this.sb.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname + '#/signin'
    });
    return error ? { error: error.message } : { sent: true };
  },

  /* ---------- storage ---------- */
  async uploadPhoto(dataUrl, kind, dayIndex, label) {
    if (!this.online || !this.user) return null;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const path = this.user.id + '/' + uid('img') + '.jpg';
      const up = await this.sb.storage.from(CLOUD.bucket).upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (up.error) throw up.error;
      const row = await this.sb.from('skin_photos').insert({
        user_id: this.user.id, storage_path: path, kind: kind,
        day_index: dayIndex == null ? null : dayIndex, label: label || null
      }).select('id').single();
      if (row.error) throw row.error;
      return { id: row.data.id, path };
    } catch (e) { console.warn('photo upload failed', e); return null; }
  },
  async photoUrl(path) {
    if (!this.online || !path) return null;
    const { data } = await this.sb.storage.from(CLOUD.bucket).createSignedUrl(path, 60 * 60 * 8);
    return (data && data.signedUrl) || null;
  },

  /* ---------- hydrate: server -> state ---------- */
  async hydrate() {
    if (!this.online || !this.user) return null;
    const uidv = this.user.id;
    const sb = this.sb;
    const st = blankState({ id: uidv, name: '', email: this.user.email });
    st.cloud = { photoIds: {} };

    const [prof, settings, addr, conc, photos, analysis, cart, orders, trial, sub, thread, prodRevs, clinRev, svcRev, skinRates, acts] = await Promise.all([
      sb.from('profiles').select('*').eq('id', uidv).maybeSingle(),
      sb.from('user_settings').select('*').eq('user_id', uidv).maybeSingle(),
      sb.from('addresses').select('*').eq('user_id', uidv).order('created_at', { ascending: false }).limit(1),
      sb.from('user_concerns').select('concern_id,priority_rank').eq('user_id', uidv),
      sb.from('skin_photos').select('*').eq('user_id', uidv).order('taken_at', { ascending: true }),
      sb.from('analyses').select('*').eq('user_id', uidv).order('created_at', { ascending: false }).limit(1),
      sb.from('carts').select('id,cart_items(product_id,size,qty,saved_for_later)').eq('user_id', uidv).eq('status', 'open').maybeSingle(),
      sb.from('orders').select('*,order_items(product_id,size,qty,unit_price)').eq('user_id', uidv).order('placed_at', { ascending: false }),
      sb.from('trials').select('*,trial_logs(*)').eq('user_id', uidv).order('started_at', { ascending: false }).limit(1),
      sb.from('subscriptions').select('*').eq('user_id', uidv).neq('status', 'cancelled').maybeSingle(),
      sb.from('message_threads').select('id,messages(*)').eq('user_id', uidv).maybeSingle(),
      sb.from('product_reviews').select('*').eq('user_id', uidv),
      sb.from('clinician_reviews').select('*').eq('user_id', uidv).maybeSingle(),
      sb.from('service_reviews').select('*').eq('user_id', uidv).maybeSingle(),
      sb.from('skin_ratings').select('*').eq('user_id', uidv).order('rated_on', { ascending: false }),
      sb.from('activity_log').select('event,created_at').eq('user_id', uidv).order('created_at', { ascending: true }).limit(40)
    ]);

    /* profile */
    if (prof.data) {
      st.profile.name = prof.data.full_name || this.user.email;
      st.profile.email = prof.data.email || this.user.email;
      st.profile.phone = prof.data.phone || '';
      st.profile.age = prof.data.age || '';
      st.profile.goals = prof.data.skin_goals || '';
    }
    if (settings.data) {
      st.settings = { dermAlerts: settings.data.derm_alerts, shipReminders: settings.data.ship_reminders,
                      emailUpdates: settings.data.email_updates, shareAnon: settings.data.share_anonymised };
    }
    if (addr.data && addr.data[0]) {
      const a = addr.data[0];
      st.profile.address = { name: a.recipient, phone: a.phone, line: a.line, area: a.area, gov: a.governorate };
      st.cloud.addressId = a.id;
    }

    /* concerns */
    (conc.data || []).forEach(c => {
      st.concerns.push(c.concern_id);
      if (c.priority_rank) st.priorities[c.priority_rank - 1] = c.concern_id;
    });
    st.priorities = st.priorities.filter(Boolean);

    /* photos (signed URLs so <img> works against a private bucket) */
    const rows = photos.data || [];
    await Promise.all(rows.map(async p => {
      const url = await this.photoUrl(p.storage_path);
      if (!url) return;
      if (p.kind === 'baseline' && !st.photo) { st.photo = url; st.photoAt = new Date(p.taken_at).getTime(); st.cloud.baselinePath = p.storage_path; }
      if (p.kind === 'baseline' || p.kind === 'progress') {
        st.progress.push({ id: p.id, src: url, day: p.day_index || 1, label: p.label || ('Day ' + (p.day_index || 1)), at: new Date(p.taken_at).getTime() });
      }
    }));
    st.progress.sort((a, b) => a.day - b.day);

    /* analysis + review + routine */
    const an = analysis.data && analysis.data[0];
    if (an) {
      st.cloud.analysisId = an.id;
      const [mets, focus, ancs, rev] = await Promise.all([
        sb.from('analysis_metrics').select('*').eq('analysis_id', an.id),
        sb.from('analysis_focus').select('*').eq('analysis_id', an.id).order('rank'),
        sb.from('analysis_concerns').select('concern_id,priority_rank').eq('analysis_id', an.id),
        sb.from('reviews').select('*').eq('analysis_id', an.id).maybeSingle()
      ]);
      const order = ['hydration', 'oil', 'texture', 'redness', 'pigmentation', 'pores', 'breakouts'];
      st.report = {
        createdAt: new Date(an.created_at).getTime(), score: an.score, band: an.band,
        summary: an.summary, notes: an.patient_notes || '', engine: an.engine_version,
        concerns: (ancs.data || []).map(c => c.concern_id),
        metrics: (mets.data || []).slice().sort((a, b) => order.indexOf(a.metric_key) - order.indexOf(b.metric_key)).map(m => ({
          key: m.metric_key, label: m.label, value: m.value, level: m.level, word: m.display_word,
          note: m.note, dir: m.metric_key === 'hydration' ? 'good' : 'flag',
          tone: Engine.tone({ dir: m.metric_key === 'hydration' ? 'good' : 'flag', key: m.metric_key }, m.level)
        })),
        focus: (focus.data || []).map(f => ({ key: f.focus_key, t: f.title, d: f.detail })),
        focusKeys: (focus.data || []).map(f => f.focus_key)
      };
      st.notes = an.patient_notes || '';

      if (rev.data) {
        st.cloud.reviewId = rev.data.id;
        st.review = {
          status: rev.data.status === 'info_requested' ? 'info' : rev.data.status,
          notes: rev.data.clinician_notes || '', requests: [], adjustments: [],
          confirmedAt: rev.data.confirmed_at ? new Date(rev.data.confirmed_at).getTime() : null,
          sentAt: new Date(rev.data.sent_at).getTime()
        };
        const rt = await sb.from('routines').select('*,routine_items(*)').eq('user_id', uidv)
                           .order('version', { ascending: false }).limit(1).maybeSingle();
        if (rt.data) {
          st.cloud.routineId = rt.data.id;
          const items = (rt.data.routine_items || []).slice().sort((a, b) => a.step_order - b.step_order);
          st.routine = {
            createdAt: new Date(rt.data.created_at).getTime(), version: rt.data.version,
            approvedBy: rt.data.approved_at ? DERM.name : null,
            am: items.filter(i => i.slot === 'am').map(i => ({ id: i.product_id, size: i.size })),
            pm: items.filter(i => i.slot === 'pm').map(i => ({ id: i.product_id, size: i.size })),
            rationale: st.report.focus.map(f => f.t)
          };
        }
      }
    }

    /* basket */
    if (cart.data) {
      st.cloud.cartId = cart.data.id;
      (cart.data.cart_items || []).forEach(i => {
        (i.saved_for_later ? st.saved : st.cart).push({ id: i.product_id, size: i.size, qty: i.qty, at: now() });
      });
    }

    /* orders */
    st.orders = (orders.data || []).map(o => ({
      id: o.order_number, at: new Date(o.placed_at).getTime(), kind: o.kind,
      total: Number(o.total), ship: Number(o.shipping), kit: Number(o.bundle_discount),
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      eta: o.eta ? new Date(o.eta).getTime() : now(),
      items: (o.order_items || []).map(i => ({ id: i.product_id, size: i.size, qty: i.qty })),
      details: { payment: o.payment_method, fee: Number(o.handling_fee) || 0,
                 address: st.profile.address || null },
      cloudId: o.id
    }));

    /* trial */
    const tr = trial.data && trial.data[0];
    if (tr) {
      st.cloud.trialId = tr.id;
      st.trial = { startedAt: new Date(tr.started_at).getTime(), demoDay: tr.demo_day || 1, logs: {},
                   orderId: (st.orders.find(o => o.cloudId === tr.order_id) || {}).id || null,
                   kit: st.routine ? Engine.routineProducts(st.routine).map(p => p.id) : [] };
      (tr.trial_logs || []).forEach(l => {
        st.trial.logs[l.day_index] = { at: new Date(l.logged_at).getTime(), note: l.note || '',
          irritation: l.irritation, dryness: l.dryness, breakouts: l.breakouts,
          improvement: l.improvement, satisfaction: l.satisfaction };
      });
    }

    /* subscription */
    if (sub.data) {
      st.cloud.subId = sub.data.id;
      st.subscription = { status: sub.data.status, startedAt: new Date(sub.data.started_at).getTime(),
        frequency: sub.data.interval_days, nextShip: sub.data.next_ship_on ? new Date(sub.data.next_ship_on).getTime() : now(),
        price: Number(sub.data.price), skipNext: sub.data.skip_next, payment: sub.data.payment_method,
        address: st.profile.address ? st.profile.address.line : 'Not set' };
    }

    /* messages */
    if (thread.data) {
      st.cloud.threadId = thread.data.id;
      st.messages = (thread.data.messages || []).slice()
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(m => ({ id: m.id, who: m.sender === 'patient' ? 'me' : m.sender === 'clinician' ? 'derm' : 'system',
                     text: m.body, at: new Date(m.created_at).getTime() }));
      st.cloud.msgSynced = st.messages.length;
    }

    /* ratings and reviews */
    (prodRevs.data || []).forEach(r => {
      st.reviews[r.product_id] = { rating: r.rating, text: r.body || '', at: new Date(r.updated_at).getTime() };
    });
    if (clinRev.data) st.clinicianReview = { rating: clinRev.data.rating, text: clinRev.data.body || '', at: new Date(clinRev.data.updated_at).getTime() };
    if (svcRev.data) st.serviceReview = { rating: svcRev.data.rating, text: svcRev.data.body || '', recommend: svcRev.data.would_recommend, at: new Date(svcRev.data.updated_at).getTime() };
    st.ratings = (skinRates.data || []).map(r => ({ at: new Date(r.created_at).getTime(), rating: r.rating, note: r.note || '' }));
    st.history = (acts.data || []).map(a => ({ at: new Date(a.created_at).getTime(), t: a.event }));

    return st;
  }
};

/* ---------- cloud write layer: state -> server ----------
   Every Store.commit() queues push(). Each domain is idempotent: ids of
   already-created rows are kept on state.cloud so a second push updates
   rather than duplicates. A failure in one domain never blocks the others. */
Object.assign(Cloud, {
  queue() {
    if (!this.online || !this.user) return;
    this.dirty = true;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.push(), 700);
  },

  async push() {
    if (!this.online || !this.user || this.pushing) return;
    const st = Store.state();
    if (!st) return;
    this.pushing = true; this.dirty = false;
    const sb = this.sb, me = this.user.id;
    if (!st.cloud) st.cloud = { photoIds: {} };
    const c = st.cloud;
    const fail = [];
    const step = async (name, fn) => { try { await fn(); } catch (e) { fail.push(name); console.warn('sync ' + name, e); } };

    /* --- profile, settings, address --- */
    await step('profile', async () => {
      await sb.from('profiles').update({
        full_name: st.profile.name || null, phone: st.profile.phone || null,
        age: st.profile.age ? parseInt(st.profile.age, 10) || null : null,
        skin_goals: st.profile.goals || null
      }).eq('id', me);
    });
    await step('settings', async () => {
      await sb.from('user_settings').update({
        derm_alerts: !!st.settings.dermAlerts, ship_reminders: !!st.settings.shipReminders,
        email_updates: !!st.settings.emailUpdates, share_anonymised: !!st.settings.shareAnon
      }).eq('user_id', me);
    });
    if (st.profile.address && st.profile.address.line) {
      await step('address', async () => {
        const a = st.profile.address;
        const row = { user_id: me, recipient: a.name || st.profile.name, phone: a.phone || '',
                      line: a.line, area: a.area || '', governorate: a.gov || '', is_default: true };
        if (c.addressId) await sb.from('addresses').update(row).eq('id', c.addressId);
        else { const r = await sb.from('addresses').insert(row).select('id').single(); if (!r.error) c.addressId = r.data.id; }
      });
    }

    /* --- concerns --- */
    await step('concerns', async () => {
      await sb.from('user_concerns').delete().eq('user_id', me);
      if (st.concerns.length) {
        await sb.from('user_concerns').insert(st.concerns.map(id => ({
          user_id: me, concern_id: id,
          priority_rank: st.priorities.indexOf(id) > -1 ? st.priorities.indexOf(id) + 1 : null
        })));
      }
    });

    /* --- analysis (insert once, with its children) --- */
    if (st.report && !c.analysisId) {
      await step('analysis', async () => {
        const r = await sb.from('analyses').insert({
          user_id: me, photo_id: c.baselinePhotoId || null, engine_version: st.report.engine,
          score: st.report.score, band: st.report.band, summary: st.report.summary,
          patient_notes: st.notes || null
        }).select('id').single();
        if (r.error) throw r.error;
        c.analysisId = r.data.id;
        await Promise.all([
          sb.from('analysis_metrics').insert(st.report.metrics.map(m => ({
            analysis_id: c.analysisId, metric_key: m.key, label: m.label,
            value: m.value, level: m.level, display_word: m.word, note: m.note
          }))),
          sb.from('analysis_focus').insert(st.report.focus.map((f, i) => ({
            analysis_id: c.analysisId, rank: i + 1, focus_key: f.key, title: f.t, detail: f.d
          }))),
          sb.from('analysis_concerns').insert(st.report.concerns.map(id => ({
            analysis_id: c.analysisId, concern_id: id,
            priority_rank: st.priorities.indexOf(id) > -1 ? st.priorities.indexOf(id) + 1 : null
          })))
        ]);
      });
    }

    /* --- review: the member may submit it; only the server may confirm it --- */
    if (st.review.status !== 'none' && c.analysisId && !c.reviewId) {
      await step('review', async () => {
        const r = await sb.from('reviews').insert({ user_id: me, analysis_id: c.analysisId, status: 'pending' })
                          .select('id').single();
        if (r.error) throw r.error;
        c.reviewId = r.data.id;
      });
    }

    /* --- routine: written through release_review(), because RLS reserves
           routine authorship for the clinician --- */
    const routineItems = () => {
      const out = [];
      st.routine.am.forEach((it, i) => out.push({ product_id: it.id, slot: 'am', step_order: i + 1, size: it.size, rationale: P(it.id).why }));
      st.routine.pm.forEach((it, i) => out.push({ product_id: it.id, slot: 'pm', step_order: i + 1, size: it.size, rationale: P(it.id).why }));
      return out;
    };
    if (st.routine && st.review.status === 'confirmed' && c.analysisId && !c.routineId) {
      await step('routine', async () => {
        const r = await sb.rpc('release_review', {
          p_analysis: c.analysisId, p_items: routineItems(), p_notes: st.review.notes || null
        });
        if (r.error) throw r.error;
        c.routineId = r.data;
        c.itemsHash = hash(JSON.stringify(routineItems()));
      });
    } else if (st.routine && c.routineId) {
      const h = hash(JSON.stringify(routineItems()));
      if (h !== c.itemsHash) {
        await step('routine_items', async () => {
          const r = await sb.rpc('set_routine_items', { p_routine: c.routineId, p_items: routineItems() });
          if (r.error) throw r.error;
          c.itemsHash = h;
        });
      }
    }

    /* --- basket --- */
    await step('cart', async () => {
      if (!c.cartId) {
        const r = await sb.from('carts').insert({ user_id: me, status: 'open' }).select('id').single();
        if (r.error) { /* a cart may already exist from another tab */
          const ex = await sb.from('carts').select('id').eq('user_id', me).eq('status', 'open').maybeSingle();
          if (ex.data) c.cartId = ex.data.id; else throw r.error;
        } else c.cartId = r.data.id;
      }
      await sb.from('cart_items').delete().eq('cart_id', c.cartId);
      const rows = st.cart.map(i => ({ cart_id: c.cartId, product_id: i.id, size: i.size, qty: i.qty, saved_for_later: false }))
        .concat(st.saved.map(i => ({ cart_id: c.cartId, product_id: i.id, size: i.size, qty: i.qty, saved_for_later: true })));
      if (rows.length) await sb.from('cart_items').insert(rows);
    });

    /* --- orders (append only) --- */
    for (const o of st.orders.filter(o => !o.cloudId)) {
      await step('order', async () => {
        const sub = o.items.reduce((t, i) => t + (i.size === 'trial' ? P(i.id).trialPrice : P(i.id).price) * i.qty, 0);
        const r = await sb.from('orders').insert({
          user_id: me, order_number: o.id, kind: o.kind, subtotal: sub,
          bundle_discount: o.kit || 0, shipping: o.ship || 0,
          handling_fee: (o.details && o.details.fee) || 0, total: o.total,
          status: 'processing', payment_method: (o.details && o.details.payment) || null,
          address_id: c.addressId || null, eta: new Date(o.eta).toISOString().slice(0, 10)
        }).select('id').single();
        if (r.error) throw r.error;
        o.cloudId = r.data.id;
        await sb.from('order_items').insert(o.items.map(i => ({
          order_id: o.cloudId, product_id: i.id, size: i.size, qty: i.qty,
          unit_price: i.size === 'trial' ? P(i.id).trialPrice : P(i.id).price
        })));
      });
    }

    /* --- trial + logs --- */
    if (st.trial) {
      await step('trial', async () => {
        if (!c.trialId) {
          const ord = st.orders.find(o => o.id === st.trial.orderId);
          const r = await sb.from('trials').insert({
            user_id: me, routine_id: c.routineId || null, order_id: (ord && ord.cloudId) || null,
            started_at: new Date(st.trial.startedAt).toISOString(), demo_day: Trial.day(st), status: 'active'
          }).select('id').single();
          if (r.error) throw r.error;
          c.trialId = r.data.id;
        } else {
          await sb.from('trials').update({ demo_day: Trial.day(st) }).eq('id', c.trialId);
        }
        const logs = Object.keys(st.trial.logs).map(d => ({
          trial_id: c.trialId, day_index: parseInt(d, 10),
          irritation: st.trial.logs[d].irritation, dryness: st.trial.logs[d].dryness,
          breakouts: st.trial.logs[d].breakouts, improvement: st.trial.logs[d].improvement,
          satisfaction: st.trial.logs[d].satisfaction, note: st.trial.logs[d].note || null
        }));
        if (logs.length) await sb.from('trial_logs').upsert(logs, { onConflict: 'trial_id,day_index' });
      });
    }

    /* --- subscription --- */
    if (st.subscription) {
      await step('subscription', async () => {
        const row = { user_id: me, routine_id: c.routineId || null, status: st.subscription.status,
          price: st.subscription.price, interval_days: st.subscription.frequency,
          next_ship_on: new Date(st.subscription.nextShip).toISOString().slice(0, 10),
          skip_next: !!st.subscription.skipNext, payment_method: st.subscription.payment || null,
          address_id: c.addressId || null,
          cancelled_at: st.subscription.status === 'cancelled' ? new Date().toISOString() : null };
        if (c.subId) await sb.from('subscriptions').update(row).eq('id', c.subId);
        else { const r = await sb.from('subscriptions').insert(row).select('id').single(); if (!r.error) c.subId = r.data.id; }
      });
    }

    /* --- messages (append only) --- */
    if (st.messages.length > (c.msgSynced || 0)) {
      await step('messages', async () => {
        if (!c.threadId) {
          const clin = await this.clinicianId();
          const ex = await sb.from('message_threads').select('id').eq('user_id', me).maybeSingle();
          if (ex.data) c.threadId = ex.data.id;
          else {
            const r = await sb.from('message_threads').insert({ user_id: me, clinician_id: clin }).select('id').single();
            if (r.error) throw r.error;
            c.threadId = r.data.id;
          }
        }
        const fresh = st.messages.slice(c.msgSynced || 0);
        await sb.from('messages').insert(fresh.map(m => ({
          thread_id: c.threadId,
          sender: m.who === 'me' ? 'patient' : m.who === 'derm' ? 'clinician' : 'system',
          body: m.text, photo_id: m.photoId || null, created_at: new Date(m.at).toISOString()
        })));
        c.msgSynced = st.messages.length;
      });
    }

    /* --- reviews and ratings --- */
    await step('product_reviews', async () => {
      const ids = Object.keys(st.reviews || {});
      if (!ids.length) return;
      await sb.from('product_reviews').upsert(ids.map(id => ({
        user_id: me, product_id: id, rating: st.reviews[id].rating,
        body: st.reviews[id].text || null,
        verified_purchase: st.orders.some(o => o.items.some(i => i.id === id))
      })), { onConflict: 'user_id,product_id' });
    });
    if (st.clinicianReview) {
      await step('clinician_review', async () => {
        const clin = await this.clinicianId();
        await sb.from('clinician_reviews').upsert({ user_id: me, clinician_id: clin,
          rating: st.clinicianReview.rating, body: st.clinicianReview.text || null },
          { onConflict: 'user_id,clinician_id' });
      });
    }
    if (st.serviceReview) {
      await step('service_review', async () => {
        await sb.from('service_reviews').upsert({ user_id: me, rating: st.serviceReview.rating,
          body: st.serviceReview.text || null, would_recommend: !!st.serviceReview.recommend },
          { onConflict: 'user_id' });
      });
    }
    if ((st.ratings || []).length) {
      await step('skin_ratings', async () => {
        const r = st.ratings[st.ratings.length - 1];
        await sb.from('skin_ratings').upsert({ user_id: me, rating: r.rating, note: r.note || null,
          rated_on: new Date(r.at).toISOString().slice(0, 10) }, { onConflict: 'user_id,rated_on' });
      });
    }

    /* --- activity feed (append only) --- */
    if (st.history.length > (c.actSynced || 0)) {
      await step('activity', async () => {
        const fresh = st.history.slice(c.actSynced || 0);
        await sb.from('activity_log').insert(fresh.map(h => ({
          user_id: me, event: h.t, created_at: new Date(h.at).toISOString()
        })));
        c.actSynced = st.history.length;
      });
    }

    Store.save();
    this.pushing = false;
    if (fail.length && !this.warned) {
      this.warned = true;
      UI.toast('Some changes could not be saved to the cloud (' + fail[0] + '). They are safe in this browser.', 'warn', 5000);
    }
    if (this.dirty) this.queue();          /* changes arrived mid-push */
  },

  async clinicianId() {
    if (this._clinId) return this._clinId;
    const r = await this.sb.from('clinicians').select('id').limit(1).maybeSingle();
    this._clinId = r.data ? r.data.id : null;
    return this._clinId;
  }
});

/* ===================== CATALOG ===================== */
const CONCERNS = [
  { id: 'acne', label: 'Acne' }, { id: 'breakouts', label: 'Breakouts' },
  { id: 'dryness', label: 'Dryness' }, { id: 'dehydration', label: 'Dehydration' },
  { id: 'oiliness', label: 'Oiliness' }, { id: 'redness', label: 'Redness' },
  { id: 'sensitivity', label: 'Sensitivity' }, { id: 'pigmentation', label: 'Hyperpigmentation' },
  { id: 'darkspots', label: 'Dark spots' }, { id: 'unevenTone', label: 'Uneven skin tone' },
  { id: 'texture', label: 'Uneven texture' }, { id: 'pores', label: 'Enlarged pores' },
  { id: 'lines', label: 'Fine lines' }, { id: 'dullness', label: 'Dullness' },
  { id: 'marks', label: 'Post-acne marks' }
];
const cLabel = (id) => (CONCERNS.find(c => c.id === id) || { label: id }).label;

const PRODUCTS = [
  { id: 'cl-gel', name: 'Clarify Gel Cleanser', cat: 'Cleanser', role: 'cleanser', slot: 'both',
    price: 9.5, trialPrice: 2.25, size: '150 ml', trialSize: '30 ml', form: 'tube', tone: 'cool',
    ing: ['Salicylic Acid 0.5%', 'Zinc PCA', 'Green Tea'],
    targets: ['acne', 'breakouts', 'oiliness', 'pores'], gentle: false,
    why: 'A low-foam gel that lifts excess sebum without stripping the barrier.',
    how: 'Massage onto damp skin for 30 seconds, morning and evening. Rinse with lukewarm water.' },
  { id: 'cl-cream', name: 'Lucent Cream Cleanser', cat: 'Cleanser', role: 'cleanser', slot: 'both',
    price: 10.5, trialPrice: 2.5, size: '150 ml', trialSize: '30 ml', form: 'tube', tone: 'warm',
    ing: ['Colloidal Oat', 'Glycerin', 'Ceramide NP'],
    targets: ['dryness', 'sensitivity', 'redness', 'dehydration'], gentle: true,
    why: 'A cushioning cream cleanse that leaves the barrier intact on reactive skin.',
    how: 'Apply to dry or damp skin, massage, then remove with a soft cloth or water.' },
  { id: 'sr-vitc', name: 'Aurora Antioxidant Serum', cat: 'Antioxidant Serum', role: 'serum', slot: 'am',
    price: 24, trialPrice: 4.5, size: '30 ml', trialSize: '7 ml', form: 'dropper', tone: 'amber',
    ing: ['Vitamin C 12%', 'Ferulic Acid', 'Vitamin E'],
    targets: ['dullness', 'pigmentation', 'darkspots', 'unevenTone'], gentle: false,
    why: 'Daytime antioxidant support for brightness and defence against environmental stress.',
    how: 'Four drops to clean, dry skin each morning before moisturiser and SPF.' },
  { id: 'sr-niac', name: 'Equilibrium Niacinamide Serum', cat: 'Balancing Serum', role: 'serum', slot: 'am',
    price: 16.5, trialPrice: 3.25, size: '30 ml', trialSize: '7 ml', form: 'dropper', tone: 'sage',
    ing: ['Niacinamide 5%', 'Zinc PCA', 'Panthenol'],
    targets: ['oiliness', 'pores', 'marks', 'redness', 'breakouts'], gentle: true,
    why: 'Helps visibly balance oil and soften the look of pores and post-acne marks.',
    how: 'Two to three drops in the morning, before moisturiser.' },
  { id: 'sr-hydra', name: 'Reservoir Hydrating Serum', cat: 'Hydrating Serum', role: 'serum', slot: 'am',
    price: 18, trialPrice: 3.5, size: '30 ml', trialSize: '7 ml', form: 'dropper', tone: 'aqua',
    ing: ['Multi-weight Hyaluronic Acid', 'Trehalose', 'Panthenol'],
    targets: ['dehydration', 'dryness', 'dullness', 'sensitivity'], gentle: true,
    why: 'Layers water into the upper skin layers so the surface reads plumper and calmer.',
    how: 'Apply to slightly damp skin, then seal with moisturiser.' },
  { id: 'tr-retinal', name: 'Renew Encapsulated Retinal 0.05%', cat: 'Treatment', role: 'treatment', slot: 'pm',
    price: 27.5, trialPrice: 5, size: '30 ml', trialSize: '7 ml', form: 'dropper', tone: 'plum',
    ing: ['Encapsulated Retinal 0.05%', 'Squalane', 'Bisabolol'],
    targets: ['lines', 'texture', 'breakouts', 'marks', 'pores'], gentle: false,
    caution: 'Introduce gradually. Not for use in pregnancy — speak to your dermatologist first.',
    why: 'A time-release retinoid for texture and the appearance of fine lines.',
    how: 'Pea-size amount at night, two evenings a week to begin, building up as tolerated.' },
  { id: 'tr-azelaic', name: 'Calm Azelaic 10%', cat: 'Treatment', role: 'treatment', slot: 'pm',
    price: 19.5, trialPrice: 3.75, size: '30 ml', trialSize: '7 ml', form: 'tube', tone: 'blush',
    ing: ['Azelaic Acid 10%', 'Niacinamide', 'Allantoin'],
    targets: ['redness', 'sensitivity', 'marks', 'breakouts', 'unevenTone'], gentle: true,
    why: 'Well tolerated support for visible redness and uneven tone on reactive skin.',
    how: 'A thin layer each evening after cleansing.' },
  { id: 'tr-lactic', name: 'Resurface Lactic 8%', cat: 'Treatment', role: 'treatment', slot: 'pm',
    price: 17, trialPrice: 3.25, size: '30 ml', trialSize: '7 ml', form: 'dropper', tone: 'cool',
    ing: ['Lactic Acid 8%', 'Sodium PCA', 'Liquorice Root'],
    targets: ['texture', 'dullness', 'pores', 'unevenTone'], gentle: false,
    caution: 'Use on alternate evenings and always pair with daytime SPF.',
    why: 'A gentle exfoliating acid for surface smoothness and light reflection.',
    how: 'Apply on alternate evenings to clean skin, avoiding the eye area.' },
  { id: 'tr-tranex', name: 'Clarity Tranexamic + Arbutin', cat: 'Treatment', role: 'treatment', slot: 'pm',
    price: 25, trialPrice: 4.5, size: '30 ml', trialSize: '7 ml', form: 'dropper', tone: 'amber',
    ing: ['Tranexamic Acid 3%', 'Alpha Arbutin 2%', 'Niacinamide'],
    targets: ['pigmentation', 'darkspots', 'marks', 'unevenTone'], gentle: true,
    why: 'Targeted support for stubborn discolouration and post-inflammatory marks.',
    how: 'Apply each evening to areas of concern before moisturiser.' },
  { id: 'mo-light', name: 'Veil Lightweight Moisturiser', cat: 'Moisturiser', role: 'moisturiser', slot: 'am',
    price: 15.5, trialPrice: 3, size: '50 ml', trialSize: '15 ml', form: 'jar', tone: 'aqua',
    ing: ['Glycerin', 'Squalane', 'Niacinamide'],
    targets: ['oiliness', 'pores', 'breakouts', 'dehydration'], gentle: true,
    why: 'A weightless gel-cream that hydrates without a heavy finish under SPF.',
    how: 'Smooth over face and neck morning and evening.' },
  { id: 'mo-barrier', name: 'Fortify Barrier Cream', cat: 'Moisturiser', role: 'moisturiser', slot: 'pm',
    price: 18.5, trialPrice: 3.5, size: '50 ml', trialSize: '15 ml', form: 'jar', tone: 'warm',
    ing: ['Ceramide Complex', 'Cholesterol', 'Shea Butter'],
    targets: ['dryness', 'dehydration', 'sensitivity', 'redness'], gentle: true,
    why: 'Replenishes the lipids that hold water in overnight.',
    how: 'Final evening step. Warm between fingers and press into skin.' },
  { id: 'sp-mineral', name: 'Halo Mineral SPF 50', cat: 'SPF', role: 'spf', slot: 'am',
    price: 14.5, trialPrice: 2.75, size: '50 ml', trialSize: '15 ml', form: 'tube', tone: 'sand',
    ing: ['Zinc Oxide 14%', 'Vitamin E', 'Glycerin'],
    targets: ['pigmentation', 'darkspots', 'redness', 'sensitivity', 'lines'], gentle: true,
    why: 'Daily protection — the single most effective step for pigmentation and ageing.',
    how: 'Two fingers’ length every morning, reapplied through the day.' }
];
const P = (id) => PRODUCTS.find(p => p.id === id);

/* product artwork — inline SVG so the prototype ships with no image assets */
const TONES = {
  cool:  ['#DCE4E4', '#AFC0C2', '#7E9295'], warm: ['#F0E0D0', '#DCBFA4', '#B79274'],
  amber: ['#F7E3C4', '#E4BE83', '#C69A57'], sage: ['#E0E6DC', '#B7C4B2', '#8B9B87'],
  aqua:  ['#DDE9EA', '#B4CFD2', '#89ADB1'], plum: ['#E7DCE2', '#C7AEBB', '#9C7E8E'],
  blush: ['#F4E2DE', '#E0BDB4', '#BE9187'], sand: ['#F2E9DA', '#DCCBB1', '#B9A385']
};
function art(p, h) {
  const t = TONES[p.tone] || TONES.warm, id = 'g' + p.id.replace(/\W/g, '') + (h || '');
  const shapes = {
    dropper: `<rect x="26" y="30" width="44" height="60" rx="7" fill="url(#${id})"/><rect x="38" y="14" width="20" height="17" rx="3" fill="${t[2]}"/><rect x="43" y="7" width="10" height="8" rx="2.5" fill="${t[2]}" opacity=".85"/>`,
    tube:    `<path d="M30 26h36v58a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V26Z" fill="url(#${id})"/><rect x="38" y="14" width="20" height="13" rx="3" fill="${t[2]}"/>`,
    jar:     `<rect x="22" y="42" width="52" height="46" rx="9" fill="url(#${id})"/><rect x="27" y="30" width="42" height="14" rx="5" fill="${t[2]}"/>`,
    pump:    `<rect x="27" y="32" width="42" height="58" rx="8" fill="url(#${id})"/><rect x="42" y="12" width="12" height="21" rx="4" fill="${t[2]}"/><rect x="52" y="15" width="13" height="5" rx="2.5" fill="${t[2]}"/>`
  };
  return `<svg viewBox="0 0 96 104" role="img" aria-label="${esc(p.name)}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t[0]}"/><stop offset=".55" stop-color="${t[1]}"/><stop offset="1" stop-color="${t[2]}"/>
    </linearGradient></defs>
    <ellipse cx="48" cy="97" rx="26" ry="4.5" fill="rgba(33,29,25,.10)"/>
    ${shapes[p.form] || shapes.tube}
    <rect x="${p.form === 'jar' ? 30 : 34}" y="${p.form === 'jar' ? 54 : 46}" width="${p.form === 'jar' ? 36 : 28}" height="26" rx="2" fill="rgba(255,255,255,.62)"/>
    <rect x="${p.form === 'jar' ? 34 : 38}" y="${p.form === 'jar' ? 60 : 52}" width="14" height="2" rx="1" fill="${t[2]}" opacity=".7"/>
    <rect x="${p.form === 'jar' ? 34 : 38}" y="${p.form === 'jar' ? 66 : 58}" width="20" height="1.5" rx="1" fill="${t[2]}" opacity=".45"/>
  </svg>`;
}

/* ===================== ENGINE (AI-assisted analysis) ===================== */
/* Replace Engine.analyse / Engine.buildRoutine with API calls to go live. */
const METRICS = [
  { key: 'hydration', label: 'Hydration', dir: 'good', base: 58,
    w: { dehydration: -26, dryness: -20, oiliness: 4, sensitivity: -6, dullness: -6, lines: -5 },
    notes: { low: 'Surface reads water-depleted. Layered humectants are the priority.',
             moderate: 'Reasonable water content with room to build resilience.',
             high: 'Water content looks well supported. Maintain it.' } },
  { key: 'oil', label: 'Oil balance', dir: 'flag', base: 46,
    w: { oiliness: 26, acne: 12, breakouts: 10, pores: 8, dryness: -22, dehydration: -8 },
    notes: { low: 'Low visible sebum — favour richer textures.',
             moderate: 'Sebum appears within a balanced range.',
             high: 'Elevated surface oil, most likely through the T-zone.' } },
  { key: 'texture', label: 'Texture', dir: 'flag', base: 38,
    w: { texture: 26, pores: 12, dullness: 10, acne: 10, marks: 8, lines: 10 },
    notes: { low: 'Surface looks even.', moderate: 'Some unevenness across the cheeks and chin.',
             high: 'Noticeable surface irregularity — gradual resurfacing suits best.' } },
  { key: 'redness', label: 'Redness', dir: 'flag', base: 32,
    w: { redness: 30, sensitivity: 20, acne: 12, breakouts: 8, dryness: 6 },
    notes: { low: 'Little visible diffuse redness.', moderate: 'Intermittent redness in the central face.',
             high: 'Persistent visible redness — a dermatologist review is worthwhile.' } },
  { key: 'pigmentation', label: 'Pigmentation', dir: 'flag', base: 34,
    w: { pigmentation: 30, darkspots: 24, unevenTone: 16, marks: 12, dullness: 6 },
    notes: { low: 'Tone reads fairly even.', moderate: 'Scattered areas of deeper tone.',
             high: 'Distinct discolouration — daily SPF is non-negotiable here.' } },
  { key: 'pores', label: 'Pore appearance', dir: 'flag', base: 36,
    w: { pores: 30, oiliness: 14, texture: 10, acne: 8 },
    notes: { low: 'Pores are not a visible feature.', moderate: 'Slightly visible around the nose and cheeks.',
             high: 'Pore visibility is a defining feature of your profile.' } },
  { key: 'breakouts', label: 'Breakout tendency', dir: 'flag', base: 30,
    w: { acne: 32, breakouts: 26, oiliness: 12, pores: 6, marks: 8 },
    notes: { low: 'Low breakout activity indicated.', moderate: 'Occasional congestion likely.',
             high: 'Active breakout tendency — keep actives simple and consistent.' } }
];
const FOCUS_MAP = {
  hydration:    { t: 'Hydration & water retention', d: 'Layered humectants with an occlusive seal to hold water overnight.' },
  oil:          { t: 'Oil regulation', d: 'Lightweight textures and niacinamide to balance sebum without stripping.' },
  texture:      { t: 'Texture refinement', d: 'Gradual resurfacing rather than aggressive exfoliation.' },
  redness:      { t: 'Calming & barrier support', d: 'Anti-irritant actives and a lipid-rich barrier repair step.' },
  pigmentation: { t: 'Pigment management', d: 'Tyrosinase support paired with daily broad-spectrum SPF.' },
  pores:        { t: 'Pore appearance', d: 'Keeping the pore lining clear with gentle keratolytics.' },
  breakouts:    { t: 'Breakout control', d: 'A simple, consistent routine with a low irritation ceiling.' }
};

const Engine = {
  level(m, v) {
    if (m.dir === 'good') return v < 40 ? 'low' : v < 70 ? 'moderate' : 'high';
    return v < 35 ? 'low' : v < 65 ? 'moderate' : 'high';
  },
  levelWord(m, lv) {
    if (m.dir === 'good') return { low: 'Low', moderate: 'Moderate', high: 'Optimal' }[lv];
    if (m.key === 'oil') return { low: 'Low', moderate: 'Balanced', high: 'Elevated' }[lv];
    return { low: 'Low', moderate: 'Moderate', high: 'Elevated' }[lv];
  },
  tone(m, lv) {
    if (m.dir === 'good') return { low: 'low', moderate: 'moderate', high: 'good' }[lv];
    return { low: 'good', moderate: 'moderate', high: 'elevated' }[lv];
  },

  analyse(input) {
    const { concerns = [], notes = '', photo = '', email = '' } = input;
    const seed = hash((photo || '').slice(-900) + email + concerns.join(','));
    const metrics = METRICS.map((m, i) => {
      let v = m.base;
      concerns.forEach(c => { if (m.w[c]) v += m.w[c]; });
      /* deterministic per-image variation so two profiles never read identically */
      v += ((seed >> (i * 3)) % 11) - 5;
      v = clamp(Math.round(v), 6, 96);
      const lv = this.level(m, v);
      return { key: m.key, label: m.label, value: v, dir: m.dir, level: lv,
               word: this.levelWord(m, lv), tone: this.tone(m, lv), note: m.notes[lv] };
    });

    /* focus = the flags reading highest, plus hydration if depleted */
    const flags = metrics.filter(m => m.dir === 'flag').slice().sort((a, b) => b.value - a.value);
    const hyd = metrics.find(m => m.key === 'hydration');
    const focusKeys = [];
    if (hyd.value < 55) focusKeys.push('hydration');
    flags.forEach(f => { if (focusKeys.length < 3 && f.value >= 42) focusKeys.push(f.key); });
    while (focusKeys.length < 2) { const f = flags.shift(); if (!f) break; if (!focusKeys.includes(f.key)) focusKeys.push(f.key); }
    const focus = focusKeys.slice(0, 3).map(k => Object.assign({ key: k }, FOCUS_MAP[k]));

    const flagAvg = metrics.filter(m => m.dir === 'flag').reduce((s, m) => s + m.value, 0) / (metrics.length - 1);
    const score = clamp(Math.round(0.36 * hyd.value + 0.64 * (100 - flagAvg)), 18, 94);
    const band = score >= 78 ? 'Resilient' : score >= 62 ? 'Balanced' : score >= 46 ? 'Reactive' : 'Needs support';

    const names = focus.map(f => f.t.toLowerCase().replace(' & ', ' and '));
    const summary = 'Your analysis suggests a routine that prioritises ' +
      (names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names.slice(-1) : names[0]) +
      '. Nothing in your inputs points to an aggressive regimen — consistency will do more here than intensity.';

    return { createdAt: now(), metrics, focus, focusKeys: focus.map(f => f.key), score, band, summary,
             concerns: concerns.slice(), notes, engine: 'lumea-vision-sim-1.4' };
  },

  /* choose one product per slot by concern overlap, tolerance and focus weighting */
  pick(role, slot, ctx) {
    const { concerns, focusKeys, sensitive } = ctx;
    const pool = PRODUCTS.filter(p => p.role === role && (p.slot === slot || p.slot === 'both'));
    let best = null, bestScore = -1e9;
    pool.forEach(p => {
      let s = 0;
      p.targets.forEach(t => { if (concerns.includes(t)) s += 10; });
      focusKeys.forEach((k, i) => {
        const rel = { hydration: ['dehydration', 'dryness'], oil: ['oiliness', 'pores'], texture: ['texture', 'dullness'],
                      redness: ['redness', 'sensitivity'], pigmentation: ['pigmentation', 'darkspots', 'unevenTone'],
                      pores: ['pores'], breakouts: ['acne', 'breakouts', 'marks'] }[k] || [];
        if (p.targets.some(t => rel.includes(t))) s += 9 - i * 2;
      });
      if (sensitive) s += p.gentle ? 12 : -14;
      if (!p.gentle && concerns.includes('redness')) s -= 6;
      s += (hash(p.id) % 3) * 0.1; /* stable tie-break */
      if (s > bestScore) { bestScore = s; best = p; }
    });
    return best || pool[0];
  },

  buildRoutine(report, opts) {
    const concerns = report.concerns || [];
    const ctx = { concerns, focusKeys: report.focusKeys, sensitive: concerns.includes('sensitivity') || report.metrics.find(m => m.key === 'redness').value >= 65 };
    const am = [
      this.pick('cleanser', 'am', ctx),
      this.pick('serum', 'am', ctx),
      this.pick('moisturiser', 'am', ctx),
      this.pick('spf', 'am', ctx)
    ];
    const pmMoist = PRODUCTS.find(p => p.id === (ctx.sensitive || concerns.includes('dryness') || concerns.includes('dehydration') ? 'mo-barrier' : 'mo-light'));
    const pm = [ am[0], this.pick('treatment', 'pm', ctx), pmMoist ];
    return {
      createdAt: now(),
      am: am.map(p => ({ id: p.id, size: 'trial' })),
      pm: pm.map(p => ({ id: p.id, size: 'trial' })),
      approvedBy: (opts && opts.approvedBy) || null,
      version: 1,
      rationale: report.focus.map(f => f.t)
    };
  },

  routineProducts(routine) {
    if (!routine) return [];
    const ids = [];
    routine.am.concat(routine.pm).forEach(x => { if (!ids.includes(x.id)) ids.push(x.id); });
    return ids.map(P);
  },
  routineTotal(routine, size) {
    return this.routineProducts(routine).reduce((s, p) => s + (size === 'trial' ? p.trialPrice : p.price), 0);
  }
};

/* ===================== JOURNEY (stage machine + gating) ===================== */
const Journey = {
  stages: [
    { n: 1, key: 'profile', label: 'Stage 01', title: 'Profile created' },
    { n: 2, key: 'analysis', label: 'Stage 02', title: 'Skin analysis' },
    { n: 3, key: 'review', label: 'Stage 03', title: 'Dermatologist review' },
    { n: 4, key: 'routine', label: 'Stage 04', title: 'Personalised routine' },
    { n: 5, key: 'trial', label: 'Stage 05', title: '14-day trial' },
    { n: 6, key: 'subscription', label: 'Stage 06', title: 'Monthly routine' }
  ],
  status(key) {
    const st = Store.state();
    if (!st) return 'locked';
    switch (key) {
      case 'profile': return 'done';
      case 'analysis': return st.report ? 'done' : (st.photo ? 'now' : 'now');
      case 'review':
        if (!st.report) return 'locked';
        return st.review.status === 'confirmed' ? 'done' : (st.review.status === 'none' ? 'now' : 'now');
      case 'routine':
        if (st.review.status !== 'confirmed') return 'locked';
        return st.routine ? 'done' : 'now';
      case 'trial':
        if (!st.routine) return 'locked';
        if (!st.trial) return Trial.boughtFullSize(st) ? 'done' : 'now';
        return Trial.day(st) >= 14 ? 'done' : 'now';
      case 'subscription':
        if (!st.trial && !Trial.boughtFullSize(st)) return 'locked';
        return st.subscription && st.subscription.status === 'active' ? 'done' : 'now';
    }
    return 'locked';
  },
  current() { const s = this.stages.find(s => this.status(s.key) === 'now'); return s || this.stages[this.stages.length - 1]; },
  can(key) { return this.status(key) !== 'locked'; },
  /* why a locked door is locked */
  reason(key) {
    return {
      analysis: 'Upload a photo to begin your analysis.',
      review: 'Complete your skin analysis first.',
      routine: 'Your routine unlocks once a dermatologist has reviewed your analysis.',
      trial: 'The 14-day trial unlocks once your routine is approved.',
      subscription: 'Subscriptions open once you have bought the routine — as a trial kit or full size.'
    }[key] || 'Complete the previous step first.';
  }
};

/* ===================== CART / ORDERS ===================== */
const Cart = {
  list() { const st = Store.state(); return st ? st.cart : []; },
  count() { return this.list().reduce((s, i) => s + i.qty, 0); },
  add(id, size, qty, quiet) {
    Store.commit(st => {
      const hit = st.cart.find(i => i.id === id && i.size === size);
      if (hit) hit.qty += (qty || 1); else st.cart.push({ id, size, qty: qty || 1, at: now() });
    });
    Shell.cartCount(true);
    if (!quiet) UI.toast(P(id).name + ' added to your basket', 'good');
  },
  addRoutine(routine, size) {
    const items = Engine.routineProducts(routine);
    Store.commit(st => {
      items.forEach(p => {
        const hit = st.cart.find(i => i.id === p.id && i.size === size);
        if (hit) hit.qty += 1; else st.cart.push({ id: p.id, size, qty: 1, at: now() });
      });
    });
    Shell.cartCount(true);
    UI.toast(items.length + (size === 'trial' ? ' trial sizes' : ' full sizes') + ' added to your basket', 'good');
  },
  setQty(idx, q) { Store.commit(st => { if (q <= 0) st.cart.splice(idx, 1); else st.cart[idx].qty = q; }); Shell.cartCount(); },
  remove(idx) { Store.commit(st => st.cart.splice(idx, 1)); Shell.cartCount(); },
  saveForLater(idx) {
    Store.commit(st => { const it = st.cart.splice(idx, 1)[0]; if (it) st.saved.push(it); });
    Shell.cartCount(); UI.toast('Saved for later');
  },
  unsave(idx) { Store.commit(st => { const it = st.saved.splice(idx, 1)[0]; if (it) st.cart.push(it); }); Shell.cartCount(); },
  clear() { Store.commit(st => { st.cart = []; }); Shell.cartCount(); },
  groups() {
    const l = this.list();
    return { trial: l.filter(i => i.size === 'trial'), full: l.filter(i => i.size === 'full') };
  },
  totals() {
    const g = this.groups();
    const rawTrial = g.trial.reduce((s, i) => s + P(i.id).trialPrice * i.qty, 0);
    const rawFull  = g.full.reduce((s, i) => s + P(i.id).price * i.qty, 0);
    const units = g.trial.reduce((s, i) => s + i.qty, 0);
    const kit = units >= 4 ? rawTrial * 0.25 : 0;           /* trial kit bundle */
    const sub = rawTrial - kit + rawFull;
    const ship = sub === 0 || sub >= 25 || units >= 4 ? 0 : 2;   /* free over KD 25, and on any trial kit */
    return { rawTrial, rawFull, kit, units, sub, ship, total: sub + ship };
  },
  placeOrder(details) {
    const t = this.totals(), g = this.groups(), items = this.list().map(i => Object.assign({}, i));
    const order = {
      id: 'LM' + String(hash(uid()) % 900000 + 100000),
      at: now(), items, total: t.total, ship: t.ship, kit: t.kit,
      kind: g.trial.length && !g.full.length ? 'trial' : (g.full.length && !g.trial.length ? 'full' : 'mixed'),
      details: details, status: 'Processing', eta: now() + 2 * DAY
    };
    Store.commit(st => {
      st.orders.unshift(order);
      if (g.trial.length && !st.trial) {
        st.trial = { startedAt: now(), demoDay: 1, logs: {}, orderId: order.id, kit: g.trial.map(i => i.id) };
        st.history.push({ at: now(), t: 'Trial kit dispatched' });
      }
      st.cart = [];
    });
    Shell.cartCount();
    return order;
  }
};

/* ===================== TRIAL ===================== */
const Trial = {
  day(st) { const t = (st || Store.state()).trial; if (!t) return 0; return clamp(t.demoDay, 1, 14); },
  milestones: [1, 3, 7, 10, 14],
  advance(n) {
    Store.commit(st => { if (st.trial) st.trial.demoDay = clamp(st.trial.demoDay + (n || 1), 1, 14); });
  },
  log(day, data) {
    Store.commit(st => { if (st.trial) st.trial.logs[day] = Object.assign({ at: now() }, data); });
  },
  logs(st) { const t = (st || Store.state()).trial; return t ? t.logs : {}; },
  logCount(st) { return Object.keys(this.logs(st)).length; },
  boughtFullSize(st) { return (st.orders || []).some(o => o.kind === 'full' || o.kind === 'mixed'); },
  eligibleForSub(st) {
    st = st || Store.state();
    if (this.boughtFullSize(st)) return true;      /* bought the routine outright */
    return !!st.trial && (this.day(st) >= 7 || this.logCount(st) >= 3);
  }
};

/* ===================== RATINGS ===================== */
/* Per-product star rating + written review, kept on the user's own state.
   Community figures are derived from the product id so they stay stable. */
const Ratings = {
  all() { const st = Store.state(); if (!st) return {}; if (!st.reviews) st.reviews = {}; return st.reviews; },
  get(id) { return this.all()[id] || null; },
  count() { return Object.keys(this.all()).length; },
  set(id, rating, text) {
    Store.commit(st => {
      if (!st.reviews) st.reviews = {};
      const prev = st.reviews[id] || {};
      const first = !prev.rating;
      st.reviews[id] = { rating: rating || prev.rating || 0, text: text != null ? text : (prev.text || ''), at: now() };
      if (first && st.reviews[id].rating) st.history.push({ at: now(), t: 'Rated ' + P(id).name + ' ' + st.reviews[id].rating + '/5' });
    });
  },
  community(id) { const h = hash(id); return { avg: (4.1 + (h % 8) / 10).toFixed(1), count: 40 + (h % 380) }; },

  /* the other two things a member can rate: their dermatologist, and Lumea itself */
  getFor(kind) { const st = Store.state(); if (!st) return null; return kind === 'clinician' ? st.clinicianReview : st.serviceReview; },
  setFor(kind, rating, text, recommend) {
    Store.commit(st => {
      const key = kind === 'clinician' ? 'clinicianReview' : 'serviceReview';
      const prev = st[key] || {};
      st[key] = { rating: rating || prev.rating || 0, text: text != null ? text : (prev.text || ''),
                  recommend: recommend != null ? recommend : prev.recommend, at: now() };
      st.history.push({ at: now(), t: (kind === 'clinician' ? 'Rated ' + DERM.name : 'Rated the Lumea experience') + ' ' + st[key].rating + '/5' });
    });
  },
  clinicianCommunity() { return { avg: '4.9', count: 212 }; },
  serviceCommunity() { return { avg: '4.7', count: 1840 }; },
  /* floor, not round — a 4.6 average should not read as five filled stars */
  stars(n) { const f = Math.floor(n); let out = ''; for (let i = 1; i <= 5; i++) out += i <= f ? '★' : '☆'; return out; }
};

/* ===================== REVIEW (dermatologist turnaround) ===================== */
/* A real review takes hours; the prototype turns it around in seconds so the
   patient journey can be walked in one sitting. release() builds the routine
   from the proposal, writes the clinician's note and opens the report. */
const REVIEW_DELAY = 7000;
const Review = {
  timer: null,
  waitLeft() {
    const st = Store.state();
    if (!st || st.review.status !== 'pending') return 0;
    return Math.max(0, REVIEW_DELAY - (now() - (st.review.sentAt || now())));
  },
  release(note, by) {
    let released = false;
    Store.commit(st => {
      if (!st.report) return;
      if (!st.review.proposal) st.review.proposal = Engine.buildRoutine(st.report, {});
      st.review.status = 'confirmed';
      st.review.confirmedAt = now();
      st.review.notes = note || 'Analysis confirmed. Your indicators are consistent with your reported concerns — this routine prioritises tolerance over intensity. Begin your treatment step twice weekly and build up from there.';
      const prev = st.routine;
      st.routine = Object.assign(Engine.buildRoutine(st.report, { approvedBy: by || DERM.name }), {
        am: st.review.proposal.am.map(x => Object.assign({}, x)),
        pm: st.review.proposal.pm.map(x => Object.assign({}, x)),
        approvedBy: by || DERM.name,
        version: prev ? prev.version + 1 : 1
      });
      st.messages.push({ id: uid('m'), who: 'derm', text: st.review.notes, at: now() });
      st.messages.push({ id: uid('m'), who: 'system', text: 'Your dermatologist’s report is ready — it lists your prescribed routine and when to use each step. Open it from your dashboard or your analysis.', at: now() });
      if (st.review.adjustments.length) {
        st.messages.push({ id: uid('m'), who: 'system', text: st.review.adjustments.length + ' recommendation(s) adjusted by ' + DERM.name + ' before release.', at: now() });
      }
      st.history.push({ at: now(), t: 'Dermatologist confirmed analysis · routine released' });
      released = true;
    });
    return released;
  },
  schedule() {
    clearTimeout(this.timer);
    const st = Store.state();
    if (!st || st.review.status !== 'pending') return;
    this.timer = setTimeout(() => {
      const cur = Store.state();
      if (!cur || cur.review.status !== 'pending') return;
      if (!this.release(null)) return;
      Shell.render();
      UI.toast(DERM.name + ' has reviewed your analysis — your routine is ready.', 'good', 5200);
      if (['report', 'dashboard', 'analyze'].indexOf(Router.path()) > -1) Router.render();
    }, this.waitLeft());
  }
};

/* ===================== UI ===================== */
const UI = {
  toast(msg, kind, ms) {
    const t = el('div', 'toast' + (kind ? ' toast--' + kind : ''),
      (kind === 'good' ? ico.check : kind === 'warn' ? ico.info : ico.spark) + '<span>' + esc(msg) + '</span>');
    $('#toaster').appendChild(t);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 360); }, ms || 3200);
  },
  modal(html, opts) {
    opts = opts || {};
    const root = $('#modalRoot');
    root.hidden = false;
    root.innerHTML = '<div class="modalroot__scrim" data-close></div><div class="modal" role="dialog" aria-modal="true">' +
      '<button class="modal__close" data-close aria-label="Close">' + ico.x + '</button>' + html + '</div>';
    const close = () => this.closeModal();
    $$('[data-close]', root).forEach(b => b.addEventListener('click', close));
    document.addEventListener('keydown', this._escHandler = (e) => { if (e.key === 'Escape') close(); });
    if (opts.after) opts.after($('.modal', root));
    return $('.modal', root);
  },
  closeModal() {
    const root = $('#modalRoot');
    root.hidden = true; root.innerHTML = '';
    if (this._escHandler) { document.removeEventListener('keydown', this._escHandler); this._escHandler = null; }
  },
  confirm(title, body, okLabel, onOk, danger) {
    this.modal('<h3>' + esc(title) + '</h3><p class="small">' + body + '</p>' +
      '<div class="btnrow" style="margin-top:22px"><button class="btn btn--sm' + (danger ? '' : ' btn--gold') + '" data-ok>' + esc(okLabel) + '</button>' +
      '<button class="btn btn--ghost btn--sm" data-close>Cancel</button></div>', {
      after: (m) => $('[data-ok]', m).addEventListener('click', () => { this.closeModal(); onOk(); })
    });
  },
  reveal(scope) {
    const nodes = $$('.reveal', scope || document);
    if (!('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('is-in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    /* first screen: reveal on the next frame regardless of the observer, so the
       page never sits blank if IO is throttled or a capture happens early */
    const fold = window.innerHeight || 800;
    const above = [], below = [];
    nodes.forEach(n => (n.getBoundingClientRect().top < fold * 1.05 ? above : below).push(n));
    /* a timer, not requestAnimationFrame: rAF is paused while a page isn't being
       rendered, which would leave the first screen hidden in that state */
    setTimeout(() => above.forEach(n => n.classList.add('is-in')), 40);
    below.forEach(n => io.observe(n));
    /* anything the viewport has jumped past (deep link, in-page anchor, restored
       scroll position) never intersects again — show it at once rather than never */
    const sweep = () => below.forEach(n => {
      if (!n.classList.contains('is-in') && n.getBoundingClientRect().bottom <= 0) {
        n.classList.add('is-in'); io.unobserve(n);
      }
    });
    sweep();
    const onScroll = debounce(sweep, 120);
    /* capture phase: scroll events don't bubble, so this catches whichever
       element is actually scrolling (root, body or an inner pane) */
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onCleanup(() => { document.removeEventListener('scroll', onScroll, true); io.disconnect(); });
  },
  meters(scope) {
    setTimeout(() => $$('.meter__fill,.deltabar__t i', scope || document).forEach(f => { f.style.width = (f.dataset.v || 0) + '%'; }), 90);
  },
  accordion(scope) {
    $$('.acc__q', scope).forEach(q => q.addEventListener('click', () => {
      const item = q.closest('.acc__item'), a = $('.acc__a', item), open = item.classList.contains('is-open');
      $$('.acc__item', scope).forEach(i => { i.classList.remove('is-open'); $('.acc__a', i).style.maxHeight = '0px'; });
      if (!open) { item.classList.add('is-open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    }));
  },
  curtain(fn) {
    const c = $('#curtain');
    c.classList.add('is-on');
    setTimeout(() => { fn(); setTimeout(() => c.classList.remove('is-on'), 60); }, 300);
  }
};

/* ===================== IMAGE HELPERS ===================== */
const Img = {
  MAX: 760,
  fromFile(file) {
    return new Promise((res, rej) => {
      if (!file) return rej(new Error('No file'));
      if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) return rej(new Error('Please choose a JPG, PNG or WEBP image.'));
      if (file.size > 12 * 1024 * 1024) return rej(new Error('That image is over 12 MB. Please choose a smaller file.'));
      const fr = new FileReader();
      fr.onerror = () => rej(new Error('That file could not be read.'));
      fr.onload = () => this.downscale(fr.result).then(res).catch(rej);
      fr.readAsDataURL(file);
    });
  },
  downscale(dataUrl) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onerror = () => rej(new Error('That image could not be decoded.'));
      im.onload = () => {
        const s = Math.min(1, this.MAX / Math.max(im.width, im.height));
        const c = el('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .72));
      };
      im.src = dataUrl;
    });
  },
  fromVideo(video) {
    const c = el('canvas');
    const s = Math.min(1, this.MAX / Math.max(video.videoWidth, video.videoHeight));
    c.width = Math.round(video.videoWidth * s); c.height = Math.round(video.videoHeight * s);
    const ctx = c.getContext('2d');
    ctx.translate(c.width, 0); ctx.scale(-1, 1);           /* un-mirror the selfie view */
    ctx.drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', .72);
  }
};

/* ===================== SHELL (header, nav, account menu) ===================== */
const NAV = [
  { href: '#/dashboard', label: 'Home', icon: 'home', gate: null },
  { href: '#/analyze', label: 'Analyse', icon: 'scan', gate: null },
  { href: '#/routine', label: 'My Routine', icon: 'bottleI', gate: 'routine' },
  { href: '#/progress', label: 'Progress', icon: 'chartI', gate: 'review' },
  { href: '#/messages', label: 'Messages', icon: 'chat', gate: 'review' },
  { href: '#/account', label: 'Account', icon: 'userI', gate: null }
];
const Shell = {
  render() {
    const signed = !!Store.session();
    $('#topbar').hidden = !signed;
    $('#bottomnav').hidden = !signed;
    if (!signed) return;
    const path = Router.path();
    $('#mainnav').innerHTML = NAV.map(n => {
      const locked = n.gate && !Journey.can(n.gate);
      return '<a href="' + (locked ? '#/dashboard' : n.href) + '" class="' + (path === n.href.slice(1) ? 'is-active' : '') +
        (locked ? ' is-locked' : '') + '"' + (locked ? ' data-locked="' + n.gate + '"' : '') + '>' + n.label + '</a>';
    }).join('');
    $('#bottomnav').innerHTML = '<div class="bottomnav__row">' + NAV.concat([{ href: '#/basket', label: 'Basket', icon: 'bagI' }]).map(n => {
      const locked = n.gate && !Journey.can(n.gate);
      return '<a href="' + (locked ? '#/dashboard' : n.href) + '" class="' + (path === n.href.slice(1) ? 'is-active' : '') + '"' +
        (locked ? ' data-locked="' + n.gate + '"' : '') + '>' + ico[n.icon] + '<span>' + n.label + '</span>' +
        (n.label === 'Basket' ? '<span class="badge" id="cartCountM" hidden>0</span>' : '') + '</a>';
    }).join('') + '</div>';
    $$('[data-locked]').forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault(); UI.toast(Journey.reason(a.dataset.locked), 'warn');
    }));
    this.accountMenu();
    this.cartCount();
  },
  accountMenu() {
    const u = Store.user(); if (!u) return;
    const st = Store.state();
    $('#accountMenu').innerHTML =
      '<button class="avatar" id="avatarBtn" aria-haspopup="true" aria-expanded="false">' + esc(initials(u.name)) + '</button>' +
      '<div class="dropdown" id="acctDrop" role="menu">' +
        '<div class="dropdown__head"><strong>' + esc(u.name) + '</strong><span class="tiny">' + esc(u.email) + '</span></div>' +
        '<a href="#/dashboard" role="menuitem">Dashboard</a>' +
        '<a href="#/account" role="menuitem">Account &amp; profile</a>' +
        '<a href="#/subscription" role="menuitem">Subscription' + (st.subscription && st.subscription.status === 'active' ? '<span class="pill pill--sage">Active</span>' : '') + '</a>' +
        '<a href="#/basket" role="menuitem">Basket</a>' +
        '<hr class="hairline" style="margin:6px 0">' +
        '<button class="danger" id="logoutBtn" role="menuitem">Log out</button>' +
      '</div>';
    const btn = $('#avatarBtn'), drop = $('#acctDrop');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = drop.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => { drop.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
    $$('a', drop).forEach(a => a.addEventListener('click', () => drop.classList.remove('is-open')));
    $('#logoutBtn').addEventListener('click', () => Auth.signOut());
  },
  cartCount(bump) {
    const n = Cart.count();
    [$('#cartCount'), $('#cartCountM')].forEach(b => {
      if (!b) return;
      b.hidden = n === 0; b.textContent = n;
      if (bump && n) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
  }
};

/* ===================== AUTH ===================== */
const Auth = {
  async signUp(data) {
    const res = await Cloud.signUp(data);
    if (res.error) return res;
    if (res.pendingEmail) return res;                 /* awaiting email confirmation */
    Cloud.user = res.user;
    await Auth.load();
    Store.commit(st => { st.profile.name = data.name; st.profile.goals = data.goals || ''; st.history.push({ at: now(), t: 'Account created' }); });
    return { user: res.user };
  },
  async signIn(email, password) {
    const res = await Cloud.signIn(email, password);
    if (res.error || res.unconfirmed) return res;
    Cloud.user = res.user;
    await Auth.load();
    return { user: res.user };
  },
  /* pull the account down from Supabase into the in-memory state */
  async load() {
    const st = await Cloud.hydrate();
    if (st) { Store.db.data[Cloud.user.id] = st; Store.db.session = { userId: Cloud.user.id, remember: true, at: now() }; Store.save(); }
    Review.schedule();          /* a review left pending on the server resumes here */
    return st;
  },
  signOut() {
    UI.confirm('Log out of Lumea?', 'Your skin profile, routine and messages stay saved to your account.', 'Log out', async () => {
      await Cloud.signOut();
      Store.signOut();
      UI.curtain(() => { Router.go('/'); Shell.render(); UI.toast('You’ve been safely signed out.', 'good'); });
    }, true);
  }
};

/* ===================== SHARED VIEW PARTS ===================== */
const publicBar = () => `
<div class="topbar" style="position:sticky;top:0">
  <div class="topbar__inner">
    <a class="brand" href="#/"><span class="brand__mark">
      <svg viewBox="0 0 32 32" width="26" height="26"><circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="1"/><path d="M16 4.5c5 3.4 7.6 7.3 7.6 11.5S21 24.2 16 27.5c-5-3.3-7.6-7.3-7.6-11.5S11 7.9 16 4.5Z" fill="none" stroke="currentColor" stroke-width="1" opacity=".65"/></svg>
    </span><span class="brand__word">LUMEA</span></a>
    <nav class="mainnav">
      <a href="#how">How it works</a><a href="#approach">Approach</a><a href="#trial">14-day trial</a><a href="#faq">FAQ</a>
    </nav>
    <div class="topbar__actions" style="gap:10px">
      <a class="btn btn--quiet btn--sm" href="#/signin">Sign in</a>
      <a class="btn btn--sm" href="#/signup">Create account</a>
    </div>
  </div>
</div>`;

const portraitArt = () => `
<div class="portrait">
  <svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="fieldG" x1=".1" y1="0" x2=".9" y2="1">
        <stop offset="0" stop-color="#F7E8D8"/><stop offset=".42" stop-color="#E7C9AC"/>
        <stop offset=".78" stop-color="#D0A382"/><stop offset="1" stop-color="#A87656"/>
      </linearGradient>
      <radialGradient id="lift" cx=".38" cy=".3" r=".62">
        <stop offset="0" stop-color="#FFF6EC" stop-opacity=".92"/><stop offset="1" stop-color="#FFF6EC" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="lift2" cx=".82" cy=".78" r=".5">
        <stop offset="0" stop-color="#8B5E42" stop-opacity=".35"/><stop offset="1" stop-color="#8B5E42" stop-opacity="0"/>
      </radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
      <clipPath id="clipAll"><rect width="400" height="460"/></clipPath>
    </defs>
    <g clip-path="url(#clipAll)">
      <rect width="400" height="460" fill="url(#fieldG)"/>
      <rect width="400" height="460" fill="url(#lift)"/>
      <rect width="400" height="460" fill="url(#lift2)"/>
      <!-- soft dermal contour mapping -->
      <g fill="none" stroke="#FFF3E6" stroke-opacity=".34" stroke-width="1">
        <ellipse cx="176" cy="196" rx="52" ry="66" transform="rotate(-14 176 196)"/>
        <ellipse cx="176" cy="196" rx="82" ry="104" transform="rotate(-14 176 196)"/>
        <ellipse cx="176" cy="196" rx="114" ry="144" transform="rotate(-14 176 196)"/>
        <ellipse cx="176" cy="196" rx="150" ry="188" transform="rotate(-14 176 196)"/>
        <ellipse cx="176" cy="196" rx="190" ry="236" transform="rotate(-14 176 196)"/>
      </g>
      <g fill="none" stroke="#7B4F35" stroke-opacity=".16" stroke-width="1">
        <ellipse cx="288" cy="352" rx="46" ry="34" transform="rotate(18 288 352)"/>
        <ellipse cx="288" cy="352" rx="76" ry="56" transform="rotate(18 288 352)"/>
        <ellipse cx="288" cy="352" rx="108" ry="80" transform="rotate(18 288 352)"/>
      </g>
      <!-- diffuse blooms, as light on skin -->
      <g filter="url(#soft)" opacity=".5">
        <circle cx="128" cy="132" r="46" fill="#FFFBF4"/>
        <circle cx="300" cy="240" r="34" fill="#FFE9D3"/>
        <circle cx="212" cy="392" r="40" fill="#C08A67"/>
      </g>
      <!-- measurement nodes -->
      <g stroke="#FFF6EC" stroke-opacity=".85" fill="none">
        <circle cx="176" cy="196" r="5.5" fill="#FFF6EC" fill-opacity=".9" stroke="none"/>
        <circle cx="176" cy="196" r="13" stroke-opacity=".5"/>
        <path d="M176 196 L286 138" stroke-opacity=".45" stroke-dasharray="3 4"/>
        <circle cx="286" cy="138" r="3.5" fill="#FFF6EC" stroke="none"/>
        <path d="M176 196 L118 300" stroke-opacity=".45" stroke-dasharray="3 4"/>
        <circle cx="118" cy="300" r="3.5" fill="#FFF6EC" stroke="none"/>
      </g>
      <g font-family="Instrument Sans,sans-serif" font-size="8.5" letter-spacing="1.6" fill="#FFF6EC" fill-opacity=".9">
        <text x="296" y="134">HYDRATION</text>
        <text x="60" y="318">BARRIER</text>
      </g>
      <g font-family="Instrument Sans,sans-serif" font-size="7.5" letter-spacing="2" fill="#4A3222" fill-opacity=".5">
        <text x="26" y="440">LUMEA VISION · ASSISTIVE MODEL</text>
      </g>
    </g>
  </svg>
  <div class="hero__scan"></div>
</div>`;

/* ===================== VIEW: LANDING ===================== */
const Views = {};

Views.landing = () => ({
  html: `
${publicBar()}
<section class="hero">
  <div class="hero__grain"></div>
  <div class="hero__inner">
    <div>
      <span class="eyebrow eyebrow--gold reveal">AI-assisted analysis · Dermatologist reviewed</span>
      <h1 class="reveal reveal-d1">Your Skin.<br><em>Scientifically</em> Personalized.</h1>
      <p class="hero__lede reveal reveal-d2">AI-powered skin analysis, dermatologist guidance, and a skincare routine designed around you — trialled in sample sizes before you commit to the full line.</p>
      <div class="hero__cta reveal reveal-d3">
        <a class="btn btn--lg" href="#/signup">Analyse my skin ${ico.arrow}</a>
        <a class="btn btn--ghost btn--lg" href="#how">Explore how it works</a>
      </div>
      <div class="hero__proof reveal reveal-d4">
        <div class="stat"><span class="stat__num">14</span><span class="stat__lbl">Day sample trial</span></div>
        <div class="stat"><span class="stat__num">7</span><span class="stat__lbl">Step personal line</span></div>
        <div class="stat"><span class="stat__num">${money(14.25)}</span><span class="stat__lbl">Trial kit, delivered</span></div>
      </div>
    </div>
    <div class="hero__art reveal reveal-d2">
      ${portraitArt()}
      <div class="hero__badge">
        <span class="dot dot--live"></span>
        <div><strong style="font-size:.86rem;font-weight:500">Analysis reviewed by ${esc(DERM.name)}</strong>
        <div class="tiny">${esc(DERM.title)} · usually within 24 hours</div></div>
      </div>
    </div>
  </div>
</section>

<div class="marquee"><div class="marquee__track">
  ${Array(2).fill('<span>Barrier science</span><span>·</span><span>Dermatologist reviewed</span><span>·</span><span>Sample-first</span><span>·</span><span>No long contracts</span><span>·</span><span>Fragrance-free options</span><span>·</span><span>Pause anytime</span><span>·</span>').join('')}
</div></div>

<section class="section" id="how">
  <div class="wrap">
    <div class="rowbetween" style="align-items:flex-end;margin-bottom:clamp(30px,5vw,58px)">
      <div><span class="eyebrow reveal">How it works</span><h2 class="reveal reveal-d1">Seven steps from<br>question to routine.</h2></div>
      <p class="small reveal reveal-d2" style="max-width:34ch">Every stage is transparent: you always know what has been assessed, by whom, and what happens next.</p>
    </div>
    <div class="grid g4 steps">
      ${[['Create your profile', 'A private account holds your photos, analysis and routine history.'],
         ['Capture your skin', 'Upload or take a photo in natural light. Retake as many times as you like.'],
         ['AI-assisted analysis', 'Your image and concerns produce a readable skin profile — not a diagnosis.'],
         ['Dermatologist review', 'A registered dermatologist reads your report and confirms or adjusts it.'],
         ['Your personal line', 'A seven-step morning and evening routine, each product explained.'],
         ['14 days of samples', 'Trial the whole routine in sample sizes for the price of one product.'],
         ['Track and consult', 'Log how your skin feels and message your dermatologist as you go.'],
         ['Subscribe, or don’t', 'Convert to full sizes monthly. Skip, pause or cancel at any point.']
        ].map((s, i) => `<div class="step reveal reveal-d${(i % 4) + 1}"><h4>${s[0]}</h4><p>${s[1]}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--shell" id="approach">
  <div class="wrap">
    <div class="center" style="margin-bottom:clamp(28px,4vw,52px)">
      <span class="eyebrow reveal">The approach</span>
      <h2 class="reveal reveal-d1">Machine precision.<br>Human judgement.</h2>
      <p class="lede reveal reveal-d2" style="margin:16px auto 0;text-align:center">Software is good at consistency. Dermatologists are good at context. We use each for what it does well — and we tell you which is which.</p>
    </div>
    <div class="duo">
      <div class="duo__panel duo__panel--ai reveal reveal-d1">
        <span class="glyph">${ico.spark}</span>
        <span class="eyebrow" style="margin:16px 0 0">Layer one</span>
        <h3>AI-assisted skin analysis</h3>
        <p class="small">Reads your photograph and your own account of your skin, then produces consistent, comparable indicators you can track over time.</p>
        <ul><li>Seven visible-skin indicators</li><li>Comparable across every photo you take</li><li>Available in minutes, any hour</li><li>Supportive guidance — never a diagnosis</li></ul>
      </div>
      <div class="duo__panel duo__panel--derm reveal reveal-d2">
        <span class="glyph">${ico.derm}</span>
        <span class="eyebrow" style="margin:16px 0 0">Layer two</span>
        <h3>Dermatologist review</h3>
        <p class="small">Every report is read by a registered dermatologist before a routine is released. They can confirm it, adjust the recommendations, or ask you for more information.</p>
        <ul><li>Registered, verified clinicians</li><li>Confirms or overrides every recommendation</li><li>Direct messaging throughout your trial</li><li>Refers you onward when in-person care is right</li></ul>
      </div>
    </div>
    <div class="notice notice--gold reveal" style="margin-top:22px">${ico.info}<div><strong>Lumea is not a diagnostic service.</strong> Our analysis describes the visible appearance of your skin to guide product choice. Persistent, painful, spreading or changing skin conditions — including any changing mole or lesion — need in-person medical assessment.</div></div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <span class="eyebrow reveal">Personalised skincare</span>
      <h2 class="reveal reveal-d1">A line built for one person.</h2>
      <p class="lede reveal reveal-d2">No twelve-step ritual. Seven products across morning and evening, each one chosen against a specific finding in your report — and each one explained in a sentence you can actually act on.</p>
      <ul class="focuslist reveal reveal-d3" style="margin-top:26px">
        <li><span class="glyph">${ico.drop}</span><div><b>Why this product?</b>Every recommendation carries the concern it addresses and the reason it was selected.</div></li>
        <li><span class="glyph">${ico.swap}</span><div><b>Swap anything</b>Don’t like a product? Replace it, or ask the dermatologist for an alternative.</div></li>
        <li><span class="glyph">${ico.shield}</span><div><b>Tolerance first</b>Reactive skin profiles automatically avoid high-strength actives.</div></li>
      </ul>
    </div>
    <div class="card card--pad-lg reveal reveal-d2">
      <span class="card__label">Example — morning</span>
      <div class="prodlist">
        ${['cl-cream', 'sr-vitc', 'mo-light', 'sp-mineral'].map((id, i) => {
          const p = P(id);
          return `<div class="prod" style="grid-template-columns:62px 1fr;padding:12px">
            <div class="prod__art" style="width:62px;height:72px">${art(p, 'x' + i)}<span class="prod__step">${i + 1}</span></div>
            <div><div class="prod__cat">${esc(p.cat)}</div><div class="prod__name" style="font-size:1rem">${esc(p.name)}</div>
            <div class="tiny">${esc(p.ing.slice(0, 2).join(' · '))}</div></div></div>`;
        }).join('')}
      </div>
      <p class="tiny" style="margin:16px 0 0">Illustrative only. Your routine is generated from your own report.</p>
    </div>
  </div>
</section>

<section class="section section--stone" id="trial">
  <div class="wrap">
    <div class="trialhero reveal">
      <div class="trialhero__ring"></div>
      <div class="split" style="align-items:center">
        <div>
          <span class="pill pill--gold" style="margin-bottom:20px">The Lumea difference</span>
          <h2>Try before you commit.</h2>
          <p class="lede" style="margin:16px 0 26px">Experience your personalised routine for 14 days in sample sizes before investing in the full-size line. One price, seven products, delivered.</p>
          <div class="btnrow"><a class="btn btn--lg" href="#/signup">Start with an analysis ${ico.arrow}</a></div>
          <div class="hero__proof" style="margin-top:30px">
            <div class="stat"><span class="stat__num">${money(14.25)}</span><span class="stat__lbl">Typical trial kit</span></div>
            <div class="stat"><span class="stat__num">14</span><span class="stat__lbl">Days of product</span></div>
            <div class="stat"><span class="stat__num">0</span><span class="stat__lbl">Commitment</span></div>
          </div>
        </div>
        <div class="kitgrid">
          ${['cl-gel', 'sr-niac', 'tr-azelaic', 'mo-barrier', 'sp-mineral', 'sr-hydra'].map((id, i) => {
            const p = P(id);
            return `<div class="kititem"><div class="kititem__art">${art(p, 'k' + i)}</div><b>${esc(p.cat)}</b><span>${esc(p.trialSize)}</span></div>`;
          }).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="card card--pad-lg reveal" style="order:2">
      <div class="chathead" style="padding:0 0 16px;background:none;border-bottom:1px solid var(--line)">
        <span class="dermface">${esc(initials(DERM.name))}</span>
        <div><strong style="font-weight:500">${esc(DERM.name)}</strong>
          <div class="tiny">${esc(DERM.title)} · <span class="verified">${ico.check} Verified</span></div></div>
        <span class="pill pill--sage" style="margin-left:auto"><span class="dot dot--live"></span>Online</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;padding-top:18px">
        <div class="msg msg--me"><div class="msg__bubble">Day 6 — a little dryness on my cheeks after the treatment step.</div></div>
        <div class="msg msg--them"><div class="msg__bubble">That’s common in the first fortnight. Drop the treatment to alternate evenings and apply your barrier cream while skin is still slightly damp. Message me on day 10 with an update.</div></div>
        <div class="msg msg--system"><div class="msg__bubble">Routine adjusted by ${esc(DERM.name)} · treatment frequency reduced</div></div>
      </div>
    </div>
    <div>
      <span class="eyebrow reveal">Dermatologist chat</span>
      <h2 class="reveal reveal-d1">A clinician, in the app.</h2>
      <p class="lede reveal reveal-d2">Irritation on day four? A product you’re unsure about? Send a photo and a sentence. Your dermatologist can adjust the routine directly — no appointment, no waiting room.</p>
      <div class="notice notice--clay reveal reveal-d3" style="margin-top:24px">${ico.info}<div>Messaging is for routine guidance. If symptoms are severe, spreading rapidly, or accompanied by fever, pain or swelling, seek urgent in-person medical care.</div></div>
    </div>
  </div>
</section>

<section class="section section--shell">
  <div class="wrap">
    <div class="split">
      <div>
        <span class="eyebrow reveal">Monthly routine</span>
        <h2 class="reveal reveal-d1">Full sizes, when you’re sure.</h2>
        <p class="lede reveal reveal-d2">Liked your fortnight? Convert the exact same routine into full sizes on a monthly rhythm, at ${'15%'} below individual pricing. Edit the routine, skip a month, pause, or cancel — all self-serve.</p>
        <ul class="focuslist reveal reveal-d3" style="margin-top:24px">
          <li><span class="glyph">${ico.check}</span><div><b>Your routine, saved</b>Approved routines stay on your account permanently.</div></li>
          <li><span class="glyph">${ico.check}</span><div><b>Adjust as your skin changes</b>Re-analyse any time and your dermatologist re-reviews.</div></li>
          <li><span class="glyph">${ico.check}</span><div><b>No lock-in</b>Skip, pause or cancel from your account in two clicks.</div></li>
        </ul>
      </div>
      <div class="card card--pad-lg reveal reveal-d2">
        <span class="card__label">Illustrative monthly routine</span>
        <div class="sumrow"><span>7 full-size products</span><span>${money(131.5)}</span></div>
        <div class="sumrow sumrow--save"><span>Subscriber saving (15%)</span><span>− ${money(19.7)}</span></div>
        <div class="sumrow"><span>Delivery</span><span>Included</span></div>
        <div class="sumrow sumrow--total"><span>Monthly</span><span>${money(111.8)}</span></div>
        <p class="tiny" style="margin-top:14px">Your own total depends on the routine your dermatologist approves.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="center" style="margin-bottom:36px"><span class="eyebrow reveal">In their words</span><h2 class="reveal reveal-d1">Trialled, then trusted.</h2></div>
    <div class="testi">
      ${[['The sample kit is the whole reason I tried it. Two weeks in I knew the treatment was too strong, messaged the dermatologist, and had a revised routine the same evening.', 'Farah A.', 'Combination · pigmentation'],
         ['I have used four “personalised” brands. This is the first where a human actually changed what the algorithm suggested — and said why.', 'Dana K.', 'Sensitive · redness'],
         ['Being told my routine should be simpler, not bigger, was not what I expected from a skincare company.', 'Mariam H.', 'Dry · fine lines']
        ].map((t, i) => `<div class="testi__card reveal reveal-d${i + 1}"><div class="stars">★★★★★</div><p>“${t[0]}”</p>
          <div class="testi__who"><span class="avatar">${esc(initials(t[1]))}</span><div><strong style="font-size:.86rem;font-weight:500">${t[1]}</strong><div class="tiny">${t[2]}</div></div></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tight" id="faq">
  <div class="wrap wrap--narrow">
    <div class="center" style="margin-bottom:30px"><span class="eyebrow reveal">Questions</span><h2 class="reveal reveal-d1">Before you begin.</h2></div>
    <div class="acc reveal reveal-d2">
      ${[['Is this a medical diagnosis?', 'No. Lumea provides an AI-assisted assessment of your skin’s visible appearance, reviewed by a registered dermatologist for the purpose of recommending skincare. It does not diagnose skin disease. Persistent, painful or changing skin conditions need in-person assessment.'],
         ['What happens to my photographs?', 'In this prototype your photos are stored only in your own browser and never uploaded. In production they would be encrypted, visible only to you and your reviewing dermatologist, and deletable at any time from your account.'],
         ['What is actually in the 14-day trial?', 'Every product in your approved routine, in sample size — typically seven items covering morning and evening. Enough for fourteen days of twice-daily use.'],
         ['Can the dermatologist change what the AI suggests?', 'Yes, and they frequently do. The dermatologist can confirm the analysis, request more information, or replace individual products before your routine is released.'],
         ['What if a product irritates my skin?', 'Stop that step and message your dermatologist through the app. They can lower the frequency, swap the product, or ask you to pause actives entirely.'],
         ['Can I cancel the subscription?', 'Any time, from your account — alongside skipping a single shipment or pausing for a month. Your saved routine remains on your account either way.']
        ].map(q => `<div class="acc__item"><button class="acc__q">${q[0]}<i></i></button><div class="acc__a"><p>${q[1]}</p></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="cta-band reveal">
      <div class="cta-band__ring"></div><div class="cta-band__ring"></div>
      <span class="eyebrow" style="color:rgba(246,241,233,.6)">Begin</span>
      <h2>Five minutes now.<br>A routine that fits.</h2>
      <p>Create your profile, capture your skin, and have a dermatologist-reviewed routine waiting for you.</p>
      <div class="btnrow" style="justify-content:center"><a class="btn btn--lg" href="#/signup">Analyse my skin ${ico.arrow}</a>
      <a class="btn btn--lg" href="#/signin" style="--bg:transparent;--fg:#F6F1E9;--bd:rgba(246,241,233,.35)">I have an account</a></div>
    </div>
  </div>
</section>

<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <a class="brand" href="#/" style="margin-bottom:16px"><span class="brand__mark">
          <svg viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="1"/></svg></span>
          <span class="brand__word">LUMEA</span></a>
        <p class="small" style="max-width:32ch">AI-assisted skin analysis and dermatologist-reviewed skincare. A front-end prototype — no products are shipped and no payments are taken.</p>
      </div>
      <div><h5>Platform</h5><ul><li><a href="#how">How it works</a></li><li><a href="#trial">14-day trial</a></li><li><a href="#approach">AI &amp; dermatology</a></li><li><a href="#/signup">Create account</a></li></ul></div>
      <div><h5>Care</h5><ul><li><a href="#faq">FAQ</a></li><li><a href="#/signin">Dermatologist chat</a></li><li><a href="#faq">Photo privacy</a></li><li><a href="#faq">Cancellation</a></li></ul></div>
      <div><h5>Legal</h5><ul><li><a href="#faq">Medical disclaimer</a></li><li><a href="#faq">Terms</a></li><li><a href="#faq">Privacy policy</a></li><li><a href="#faq">Cookies</a></li></ul></div>
    </div>
    <div class="foot__bottom"><span>© ${new Date().getFullYear()} Lumea Skin Studio · Prototype</span><span>Not a substitute for professional medical advice</span></div>
  </div>
</footer>`,
  after() { UI.accordion($('#view')); }
});

/* ===================== VIEW: SIGN IN / SIGN UP ===================== */
const asideArt = (quote) => `
<div class="authpage__aside">
  <a class="brand" href="#/"><span class="brand__mark">
    <svg viewBox="0 0 32 32" width="26" height="26"><circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="1"/><path d="M16 4.5c5 3.4 7.6 7.3 7.6 11.5S21 24.2 16 27.5c-5-3.3-7.6-7.3-7.6-11.5S11 7.9 16 4.5Z" fill="none" stroke="currentColor" stroke-width="1" opacity=".65"/></svg>
  </span><span class="brand__word">LUMEA</span></a>
  <div>
    <h2>${quote}</h2>
    <p style="margin-top:18px">AI-assisted analysis, reviewed by a registered dermatologist, trialled in sample sizes before you commit.</p>
  </div>
  <div>
    <div class="authpage__quote">“Being told my routine should be simpler, not bigger, was not what I expected from a skincare company.”</div>
    <p class="tiny" style="margin-top:12px;color:rgba(246,241,233,.55)">Mariam H. · Lumea member</p>
  </div>
</div>`;

/* Email confirmation is required on this project, so both sign-up and an
   unconfirmed sign-in land here rather than dead-ending on an error. */
function pendingConfirm(email, reason) {
  const card = $('.authcard');
  if (!card) return;
  card.innerHTML = `
    <div class="center viewin">
      <div class="orderdone__seal">${ico.send}</div>
      <span class="eyebrow eyebrow--gold">${reason === 'signup' ? 'Almost there' : 'One step left'}</span>
      <h1 style="font-size:clamp(1.6rem,2.6vw,2.1rem);margin-bottom:12px">Check your email</h1>
      <p class="small" style="max-width:44ch;margin:0 auto 8px">${reason === 'signup'
        ? 'We’ve sent a confirmation link to'
        : 'This account hasn’t been confirmed yet. We can send the link again to'}</p>
      <p style="font-weight:500;margin-bottom:20px">${esc(email)}</p>
      <p class="small" style="max-width:46ch;margin:0 auto 24px">Open it and you’ll be signed in automatically. It can take a minute to arrive — check your spam folder if it doesn’t.</p>
      <div class="btnrow" style="justify-content:center">
        <button class="btn btn--sm btn--gold" id="resendBtn">Resend the link</button>
        <a class="btn btn--ghost btn--sm" href="#/signin">Back to sign in</a>
      </div>
      <p class="tiny" style="margin-top:18px">Wrong address? <a class="link" href="#/signup">Start again</a></p>
    </div>`;
  $('#resendBtn').addEventListener('click', async (e) => {
    e.target.disabled = true;
    const r = await Cloud.resend(email);
    UI.toast(r.error ? r.error : 'Link sent again to ' + email, r.error ? 'warn' : 'good', 5000);
    setTimeout(() => { if (e.target) e.target.disabled = false; }, 30000);
  });
}

Views.signin = () => ({
  html: `<div class="authpage">
  ${asideArt('Welcome back.<br>Your skin has been waiting.')}
  <div class="authpage__main"><div class="authcard viewin">
    <a class="link link--muted small" href="#/" style="display:inline-block;margin-bottom:26px">← Back to home</a>
    <h1>Sign in</h1>
    <p class="small">Continue your skin journey.</p>
    <form id="signinForm" novalidate>
      <div class="field"><label for="si-email">Email address</label>
        <input class="input" type="email" id="si-email" placeholder="you@email.com" autocomplete="email">
        <span class="err" data-err="email"></span></div>
      <div class="field"><label for="si-pass">Password</label>
        <input class="input" type="password" id="si-pass" placeholder="••••••••" autocomplete="current-password">
        <span class="err" data-err="pass"></span></div>
      <div class="rowbetween" style="margin:4px 0 22px">
        <label class="check"><input type="checkbox" id="si-remember" checked><span>Remember me</span></label>
        <button type="button" class="link link--muted small" id="forgotBtn">Forgot password?</button>
      </div>
      <button class="btn btn--block btn--lg" type="submit">Sign in ${ico.arrow}</button>
      <div class="err" data-err="form" style="text-align:center;margin-top:12px"></div>
    </form>
    <div class="divider-or">or</div>
    <div class="oauth">
      <button type="button" data-oauth="Google">Continue with Google</button>
      <button type="button" data-oauth="Apple">Continue with Apple</button>
    </div>
    <p class="small center" style="margin-top:26px">New to Lumea? <a class="link" href="#/signup">Create an account</a></p>
    <div class="notice notice--gold" style="margin-top:24px;flex-direction:column;align-items:stretch;gap:14px">
      <div style="display:flex;gap:13px">${ico.info}<div><strong>Just want to look around?</strong> The demo account signs you in without typing. It starts fresh, so you can walk the whole journey from photo to subscription.</div></div>
      <button type="button" class="btn btn--sm btn--gold" id="demoBtn">One-click demo sign-in ${ico.arrow}</button>
      <span class="tiny">Credentials, if you’d rather type them: <code>demo@lumea.co</code> · <code>demo1234</code></span>
    </div>
  </div></div></div>`,
  after() {
    const form = $('#signinForm');
    const fail = (k, msg) => { const f = $('[data-err="' + k + '"]', form); f.textContent = msg; if (f.closest('.field')) f.closest('.field').classList.add('has-error'); };
    const clear = () => { $$('.field', form).forEach(f => f.classList.remove('has-error')); $$('.err', form).forEach(e => e.textContent = ''); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); clear();
      const email = $('#si-email').value.trim(), pass = $('#si-pass').value;
      let bad = false;
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { fail('email', 'Enter a valid email address.'); bad = true; }
      if (!pass) { fail('pass', 'Enter your password.'); bad = true; }
      if (bad) return;

      const btn = $('button[type=submit]', form);
      btn.disabled = true; btn.innerHTML = '<span class="spinner" style="border-top-color:currentColor"></span> Signing in…';
      const res = await Auth.signIn(email, pass);
      btn.disabled = false; btn.innerHTML = 'Sign in ' + ico.arrow;

      if (res.unconfirmed) { pendingConfirm(res.email, 'unconfirmed'); return; }
      if (res.error) { fail('form', res.error); return; }
      UI.curtain(() => {
        Shell.render();
        const st = Store.state();
        Router.go(st && st.report ? '/dashboard' : '/analyze');
        UI.toast(greeting() + ', ' + (Store.user().name || '').split(' ')[0] + '.', 'good');
      });
    });
    $('#forgotBtn').addEventListener('click', () => UI.modal(
      '<h3>Reset your password</h3><p class="small">We’ll email you a link to set a new password.</p>' +
      '<div class="field" style="margin-top:18px"><label for="rsEmail">Email address</label>' +
      '<input class="input" type="email" id="rsEmail" placeholder="you@email.com" value="' + esc($('#si-email').value.trim()) + '"></div>' +
      '<button class="btn btn--block" data-reset>Send reset link</button>', {
      after(m) {
        $('[data-reset]', m).addEventListener('click', async () => {
          const mail = $('#rsEmail', m).value.trim();
          if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(mail)) { UI.toast('Enter a valid email address.', 'warn'); return; }
          const r = await Cloud.resetPassword(mail);
          UI.closeModal();
          UI.toast(r.error ? r.error : 'Reset link sent to ' + mail, r.error ? 'warn' : 'good', 5000);
        });
      }
    }));
    $$('[data-oauth]').forEach(b => b.addEventListener('click', () =>
      UI.toast(b.dataset.oauth + ' sign-in is not wired up in this prototype — use email.', 'warn')));
    /* fill the fields visibly, then submit through the normal flow */
    $('#demoBtn').addEventListener('click', () => {
      $('#si-email').value = 'demo@lumea.co';
      $('#si-pass').value = 'demo1234';
      setTimeout(() => form.dispatchEvent(new Event('submit', { cancelable: true })), 260);
    });
  }
});

Views.signup = () => ({
  html: `<div class="authpage">
  ${asideArt('Two weeks of samples.<br>Then decide.')}
  <div class="authpage__main"><div class="authcard viewin">
    <a class="link link--muted small" href="#/" style="display:inline-block;margin-bottom:26px">← Back to home</a>
    <h1>Create your account</h1>
    <p class="small">Then we’ll get to know your skin.</p>
    <div class="btnrow" style="margin-bottom:24px">
      <button type="button" class="btn btn--ghost btn--sm" id="fillDemo">Fill in example details</button>
      <a class="btn btn--quiet btn--sm" href="#/signin">Skip to demo sign-in</a>
    </div>
    <form id="signupForm" novalidate>
      <div class="field"><label for="su-name">Full name</label>
        <input class="input" id="su-name" placeholder="Layla Al-Rashid" autocomplete="name"><span class="err" data-err="name"></span></div>
      <div class="field"><label for="su-email">Email address</label>
        <input class="input" type="email" id="su-email" placeholder="you@email.com" autocomplete="email"><span class="err" data-err="email"></span></div>
      <div class="field"><label for="su-pass">Password</label>
        <input class="input" type="password" id="su-pass" placeholder="At least 8 characters" autocomplete="new-password">
        <div class="strength" data-level="0"><span></span></div>
        <span class="err" data-err="pass"></span>
        <div class="hint">Eight characters or more, including a number.</div></div>
      <div class="field"><label for="su-pass2">Confirm password</label>
        <input class="input" type="password" id="su-pass2" placeholder="Repeat your password" autocomplete="new-password"><span class="err" data-err="pass2"></span></div>
      <div class="field"><label for="su-goals">Skin goals <span style="text-transform:none;letter-spacing:0">— optional</span></label>
        <textarea class="textarea" id="su-goals" style="min-height:78px" placeholder="e.g. calmer skin, fewer breakouts along the jaw, even tone before a wedding in spring"></textarea></div>
      <label class="check" style="margin:6px 0 20px"><input type="checkbox" id="su-terms">
        <span>I agree to the <button type="button" class="link" data-legal="terms">Terms</button> and <button type="button" class="link" data-legal="privacy">Privacy Policy</button>, and understand Lumea provides skincare guidance, not medical diagnosis.</span></label>
      <span class="err" data-err="terms" style="display:block;margin:-14px 0 14px"></span>
      <button class="btn btn--block btn--lg" type="submit">Create account ${ico.arrow}</button>
      <div class="err" data-err="form" style="text-align:center;margin-top:12px"></div>
    </form>
    <p class="small center" style="margin-top:24px">Already a member? <a class="link" href="#/signin">Sign in</a></p>
  </div></div></div>`,
  after() {
    const form = $('#signupForm');
    $$('[data-legal]').forEach(b => b.addEventListener('click', () => UI.modal(b.dataset.legal === 'terms'
      ? `<h3>Terms of use</h3><p class="small">Lumea provides AI-assisted skincare guidance reviewed by a registered dermatologist. It recommends cosmetic skincare products; it does not diagnose, treat or cure any medical condition.</p>
         <p class="small">You agree to provide accurate information about your skin, to patch-test new products, and to discontinue any product that causes a reaction. Subscriptions may be skipped, paused or cancelled at any time from your account.</p>
         <p class="small">This is a front-end prototype: no products ship, no payments are processed, and no data leaves your browser.</p>`
      : `<h3>Privacy policy</h3><p class="small">Your photographs, skin analysis, routine and messages are stored only in this browser’s local storage in this prototype. Nothing is uploaded to a server and nothing is shared with third parties.</p>
         <p class="small">In production, photographs would be encrypted at rest, visible only to you and your reviewing dermatologist, deletable individually at any time, and never used for advertising. Anonymised, de-identified indicators would be used for research only with your explicit opt-in.</p>
         <p class="small">You can view and delete everything held about you from Account → Privacy &amp; data.</p>`)));
    $('#fillDemo').addEventListener('click', () => {
      const tag = Math.random().toString(36).slice(2, 6);
      const set = (sel, val) => { const f = $(sel); f.value = val; f.dispatchEvent(new Event('input', { bubbles: true })); };
      set('#su-name', 'Layla Al-Rashid');
      set('#su-email', 'layla.' + tag + '@example.com');
      set('#su-pass', 'skin12345');
      set('#su-pass2', 'skin12345');
      set('#su-goals', 'Calmer skin, fewer breakouts along the jaw, and more even tone.');
      $('#su-terms').checked = true;
      UI.toast('Example details filled — press Create account', 'good');
    });
    const pass = $('#su-pass'), meter = $('.strength', form);
    pass.addEventListener('input', () => {
      const v = pass.value;
      let lv = 0;
      if (v.length >= 8) lv++;
      if (/\d/.test(v) && /[a-z]/i.test(v)) lv++;
      if (v.length >= 12 || /[^\w\s]/.test(v)) lv++;
      meter.dataset.level = lv;
      $('span', meter).style.width = (lv / 3 * 100) + '%';
    });
    const fail = (k, msg) => { const f = $('[data-err="' + k + '"]', form); f.textContent = msg; f.style.display = 'block'; if (f.closest('.field')) f.closest('.field').classList.add('has-error'); };
    const clear = () => { $$('.field', form).forEach(f => f.classList.remove('has-error')); $$('.err', form).forEach(e => { e.textContent = ''; }); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); clear();
      const name = $('#su-name').value.trim(), email = $('#su-email').value.trim();
      const p1 = pass.value, p2 = $('#su-pass2').value, goals = $('#su-goals').value.trim();
      let bad = false;
      if (name.length < 2) { fail('name', 'Please enter your full name.'); bad = true; }
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { fail('email', 'Enter a valid email address.'); bad = true; }
      if (p1.length < 8 || !/\d/.test(p1)) { fail('pass', 'Use at least 8 characters including a number.'); bad = true; }
      if (p1 !== p2) { fail('pass2', 'Those passwords don’t match.'); bad = true; }
      if (!$('#su-terms').checked) { fail('terms', 'Please accept the terms to continue.'); bad = true; }
      if (bad) return;

      const btn = $('button[type=submit]', form);
      btn.disabled = true; btn.innerHTML = '<span class="spinner" style="border-top-color:currentColor"></span> Creating your account…';
      const res = await Auth.signUp({ name, email, password: p1, goals });
      btn.disabled = false; btn.innerHTML = 'Create account ' + ico.arrow;

      if (res.error) { fail('email', res.error); return; }
      if (res.pendingEmail) { pendingConfirm(res.pendingEmail, 'signup'); return; }
      UI.curtain(() => {
        Shell.render();
        Router.go('/analyze');
        UI.toast('Welcome to Lumea. Let’s get to know your skin.', 'good', 4200);
      });
    });
  }
});

/* ===================== VIEW: ANALYSIS WIZARD ===================== */
const CLEAN = [];
const onCleanup = (fn) => CLEAN.push(fn);

const wizSteps = (active) => `<div class="wizsteps">${
  [['Upload your skin', 1], ['Tell us about your skin', 2], ['Skin profile', 3]].map((s, i) => `
    <div class="wizstep ${active === s[1] ? 'is-active' : active > s[1] ? 'is-done' : ''}">
      <span class="wizstep__n">${active > s[1] ? ico.check : s[1]}</span><span>${s[0]}</span>
    </div>${i < 2 ? '<span class="wizstep__bar"></span>' : ''}`).join('')}</div>`;

Views.analyze = () => {
  const st = Store.state();
  const q = Router.query();
  let step = parseInt(q.step, 10);
  if (!step) {
    if (!st.photo) step = 1;
    else if (!st.concerns.length) step = 2;
    else if (!st.report) step = 3;
    else return Views.report();
  }
  if (step === 3 && (!st.photo || !st.concerns.length)) step = st.photo ? 2 : 1;
  return step === 1 ? wizUpload(st) : step === 2 ? wizConcerns(st) : wizScan(st);
};

/* --- step 1: capture --- */
function wizUpload(st) {
  return {
    html: `<div class="view--app"><div class="wizard">
      ${wizSteps(1)}
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Step one</span>
        <h1>Upload your skin.</h1>
        <p class="lede">A single, clear photograph is all we need. You can retake it as many times as you like — nothing is analysed until you confirm.</p>
      </div>

      <div id="capture"></div>

      <div class="tipgrid" style="margin-top:26px">
        ${[['Face the camera directly', 'Straight on, eyes level, whole face in frame.'],
           ['Natural or bright light', 'Window light beats overhead bulbs. Avoid harsh shadows.'],
           ['Bare skin where possible', 'Remove makeup, glasses and filters for a truer read.']
          ].map(t => `<div class="tip">${ico.check}<div><strong style="font-weight:500;color:var(--char)">${t[0]}</strong><br>${t[1]}</div></div>`).join('')}
      </div>

      <div class="notice" style="margin-top:22px">${ico.shield}<div><strong>Your photograph stays in this browser.</strong> In this prototype nothing is uploaded to a server. In production, images would be encrypted and visible only to you and your reviewing dermatologist.</div></div>
    </div></div>`,
    after() { mountCapture(st); }
  };
}

function mountCapture(st) {
  const host = $('#capture');
  let stream = null, shot = st.photo || null;
  onCleanup(() => { if (stream) stream.getTracks().forEach(t => t.stop()); });

  /* camera availability: an embedded page can be blocked by the host's
     permissions policy before the browser ever prompts */
  const camSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'unsupported';
    if (!window.isSecureContext) return 'insecure';
    try {
      const fp = document.featurePolicy || document.permissionsPolicy;
      if (fp && fp.allowsFeature && !fp.allowsFeature('camera')) return 'policy';
    } catch (e) {}
    return 'ok';
  };
  const embedded = window.top !== window.self;
  let camNote = null;

  /* a drawn stand-in so the capture step can be demonstrated without a real face */
  const sampleShot = () => {
    const c = el('canvas'); c.width = 640; c.height = 780;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 640, 780);
    g.addColorStop(0, '#F6E6D6'); g.addColorStop(.5, '#E3C3A4'); g.addColorStop(1, '#BE9070');
    x.fillStyle = g; x.fillRect(0, 0, 640, 780);
    const lift = x.createRadialGradient(300, 300, 20, 300, 300, 340);
    lift.addColorStop(0, 'rgba(255,250,244,.85)'); lift.addColorStop(1, 'rgba(255,250,244,0)');
    x.fillStyle = lift; x.fillRect(0, 0, 640, 780);
    x.save(); x.translate(320, 350); x.scale(1, 1.32);
    x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.arc(0, 0, 205, 0, Math.PI * 2); x.fill();
    x.restore();
    for (let i = 0; i < 26; i++) {
      const r = 8 + Math.random() * 30;
      x.fillStyle = 'rgba(176,120,92,' + (.04 + Math.random() * .06).toFixed(3) + ')';
      x.beginPath(); x.arc(120 + Math.random() * 400, 180 + Math.random() * 420, r, 0, Math.PI * 2); x.fill();
    }
    x.font = '500 20px Instrument Sans, sans-serif';
    x.fillStyle = 'rgba(74,50,34,.55)'; x.letterSpacing = '4px';
    x.fillText('SAMPLE IMAGE', 30, 748);
    return c.toDataURL('image/jpeg', .82);
  };

  const drawEmpty = () => {
    const support = camSupport();
    host.innerHTML = `
      <div class="dropzone" id="dz">
        <div class="dropzone__ico">${ico.upload}</div>
        <h3>Drag &amp; drop your photo</h3>
        <p>Use natural lighting, remove makeup if possible, and keep your face centred. JPG, PNG or WEBP up to 12 MB.</p>
        <div class="btnrow" style="justify-content:center">
          <button class="btn" id="pickBtn">Upload from device</button>
          <button class="btn btn--ghost" id="camBtn">${ico.cam} Take a photo</button>
        </div>
        <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" hidden>
        <hr class="hairline" style="margin:24px auto 18px;max-width:280px">
        <div class="btnrow" style="justify-content:center;align-items:center;gap:10px">
          <span class="tiny">Walking someone through it?</span>
          <button class="btn btn--quiet btn--sm" id="sampleBtn">Use a sample photo</button>
        </div>
      </div>
      ${camNote ? `<div class="notice notice--clay" style="margin-top:18px">${ico.info}<div>${camNote}
        ${embedded ? ' <button class="link" id="popOut" type="button">Open this page in its own tab</button> to let the browser ask for camera access.' : ''}</div></div>` : ''}
      ${!camNote && support === 'policy' && embedded ? `<div class="notice" style="margin-top:18px">${ico.cam}<div>Taking a photo needs the page to be in its own tab — <button class="link" id="popOut" type="button">open it there</button>, or upload a photo instead.</div></div>` : ''}`;
    const dz = $('#dz'), input = $('#fileInput');
    $('#pickBtn').addEventListener('click', () => input.click());
    input.addEventListener('change', () => { if (input.files[0]) load(input.files[0]); });
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('is-over'); }));
    dz.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) load(f); });
    $('#camBtn').addEventListener('click', openCamera);
    $('#sampleBtn').addEventListener('click', () => {
      shot = sampleShot();
      drawPreview(true);
      UI.toast('Sample photo loaded — a drawn stand-in, not a real face', 'good');
    });
    const pop = $('#popOut');
    if (pop) pop.addEventListener('click', () => window.open(location.href, '_blank', 'noopener'));
  };

  const load = (file) => {
    host.innerHTML = '<div class="skel skel--block" style="max-width:420px;margin:0 auto;aspect-ratio:1/1.12;height:auto"></div>';
    Img.fromFile(file).then(d => { shot = d; drawPreview(); })
      .catch(err => { UI.toast(err.message, 'warn'); drawEmpty(); });
  };

  const openCamera = () => {
    const support = camSupport();
    if (support === 'unsupported') { UI.toast('This browser doesn’t expose a camera here — upload a photo instead.', 'warn'); return; }
    if (support === 'insecure') { UI.toast('Cameras need a secure connection (https or localhost). Upload a photo instead.', 'warn', 5000); return; }
    host.innerHTML = `
      <div class="preview" id="camWrap">
        <video id="cam" autoplay playsinline muted style="transform:scaleX(-1)"></video>
        <div class="preview__frame"><span></span><span></span><span></span><span></span></div>
        <div class="preview__oval"></div>
      </div>
      <div class="btnrow" style="justify-content:center;margin-top:20px">
        <button class="btn" id="shootBtn">${ico.cam} Capture</button>
        <button class="btn btn--ghost" id="cancelCam">Cancel</button>
      </div>
      <p class="small center" style="margin-top:14px" id="camHint">Allow camera access when your browser asks, then line your face up inside the oval.</p>`;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false })
      .then(s => {
        stream = s; camNote = null;
        const v = $('#cam');
        if (v) v.srcObject = s;
        const hint = $('#camHint');
        if (hint) hint.textContent = 'Line your face up inside the oval, then capture.';
      })
      .catch(err => {
        const name = (err && err.name) || '';
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          camNote = embedded
            ? '<strong>The camera is blocked while this page is embedded.</strong> The page it sits inside decides that, so the browser never gets to ask.'
            : '<strong>Camera access was declined.</strong> Allow it from the camera icon in your browser’s address bar, then try again.';
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          camNote = '<strong>No camera was found on this device.</strong> Upload a photo instead.';
        } else if (name === 'NotReadableError' || name === 'AbortError') {
          camNote = '<strong>The camera is in use by another app.</strong> Close it and try again, or upload a photo.';
        } else {
          camNote = '<strong>The camera couldn’t be started.</strong> Upload a photo instead.';
        }
        UI.toast('Camera unavailable — you can upload a photo or use the sample.', 'warn', 4800);
        drawEmpty();
      });
    $('#shootBtn').addEventListener('click', () => {
      const v = $('#cam');
      if (!v || !v.videoWidth) { UI.toast('Camera is still starting — try again in a moment.', 'warn'); return; }
      shot = Img.fromVideo(v);
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      drawPreview();
    });
    $('#cancelCam').addEventListener('click', () => {
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      drawEmpty();
    });
  };

  const drawPreview = (isSample) => {
    host.innerHTML = `
      <div class="preview pop">
        <img src="${shot}" alt="${isSample ? 'Sample skin photograph' : 'Your uploaded skin photograph'}">
        <div class="preview__frame"><span></span><span></span><span></span><span></span></div>
        ${isSample ? '<span class="compare__tag compare__tag--l">Sample</span>' : ''}
      </div>
      <div class="btnrow" style="justify-content:center;margin-top:22px">
        <button class="btn btn--lg" id="useBtn">Use this photo ${ico.arrow}</button>
        <button class="btn btn--ghost" id="retakeBtn">Choose another</button>
        <button class="btn btn--quiet" id="dropBtn">Remove</button>
      </div>`;
    $('#useBtn').addEventListener('click', async () => {
      const btn = $('#useBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="border-top-color:currentColor"></span> Saving your photo…';
      const up = await Cloud.uploadPhoto(shot, 'baseline', 1, 'Day 1 — baseline');
      const src = up ? (await Cloud.photoUrl(up.path)) || shot : shot;
      Store.commit(s => {
        s.photo = src; s.photoAt = now();
        if (up) { s.cloud = s.cloud || { photoIds: {} }; s.cloud.baselinePhotoId = up.id; s.cloud.baselinePath = up.path; }
        if (!s.progress.some(p => p.day === 1)) s.progress.push({ id: (up && up.id) || uid('ph'), src, day: 1, label: 'Day 1 — baseline', at: now() });
      });
      UI.toast(up ? 'Photo saved to your account' : 'Photo saved in this browser', up ? 'good' : 'warn');
      Router.go('/analyze?step=2');
    });
    $('#retakeBtn').addEventListener('click', drawEmpty);
    $('#dropBtn').addEventListener('click', () => {
      shot = null; Store.commit(s => { s.photo = null; }); drawEmpty();
    });
  };

  shot ? drawPreview() : drawEmpty();
}

/* --- step 2: concerns --- */
function wizConcerns(st) {
  return {
    html: `<div class="view--app"><div class="wizard">
      ${wizSteps(2)}
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Step two</span>
        <h1>Tell us about your skin.</h1>
        <p class="lede">Select everything that applies. Your own account of your skin carries as much weight as the image.</p>
      </div>

      <div class="card card--pad-lg">
        <span class="card__label">What are you experiencing?</span>
        <div class="chips" id="concernChips">
          ${CONCERNS.map(c => `<button class="chip ${st.concerns.includes(c.id) ? 'is-on' : ''}" data-c="${c.id}">${c.label}</button>`).join('')}
        </div>

        <hr class="hairline" style="margin:28px 0">
        <span class="card__label">What would you most like to improve? <span style="text-transform:none;letter-spacing:0;color:var(--faint)">— choose up to three, in order</span></span>
        <div class="chips" id="prioChips"></div>
        <p class="hint" id="prioHint">Select your concerns above first.</p>

        <hr class="hairline" style="margin:28px 0">
        <div class="field" style="margin:0">
          <label for="wizNotes">Tell us anything else about your skin</label>
          <textarea class="textarea" id="wizNotes" placeholder="Products that have irritated you, medication you take, how your skin behaves in different seasons, whether you are pregnant or breastfeeding…">${esc(st.notes)}</textarea>
          <div class="hint">This is passed to your dermatologist along with your report.</div>
        </div>
      </div>

      <div class="btnrow" style="margin-top:20px;justify-content:center;align-items:center;gap:10px">
        <span class="tiny">Walking someone through it?</span>
        <button class="btn btn--quiet btn--sm" id="sampleConcerns">Fill sample answers</button>
      </div>

      <div class="btnrow" style="margin-top:14px;justify-content:space-between">
        <a class="btn btn--quiet" href="#/analyze?step=1">← Back to photo</a>
        <button class="btn btn--lg" id="toScan">Run my skin analysis ${ico.arrow}</button>
      </div>
    </div></div>`,
    after() {
      let picked = st.concerns.slice(), prios = st.priorities.slice();
      const chips = $('#concernChips'), prioBox = $('#prioChips'), hint = $('#prioHint');

      const drawPrio = () => {
        prios = prios.filter(p => picked.includes(p));
        if (!picked.length) { prioBox.innerHTML = ''; hint.textContent = 'Select your concerns above first.'; return; }
        hint.textContent = prios.length >= 3 ? 'Three selected — deselect one to change your priorities.' : 'Selected ' + prios.length + ' of 3.';
        prioBox.innerHTML = picked.map(id => {
          const i = prios.indexOf(id);
          return `<button class="chip chip--rank ${i > -1 ? 'is-on' : ''}" data-p="${id}">${i > -1 ? '<span class="rankn">' + (i + 1) + '</span>' : ''}${cLabel(id)}</button>`;
        }).join('');
        $$('[data-p]', prioBox).forEach(b => b.addEventListener('click', () => {
          const id = b.dataset.p, i = prios.indexOf(id);
          if (i > -1) prios.splice(i, 1);
          else if (prios.length >= 3) { UI.toast('Three priorities is the maximum — deselect one first.', 'warn'); return; }
          else prios.push(id);
          drawPrio();
        }));
      };

      $$('[data-c]', chips).forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.c, i = picked.indexOf(id);
        if (i > -1) picked.splice(i, 1); else picked.push(id);
        b.classList.toggle('is-on');
        drawPrio();
      }));
      drawPrio();

      $('#sampleConcerns').addEventListener('click', () => {
        const sample = ['dehydration', 'pigmentation', 'redness', 'texture', 'sensitivity'];
        picked = sample.slice();
        prios = ['pigmentation', 'dehydration', 'redness'];
        $$('[data-c]', chips).forEach(b => b.classList.toggle('is-on', picked.includes(b.dataset.c)));
        $('#wizNotes').value = 'Tretinoin irritated my skin last year. Very reactive to fragrance. Not pregnant or breastfeeding.';
        drawPrio();
        UI.toast('Sample answers filled — a reactive, pigmentation-led profile', 'good');
      });

      $('#toScan').addEventListener('click', () => {
        if (!picked.length) { UI.toast('Select at least one concern so we know what to look for.', 'warn'); return; }
        Store.commit(s => { s.concerns = picked; s.priorities = prios; s.notes = $('#wizNotes').value.trim(); s.report = null; });
        Router.go('/analyze?step=3');
      });
    }
  };
}

/* --- step 3: scan --- */
function wizScan(st) {
  const pts = [[38, 34], [62, 34], [50, 46], [30, 56], [70, 56], [50, 64], [42, 74], [58, 74], [50, 26]];
  return {
    html: `<div class="view--app"><div class="wizard">
      ${wizSteps(3)}
      <div class="scanstage">
        <span class="eyebrow eyebrow--gold">Step three · AI-assisted skin analysis</span>
        <h1 style="font-size:clamp(1.9rem,3.4vw,2.7rem);margin:8px 0 26px">Analysing your skin…</h1>
        <div class="scanframe" id="scanFrame">
          <img src="${st.photo}" alt="Your photograph being analysed">
          <div class="scanframe__mesh"></div>
          <div class="scanframe__beam"></div>
          ${pts.map((p, i) => `<span class="scanframe__pt" data-i="${i}" style="left:${p[0]}%;top:${p[1]}%"></span>`).join('')}
        </div>
        <div class="progressline"><span id="scanBar"></span></div>
        <div class="scanlog" id="scanLog"></div>
        <p class="tiny" style="margin-top:18px">Lumea Vision · assistive model. This describes the visible appearance of your skin. It is not a medical diagnosis.</p>
        <div class="btnrow" style="margin-top:20px;justify-content:center;align-items:center;gap:10px">
          <span class="tiny">Walking someone through it?</span>
          <button class="btn btn--quiet btn--sm" id="replayScan">Replay this scan</button>
          <button class="btn btn--quiet btn--sm" id="skipScan">Skip to the report</button>
        </div>
      </div>
    </div></div>`,
    after() {
      const frame = $('#scanFrame'), log = $('#scanLog'), bar = $('#scanBar');
      const lines = ['Preparing image…', 'Mapping visible skin characteristics…', 'Analysing skin concerns…', 'Cross-referencing your notes…', 'Preparing your skin report…'];
      let i = 0;
      const timers = [];
      onCleanup(() => timers.forEach(clearTimeout));
      setTimeout(() => frame.classList.add('is-live'), 400);

      const tick = () => {
        if (i > 0) { const prev = log.children[i - 1]; if (prev) { prev.classList.add('is-done'); $('.spinner', prev).outerHTML = '<span class="tickmark">' + ico.check + '</span>'; } }
        if (i >= lines.length) return finish();
        const row = el('div', 'scanlog__line', '<span class="spinner"></span><span>' + lines[i] + '</span>');
        log.innerHTML = ''; log.appendChild(row);
        if (i > 0) { /* keep only current line for a calm stage */ }
        requestAnimationFrame(() => row.classList.add('is-in'));
        bar.style.width = ((i + 1) / lines.length * 100) + '%';
        $$('.scanframe__pt', frame).slice(i * 2, i * 2 + 2).forEach(p => p.classList.add('is-on'));
        i++;
        timers.push(setTimeout(tick, 1150));
      };

      /* a replay re-runs the animation only — it must not regenerate an analysis
         that a dermatologist may already have reviewed */
      const replaying = Router.query().replay === '1' && !!st.report;
      $('#replayScan').addEventListener('click', () => Router.go('/analyze?step=3&replay=' + (st.report ? '1' : '0')));
      $('#skipScan').addEventListener('click', () => { timers.forEach(clearTimeout); finish(true); });

      const finish = (immediate) => {
        if (replaying) {
          timers.push(setTimeout(() => UI.curtain(() => Router.go('/report')), immediate ? 0 : 400));
          return;
        }
        const report = Engine.analyse({ concerns: st.concerns, notes: st.notes, photo: st.photo, email: st.profile.email });
        Store.commit(s => { s.report = report; s.review = { status: 'none', notes: '', requests: [], confirmedAt: null, adjustments: [] }; s.history.push({ at: now(), t: 'AI-assisted analysis completed' }); });
        timers.push(setTimeout(() => UI.curtain(() => Router.go('/report')), immediate ? 0 : 500));
      };
      timers.push(setTimeout(tick, 700));
    }
  };
}

/* ===================== VIEW: REPORT ===================== */
function scoreRing(score, band) {
  const r = 58, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return `<div class="scorering">
    <svg viewBox="0 0 132 132" width="132" height="132">
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--stone)" stroke-width="5"/>
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--gold)" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)" data-off="${off.toFixed(1)}"/>
    </svg>
    <div class="scorering__val"><div><b>${score}</b><span>${esc(band)}</span></div></div>
  </div>`;
}

Views.report = () => {
  const st = Store.state();
  if (!st.report) return { html: '', after() { Router.go('/analyze'); } };
  const r = st.report, rv = st.review;

  const reviewBlock = () => {
    if (rv.status === 'none') return `
      <div class="card card--pad-lg reveal" id="sendBlock">
        <span class="pill pill--gold" style="margin-bottom:16px">${ico.spark} Your AI analysis is ready</span>
        <h3>Before we build your personalised routine, your report can be reviewed by a dermatologist.</h3>
        <p class="small" style="margin:12px 0 20px;max-width:62ch">${esc(DERM.name)} will read your image, your concerns and your notes, then confirm the analysis or adjust the recommended categories. Your routine is released once that review is complete.</p>
        <div class="dermcard" style="margin-bottom:22px">
          <span class="dermface dermface--lg">${esc(initials(DERM.name))}</span>
          <div><strong style="font-weight:500">${esc(DERM.name)}</strong><div class="small">${esc(DERM.title)} · ${DERM.years} years in practice</div>
          <div class="verified">${ico.check} ${esc(DERM.reg)}</div></div>
        </div>
        <button class="btn btn--lg" id="sendDerm">Send to dermatologist ${ico.arrow}</button>
        <p class="tiny" style="margin-top:14px">Shares your photograph, concerns, notes and AI indicators with your reviewing dermatologist.</p>
      </div>`;
    if (rv.status === 'confirmed') return `
      <div class="reviewbar reviewbar--done reveal">
        <span class="dermface">${esc(initials(DERM.name))}</span>
        <div><strong style="font-weight:500">${ico.check} Dermatologist reviewed</strong>
          <div class="small">Your skin analysis was reviewed by ${esc(DERM.name)} on ${fmtDate(rv.confirmedAt)}.</div></div>
        <a class="btn btn--sm btn--gold" href="#/plan" style="margin-left:auto">Open my report</a>
      </div>
      <div class="card reveal" style="margin-top:14px">
        <div class="rowbetween" style="gap:14px">
          <div style="flex:1;min-width:220px">
            <span class="card__label" style="margin-bottom:8px">Your dermatologist’s report</span>
            ${rv.notes ? `<p class="small" style="margin:0 0 10px">“${esc(rv.notes.slice(0, 150))}${rv.notes.length > 150 ? '…' : ''}”</p>` : ''}
            <div class="tiny">${esc(DERM.name)} · issued ${fmtDate(rv.confirmedAt)} · ${st.routine ? Engine.routineProducts(st.routine).length + ' products prescribed' : ''}</div>
          </div>
          <div class="btnrow">
            <a class="btn btn--sm" href="#/plan">Read the full report ${ico.arrow}</a>
            <a class="btn btn--ghost btn--sm" href="#/routine">My skin line</a>
          </div>
        </div>
      </div>`;
    return `
      <div class="reviewbar reviewbar--pending reveal">
        <span class="dermface">${esc(initials(DERM.name))}</span>
        <div><strong style="font-weight:500">${ico.check} Request approved</strong>
          <div class="small">${esc(DERM.name)} has your report and is preparing your recommendations. This page updates itself the moment it arrives.</div></div>
        <div class="btnrow" style="margin-left:auto">
          <span class="pill pill--gold"><span class="spinner"></span>Preparing your report</span>
          <a class="btn btn--sm btn--ghost" href="#/messages">Message</a>
        </div>
      </div>
      <p class="tiny reveal" style="margin-top:10px">You don’t need to do anything — your report and recommended products will appear here and in Messages.</p>`;
  };

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Your skin analysis</span>
        <h1>Your Personalised Skin Plan</h1>
        <p class="small">Generated ${fmtDate(r.createdAt)} · ${fmtTime(r.createdAt)} · engine ${esc(r.engine)}</p>
      </div>

      <div class="card card--pad-lg reveal" style="margin-bottom:16px">
        <div style="display:flex;gap:clamp(20px,4vw,44px);align-items:center;flex-wrap:wrap">
          ${scoreRing(r.score, r.band)}
          <div style="flex:1;min-width:260px">
            <span class="card__label">Skin overview</span>
            <h3 style="margin-bottom:12px">${esc(r.band)} profile</h3>
            <p class="lede" style="font-size:1.02rem">${esc(r.summary)}</p>
            <div class="chips" style="margin-top:16px">${r.concerns.map(c => `<span class="tag">${esc(cLabel(c))}</span>`).join('')}</div>
          </div>
        </div>
      </div>

      <div class="notice notice--gold reveal" style="margin-bottom:26px">${ico.info}<div><strong>AI-assisted, not diagnostic.</strong> These indicators describe the visible appearance of your skin to guide product choice. They are supportive guidance only. For a persistent, painful or changing skin condition — or any changing mole — please see a dermatologist in person.</div></div>

      <span class="eyebrow reveal">AI skin analysis · seven indicators</span>
      <div class="reportgrid reveal" style="margin-bottom:34px">
        ${r.metrics.map(m => `
          <div class="meter" data-tone="${m.tone}">
            <div class="meter__top"><span class="meter__name">${esc(m.label)}</span><span class="meter__level">${esc(m.word)}</span></div>
            <div class="meter__track"><span class="meter__fill" data-v="${m.value}"></span></div>
            <p class="meter__note">${esc(m.note)}</p>
          </div>`).join('')}
      </div>

      <div class="split" style="align-items:start;margin-bottom:30px">
        <div class="card reveal">
          <span class="card__label">Suggested areas of focus</span>
          <ul class="focuslist">
            ${r.focus.map((f, i) => `<li><span class="glyph">${i + 1}</span><div><b>${esc(f.t)}</b>${esc(f.d)}</div></li>`).join('')}
          </ul>
        </div>
        <div class="card reveal reveal-d1">
          <span class="card__label">Your notes to the dermatologist</span>
          <p class="small" style="margin:0">${st.notes ? esc(st.notes) : '<span style="color:var(--faint)">No additional notes provided.</span>'}</p>
          ${st.priorities.length ? `<hr class="hairline" style="margin:18px 0"><span class="card__label">Your priorities</span>
            <div class="chips">${st.priorities.map((p, i) => `<span class="tag">${i + 1}. ${esc(cLabel(p))}</span>`).join('')}</div>` : ''}
          <hr class="hairline" style="margin:18px 0">
          <div class="btnrow"><a class="btn btn--ghost btn--sm" href="#/analyze?step=2">Update my concerns</a>
          <a class="btn btn--quiet btn--sm" href="#/analyze?step=1">Retake photo</a></div>
        </div>
      </div>

      <span class="eyebrow reveal">Dermatologist review</span>
      ${reviewBlock()}
    </div></div>`,
    after() {
      UI.meters();
      setTimeout(() => { const c = $('.scorering circle[data-off]'); if (c) c.style.strokeDashoffset = c.dataset.off; }, 200);
      const send = $('#sendDerm');
      if (send) send.addEventListener('click', () => {
        Store.commit(s => {
          s.review.status = 'pending';
          s.review.sentAt = now();
          s.history.push({ at: now(), t: 'Report sent for dermatologist review' });
          s.messages.push({ id: uid('m'), who: 'system', text: 'Skin report submitted for review — ' + fmtDate(now()) + '. ' + DERM.name + ' has been notified.', at: now() });
        });
        Review.schedule();
        Shell.render();
        Router.render();
        UI.modal(`<div class="center"><div class="orderdone__seal">${ico.check}</div>
          <span class="eyebrow">Request approved</span>
          <h3>Your report is with ${esc(DERM.name)}.</h3>
          <p class="small">She’s reviewing it now. Your report and your recommended products will arrive here in a moment — nothing else is needed from you.</p>
          <div class="btnrow" style="justify-content:center;margin-top:20px">
            <a class="btn btn--sm btn--gold" href="#/report" data-close>Wait here</a>
            <a class="btn btn--ghost btn--sm" href="#/dashboard" data-close>Back to dashboard</a></div></div>`);
      });
    }
  };
};

/* ===================== PRODUCT MODAL + REPLACE ===================== */
function productModal(id) {
  const p = P(id), st = Store.state();
  const hit = (st.report ? st.report.concerns : []).filter(c => p.targets.includes(c));
  UI.modal(`
    <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
      <div class="prod__art" style="width:96px;height:112px">${art(p, 'm')}</div>
      <div style="flex:1;min-width:200px">
        <div class="prod__cat">${esc(p.cat)}</div>
        <h3 style="margin-bottom:6px">${esc(p.name)}</h3>
        <div class="price">${money(p.price)} <span class="tiny">· ${esc(p.size)}</span></div>
        <div class="tiny">Trial size ${esc(p.trialSize)} · ${money(p.trialPrice)}</div>
      </div>
    </div>
    <hr class="hairline" style="margin:20px 0">
    <span class="card__label">Why this product?</span><p class="small">${esc(p.why)}</p>
    <span class="card__label">Key ingredients</span>
    <div class="chips" style="margin-bottom:16px">${p.ing.map(i => `<span class="tag">${esc(i)}</span>`).join('')}</div>
    <span class="card__label">Concerns addressed</span>
    <div class="chips" style="margin-bottom:16px">${p.targets.map(t => `<span class="tag" ${hit.includes(t) ? 'style="border-color:rgba(168,131,78,.45);color:var(--gold)"' : ''}>${esc(cLabel(t))}</span>`).join('')}</div>
    <span class="card__label">How to use</span><p class="small">${esc(p.how)}</p>
    ${p.caution ? `<div class="notice notice--clay" style="margin:6px 0 16px">${ico.info}<div>${esc(p.caution)}</div></div>` : ''}
    <hr class="hairline" style="margin:18px 0">
    <span class="card__label">Ratings</span>
    <div class="ratemeta" style="margin-bottom:12px"><span class="starline">${Ratings.stars(Ratings.community(p.id).avg)}</span>
      ${Ratings.community(p.id).avg} out of 5 · ${Ratings.community(p.id).count} member reviews</div>
    ${(() => { const mine = Ratings.get(p.id); return mine && mine.rating
      ? `<p class="small"><strong style="font-weight:500">You rated it ${mine.rating}/5</strong>${mine.text ? ' — “' + esc(mine.text) + '”' : ''}</p>`
      : '<p class="small">You haven’t reviewed this yet.</p>'; })()}
    <button class="btn btn--ghost btn--sm" data-rev>${Ratings.get(p.id) ? 'Edit my review' : 'Rate &amp; review'}</button>
    <div class="btnrow" style="margin-top:18px">
      <button class="btn btn--sm" data-add-trial>Add trial size · ${money(p.trialPrice)}</button>
      <button class="btn btn--ghost btn--sm" data-add-full>Add full size · ${money(p.price)}</button>
      <button class="btn btn--quiet btn--sm" data-ask>${ico.chat} Ask dermatologist</button>
    </div>`, {
    after(m) {
      $('[data-add-trial]', m).addEventListener('click', () => { Cart.add(p.id, 'trial'); UI.closeModal(); });
      $('[data-add-full]', m).addEventListener('click', () => { Cart.add(p.id, 'full'); UI.closeModal(); });
      $('[data-ask]', m).addEventListener('click', () => { UI.closeModal(); Chat.ask('I have a question about ' + p.name + '. ', true); });
      $('[data-rev]', m).addEventListener('click', () => { UI.closeModal(); reviewModal(p.id); });
    }
  });
}

function replaceModal(role, slot, currentId, onPick) {
  const alts = PRODUCTS.filter(p => p.role === role && (p.slot === slot || p.slot === 'both'));
  UI.modal(`<h3>Replace this step</h3>
    <p class="small">Alternatives in the same category. Your dermatologist is notified of any change you make.</p>
    <div class="prodlist" style="margin-top:18px">
      ${alts.map(p => `<button class="prod" data-pick="${p.id}" style="text-align:left;grid-template-columns:62px 1fr auto;${p.id === currentId ? 'border-color:var(--gold)' : ''}">
        <div class="prod__art" style="width:62px;height:72px">${art(p, 'r')}</div>
        <div><div class="prod__cat">${esc(p.cat)}</div><div class="prod__name" style="font-size:1rem">${esc(p.name)}</div>
        <p class="prod__why" style="margin:4px 0 0">${esc(p.why)}</p></div>
        <div class="price">${money(p.price)}</div></button>`).join('')}
    </div>`, {
    after(m) {
      $$('[data-pick]', m).forEach(b => b.addEventListener('click', () => {
        UI.closeModal();
        if (b.dataset.pick !== currentId) onPick(b.dataset.pick);
      }));
    }
  });
}

/* ===================== RATING WIDGETS ===================== */
function ratePicker(id) {
  const mine = Ratings.get(id);
  return `<div class="ratepick" data-rate="${id}" role="group" aria-label="Rate this product">
    ${[1, 2, 3, 4, 5].map(n => `<button type="button" data-v="${n}" class="${mine && mine.rating >= n ? 'is-on' : ''}" aria-label="${n} out of 5">★</button>`).join('')}
  </div>`;
}

function ratingsCard(ids, opts) {
  opts = opts || {};
  const rated = ids.filter(id => Ratings.get(id) && Ratings.get(id).rating).length;
  return `<div class="card ${opts.pad ? 'card--pad-lg' : ''} reveal" id="ratingsCard">
    <div class="rowbetween" style="margin-bottom:6px">
      <span class="card__label" style="margin:0">Review your products</span>
      <span class="tiny">${rated} of ${ids.length} rated</span>
    </div>
    <p class="small" style="margin-bottom:14px">${opts.blurb || 'Rate what you’ve actually used. Your ratings stay on your account, and your dermatologist can see them alongside your check-ins.'}</p>
    ${ids.map(id => {
      const p = P(id), mine = Ratings.get(id), com = Ratings.community(id);
      return `<div class="reviewcard">
        <div class="miniprod" style="border:0;padding:0;margin-bottom:10px">
          <div class="miniprod__art">${art(p, 'rv' + id)}</div>
          <div style="flex:1"><b>${esc(p.name)}</b>
            <span class="ratemeta"><span class="starline">${Ratings.stars(com.avg)}</span> ${com.avg} · ${com.count} member reviews</span></div>
        </div>
        <div class="rowbetween" style="gap:10px">
          ${ratePicker(id)}
          <button class="btn btn--quiet btn--sm" data-writerev="${id}">${mine && mine.text ? 'Edit my review' : 'Write a review'}</button>
        </div>
        ${mine && mine.rating ? `<p class="small" style="margin:10px 0 0"><strong style="font-weight:500">You rated ${mine.rating}/5</strong>${mine.text ? ' — “' + esc(mine.text) + '”' : ''}
          <span class="tiny"> · ${fmtDate(mine.at)}</span></p>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function bindRatings() {
  $$('[data-rate]').forEach(box => $$('button', box).forEach(b => b.addEventListener('click', () => {
    const id = box.dataset.rate, v = parseInt(b.dataset.v, 10);
    Ratings.set(id, v);
    UI.toast('You rated ' + P(id).name + ' ' + v + '/5', 'good');
    Router.render();
  })));
  $$('[data-writerev]').forEach(b => b.addEventListener('click', () => reviewModal(b.dataset.writerev)));
}

function reviewModal(id) {
  const p = P(id), mine = Ratings.get(id) || { rating: 0, text: '' }, com = Ratings.community(id);
  UI.modal(`<h3>Review ${esc(p.name)}</h3>
    <p class="small">Two weeks of use is enough to judge tolerance and feel. Members average <strong style="font-weight:500">${com.avg}</strong> out of 5 on this one.</p>
    <div class="field" style="margin-top:18px"><label>Your rating</label>${ratePicker(id)}</div>
    <div class="field"><label for="revText">Your review</label>
      <textarea class="textarea" id="revText" placeholder="How did it feel on application? Any stinging? Would you buy the full size?">${esc(mine.text || '')}</textarea></div>
    <div class="btnrow"><button class="btn" data-ok>Save my review</button>
      <button class="btn btn--ghost" data-close>Cancel</button></div>`, {
    after(m) {
      let picked = mine.rating;
      $$('[data-rate] button', m).forEach(b => b.addEventListener('click', () => {
        picked = parseInt(b.dataset.v, 10);
        $$('[data-rate] button', m).forEach(x => x.classList.toggle('is-on', parseInt(x.dataset.v, 10) <= picked));
      }));
      $('[data-ok]', m).addEventListener('click', () => {
        const text = $('#revText', m).value.trim();
        if (!picked) { UI.toast('Choose a star rating first.', 'warn'); return; }
        Ratings.set(id, picked, text);
        UI.closeModal();
        UI.toast('Review saved — thank you', 'good');
        Router.render();
      });
    }
  });
}

/* ===================== FEEDBACK: DOCTOR + SERVICE ===================== */
function starPicker(key, current) {
  return `<div class="ratepick" data-star="${key}" role="group" aria-label="Rating out of five">
    ${[1, 2, 3, 4, 5].map(n => `<button type="button" data-v="${n}" class="${current >= n ? 'is-on' : ''}" aria-label="${n} out of 5">★</button>`).join('')}
  </div>`;
}

function feedbackModal(kind) {
  const isDerm = kind === 'clinician';
  const mine = Ratings.getFor(kind) || { rating: 0, text: '', recommend: null };
  const com = isDerm ? Ratings.clinicianCommunity() : Ratings.serviceCommunity();
  UI.modal(`<h3>${isDerm ? 'Rate ' + esc(DERM.name) : 'Rate your Lumea experience'}</h3>
    <p class="small">${isDerm
      ? 'How was the review and the guidance you were given? Members average <strong style="font-weight:500">' + com.avg + '</strong> out of 5 for this clinician.'
      : 'The whole thing — analysis, review, the trial, delivery. Members average <strong style="font-weight:500">' + com.avg + '</strong> out of 5.'}</p>
    <div class="field" style="margin-top:18px"><label>Your rating</label>${starPicker(kind, mine.rating)}</div>
    <div class="field"><label for="fbText">${isDerm ? 'Your review of the clinician' : 'Your review'}</label>
      <textarea class="textarea" id="fbText" placeholder="${isDerm
        ? 'Did the explanation make sense? Did the routine suit your skin?'
        : 'What worked, what didn’t, what would you change?'}">${esc(mine.text || '')}</textarea></div>
    ${isDerm ? '' : `<label class="check" style="margin-bottom:18px"><input type="checkbox" id="fbRec" ${mine.recommend ? 'checked' : ''}>
      <span>I would recommend Lumea to a friend</span></label>`}
    <div class="btnrow"><button class="btn" data-ok>Save my review</button>
      <button class="btn btn--ghost" data-close>Cancel</button></div>`, {
    after(m) {
      let picked = mine.rating;
      $$('[data-star] button', m).forEach(b => b.addEventListener('click', () => {
        picked = parseInt(b.dataset.v, 10);
        $$('[data-star] button', m).forEach(x => x.classList.toggle('is-on', parseInt(x.dataset.v, 10) <= picked));
      }));
      $('[data-ok]', m).addEventListener('click', () => {
        if (!picked) { UI.toast('Choose a star rating first.', 'warn'); return; }
        const rec = $('#fbRec', m) ? $('#fbRec', m).checked : undefined;
        Ratings.setFor(kind, picked, $('#fbText', m).value.trim(), rec);
        UI.closeModal();
        UI.toast(isDerm ? 'Thank you — your clinician review is saved' : 'Thank you — your review is saved', 'good');
        Router.render();
      });
    }
  });
}

/* the three things a member can rate, in one card */
function feedbackCard(routine, opts) {
  opts = opts || {};
  const ids = routine ? Engine.routineProducts(routine).map(p => p.id) : [];
  const rated = ids.filter(id => Ratings.get(id) && Ratings.get(id).rating).length;
  const derm = Ratings.getFor('clinician');
  const svc = Ratings.getFor('service');
  const row = (title, sub, done, action, key) => `
    <div class="reviewcard">
      <div class="rowbetween" style="gap:12px">
        <div style="flex:1;min-width:170px">
          <strong style="font-weight:500">${title}</strong>
          <div class="tiny">${sub}</div>
          ${done ? `<div class="ratemeta" style="margin-top:6px"><span class="starline">${Ratings.stars(done.rating)}</span>
            You rated ${done.rating}/5${done.text ? ' — “' + esc(done.text.slice(0, 90)) + (done.text.length > 90 ? '…' : '') + '”' : ''}</div>` : ''}
        </div>
        <button class="btn ${done ? 'btn--ghost' : ''} btn--sm" data-fb="${key}">${done ? 'Edit' : action}</button>
      </div>
    </div>`;
  return `<div class="card ${opts.pad ? 'card--pad-lg' : ''} reveal" id="feedbackCard">
    <span class="card__label">${opts.title || 'Rate and review'}</span>
    <p class="small" style="margin-bottom:6px">${opts.blurb || 'Your feedback stays on your account and helps other members choose.'}</p>
    ${ids.length ? row('Your products', rated + ' of ' + ids.length + ' rated · ' + ids.length + ' items in your routine', null, 'Rate products', 'products') : ''}
    ${row('Your dermatologist', esc(DERM.name) + ' · ' + esc(DERM.title), derm, 'Rate clinician', 'clinician')}
    ${row('Your Lumea experience', 'Analysis, review, trial and delivery', svc, 'Rate service', 'service')}
  </div>`;
}

function bindFeedback() {
  $$('[data-fb]').forEach(b => b.addEventListener('click', () => {
    const kind = b.dataset.fb;
    if (kind === 'products') {
      const card = $('#ratingsCard');
      if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      Router.go('/routine');
      return;
    }
    feedbackModal(kind);
  }));
}

/* ===================== SHARED: START CHOOSER ===================== */
function startChooser(r) {
  const trialTotal = Engine.routineTotal(r, 'trial'), fullTotal = Engine.routineTotal(r, 'full');
  return `<div class="card card--pad-lg reveal" style="margin-bottom:26px">
    <span class="card__label">Choose how to start</span>
    <div class="grid g2" style="margin:0 0 18px">
      <label class="pickbox is-on" data-buy="trial">
        <div class="pickbox__top">
          <span><strong style="font-weight:500">14-day sample kit</strong><br>
            <span class="tiny">Every step in sample size. Two weeks to judge tolerance before spending more.</span></span>
          <input type="radio" name="startWith" value="trial" checked>
        </div>
        <div class="rowbetween" style="margin-top:12px"><span class="price">${money(trialTotal * .75)}</span><span class="pill pill--gold">−25% bundle</span></div>
      </label>
      <label class="pickbox" data-buy="full">
        <div class="pickbox__top">
          <span><strong style="font-weight:500">The whole routine, full size</strong><br>
            <span class="tiny">Skip the trial and buy all ${Engine.routineProducts(r).length} products outright.</span></span>
          <input type="radio" name="startWith" value="full">
        </div>
        <div class="rowbetween" style="margin-top:12px"><span class="price">${money(fullTotal)}</span><span class="tiny">${money(fullTotal * .85)}/mo if you subscribe later</span></div>
      </label>
    </div>
    <button class="btn btn--lg" id="buyNow">Add to basket &amp; check out ${ico.arrow}</button>
    <p class="tiny" style="margin-top:12px">Pay by KNET, card or cash on delivery. Either way you can review and rate everything afterwards.</p>
  </div>`;
}

function bindStartChooser(r) {
  let startWith = 'trial';
  $$('[data-buy]').forEach(box => box.addEventListener('click', () => {
    $$('[data-buy]').forEach(b => b.classList.remove('is-on'));
    box.classList.add('is-on');
    $('input', box).checked = true;
    startWith = box.dataset.buy;
  }));
  const buy = $('#buyNow');
  if (buy) buy.addEventListener('click', () => {
    Cart.addRoutine(r, startWith);
    Router.go('/checkout?kind=' + startWith);
  });
}

/* ===================== VIEW: DERMATOLOGIST'S REPORT ===================== */
Views.plan = () => {
  const st = Store.state(), u = Store.user();
  if (!st.routine || st.review.status !== 'confirmed')
    return { html: '', after() { UI.toast('Your dermatologist’s report appears once your analysis has been reviewed.', 'warn'); Router.go('/dashboard'); } };

  const r = st.report, rv = st.review, rt = st.routine;
  const ref = 'LM-R-' + String(hash(rt.createdAt + u.id) % 900000 + 100000);
  const inBoth = (id) => rt.am.some(x => x.id === id) && rt.pm.some(x => x.id === id);
  const whenLabel = (id, slot) => inBoth(id) ? 'Morning &amp; evening' : (slot === 'am' ? 'Morning' : 'Evening');

  const rxRows = (items, slot) => items.map((it, i) => {
    const p = P(it.id);
    return `<div class="rxrow">
      <span class="rxrow__n">${i + 1}</span>
      <div class="rxrow__art">${art(p, 'rx' + slot + i)}</div>
      <div class="rxrow__body">
        <div class="prod__cat">${esc(p.cat)}</div>
        <div class="prod__name" style="font-size:1.05rem">${esc(p.name)}</div>
        <p class="small" style="margin:4px 0 0">${esc(p.why)}</p>
        ${p.caution ? `<p class="tiny" style="color:var(--clay);margin:6px 0 0">${ico.info} ${esc(p.caution)}</p>` : ''}
      </div>
      <span class="rxrow__when">${whenLabel(it.id, slot)}</span>
    </div>`;
  }).join('');

  return {
    html: `<div class="view--app"><div class="wrap wrap--mid">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Sent to you by your dermatologist</span>
        <h1>Your Dermatologist’s Report</h1>
        <p class="small">Issued ${fmtDate(rv.confirmedAt)} · reference ${esc(ref)}</p>
      </div>

      <div class="doc reveal">
        <div class="doc__head">
          <div class="brand" style="margin-bottom:0"><span class="brand__mark">
            <svg viewBox="0 0 32 32" width="22" height="22"><circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>
          </span><span class="brand__word">LUMEA</span></div>
          <div class="doc__meta">
            <div><span class="tiny">Prepared for</span><strong>${esc(u.name)}</strong></div>
            <div><span class="tiny">Reviewed by</span><strong>${esc(DERM.name)}</strong>
              <span class="tiny">${esc(DERM.title)} · ${esc(DERM.reg)}</span></div>
          </div>
        </div>

        <div class="doc__body">
          <span class="card__label">Assessment</span>
          <p class="lede" style="font-size:1.02rem;margin-bottom:14px">${esc(rv.notes)}</p>
          <p class="small" style="margin-bottom:18px">${esc(r.summary)}</p>

          <div class="chips" style="margin-bottom:22px">
            <span class="pill">Skin score ${r.score}/100</span>
            <span class="pill">${esc(r.band)} profile</span>
            ${r.focus.map(f => `<span class="tag">${esc(f.t)}</span>`).join('')}
          </div>

          <hr class="hairline" style="margin:0 0 22px">

          <div class="routinehead" style="margin-bottom:14px"><span class="glyph">${ico.sun}</span>
            <h3 style="font-size:1.25rem">Morning</h3><span class="pill" style="margin-left:auto">${rt.am.length} steps</span></div>
          <div class="rx">${rxRows(rt.am, 'am')}</div>

          <div class="routinehead" style="margin:26px 0 14px"><span class="glyph">${ico.moon}</span>
            <h3 style="font-size:1.25rem">Evening</h3><span class="pill" style="margin-left:auto">${rt.pm.length} steps</span></div>
          <div class="rx">${rxRows(rt.pm, 'pm')}</div>

          <div class="notice notice--gold" style="margin-top:24px">${ico.info}<div><strong>Introduce one active at a time.</strong> Full application instructions sit on each product — open any step from <a class="link" href="#/routine">Your Skin Line</a>. Message me if anything stings, flakes or reddens.</div></div>

          <div class="doc__sign">
            <div>
              <div class="tiny">Approved and released</div>
              <strong style="font-weight:500">${esc(DERM.name)}</strong>
              <div class="tiny">${fmtDate(rv.confirmedAt)} · ${fmtTime(rv.confirmedAt)}</div>
            </div>
            <span class="verified">${ico.check} Dermatologist reviewed</span>
          </div>
        </div>
      </div>

      <div style="margin-top:26px">${startChooser(rt)}</div>

      <div class="notice">${ico.shield}<div>This report describes the visible appearance of your skin and recommends cosmetic skincare. It is not a diagnosis or a prescription for medicine. Anything persistent, painful or changing needs in-person medical care.</div></div>
    </div></div>`,
    after() { bindStartChooser(rt); }
  };
};

/* ===================== VIEW: YOUR SKIN LINE ===================== */
function prodCard(p, i, item, opts) {
  opts = opts || {};
  return `<div class="prod reveal" data-pid="${p.id}">
    <div class="prod__art">${art(p, 'l' + i)}<span class="prod__step">${i + 1}</span></div>
    <div>
      <div class="prod__cat">${esc(p.cat)}</div>
      <div class="prod__name">${esc(p.name)}</div>
      <p class="prod__why">${esc(p.why)}</p>
      <div class="prod__meta">
        ${p.ing.slice(0, 2).map(x => `<span class="tag">${esc(x)}</span>`).join('')}
        ${p.targets.filter(t => opts.concerns && opts.concerns.includes(t)).slice(0, 2).map(t => `<span class="tag" style="border-color:rgba(168,131,78,.45);color:var(--gold)">${esc(cLabel(t))}</span>`).join('')}
      </div>
    </div>
    <div class="prod__side">
      <div class="price">${money(item.size === 'trial' ? p.trialPrice : p.price)}<span class="tiny"> · ${esc(item.size === 'trial' ? p.trialSize : p.size)}</span></div>
      <div class="sizetoggle" data-size-for="${p.id}">
        <button class="${item.size === 'trial' ? 'is-on' : ''}" data-size="trial">Sample</button>
        <button class="${item.size === 'full' ? 'is-on' : ''}" data-size="full">Full size</button>
      </div>
      <div class="prod__acts">
        <button class="miniact" data-view="${p.id}" title="View details" aria-label="View ${esc(p.name)} details">${ico.eye}</button>
        <button class="miniact" data-swap="${p.id}" title="Replace product" aria-label="Replace ${esc(p.name)}">${ico.swap}</button>
        <button class="miniact" data-ask="${p.id}" title="Ask dermatologist" aria-label="Ask about ${esc(p.name)}">${ico.chat}</button>
        <button class="miniact" data-addone="${p.id}" title="Add to basket" aria-label="Add ${esc(p.name)} to basket">+</button>
      </div>
    </div>
  </div>`;
}

Views.routine = () => {
  const st = Store.state();
  if (!st.routine) return { html: '', after() { UI.toast(Journey.reason('routine'), 'warn'); Router.go('/dashboard'); } };
  const r = st.routine, concerns = st.report ? st.report.concerns : [];
  const trialTotal = Engine.routineTotal(r, 'trial'), fullTotal = Engine.routineTotal(r, 'full');
  const kitPrice = trialTotal * .75, monthly = fullTotal * .85;

  const block = (title, icon, items, offset) => `
    <div class="routinehead"><span class="glyph">${icon}</span><h3>${title}</h3>
      <span class="pill">${items.length} steps</span></div>
    <div class="prodlist" style="margin-bottom:34px">
      ${items.map((it, i) => prodCard(P(it.id), i + offset, it, { concerns })).join('')}
    </div>`;

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Your skin line</span>
        <h1>Designed for your<br>skin profile.</h1>
        <p class="lede">Seven products across morning and evening — each one selected against a specific finding in your report and signed off by your dermatologist.</p>
      </div>

      <div class="reviewbar reviewbar--done" style="margin-bottom:30px">
        <span class="dermface">${esc(initials(DERM.name))}</span>
        <div><strong style="font-weight:500">${ico.check} Dermatologist approved</strong>
          <div class="small">Approved by ${esc(DERM.name)} on ${fmtDate(st.review.confirmedAt || r.createdAt)} · routine v${r.version}</div></div>
        <a class="btn btn--sm btn--ghost" href="#/messages" style="margin-left:auto">${ico.chat} Message about my routine</a>
      </div>

      ${startChooser(r)}

      <div class="split" style="align-items:start;gap:clamp(24px,3vw,44px)">
        <div>
          ${block('Your morning routine', ico.sun, r.am, 0)}
          ${block('Your evening routine', ico.moon, r.pm, r.am.length)}

          <div class="notice notice--clay reveal">${ico.info}<div><strong>Introduce one active at a time.</strong> Start your treatment step twice weekly and build up as your skin tolerates it. If you experience stinging, peeling or a rash, stop that step and message your dermatologist.</div></div>
        </div>

        <div class="summarybox">
          <div class="card card--pad-lg reveal">
            <span class="card__label">Complete routine</span>
            <div class="sumrow"><span>${Engine.routineProducts(r).length} products, full size</span><span>${money(fullTotal)}</span></div>
            <div class="sumrow"><span>Same routine, trial sizes</span><span>${money(trialTotal)}</span></div>
            <div class="sumrow sumrow--save"><span>Trial kit bundle (−25%)</span><span>− ${money(trialTotal * .25)}</span></div>
            <div class="sumrow sumrow--total"><span>14-day trial</span><span>${money(kitPrice)}</span></div>
            <div class="btnrow" style="margin-top:20px;flex-direction:column;align-items:stretch">
              <a class="btn btn--lg btn--block" href="#/trial">Try my 2-week routine ${ico.arrow}</a>
              <button class="btn btn--ghost btn--block" id="addAllFull">Add complete routine · full size</button>
              <button class="btn btn--quiet btn--block" id="addAllTrial">Add all trial sizes to basket</button>
            </div>
            <hr class="hairline" style="margin:20px 0 16px">
            <div class="sumrow" style="border:0;padding:0"><span class="small">Monthly subscription</span><span class="small">${money(monthly)}/mo</span></div>
            <p class="tiny" style="margin-top:8px">Full sizes at 15% below individual pricing. Available after your trial.</p>
          </div>
          ${st.orders.length || st.trial ? '<div style="margin-top:14px">' + ratingsCard(Engine.routineProducts(r).map(p => p.id), { blurb: 'You’ve ordered this routine — rate each product as you use it.' }) + '</div>' : ''}
          <div class="card card--flat reveal reveal-d1" style="margin-top:14px">
            <span class="card__label">Not sure about a step?</span>
            <p class="small" style="margin-bottom:14px">Replace any product yourself, or ask ${esc(DERM.name.split(' ').slice(0, 2).join(' '))} for an alternative.</p>
            <a class="btn btn--ghost btn--sm btn--block" href="#/messages">${ico.chat} Ask a question</a>
          </div>
        </div>
      </div>
    </div></div>`,
    after() {
      const rerender = () => Router.render();
      $$('[data-view]').forEach(b => b.addEventListener('click', () => productModal(b.dataset.view)));
      $$('[data-addone]').forEach(b => b.addEventListener('click', () => {
        const pid = b.dataset.addone;
        const item = r.am.concat(r.pm).find(x => x.id === pid);
        Cart.add(pid, item ? item.size : 'trial');
      }));
      $$('[data-ask]').forEach(b => b.addEventListener('click', () => Chat.ask('I have a question about ' + P(b.dataset.ask).name + '. ', true)));
      $$('[data-size-for]').forEach(box => $$('button', box).forEach(btn => btn.addEventListener('click', () => {
        const pid = box.dataset.sizeFor, size = btn.dataset.size;
        Store.commit(s => { s.routine.am.concat(s.routine.pm).forEach(x => { if (x.id === pid) x.size = size; }); });
        rerender();
      })));
      $$('[data-swap]').forEach(b => b.addEventListener('click', () => {
        const pid = b.dataset.swap, p = P(pid);
        const inAm = r.am.some(x => x.id === pid);
        replaceModal(p.role, inAm ? 'am' : 'pm', pid, (newId) => {
          Store.commit(s => {
            ['am', 'pm'].forEach(k => s.routine[k].forEach(x => { if (x.id === pid) x.id = newId; }));
            s.routine.version += 1;
            s.messages.push({ id: uid('m'), who: 'system', text: 'You replaced ' + p.name + ' with ' + P(newId).name + '. ' + DERM.name + ' has been notified.', at: now() });
          });
          UI.toast('Step replaced · ' + P(newId).name, 'good');
          rerender();
        });
      }));
      $('#addAllFull').addEventListener('click', () => Cart.addRoutine(r, 'full'));
      $('#addAllTrial').addEventListener('click', () => Cart.addRoutine(r, 'trial'));
      bindStartChooser(r);
      bindRatings();
    }
  };
};

/* ===================== VIEW: 14-DAY TRIAL ===================== */
Views.trial = () => {
  const st = Store.state();
  if (!st.routine) return { html: '', after() { UI.toast(Journey.reason('trial'), 'warn'); Router.go('/dashboard'); } };
  if (st.trial) return trialTracker(st);

  const items = Engine.routineProducts(st.routine);
  const raw = Engine.routineTotal(st.routine, 'trial'), kit = raw * .75;
  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="trialhero viewin" style="margin-bottom:30px">
        <div class="trialhero__ring"></div>
        <div class="split">
          <div>
            <span class="pill pill--gold" style="margin-bottom:18px">Step five · your trial</span>
            <h1 style="font-size:clamp(2rem,4vw,3.1rem)">Try before you commit.</h1>
            <p class="lede" style="margin:16px 0 26px">Experience your personalised routine for 14 days before investing in the full-size line. Every product your dermatologist approved, in sample size, delivered once.</p>
            <div class="hero__proof" style="border:0;padding:0;margin-bottom:26px">
              <div class="stat"><span class="stat__num">${items.length}</span><span class="stat__lbl">Products included</span></div>
              <div class="stat"><span class="stat__num">14</span><span class="stat__lbl">Days of product</span></div>
              <div class="stat"><span class="stat__num">${money(kit)}</span><span class="stat__lbl">One-off, delivered</span></div>
            </div>
            <button class="btn btn--lg" id="startTrial">Start my 14-day trial ${ico.arrow}</button>
            <p class="tiny" style="margin-top:12px">No subscription is created. Nothing recurs unless you choose it later.</p>
          </div>
          <div class="kitgrid">
            ${items.map((p, i) => `<div class="kititem"><div class="kititem__art">${art(p, 't' + i)}</div><b>${esc(p.cat)}</b><span>${esc(p.trialSize)}</span></div>`).join('')}
          </div>
        </div>
      </div>

      <div class="grid g3" style="margin-bottom:26px">
        ${[['What’s included', items.length + ' sample-size products covering your full morning and evening routine, plus a printed routine card and a 14-day log.'],
           ['Shipping', 'Free delivery across Kuwait in 2–3 working days, tracked. GCC delivery ' + money(3) + ', 4–6 working days.'],
           ['What happens after', 'On day 14 you can convert the same routine into full sizes monthly, adjust it with your dermatologist, or simply stop.']
          ].map((c, i) => `<div class="card reveal reveal-d${i + 1}"><span class="card__label">${c[0]}</span><p class="small" style="margin:0">${c[1]}</p></div>`).join('')}
      </div>

      <div class="card card--pad-lg reveal">
        <div class="rowbetween" style="margin-bottom:18px"><span class="card__label" style="margin:0">Your trial kit</span><span class="pill pill--gold">−25% bundle</span></div>
        ${items.map(p => `<div class="sumrow"><span>${esc(p.name)} <span class="tiny">· ${esc(p.trialSize)}</span></span><span>${money(p.trialPrice)}</span></div>`).join('')}
        <div class="sumrow sumrow--save"><span>Trial kit bundle</span><span>− ${money(raw - kit)}</span></div>
        <div class="sumrow sumrow--total"><span>Total</span><span>${money(kit)}</span></div>
        <div class="btnrow" style="margin-top:20px"><button class="btn" id="startTrial2">Start my 14-day trial ${ico.arrow}</button>
        <a class="btn btn--ghost" href="#/routine">Back to my routine</a></div>
      </div>

      <div class="notice" style="margin-top:22px">${ico.info}<div>Sample sizes are intended for tolerance testing over two weeks, not as a full course of treatment. Persistent or worsening skin conditions should be assessed in person.</div></div>
    </div></div>`,
    after() {
      const go = () => {
        Cart.addRoutine(st.routine, 'trial');
        Router.go('/checkout?kind=trial');
      };
      $('#startTrial').addEventListener('click', go);
      $('#startTrial2').addEventListener('click', go);
    }
  };
};

/* --- active trial tracker --- */
function trialTracker(st) {
  const day = Trial.day(st), logs = Trial.logs(st), items = Engine.routineProducts(st.routine);
  const nextMile = Trial.milestones.find(m => m >= day && !logs[m]);
  const pct = Math.round(day / 14 * 100);

  const scale = (name, labels, current) => `
    <div class="logrow"><div class="deltabar__n" style="flex:1;font-size:.88rem;color:var(--char)">${labels.q}</div>
      <div class="scale ${name === 'improvement' || name === 'satisfaction' ? 'scale--mood' : ''}" data-scale="${name}">
        ${labels.opts.map((o, i) => `<button data-v="${i}" class="${current === i ? 'is-on' : ''}" title="${esc(o)}">${o[0] === '—' ? '—' : i}</button>`).join('')}
      </div></div>
    <div class="tiny" style="text-align:right;margin:-8px 0 6px">${labels.opts.map((o, i) => i + ' = ' + o).join(' · ')}</div>`;

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Your 14-day skin journey</span>
        <h1>Day ${day} of 14.</h1>
        <p class="lede">Log how your skin feels at each checkpoint. Your notes go to ${esc(DERM.name)} and build the before-and-after in Progress.</p>
      </div>

      <div class="card card--pad-lg" style="margin-bottom:20px">
        <div class="rowbetween" style="margin-bottom:22px">
          <div><span class="card__label" style="margin:0">Trial progress</span>
            <div class="tiny">Started ${fmtDate(st.trial.startedAt)} · order ${esc(st.trial.orderId || '—')}</div></div>
          <span class="pill pill--gold">${pct}% complete</span>
        </div>
        <div class="trackline">
          ${Trial.milestones.map(m => `
            <div class="tracknode ${logs[m] ? 'is-done' : m === day ? 'is-today' : m < day ? 'is-today' : 'is-locked'}">
              <span class="tracknode__d">${logs[m] ? ico.check : ''}</span>
              <b>Day ${m}</b><span>${logs[m] ? 'Logged' : m <= day ? 'Ready' : 'Locked'}</span>
            </div>`).join('')}
        </div>
        <div class="progressline" style="margin-top:22px"><span style="width:${pct}%"></span></div>
        <div class="btnrow" style="margin-top:18px;justify-content:space-between">
          <span class="tiny">Prototype control — advance the calendar to test the journey.</span>
          <div class="btnrow">
            <button class="btn btn--quiet btn--sm" id="advDay">Advance 1 day</button>
            <button class="btn btn--quiet btn--sm" id="advTo">Jump to day ${nextMile || 14}</button>
          </div>
        </div>
      </div>

      <div class="split" style="align-items:start">
        <div>
          ${nextMile && nextMile <= day ? `
          <div class="card card--pad-lg reveal" id="logCard">
            <span class="card__label">Day ${nextMile} check-in</span>
            <h3 style="margin-bottom:6px">How is your skin today?</h3>
            <p class="small" style="margin-bottom:18px">Two minutes. Be honest — an irritated week is useful information.</p>
            ${scale('irritation', { q: 'Any irritation, stinging or burning?', opts: ['None', 'Slight', 'Moderate', 'Significant'] })}
            ${scale('dryness', { q: 'Dryness or tightness?', opts: ['None', 'Slight', 'Moderate', 'Significant'] })}
            ${scale('breakouts', { q: 'New breakouts?', opts: ['None', 'One or two', 'Several', 'Many'] })}
            ${scale('improvement', { q: 'Visible improvement so far?', opts: ['None yet', 'A little', 'Clear', 'Marked'] })}
            ${scale('satisfaction', { q: 'Overall satisfaction with the routine?', opts: ['Poor', 'Fair', 'Good', 'Excellent'] })}
            <div class="field" style="margin-top:16px"><label>How does your skin feel?</label>
              <textarea class="textarea" id="logNote" style="min-height:82px" placeholder="Calmer along the jaw, slight tightness after the evening treatment…"></textarea></div>
            <div class="btnrow"><button class="btn" id="saveLog">Save day ${nextMile} log</button>
              <button class="btn btn--quiet" id="logIrritated">${ico.chat} Report irritation to dermatologist</button></div>
          </div>` : `
          <div class="card card--pad-lg reveal">
            <span class="card__label">Next check-in</span>
            <h3>${day >= 14 && logs[14] ? 'Your trial is complete.' : 'Day ' + (Trial.milestones.find(m => m > day) || 14) + ' check-in'}</h3>
            <p class="small" style="margin:10px 0 0">${day >= 14 && logs[14]
              ? 'All checkpoints logged. Review your before-and-after in Progress, then decide about the full routine.'
              : 'Come back on day ' + (Trial.milestones.find(m => m > day) || 14) + ' — or use the prototype control above to advance the calendar.'}</p>
            ${day >= 14 && logs[14] ? '<div class="btnrow" style="margin-top:18px"><a class="btn" href="#/subscription">Ready for the full routine ' + ico.arrow + '</a><button class="btn btn--ghost" id="reviewAll">Review my products</button><a class="btn btn--quiet" href="#/progress">See my progress</a></div>' : ''}
          </div>`}

          ${Object.keys(logs).length ? `
          <div class="card reveal" style="margin-top:16px">
            <span class="card__label">Your log</span>
            ${Object.keys(logs).sort((a, b) => b - a).map(d => {
              const l = logs[d];
              return `<div class="logcard"><h5>Day ${d} · ${fmtDate(l.at)}</h5>
                <p class="small" style="margin:0 0 6px">${l.note ? esc(l.note) : '<span style="color:var(--faint)">No note added.</span>'}</p>
                <div class="chips">
                  <span class="tag">Irritation ${['none', 'slight', 'moderate', 'significant'][l.irritation || 0]}</span>
                  <span class="tag">Dryness ${['none', 'slight', 'moderate', 'significant'][l.dryness || 0]}</span>
                  <span class="tag">Breakouts ${['none', '1–2', 'several', 'many'][l.breakouts || 0]}</span>
                  <span class="tag">Improvement ${['none yet', 'a little', 'clear', 'marked'][l.improvement || 0]}</span>
                </div></div>`;
            }).join('')}
          </div>` : ''}
        </div>

        <div>
          <div class="card reveal">
            <span class="card__label">Your kit</span>
            ${items.map((p, i) => `<div class="miniprod"><div class="miniprod__art">${art(p, 'kt' + i)}</div>
              <div><b>${esc(p.name)}</b><span>${esc(p.trialSize)} · ${esc(p.cat)}</span></div></div>`).join('')}
            <hr class="hairline" style="margin:16px 0">
            <a class="btn btn--ghost btn--sm btn--block" href="#/routine">How to use my routine</a>
          </div>
          <div style="margin-top:14px">${ratingsCard(items.map(p => p.id), { blurb: 'Rate each sample as you go — day 14 is when your ratings mean the most.' })}</div>
          <div class="card card--flat reveal reveal-d1" style="margin-top:14px">
            <span class="card__label">Something not right?</span>
            <p class="small" style="margin-bottom:14px">Stop the step that concerns you and message ${esc(DERM.name.split(' ').slice(0, 2).join(' '))}. Adjustments are normal in the first fortnight.</p>
            <a class="btn btn--sm btn--block" href="#/messages">${ico.chat} Message my dermatologist</a>
          </div>
          ${Trial.eligibleForSub(st) ? `
          <div class="card reveal reveal-d2" style="margin-top:14px;border-color:rgba(168,131,78,.4);background:rgba(168,131,78,.06)">
            <span class="card__label">Ready when you are</span>
            <h4 style="margin-bottom:8px">Ready for the full routine?</h4>
            <p class="small" style="margin-bottom:14px">Convert this exact routine to full sizes monthly, 15% below individual pricing.</p>
            <a class="btn btn--gold btn--sm btn--block" href="#/subscription">See my subscription</a>
          </div>` : ''}
        </div>
      </div>
    </div></div>`,
    after() {
      const picked = {};
      $$('[data-scale]').forEach(box => $$('button', box).forEach(b => b.addEventListener('click', () => {
        $$('button', box).forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on');
        picked[box.dataset.scale] = parseInt(b.dataset.v, 10);
      })));
      const save = $('#saveLog');
      if (save) save.addEventListener('click', () => {
        if (Object.keys(picked).length < 3) { UI.toast('Answer at least three questions so the log is useful.', 'warn'); return; }
        Trial.log(nextMile, Object.assign({ note: $('#logNote').value.trim() }, picked));
        Store.commit(s => s.history.push({ at: now(), t: 'Day ' + nextMile + ' trial log saved' }));
        if ((picked.irritation || 0) >= 2) {
          Store.commit(s => s.messages.push({ id: uid('m'), who: 'derm', text: 'I can see you logged moderate irritation on day ' + nextMile + '. Pause your treatment step for three evenings and keep cleanser, moisturiser and SPF only. Tell me how it settles.', at: now() }));
          UI.toast('Log saved — your dermatologist has replied about the irritation', 'warn', 4600);
        } else {
          UI.toast('Day ' + nextMile + ' logged', 'good');
        }
        Shell.render(); Router.render();
      });
      const irr = $('#logIrritated');
      if (irr) irr.addEventListener('click', () => Chat.ask('I’m experiencing irritation on day ' + day + ' of my trial. ', true));
      bindRatings();
      const revAll = $('#reviewAll');
      if (revAll) revAll.addEventListener('click', () => {
        const card = $('#ratingsCard');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      $('#advDay').addEventListener('click', () => { Trial.advance(1); Shell.render(); Router.render(); });
      $('#advTo').addEventListener('click', () => {
        const target = nextMile || 14;
        Store.commit(s => { if (s.trial) s.trial.demoDay = target; });
        Shell.render(); Router.render();
      });
    }
  };
}

/* ===================== CHAT ===================== */
const Chat = {
  prefill: null,
  ask(text, navigate) { this.prefill = text; if (navigate) Router.go('/messages'); else { const t = $('#chatInput'); if (t) { t.value = text; t.focus(); } } },
  reply(text) {
    const t = text.toLowerCase();
    const st = Store.state();
    const rx = [
      [/irritat|sting|burn|red|reaction|rash/, 'Thank you for telling me. Stop the treatment step for the next three evenings and keep to cleanser, moisturiser and SPF only. If you see swelling, blistering or a spreading rash, stop everything and seek in-person care today. Otherwise message me on day three of the pause.'],
      [/dry|tight|flak|peel/, 'Some dryness in the first fortnight is expected. Apply your barrier cream to slightly damp skin, and add a second layer at night. If it persists past day ten I will swap you to a richer moisturiser.'],
      [/continue|should i|keep using|carry on/, 'Yes — continue, but reduce the frequency rather than stopping altogether. Twice weekly for the treatment step, every night for the rest. Consistency matters more than intensity here.'],
      [/breakout|spot|pimple|acne|congest/, 'A short purge phase is common when a retinoid or acid is introduced. Give it until day ten before judging. If breakouts are painful, deep or leaving marks, send me a photograph and I will reconsider the active.'],
      [/improv|better|clearer|happy|love|good/, 'That is good to hear, and typical around this point. Keep the routine exactly as it is for the remainder of the trial — changing several things at once makes it impossible to know what worked.'],
      [/pregnan|breastfeed|nursing/, 'Thank you for telling me — that changes the plan. I will remove the retinal from your routine and replace it with azelaic acid, which is considered appropriate in pregnancy. Please confirm and I will release the update.'],
      [/spf|sun|sunscreen/, 'Daily SPF is the single highest-value step in your routine, particularly with pigmentation. Two fingers’ length each morning, reapplied if you are outdoors.'],
      [/photo|picture|image/, 'Thank you — I can see this clearly. The distribution looks consistent with your original report. Continue as planned and I will look again on day fourteen.'],
      [/subscri|full size|month/, 'Once you finish the fortnight, convert the routine to full sizes from your account. I would keep the same routine for at least three months before we adjust anything.']
    ];
    for (const [re, ans] of rx) if (re.test(t)) return ans;
    return 'Thank you for the update — noted on your file. Keep the routine as prescribed for now and message me at your next checkpoint' +
      (st.trial ? ' (day ' + (Trial.milestones.find(m => m > Trial.day(st)) || 14) + ')' : '') + '. If anything feels wrong before then, tell me straight away.';
  }
};

Views.messages = () => {
  const st = Store.state();
  if (!st.report) return { html: '', after() { UI.toast('Complete your analysis to open dermatologist messaging.', 'warn'); Router.go('/analyze'); } };
  if (!st.messages.length) {
    Store.commit(s => s.messages.push({ id: uid('m'), who: 'derm',
      text: 'Hello ' + st.profile.name.split(' ')[0] + ', I’m ' + DERM.name + '. I have your analysis in front of me. Send me anything you notice as you start the routine — photographs are welcome, and no question is too small.', at: now() }));
  }
  const msgs = Store.state().messages;
  const quick = ['I’m experiencing irritation.', 'Should I continue using this?', 'My skin feels very dry.', 'I noticed new breakouts.', 'My skin is improving.'];

  return {
    html: `<div class="view--app"><div class="wrap wrap--mid">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Your dermatologist</span>
        <h1>Messages</h1>
      </div>

      <div class="chatshell">
        <div class="chathead">
          <span class="dermface">${esc(initials(DERM.name))}</span>
          <div><strong style="font-weight:500">${esc(DERM.name)}</strong>
            <div class="tiny">${esc(DERM.title)} · <span class="verified">${ico.check} Verified</span></div></div>
          <span class="pill pill--sage" style="margin-left:auto"><span class="dot dot--live"></span>Online</span>
        </div>
        <div class="chatbody" id="chatBody">
          ${msgs.map(m => m.who === 'system'
            ? `<div class="msg msg--system"><div class="msg__bubble">${esc(m.text)}</div></div>`
            : `<div class="msg msg--${m.who === 'me' ? 'me' : 'them'}">
                 <div class="msg__bubble">${m.img ? `<img src="${m.img}" alt="Shared skin photograph">` : ''}${esc(m.text)}</div>
                 <span class="msg__time">${m.who === 'me' ? 'You' : DERM.name.split(' ')[0]} · ${fmtTime(m.at)}</span></div>`).join('')}
        </div>
        <div class="quickprompts">${quick.map(q => `<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
        <form class="chatform" id="chatForm">
          <button type="button" class="attachbtn" id="attachBtn" aria-label="Attach a photo">${ico.clip}</button>
          <input type="file" id="chatFile" accept="image/jpeg,image/png,image/webp" hidden>
          <textarea class="textarea" id="chatInput" rows="1" placeholder="Describe what you’re seeing…"></textarea>
          <button class="chatform__send" type="submit" aria-label="Send message">${ico.send}</button>
        </form>
      </div>

      <div class="notice notice--clay" style="margin-top:18px">${ico.info}<div><strong>For routine guidance only.</strong> If symptoms are severe, spreading quickly, or come with fever, pain or swelling — or if you have a mole that is changing — seek urgent in-person medical care rather than waiting for a reply here.</div></div>

      ${st.trial ? `<div class="card card--flat" style="margin-top:16px">
        <span class="card__label">Send a skin update</span>
        <p class="small" style="margin-bottom:14px">Share where you are in the trial so your dermatologist has context.</p>
        <button class="btn btn--ghost btn--sm" id="sendUpdate">Send day ${Trial.day(st)} update</button></div>` : ''}
    </div></div>`,
    after() {
      const body = $('#chatBody'), input = $('#chatInput'), form = $('#chatForm');
      const scroll = () => { body.scrollTop = body.scrollHeight; };
      scroll();
      if (Chat.prefill) { input.value = Chat.prefill; Chat.prefill = null; input.focus(); }
      input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });

      const push = (msg) => {
        Store.commit(s => s.messages.push(msg));
        const node = el('div', 'msg msg--' + (msg.who === 'me' ? 'me' : 'them'),
          '<div class="msg__bubble">' + (msg.img ? '<img src="' + msg.img + '" alt="Shared skin photograph">' : '') + esc(msg.text) + '</div>' +
          '<span class="msg__time">' + (msg.who === 'me' ? 'You' : DERM.name.split(' ')[0]) + ' · ' + fmtTime(msg.at) + '</span>');
        body.appendChild(node); scroll();
      };
      const dermReply = (userText) => {
        const t = el('div', 'msg msg--them', '<div class="msg__bubble typing" style="display:flex"><i></i><i></i><i></i></div>');
        body.appendChild(t); scroll();
        setTimeout(() => {
          t.remove();
          push({ id: uid('m'), who: 'derm', text: Chat.reply(userText), at: now() });
        }, 1500 + Math.random() * 900);
      };
      const send = (text, img, photoId) => {
        text = (text || '').trim();
        if (!text && !img) return;
        push({ id: uid('m'), who: 'me', text: text || 'Photo update', img: img || null, photoId: photoId || null, at: now() });
        input.value = ''; input.style.height = 'auto';
        dermReply(text);
      };

      form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
      $$('[data-q]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.q; input.focus(); }));
      $('#attachBtn').addEventListener('click', () => $('#chatFile').click());
      $('#chatFile').addEventListener('change', (e) => {
        const f = e.target.files[0]; if (!f) return;
        Img.fromFile(f).then(async d => {
          const up = await Cloud.uploadPhoto(d, 'message', null, 'Shared in messages');
          const src = up ? (await Cloud.photoUrl(up.path)) || d : d;
          send(input.value || 'Here is a photo of the area I mentioned.', src, up && up.id);
        }).catch(err => UI.toast(err.message, 'warn'));
      });
      const upd = $('#sendUpdate');
      if (upd) upd.addEventListener('click', () => {
        const st2 = Store.state(), d = Trial.day(st2), l = Trial.logs(st2)[d];
        send('Day ' + d + ' update: ' + (l && l.note ? l.note : 'sticking to the routine morning and evening, no problems so far.'));
      });
    }
  };
};

/* ===================== VIEW: DASHBOARD ===================== */
Views.dashboard = () => {
  const st = Store.state(), u = Store.user();
  const day = Trial.day(st), logs = Trial.logs(st);
  const unread = st.messages.filter(m => m.who === 'derm').length;

  const stageCta = {
    analysis: st.photo ? ['Continue analysis', '#/analyze'] : ['Start my skin analysis', '#/analyze'],
    review: st.review.status === 'none' ? ['Send report to dermatologist', '#/report'] : ['See my request', '#/report'],
    routine: ['View my routine', '#/routine'],
    trial: st.trial ? ['Open my 14-day tracker', '#/trial'] : ['Start my 14-day trial', '#/trial'],
    subscription: ['Set up my monthly routine', '#/subscription']
  };
  const stageSub = {
    profile: 'Account created ' + fmtDate(u.createdAt),
    analysis: st.report ? 'AI-assisted analysis completed ' + fmtDate(st.report.createdAt) : (st.photo ? 'Photo uploaded — concerns still needed' : 'Photo not yet uploaded'),
    review: st.review.status === 'confirmed' ? 'Confirmed by ' + DERM.name + ' on ' + fmtDate(st.review.confirmedAt)
      : st.review.status === 'pending' ? 'Request approved — ' + DERM.name + ' is preparing your report'
      : st.review.status === 'info' ? 'Your dermatologist has asked for more information'
      : 'Not yet submitted',
    routine: st.routine ? Engine.routineProducts(st.routine).length + ' products approved · v' + st.routine.version : 'Locked until dermatologist review is complete',
    trial: st.trial ? 'Day ' + day + ' of 14 · ' + Object.keys(logs).length + ' check-ins logged' : 'Available now that your routine is approved',
    subscription: st.subscription && st.subscription.status === 'active'
      ? 'Active · next shipment ' + fmtDate(st.subscription.nextShip)
      : (st.subscription && st.subscription.status === 'paused' ? 'Paused' : 'Available after your trial')
  };

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="dashhead viewin">
        <div>
          <span class="eyebrow eyebrow--gold">Your skin studio</span>
          <h1 style="font-size:clamp(1.9rem,3.6vw,2.9rem)">${greeting()}, ${esc(u.name.split(' ')[0])}.</h1>
          <p class="small">${st.report ? 'Your profile reads ' + esc(st.report.band.toLowerCase()) + ' today. ' + (st.routine ? 'Routine v' + st.routine.version + ' approved.' : 'Awaiting your dermatologist.') : 'Let’s start with a photograph of your skin.'}</p>
        </div>
        <div class="btnrow">
          ${st.report ? '<a class="btn btn--ghost btn--sm" href="#/report">View my analysis</a>' : ''}
          <a class="btn btn--sm" href="#/analyze?step=1">${st.report ? 'Re-analyse my skin' : 'Start analysis'}</a>
        </div>
      </div>

      <div class="tilerow" style="margin-bottom:20px">
        <div class="card tile reveal"><div class="tile__k">Your skin score</div>
          <div class="tile__v">${st.report ? st.report.score + '<span style="font-size:.9rem;color:var(--muted)"> / 100</span>' : '—'}</div>
          <div class="tile__s">${st.report ? esc(st.report.band) + ' profile' : 'Complete your analysis'}</div></div>
        <div class="card tile reveal reveal-d1"><div class="tile__k">Trial progress</div>
          <div class="tile__v">${st.trial ? 'Day ' + day : '—'}</div>
          <div class="tile__s">${st.trial ? Object.keys(logs).length + ' of 5 check-ins logged' : 'Not started'}</div></div>
        <div class="card tile reveal reveal-d2"><div class="tile__k">Next shipment</div>
          <div class="tile__v" style="font-size:1.15rem">${st.subscription && st.subscription.status === 'active' ? fmtDate(st.subscription.nextShip, { day: 'numeric', month: 'short' }) : st.orders.length ? 'In transit' : '—'}</div>
          <div class="tile__s">${st.subscription && st.subscription.status === 'active' ? 'Monthly routine · ' + money(st.subscription.price) : st.orders.length ? 'Order ' + esc(st.orders[0].id) : 'No shipments scheduled'}</div></div>
        <div class="card tile reveal reveal-d3"><div class="tile__k">Dermatologist</div>
          <div class="tile__v" style="font-size:1.15rem">${unread ? unread + ' message' + (unread > 1 ? 's' : '') : 'No messages'}</div>
          <div class="tile__s">${st.review.status === 'confirmed' ? 'Reviewed by ' + esc(DERM.name.split(' ').slice(0, 2).join(' ')) : 'Review pending'}</div></div>
      </div>

      <div class="dashgrid">
        <div class="card card--pad-lg reveal">
          <span class="card__label">Your journey</span>
          <ul class="journey">
            ${Journey.stages.map(s => {
              const status = Journey.status(s.key);
              const cta = status === 'now' && stageCta[s.key];
              return `<li class="${status === 'done' ? 'is-done' : status === 'now' ? 'is-now' : 'is-locked'}">
                <span class="jdot">${status === 'done' ? ico.check : ''}</span>
                <b>${s.label}</b>
                <p>${s.title}</p>
                <small>${status === 'locked' ? '<span class="lock">' + ico.lock + ' ' + esc(Journey.reason(s.key)) + '</span>' : esc(stageSub[s.key])}</small>
                ${cta ? `<a class="btn btn--sm ${s.key === 'review' ? 'btn--gold' : ''}" href="${cta[1]}">${cta[0]} ${ico.arrow}</a>` : ''}
              </li>`;
            }).join('')}
          </ul>
        </div>

        <div>
          ${st.routine ? `
          <div class="card reveal reveal-d1">
            <div class="rowbetween" style="margin-bottom:12px"><span class="card__label" style="margin:0">Current routine</span>
              <a class="link link--muted tiny" href="#/plan">Dermatologist’s report</a></div>
            ${Engine.routineProducts(st.routine).slice(0, 4).map((p, i) => `<div class="miniprod"><div class="miniprod__art">${art(p, 'db' + i)}</div>
              <div><b>${esc(p.name)}</b><span>${esc(p.cat)}</span></div></div>`).join('')}
            <hr class="hairline" style="margin:14px 0">
            <div class="rowbetween"><span class="small">${Engine.routineProducts(st.routine).length} products</span>
              <span class="price">${money(Engine.routineTotal(st.routine, 'full'))}</span></div>
            ${st.review.status !== 'confirmed' ? `<p class="tiny" style="margin:12px 0 0">Routine v${st.routine.version} stays saved to your account while your new analysis is reviewed.</p>` : ''}
          </div>` : `
          <div class="card reveal reveal-d1">
            <span class="card__label">Current routine</span>
            <p class="small" style="margin:0 0 14px">Your routine appears here once a dermatologist has reviewed your analysis.</p>
            <span class="lock">${ico.lock} Locked</span>
          </div>`}

          ${st.trial ? `
          <div class="card reveal reveal-d2" style="margin-top:14px">
            <span class="card__label">14-day tracker</span>
            <div class="progressline" style="margin:4px 0 12px"><span style="width:${Math.round(day / 14 * 100)}%"></span></div>
            <div class="rowbetween"><span class="small">Day ${day} of 14</span><a class="btn btn--ghost btn--sm" href="#/trial">Log today</a></div>
          </div>` : ''}

          <div class="card reveal reveal-d3" style="margin-top:14px">
            <span class="card__label">Recent activity</span>
            ${(st.history.slice(-4).reverse()).map(h => `<div class="miniprod" style="gap:10px"><span class="tickmark" style="background:var(--sand);color:var(--char)">${ico.check}</span>
              <div><b style="font-size:.88rem">${esc(h.t)}</b><span>${fmtDate(h.at)} · ${fmtTime(h.at)}</span></div></div>`).join('') || '<p class="small" style="margin:0">Nothing logged yet.</p>'}
          </div>
        </div>
      </div>

      <div class="notice" style="margin-top:22px">${ico.shield}<div>Lumea provides AI-assisted skincare guidance reviewed by a registered dermatologist. It does not diagnose or treat disease. For anything persistent, painful or changing, please arrange in-person medical care.</div></div>
    </div></div>`,
    after() {}
  };
};

/* ===================== VIEW: PROGRESS ===================== */
Views.progress = () => {
  const st = Store.state();
  if (!st.report) return { html: '', after() { UI.toast('Complete your analysis first.', 'warn'); Router.go('/analyze'); } };
  const photos = st.progress.slice().sort((a, b) => a.day - b.day);
  const first = photos[0], last = photos.length > 1 ? photos[photos.length - 1] : null;
  const logs = Trial.logs(st), logKeys = Object.keys(logs).sort((a, b) => a - b);
  const lastLog = logKeys.length ? logs[logKeys[logKeys.length - 1]] : null;

  /* self-reported movement — explicitly not a measured clinical outcome */
  const deltas = lastLog ? [
    ['Overall improvement', (lastLog.improvement || 0) / 3],
    ['Comfort (less irritation)', 1 - (lastLog.irritation || 0) / 3],
    ['Hydration (less tightness)', 1 - (lastLog.dryness || 0) / 3],
    ['Clarity (fewer breakouts)', 1 - (lastLog.breakouts || 0) / 3],
    ['Satisfaction with routine', (lastLog.satisfaction || 0) / 3]
  ] : [];

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Skin progress</span>
        <h1>Your skin is changing.</h1>
        <p class="lede">Compare your baseline photograph with your most recent one, and see how your own ratings have moved across the fortnight.</p>
      </div>

      <div class="split" style="align-items:start">
        <div>
          ${first && last ? `
          <div class="compare reveal" id="compare">
            <img src="${first.src}" alt="Baseline photograph">
            <img src="${last.src}" class="compare__after" id="afterImg" alt="Most recent photograph">
            <span class="compare__tag compare__tag--l">${esc(first.label.split('—')[0].trim())}</span>
            <span class="compare__tag compare__tag--r">${esc(last.label.split('—')[0].trim())}</span>
            <div class="compare__handle" id="cmpHandle"><span class="compare__grip">${ico.swap}</span></div>
          </div>
          <p class="tiny center" style="margin-top:12px">Drag to compare. Lighting and angle affect appearance — take photos in the same spot where you can.</p>`
          : `<div class="empty reveal"><h3>One photo so far</h3>
              <p>Add a second photograph — day 7 or day 14 is ideal — to unlock the before-and-after comparison.</p>
              <button class="btn" id="addPhotoEmpty">Add a progress photo</button></div>`}

          <div class="card reveal" style="margin-top:20px">
            <div class="rowbetween" style="margin-bottom:14px"><span class="card__label" style="margin:0">Your photo timeline</span>
              <span class="tiny">${photos.length} photo${photos.length === 1 ? '' : 's'}</span></div>
            <div class="photostrip">
              ${photos.map(p => `<div class="photocell"><img src="${p.src}" alt="${esc(p.label)}">
                <span class="photocell__d">Day ${p.day}</span>
                <button class="miniact" data-delphoto="${p.id}" style="position:absolute;top:6px;right:6px;width:24px;height:24px;background:var(--glass)" aria-label="Remove photo">${ico.x}</button></div>`).join('')}
              <button class="photocell photocell--add" id="addPhoto"><div style="text-align:center"><div style="font-size:1.4rem;line-height:1">+</div><span class="tiny">Add photo</span></div></button>
            </div>
            <input type="file" id="progFile" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>

        <div>
          ${deltas.length ? `
          <div class="card reveal">
            <span class="card__label">Self-reported change</span>
            <p class="small" style="margin-bottom:12px">From your day ${logKeys[logKeys.length - 1]} check-in. These are your own ratings, not clinical measurements.</p>
            ${deltas.map(d => `<div class="deltabar"><span class="deltabar__n">${d[0]}</span>
              <span class="deltabar__t"><i data-v="${Math.round(clamp(d[1], 0, 1) * 100)}"></i></span>
              <span class="deltabar__v">${Math.round(clamp(d[1], 0, 1) * 100)}%</span></div>`).join('')}
          </div>` : `
          <div class="card reveal"><span class="card__label">Self-reported change</span>
            <p class="small" style="margin:0">Log a trial check-in and your ratings will appear here.</p>
            ${st.trial ? '<a class="btn btn--ghost btn--sm" href="#/trial" style="margin-top:14px">Log a check-in</a>' : ''}</div>`}

          <div class="card reveal reveal-d1" style="margin-top:14px">
            <span class="card__label">Rate your skin today</span>
            <div class="scale scale--mood" id="rateToday" style="margin-bottom:12px">
              ${[1, 2, 3, 4, 5].map(n => `<button data-r="${n}">${n}</button>`).join('')}
            </div>
            <div class="field" style="margin:0"><label>Notes</label>
              <textarea class="textarea" id="progNote" style="min-height:74px" placeholder="Texture on the cheeks looks smoother; still some redness at the chin."></textarea></div>
            <button class="btn btn--sm btn--block" id="saveRating" style="margin-top:12px">Save today’s rating</button>
          </div>

          <div class="card reveal reveal-d2" style="margin-top:14px">
            <span class="card__label">Concerns you’re tracking</span>
            <div class="chips">${st.report.concerns.map(c => `<span class="tag">${esc(cLabel(c))}</span>`).join('')}</div>
            <hr class="hairline" style="margin:16px 0">
            <a class="btn btn--ghost btn--sm btn--block" href="#/analyze?step=2">Update my concerns</a>
            <p class="tiny" style="margin:10px 0 0">Updating your concerns produces a fresh analysis for dermatologist review.</p>
          </div>

          ${st.ratings && st.ratings.length ? '' : ''}
        </div>
      </div>

      <div class="notice notice--gold" style="margin-top:22px">${ico.info}<div>Photographic comparison is affected by lighting, angle and camera. Treat it as a guide to how your skin looks and feels, not as clinical proof of an outcome.</div></div>
    </div></div>`,
    after() {
      UI.meters();
      const cmp = $('#compare');
      if (cmp) {
        const after = $('#afterImg'), handle = $('#cmpHandle');
        const set = (x) => {
          const r = cmp.getBoundingClientRect();
          const pct = clamp((x - r.left) / r.width, 0, 1) * 100;
          after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
          handle.style.left = pct + '%';
        };
        let drag = false;
        const down = (e) => { drag = true; set((e.touches ? e.touches[0] : e).clientX); };
        const move = (e) => { if (drag) { set((e.touches ? e.touches[0] : e).clientX); if (e.cancelable) e.preventDefault(); } };
        const up = () => { drag = false; };
        cmp.addEventListener('mousedown', down); cmp.addEventListener('touchstart', down, { passive: true });
        window.addEventListener('mousemove', move); window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('mouseup', up); window.addEventListener('touchend', up);
        onCleanup(() => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); });
      }

      const file = $('#progFile');
      const trigger = () => file.click();
      const addBtn = $('#addPhoto'), addEmpty = $('#addPhotoEmpty');
      if (addBtn) addBtn.addEventListener('click', trigger);
      if (addEmpty) addEmpty.addEventListener('click', trigger);
      file.addEventListener('change', (e) => {
        const f = e.target.files[0]; if (!f) return;
        Img.fromFile(f).then(async d => {
          const day = st.trial ? Trial.day(st) : (st.progress.length + 1);
          const up = await Cloud.uploadPhoto(d, 'progress', day, 'Day ' + day);
          const src = up ? (await Cloud.photoUrl(up.path)) || d : d;
          Store.commit(s => s.progress.push({ id: (up && up.id) || uid('ph'), src, day, label: 'Day ' + day, at: now() }));
          UI.toast('Progress photo added · day ' + day, 'good');
          Router.render();
        }).catch(err => UI.toast(err.message, 'warn'));
      });
      $$('[data-delphoto]').forEach(b => b.addEventListener('click', () => {
        UI.confirm('Remove this photo?', 'It will be deleted from your progress timeline.', 'Remove', () => {
          Store.commit(s => { s.progress = s.progress.filter(p => p.id !== b.dataset.delphoto); });
          Router.render();
        }, true);
      }));
      let rating = null;
      $$('#rateToday button').forEach(b => b.addEventListener('click', () => {
        $$('#rateToday button').forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on'); rating = parseInt(b.dataset.r, 10);
      }));
      $('#saveRating').addEventListener('click', () => {
        if (!rating) { UI.toast('Choose a rating from 1 to 5 first.', 'warn'); return; }
        Store.commit(s => {
          s.ratings = s.ratings || [];
          s.ratings.push({ at: now(), rating, note: $('#progNote').value.trim() });
          s.history.push({ at: now(), t: 'Skin rated ' + rating + '/5' });
        });
        UI.toast('Rating saved', 'good');
        $('#progNote').value = '';
      });
    }
  };
};

/* ===================== VIEW: SUBSCRIPTION ===================== */
Views.subscription = () => {
  const st = Store.state();
  if (!st.routine) return { html: '', after() { UI.toast(Journey.reason('routine'), 'warn'); Router.go('/dashboard'); } };
  const items = Engine.routineProducts(st.routine);
  const full = Engine.routineTotal(st.routine, 'full'), monthly = full * .85;
  const sub = st.subscription;

  if (sub && sub.status !== 'cancelled') {
    return {
      html: `<div class="view--app"><div class="wrap wrap--mid">
        <div class="pagehead viewin"><span class="eyebrow eyebrow--gold">Monthly routine</span>
          <h1>Your subscription</h1></div>

        <div class="subcard viewin">
          <div class="subcard__head rowbetween">
            <div><span class="pill ${sub.status === 'active' ? 'pill--sage' : 'pill--clay'}">${sub.status === 'active' ? '<span class="dot dot--live"></span>Active' : 'Paused'}</span>
              <h3 style="margin-top:12px">Your ${items.length}-step routine, full size</h3>
              <p class="small" style="margin:6px 0 0">Started ${fmtDate(sub.startedAt)} · routine v${st.routine.version} approved by ${esc(DERM.name)}</p></div>
            <div style="text-align:right"><div class="price" style="font-size:1.5rem">${money(sub.price)}</div><div class="tiny">per ${sub.frequency === 60 ? '2 months' : 'month'}</div></div>
          </div>
          <div class="subcard__body">
            <dl class="kv">
              <dt>Next shipment</dt><dd>${sub.skipNext ? '<s>' + fmtDate(sub.nextShip) + '</s> — skipped, next on ' + fmtDate(sub.nextShip + sub.frequency * DAY) : fmtDate(sub.nextShip)}</dd>
              <dt>Delivery frequency</dt><dd>Every ${sub.frequency} days</dd>
              <dt>Payment method</dt><dd>${esc(sub.payment || 'KNET · demo')}</dd>
              <dt>Delivery address</dt><dd>${sub.address ? esc(sub.address) : 'Not set'}</dd>
              <dt>Products</dt><dd>${items.length} full-size items</dd>
            </dl>
            <hr class="hairline" style="margin:20px 0">
            <span class="card__label">In every shipment</span>
            ${items.map((p, i) => `<div class="miniprod"><div class="miniprod__art">${art(p, 's' + i)}</div>
              <div><b>${esc(p.name)}</b><span>${esc(p.size)} · ${money(p.price)}</span></div></div>`).join('')}
            <div class="subctrl">
              <a class="btn btn--ghost btn--sm" href="#/routine">Edit my routine</a>
              <button class="btn btn--ghost btn--sm" id="skipBtn">${sub.skipNext ? 'Un-skip next shipment' : 'Skip next shipment'}</button>
              <button class="btn btn--ghost btn--sm" id="freqBtn">Change frequency</button>
              <button class="btn btn--ghost btn--sm" id="pauseBtn">${sub.status === 'paused' ? 'Resume subscription' : 'Pause subscription'}</button>
              <button class="btn btn--quiet btn--sm" id="cancelBtn" style="--fg:var(--clay)">Cancel subscription</button>
            </div>
          </div>
        </div>

        <div class="notice" style="margin-top:20px">${ico.check}<div><strong>Your routine is saved to your account permanently.</strong> Cancelling a subscription never removes your approved routine, analysis history or dermatologist conversations.</div></div>
      </div></div>`,
      after() {
        $('#skipBtn').addEventListener('click', () => {
          Store.commit(s => { s.subscription.skipNext = !s.subscription.skipNext; });
          UI.toast(Store.state().subscription.skipNext ? 'Next shipment skipped' : 'Next shipment restored', 'good');
          Router.render();
        });
        $('#pauseBtn').addEventListener('click', () => {
          const paused = st.subscription.status === 'paused';
          Store.commit(s => { s.subscription.status = paused ? 'active' : 'paused'; });
          UI.toast(paused ? 'Subscription resumed' : 'Subscription paused — nothing will ship', 'good');
          Shell.render(); Router.render();
        });
        $('#freqBtn').addEventListener('click', () => UI.modal(`<h3>Delivery frequency</h3>
          <p class="small">How often should your routine arrive?</p>
          <div class="stack" style="margin-top:18px">
            ${[[30, 'Every month', 'Standard for a full routine in daily use.'], [45, 'Every 6 weeks', 'If you use less than a full pump daily.'], [60, 'Every 2 months', 'For lighter use or shared products.']].map(f =>
              `<label class="pickbox ${st.subscription.frequency === f[0] ? 'is-on' : ''}"><div class="pickbox__top">
                <span><strong style="font-weight:500">${f[1]}</strong><br><span class="tiny">${f[2]}</span></span>
                <input type="radio" name="freq" value="${f[0]}" ${st.subscription.frequency === f[0] ? 'checked' : ''}></div></label>`).join('')}
          </div>
          <button class="btn btn--block" data-ok style="margin-top:18px">Save frequency</button>`, {
          after(m) {
            $('[data-ok]', m).addEventListener('click', () => {
              const v = parseInt(($('input[name=freq]:checked', m) || {}).value || 30, 10);
              Store.commit(s => { s.subscription.frequency = v; s.subscription.nextShip = now() + v * DAY; });
              UI.closeModal(); UI.toast('Frequency updated', 'good'); Router.render();
            });
          }
        }));
        $('#cancelBtn').addEventListener('click', () => UI.confirm('Cancel your subscription?',
          'Nothing further will ship. Your approved routine, analysis and messages stay on your account, and you can restart at any time.',
          'Cancel subscription', () => {
            Store.commit(s => { s.subscription.status = 'cancelled'; s.history.push({ at: now(), t: 'Subscription cancelled' }); });
            UI.toast('Subscription cancelled. Your routine is still saved.', 'warn', 4200);
            Shell.render(); Router.go('/dashboard');
          }, true));
      }
    };
  }

  const eligible = Trial.eligibleForSub(st);
  return {
    html: `<div class="view--app"><div class="wrap wrap--mid">
      <div class="pagehead viewin">
        <span class="eyebrow eyebrow--gold">Monthly routine</span>
        <h1>${eligible ? 'Ready for the full routine?' : 'Your monthly routine'}</h1>
        <p class="lede">${eligible
          ? 'Convert the exact routine you trialled into full sizes, delivered monthly at 15% below individual pricing.'
          : 'Subscriptions open once you have started your 14-day trial — we would rather you tested the routine first.'}</p>
      </div>

      ${!eligible ? `<div class="card card--pad-lg viewin" style="margin-bottom:20px">
        <span class="lock">${ico.lock} ${st.trial ? 'Available from day 7 of your trial' : 'Trial not started'}</span>
        <h3 style="margin:12px 0 10px">Try it first.</h3>
        <p class="small" style="margin-bottom:18px">${st.trial ? 'You are on day ' + Trial.day(st) + '. Log a few check-ins and this unlocks — or advance the calendar from the tracker.' : 'Start with the 14-day sample kit. If the routine suits you, converting takes two clicks.'}</p>
        <a class="btn" href="#/trial">${st.trial ? 'Open my tracker' : 'Start my 14-day trial'} ${ico.arrow}</a>
      </div>` : ''}

      <div class="subcard viewin">
        <div class="subcard__head">
          <span class="card__label" style="margin:0">Your monthly routine</span>
          <div class="rowbetween" style="margin-top:10px">
            <h3>${items.length} full-size products</h3>
            <div style="text-align:right"><div class="price" style="font-size:1.5rem">${money(monthly)}</div><div class="tiny">per month, delivery included</div></div>
          </div>
        </div>
        <div class="subcard__body">
          ${items.map((p, i) => `<div class="miniprod"><div class="miniprod__art">${art(p, 'q' + i)}</div>
            <div style="flex:1"><b>${esc(p.name)}</b><span>${esc(p.size)}</span></div>
            <span class="price" style="font-size:.94rem">${money(p.price)}</span></div>`).join('')}
          <hr class="hairline" style="margin:16px 0">
          <div class="sumrow"><span>Individual pricing</span><span>${money(full)}</span></div>
          <div class="sumrow sumrow--save"><span>Subscriber saving (15%)</span><span>− ${money(full * .15)}</span></div>
          <div class="sumrow"><span>Delivery</span><span>Included</span></div>
          <div class="sumrow sumrow--total"><span>Monthly total</span><span>${money(monthly)}</span></div>

          <div class="grid g3" style="margin:20px 0 4px">
            ${[['Skip anytime', 'Skip a single month without cancelling.'], ['Pause anytime', 'Freeze deliveries and keep your routine.'], ['Edit freely', 'Swap products or re-analyse whenever your skin changes.']]
              .map(c => `<div class="card card--flat" style="padding:16px"><strong style="font-weight:500;font-size:.9rem">${c[0]}</strong><p class="tiny" style="margin:5px 0 0">${c[1]}</p></div>`).join('')}
          </div>

          <button class="btn btn--lg btn--block ${eligible ? '' : 'is-disabled'}" id="startSub" style="margin-top:18px">Start my monthly routine ${ico.arrow}</button>
          <p class="tiny center" style="margin-top:12px">No payment is taken in this prototype. Cancel in two clicks from your account.</p>
        </div>
      </div>
    </div></div>`,
    after() {
      const btn = $('#startSub');
      if (!eligible) { btn.addEventListener('click', () => UI.toast('Start your 14-day trial first — subscriptions open from day 7.', 'warn')); return; }
      btn.addEventListener('click', () => {
        Store.commit(s => {
          s.subscription = { status: 'active', startedAt: now(), frequency: 30, nextShip: now() + 30 * DAY,
            price: monthly, skipNext: false, payment: 'KNET · demo', address: s.profile.address || 'Not set', routineVersion: s.routine.version };
          s.history.push({ at: now(), t: 'Monthly subscription started' });
          s.orders.unshift({ id: 'LM' + String(hash(uid()) % 900000 + 100000), at: now(), items: Engine.routineProducts(s.routine).map(p => ({ id: p.id, size: 'full', qty: 1 })),
            total: monthly, ship: 0, kit: 0, kind: 'subscription', status: 'Processing', eta: now() + 3 * DAY, details: {} });
        });
        Shell.render();
        Router.render();
        UI.modal(`<div class="center"><div class="orderdone__seal">${ico.check}</div>
          <span class="eyebrow">Subscription confirmed</span>
          <h3>Your routine is now permanent.</h3>
          <p class="small">Your ${items.length}-step routine ships every 30 days. Your first full-size delivery arrives in 2–3 working days, and your routine is saved to your account.</p>
          <div class="btnrow" style="justify-content:center;margin-top:20px">
            <a class="btn btn--sm btn--gold" href="#/subscription" data-close>Manage subscription</a>
            <a class="btn btn--ghost btn--sm" href="#/dashboard" data-close>Dashboard</a></div></div>`);
      });
    }
  };
};

/* ===================== VIEW: BASKET ===================== */
Views.basket = () => {
  const st = Store.state(), t = Cart.totals(), g = Cart.groups();
  const line = (it, idx) => {
    const p = P(it.id), unit = it.size === 'trial' ? p.trialPrice : p.price;
    return `<div class="bline">
      <div class="bline__art">${art(p, 'b' + idx)}</div>
      <div><b>${esc(p.name)}</b>
        <div class="bline__sub">${esc(it.size === 'trial' ? 'Trial size · ' + p.trialSize : 'Full size · ' + p.size)} · ${money(unit)} each</div>
        <div class="btnrow" style="margin-top:8px;gap:8px">
          <div class="qty"><button data-dec="${idx}" aria-label="Decrease quantity">−</button><span>${it.qty}</span><button data-inc="${idx}" aria-label="Increase quantity">+</button></div>
          <button class="btn btn--quiet btn--sm" data-save="${idx}">Save for later</button>
          <button class="btn btn--quiet btn--sm" data-del="${idx}" style="--fg:var(--clay)">Remove</button>
        </div></div>
      <div class="price">${money(unit * it.qty)}</div></div>`;
  };
  const idxOf = (it) => st.cart.indexOf(it);

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin"><span class="eyebrow eyebrow--gold">Basket</span><h1>Your basket</h1></div>

      ${!st.cart.length ? `<div class="empty viewin"><h3>Your basket is empty</h3>
        <p>${st.routine ? 'Add your dermatologist-approved routine — in trial sizes for two weeks, or full sizes.' : 'Complete your skin analysis and a personalised routine will appear here.'}</p>
        <div class="btnrow" style="justify-content:center">
          ${st.routine ? '<a class="btn" href="#/trial">Start my 14-day trial</a><a class="btn btn--ghost" href="#/routine">View my routine</a>'
            : '<a class="btn" href="#/analyze">Analyse my skin</a>'}</div></div>`
      : `<div class="basketgrid">
        <div>
          ${g.trial.length ? `<div class="basketgroup viewin">
            <div class="basketgroup__head"><span class="pill pill--gold">14-day trial</span>
              <h4>Sample sizes</h4>${t.units >= 4 ? '<span class="tiny" style="margin-left:auto;color:var(--sage)">Bundle discount applied</span>' : ''}</div>
            ${g.trial.map(it => line(it, idxOf(it))).join('')}
          </div>` : ''}
          ${g.full.length ? `<div class="basketgroup viewin">
            <div class="basketgroup__head"><span class="pill">Full size</span><h4>Full-size routine</h4></div>
            ${g.full.map(it => line(it, idxOf(it))).join('')}
          </div>` : ''}
          ${st.saved.length ? `<div class="card card--flat" style="margin-top:18px">
            <span class="card__label">Saved for later</span>
            ${st.saved.map((it, i) => `<div class="miniprod"><div class="miniprod__art">${art(P(it.id), 'sv' + i)}</div>
              <div style="flex:1"><b>${esc(P(it.id).name)}</b><span>${esc(it.size === 'trial' ? 'Trial size' : 'Full size')}</span></div>
              <button class="btn btn--ghost btn--sm" data-unsave="${i}">Move to basket</button></div>`).join('')}
          </div>` : ''}
        </div>

        <div class="summarybox">
          <div class="card card--pad-lg viewin">
            <span class="card__label">Order summary</span>
            ${t.rawTrial ? `<div class="sumrow"><span>Trial sizes (${t.units})</span><span>${money(t.rawTrial)}</span></div>` : ''}
            ${t.kit ? `<div class="sumrow sumrow--save"><span>Trial kit bundle (−25%)</span><span>− ${money(t.kit)}</span></div>` : ''}
            ${t.rawFull ? `<div class="sumrow"><span>Full-size products</span><span>${money(t.rawFull)}</span></div>` : ''}
            <div class="sumrow"><span>Subtotal</span><span>${money(t.sub)}</span></div>
            <div class="sumrow"><span>Shipping</span><span>${t.ship ? money(t.ship) : 'Free'}</span></div>
            <div class="sumrow sumrow--total"><span>Total</span><span>${money(t.total)}</span></div>
            ${t.ship ? `<p class="tiny" style="margin-top:10px">Free delivery on orders over ${money(25)}.</p>` : ''}
            <a class="btn btn--lg btn--block" href="#/checkout" style="margin-top:18px">Proceed to checkout ${ico.arrow}</a>
            <div class="securebar">${ico.shield} Secure checkout · prototype, no payment taken</div>
            <button class="btn btn--quiet btn--sm btn--block" id="clearCart" style="margin-top:10px">Empty basket</button>
          </div>
        </div>
      </div>`}
    </div></div>`,
    after() {
      const re = () => Router.render();
      $$('[data-inc]').forEach(b => b.addEventListener('click', () => { Cart.setQty(+b.dataset.inc, st.cart[+b.dataset.inc].qty + 1); re(); }));
      $$('[data-dec]').forEach(b => b.addEventListener('click', () => { Cart.setQty(+b.dataset.dec, st.cart[+b.dataset.dec].qty - 1); re(); }));
      $$('[data-del]').forEach(b => b.addEventListener('click', () => { Cart.remove(+b.dataset.del); re(); }));
      $$('[data-save]').forEach(b => b.addEventListener('click', () => { Cart.saveForLater(+b.dataset.save); re(); }));
      $$('[data-unsave]').forEach(b => b.addEventListener('click', () => { Cart.unsave(+b.dataset.unsave); re(); }));
      const cc = $('#clearCart');
      if (cc) cc.addEventListener('click', () => UI.confirm('Empty your basket?', 'Everything in the basket will be removed.', 'Empty basket', () => { Cart.clear(); re(); }, true));
    }
  };
};

/* ===================== VIEW: CHECKOUT ===================== */
Views.checkout = () => {
  const st = Store.state(), t = Cart.totals(), g = Cart.groups();
  if (!st.cart.length) return { html: '', after() { UI.toast('Your basket is empty.', 'warn'); Router.go('/basket'); } };
  const a = st.profile.address || {};

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin"><span class="eyebrow eyebrow--gold">Checkout</span><h1>Almost there.</h1>
        <p class="small">${g.trial.length && !g.full.length ? 'You are ordering the 14-day trial kit. Nothing recurs.' : 'One-off order. No subscription is created.'}</p></div>

      <div class="basketgrid">
        <form id="coForm" novalidate>
          <div class="card card--pad-lg" style="margin-bottom:16px">
            <span class="card__label">Delivery information</span>
            <div class="fieldrow">
              <div class="field"><label for="co-name">Full name</label><input class="input" id="co-name" value="${esc(a.name || st.profile.name)}" autocomplete="name"><span class="err" data-err="name"></span></div>
              <div class="field"><label for="co-phone">Mobile number</label><input class="input" id="co-phone" placeholder="+965 0000 0000" value="${esc(a.phone || st.profile.phone)}" autocomplete="tel"><span class="err" data-err="phone"></span></div>
            </div>
            <div class="field"><label for="co-email">Email</label><input class="input" type="email" id="co-email" value="${esc(st.profile.email)}" autocomplete="email"><span class="err" data-err="email"></span></div>
            <div class="field"><label for="co-addr">Address</label><input class="input" id="co-addr" placeholder="Block, street, building, floor, flat" value="${esc(a.line || '')}" autocomplete="street-address"><span class="err" data-err="addr"></span></div>
            <div class="fieldrow">
              <div class="field"><label for="co-area">Area</label><input class="input" id="co-area" placeholder="Salmiya" value="${esc(a.area || '')}"><span class="err" data-err="area"></span></div>
              <div class="field"><label for="co-gov">Governorate</label>
                <select class="select" id="co-gov">${['Al Asimah', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer', 'Outside Kuwait'].map(x => `<option ${a.gov === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            </div>
            <label class="check" style="margin-top:6px"><input type="checkbox" id="co-savead" checked><span>Save this address to my account</span></label>
          </div>

          <div class="card card--pad-lg" style="margin-bottom:16px">
            <span class="card__label">Payment information</span>
            <div class="stack" style="margin-bottom:16px">
              ${[['knet', 'KNET', 'Redirects to your bank. Most common in Kuwait.'], ['card', 'Visa or Mastercard', 'Debit or credit card.'], ['cod', 'Cash on delivery', 'Pay the courier. ' + money(1.5) + ' handling fee.']].map((m, i) =>
                `<label class="pickbox ${i === 0 ? 'is-on' : ''}" data-pay="${m[0]}"><div class="pickbox__top">
                  <span><strong style="font-weight:500">${m[1]}</strong><br><span class="tiny">${m[2]}</span></span>
                  <input type="radio" name="pay" value="${m[0]}" ${i === 0 ? 'checked' : ''}></div></label>`).join('')}
            </div>
            <div id="cardFields" hidden>
              <div class="field"><label for="co-cardname">Name on card</label><input class="input" id="co-cardname" autocomplete="cc-name"><span class="err" data-err="cardname"></span></div>
              <div class="field"><label for="co-card">Card number</label><input class="input" id="co-card" inputmode="numeric" placeholder="0000 0000 0000 0000" autocomplete="cc-number"><span class="err" data-err="card"></span></div>
              <div class="fieldrow">
                <div class="field"><label for="co-exp">Expiry</label><input class="input" id="co-exp" placeholder="MM/YY" inputmode="numeric" autocomplete="cc-exp"><span class="err" data-err="exp"></span></div>
                <div class="field"><label for="co-cvc">CVC</label><input class="input" id="co-cvc" placeholder="123" inputmode="numeric" autocomplete="cc-csc"><span class="err" data-err="cvc"></span></div>
              </div>
            </div>
            <div class="notice notice--gold">${ico.shield}<div><strong>Prototype checkout.</strong> No payment is processed and no card details are transmitted anywhere — this form validates format only. Please don’t enter a real card number.</div></div>
          </div>

          <button class="btn btn--lg btn--block" type="submit">Place order · ${money(t.total)}</button>
          <div class="err" data-err="form" style="text-align:center;margin-top:12px"></div>
          <div class="securebar" style="justify-content:center">${ico.lock} Secure checkout</div>
        </form>

        <div class="summarybox">
          <div class="card card--pad-lg">
            <span class="card__label">Order summary</span>
            ${st.cart.map((it, i) => { const p = P(it.id);
              return `<div class="miniprod"><div class="miniprod__art">${art(p, 'co' + i)}</div>
                <div style="flex:1"><b>${esc(p.name)}</b><span>${esc(it.size === 'trial' ? p.trialSize + ' trial' : p.size)} × ${it.qty}</span></div>
                <span class="price" style="font-size:.9rem">${money((it.size === 'trial' ? p.trialPrice : p.price) * it.qty)}</span></div>`;
            }).join('')}
            <hr class="hairline" style="margin:16px 0 6px">
            ${t.kit ? `<div class="sumrow sumrow--save"><span>Trial kit bundle</span><span>− ${money(t.kit)}</span></div>` : ''}
            <div class="sumrow"><span>Subtotal</span><span>${money(t.sub)}</span></div>
            <div class="sumrow"><span>Shipping</span><span>${t.ship ? money(t.ship) : 'Free'}</span></div>
            <div class="sumrow" id="feeRow" hidden><span>Cash handling</span><span>${money(1.5)}</span></div>
            <div class="sumrow sumrow--total"><span>Total</span><span id="coTotal">${money(t.total)}</span></div>
            <p class="tiny" style="margin-top:12px">Delivered in 2–3 working days, tracked. ${g.trial.length ? 'Your 14-day tracker opens as soon as the order is placed.' : ''}</p>
          </div>
        </div>
      </div>
    </div></div>`,
    after() {
      const form = $('#coForm'), cardFields = $('#cardFields'), feeRow = $('#feeRow'), totalEl = $('#coTotal');
      let pay = 'knet';
      const refreshTotal = () => {
        const fee = pay === 'cod' ? 1.5 : 0;
        feeRow.hidden = !fee;
        totalEl.textContent = money(t.total + fee);
      };
      $$('[data-pay]').forEach(box => box.addEventListener('click', () => {
        $$('[data-pay]').forEach(b => b.classList.remove('is-on'));
        box.classList.add('is-on');
        $('input', box).checked = true;
        pay = box.dataset.pay;
        cardFields.hidden = pay !== 'card';
        refreshTotal();
      }));

      const card = $('#co-card');
      card.addEventListener('input', () => {
        const d = card.value.replace(/\D/g, '').slice(0, 16);
        card.value = d.replace(/(.{4})/g, '$1 ').trim();
      });
      const exp = $('#co-exp');
      exp.addEventListener('input', () => {
        let d = exp.value.replace(/\D/g, '').slice(0, 4);
        exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      });

      const fail = (k, msg) => { const f = $('[data-err="' + k + '"]', form); if (!f) return; f.textContent = msg; f.style.display = 'block'; if (f.closest('.field')) f.closest('.field').classList.add('has-error'); };
      const clear = () => { $$('.field', form).forEach(f => f.classList.remove('has-error')); $$('.err', form).forEach(e => e.textContent = ''); };

      form.addEventListener('submit', (e) => {
        e.preventDefault(); clear();
        const v = (id) => $(id).value.trim();
        let bad = false;
        if (v('#co-name').length < 2) { fail('name', 'Enter the name for delivery.'); bad = true; }
        if (!/^[\d+\s()-]{8,}$/.test(v('#co-phone'))) { fail('phone', 'Enter a contact number.'); bad = true; }
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v('#co-email'))) { fail('email', 'Enter a valid email address.'); bad = true; }
        if (v('#co-addr').length < 6) { fail('addr', 'Enter your delivery address.'); bad = true; }
        if (v('#co-area').length < 2) { fail('area', 'Enter your area.'); bad = true; }
        if (pay === 'card') {
          if (v('#co-cardname').length < 2) { fail('cardname', 'Enter the name on the card.'); bad = true; }
          if (v('#co-card').replace(/\s/g, '').length !== 16) { fail('card', 'Enter the 16 digits of your card.'); bad = true; }
          if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v('#co-exp'))) { fail('exp', 'Use MM/YY.'); bad = true; }
          if (!/^\d{3,4}$/.test(v('#co-cvc'))) { fail('cvc', '3 or 4 digits.'); bad = true; }
        }
        if (bad) { fail('form', 'Please correct the highlighted fields.'); return; }

        const address = { name: v('#co-name'), phone: v('#co-phone'), line: v('#co-addr'), area: v('#co-area'), gov: $('#co-gov').value };
        if ($('#co-savead').checked) Store.commit(s => { s.profile.address = address; s.profile.phone = address.phone; });
        const order = Cart.placeOrder({ address, payment: pay === 'knet' ? 'KNET' : pay === 'card' ? 'Card ending ' + v('#co-card').slice(-4) : 'Cash on delivery', fee: pay === 'cod' ? 1.5 : 0 });
        Shell.render();
        UI.curtain(() => Router.go('/order?id=' + order.id));
      });
      refreshTotal();
    }
  };
};

/* ===================== VIEW: ORDER CONFIRMATION ===================== */
Views.order = () => {
  const st = Store.state(), q = Router.query();
  const order = st.orders.find(o => o.id === q.id) || st.orders[0];
  if (!order) return { html: '', after() { Router.go('/dashboard'); } };
  const isTrial = order.kind === 'trial' || order.kind === 'mixed';

  return {
    html: `<div class="view--app"><div class="wrap wrap--narrow">
      <div class="orderdone viewin">
        <div class="orderdone__seal">${ico.check}</div>
        <span class="eyebrow eyebrow--gold">Receipt · ${esc(order.id)}</span>
        <h1 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">${isTrial ? 'Your 14-day trial is on its way.' : 'Order confirmed.'}</h1>
        <p class="lede" style="margin:14px auto 0;text-align:center">${isTrial
          ? 'Your sample kit ships within 24 hours. Your tracker is open now, so you can start logging from day one.'
          : 'Your full-size products ship within 24 hours, tracked.'}</p>
      </div>

      <div class="card card--pad-lg" style="margin-top:30px">
        <div class="rowbetween" style="margin-bottom:16px">
          <span class="card__label" style="margin:0">Receipt</span>
          <span class="pill pill--sage">${esc(order.status)}</span>
        </div>
        ${order.items.map((it, i) => { const p = P(it.id);
          return `<div class="miniprod"><div class="miniprod__art">${art(p, 'or' + i)}</div>
            <div style="flex:1"><b>${esc(p.name)}</b><span>${esc(it.size === 'trial' ? p.trialSize + ' trial size' : p.size)} × ${it.qty}</span></div>
            <span class="price" style="font-size:.9rem">${money((it.size === 'trial' ? p.trialPrice : p.price) * it.qty)}</span></div>`;
        }).join('')}
        <hr class="hairline" style="margin:16px 0 6px">
        ${order.kit ? `<div class="sumrow sumrow--save"><span>Trial kit bundle</span><span>− ${money(order.kit)}</span></div>` : ''}
        <div class="sumrow"><span>Shipping</span><span>${order.ship ? money(order.ship) : 'Free'}</span></div>
        <div class="sumrow sumrow--total"><span>Paid</span><span>${money(order.total + ((order.details && order.details.fee) || 0))}</span></div>
        <hr class="hairline" style="margin:18px 0">
        <dl class="kv">
          <dt>Delivering to</dt><dd>${order.details && order.details.address ? esc(order.details.address.name) + ', ' + esc(order.details.address.line) + ', ' + esc(order.details.address.area) + ', ' + esc(order.details.address.gov) : 'Saved address'}</dd>
          <dt>Payment</dt><dd>${esc((order.details && order.details.payment) || 'Demo')}${order.details && order.details.fee ? ' · incl. ' + money(order.details.fee) + ' cash handling' : ''}</dd>
          <dt>Arriving</dt><dd><strong style="font-weight:500">${fmtDate(order.eta, { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
            <div class="tiny">Between ${fmtDate(order.eta, { day: 'numeric', month: 'short' })} and ${fmtDate(order.eta + DAY, { day: 'numeric', month: 'short' })}, 9am–9pm. You’ll get a text from the courier on the day.</div></dd>
          <dt>Order placed</dt><dd>${fmtDate(order.at)} · ${fmtTime(order.at)}</dd>
        </dl>
        <div class="btnrow" style="margin-top:22px">
          ${isTrial ? '<a class="btn" href="#/trial">Open my 14-day tracker ' + ico.arrow + '</a>' : '<a class="btn" href="#/dashboard">Back to dashboard</a>'}
          <a class="btn btn--ghost" href="#/plan">My dermatologist’s report</a>
        </div>
      </div>

      <div class="card card--pad-lg" style="margin-top:20px;text-align:center;background:linear-gradient(160deg,rgba(168,131,78,.08),var(--surface))">
        <h3 style="margin-bottom:10px">Thank you for choosing Lumea.</h3>
        <p class="small" style="max-width:52ch;margin:0 auto">Your order is saved to your account — you’ll find it any time under Account → Order history. ${isTrial ? 'Your tracker opens today, so you can log how your skin feels from day one.' : 'Your routine is saved permanently, and you can convert it to a monthly delivery whenever you like.'}</p>
      </div>

      <div style="margin-top:20px">${feedbackCard(st.routine, {
        pad: true,
        title: 'How did we do?',
        blurb: 'Rate the products, your dermatologist, or the whole Lumea experience. You can come back to this any time from your account.'
      })}</div>

      <div class="notice" style="margin-top:20px">${ico.info}<div>Prototype order — nothing ships and no payment was taken. The order, trial and tracker states are stored in this browser so you can complete the journey.</div></div>
    </div></div>`,
    after() { bindFeedback(); }
  };
};

/* ===================== VIEW: ACCOUNT ===================== */
Views.account = () => {
  const st = Store.state(), u = Store.user();
  const q = Router.query();
  const tab = q.tab || 'personal';
  const tabs = [['personal', 'Personal information'], ['skin', 'Skin profile'], ['routine', 'Saved routine'], ['orders', 'Order history'],
    ['sub', 'Subscription'], ['pay', 'Payment methods'], ['reviews', 'Ratings & reviews'],
    ['msgs', 'Dermatologist conversations'], ['photos', 'Progress photos'],
    ['notif', 'Notifications'], ['privacy', 'Privacy & data']];

  const panels = {
    personal: () => `
      <div class="card card--pad-lg">
        <span class="card__label">Personal information</span>
        <form id="profForm">
          <div class="fieldrow">
            <div class="field"><label for="pf-name">Full name</label><input class="input" id="pf-name" value="${esc(u.name)}"></div>
            <div class="field"><label for="pf-age">Age</label><input class="input" id="pf-age" inputmode="numeric" placeholder="Optional" value="${esc(st.profile.age)}"></div>
          </div>
          <div class="fieldrow">
            <div class="field"><label for="pf-email">Email</label>
              <input class="input" type="email" id="pf-email" value="${esc(u.email)}" disabled>
              <div class="hint">Your sign-in address. Changing it needs a fresh confirmation email — ask us and we’ll move it across.</div></div>
            <div class="field"><label for="pf-phone">Mobile</label><input class="input" id="pf-phone" value="${esc(st.profile.phone)}" placeholder="+965 0000 0000"></div>
          </div>
          <div class="field"><label for="pf-goals">Skin goals</label><textarea class="textarea" id="pf-goals" style="min-height:80px">${esc(st.profile.goals)}</textarea></div>
          <div class="field"><label for="pf-addr">Delivery address</label><input class="input" id="pf-addr" placeholder="Block, street, building" value="${esc((st.profile.address || {}).line || '')}"></div>
          <button class="btn" type="submit">Save changes</button>
        </form>
      </div>`,
    skin: () => st.report ? `
      <div class="card card--pad-lg">
        <div class="rowbetween" style="margin-bottom:18px"><span class="card__label" style="margin:0">Skin profile</span>
          <span class="pill pill--gold">Score ${st.report.score} · ${esc(st.report.band)}</span></div>
        <dl class="kv">
          <dt>Last analysis</dt><dd>${fmtDate(st.report.createdAt)} · ${fmtTime(st.report.createdAt)}</dd>
          <dt>Review status</dt><dd>${st.review.status === 'confirmed' ? 'Confirmed by ' + esc(DERM.name) + ' on ' + fmtDate(st.review.confirmedAt) : esc(st.review.status)}</dd>
          <dt>Concerns</dt><dd>${st.report.concerns.map(cLabel).join(', ')}</dd>
          <dt>Priorities</dt><dd>${st.priorities.length ? st.priorities.map((p, i) => (i + 1) + '. ' + cLabel(p)).join(' · ') : 'None set'}</dd>
          <dt>Your notes</dt><dd>${st.notes ? esc(st.notes) : '—'}</dd>
        </dl>
        <hr class="hairline" style="margin:20px 0">
        <div class="btnrow"><a class="btn btn--ghost btn--sm" href="#/report">View full analysis</a>
          <a class="btn btn--ghost btn--sm" href="#/analyze?step=2">Update concerns</a>
          <a class="btn btn--quiet btn--sm" href="#/analyze?step=1">New photo &amp; re-analyse</a></div>
      </div>`
      : `<div class="empty"><h3>No analysis yet</h3><p>Run your first skin analysis to build your profile.</p><a class="btn" href="#/analyze">Analyse my skin</a></div>`,
    routine: () => st.routine ? `
      <div class="card card--pad-lg">
        <div class="rowbetween" style="margin-bottom:16px"><span class="card__label" style="margin:0">Saved routine · v${st.routine.version}</span>
          <span class="pill pill--sage">${ico.check} Approved by ${esc(DERM.name.split(' ').slice(0, 2).join(' '))}</span></div>
        ${Engine.routineProducts(st.routine).map((p, i) => `<div class="miniprod"><div class="miniprod__art">${art(p, 'ac' + i)}</div>
          <div style="flex:1"><b>${esc(p.name)}</b><span>${esc(p.cat)} · ${esc(p.size)}</span></div>
          <span class="price" style="font-size:.9rem">${money(p.price)}</span></div>`).join('')}
        <div class="btnrow" style="margin-top:18px"><a class="btn btn--ghost btn--sm" href="#/routine">Open my skin line</a></div>
      </div>`
      : `<div class="empty"><h3>No saved routine</h3><p>Your routine is saved here permanently once a dermatologist approves it.</p></div>`,
    orders: () => st.orders.length ? `
      <div class="card card--pad-lg"><span class="card__label">Order history &amp; receipts</span>
        ${st.orders.map(o => `<div class="orderrow">
          <div style="flex:1"><span class="orderdone__id orderrow__id">${esc(o.id)}</span>
            <div class="tiny">${fmtDate(o.at)} · ${o.items.length} item${o.items.length > 1 ? 's' : ''} · ${esc(o.kind)}</div></div>
          <span class="pill">${esc(o.status)}</span>
          <span class="price">${money(o.total + ((o.details && o.details.fee) || 0))}</span>
          <button class="btn btn--ghost btn--sm" data-order="${esc(o.id)}">View receipt</button></div>`).join('')}
      </div>`
      : `<div class="empty"><h3>No orders yet</h3><p>Your trial kit and full-size orders will be listed here.</p></div>`,
    sub: () => st.subscription ? `
      <div class="card card--pad-lg"><span class="card__label">Subscription</span>
        <dl class="kv">
          <dt>Status</dt><dd>${esc(st.subscription.status)}</dd>
          <dt>Monthly</dt><dd>${money(st.subscription.price)}</dd>
          <dt>Frequency</dt><dd>Every ${st.subscription.frequency} days</dd>
          <dt>Next shipment</dt><dd>${fmtDate(st.subscription.nextShip)}</dd>
        </dl>
        <div class="btnrow" style="margin-top:18px"><a class="btn btn--ghost btn--sm" href="#/subscription">Manage subscription</a></div>
      </div>`
      : `<div class="empty"><h3>No subscription</h3><p>Convert your routine to a monthly delivery after your trial.</p><a class="btn" href="#/subscription">See monthly routine</a></div>`,
    pay: () => `
      <div class="card card--pad-lg"><span class="card__label">Payment methods</span>
        ${(st.payments || []).length ? (st.payments).map((p, i) => `<div class="orderrow">
            <div style="flex:1"><strong style="font-weight:500">${esc(p.label)}</strong><div class="tiny">Expires ${esc(p.exp)}</div></div>
            <button class="btn btn--quiet btn--sm" data-delpay="${i}" style="--fg:var(--clay)">Remove</button></div>`).join('')
          : '<p class="small" style="margin:0 0 16px">No payment method saved. KNET is selected by default at checkout.</p>'}
        <button class="btn btn--ghost btn--sm" id="addPay" style="margin-top:14px">Add a payment method</button>
        <div class="notice" style="margin-top:16px">${ico.shield}<div>Prototype only — card details are never stored or transmitted. Only a masked label is kept in this browser.</div></div>
      </div>`,
    reviews: () => `
      ${feedbackCard(st.routine, { pad: true, title: 'Ratings & reviews', blurb: 'Everything you have rated, and anything still waiting for your verdict.' })}
      ${st.routine ? `<div style="margin-top:14px">${ratingsCard(Engine.routineProducts(st.routine).map(p => p.id), { pad: true, blurb: 'Your routine, product by product.' })}</div>` : ''}`,
    msgs: () => `
      <div class="card card--pad-lg"><span class="card__label">Dermatologist conversations</span>
        ${st.messages.length ? `<p class="small">${st.messages.length} messages with ${esc(DERM.name)}.</p>
          ${st.messages.slice(-4).map(m => `<div class="logcard"><h5>${m.who === 'me' ? 'You' : m.who === 'derm' ? esc(DERM.name) : 'System'} · ${fmtDate(m.at)}</h5>
            <p class="small" style="margin:0">${esc(m.text.slice(0, 190))}${m.text.length > 190 ? '…' : ''}</p></div>`).join('')}
          <a class="btn btn--ghost btn--sm" href="#/messages" style="margin-top:8px">Open messages</a>`
          : '<p class="small" style="margin:0">No conversations yet.</p>'}
      </div>`,
    photos: () => `
      <div class="card card--pad-lg"><span class="card__label">Progress photos</span>
        ${st.progress.length ? `<div class="photostrip">${st.progress.map(p => `<div class="photocell"><img src="${p.src}" alt="${esc(p.label)}"><span class="photocell__d">Day ${p.day}</span></div>`).join('')}</div>
          <a class="btn btn--ghost btn--sm" href="#/progress" style="margin-top:16px">Open progress</a>`
          : '<p class="small" style="margin:0">No photos yet.</p>'}
        <div class="notice" style="margin-top:16px">${ico.shield}<div>Photos are stored only in this browser in the prototype. In production you could delete them individually at any time.</div></div>
      </div>`,
    notif: () => `
      <div class="card card--pad-lg"><span class="card__label">Notification settings</span>
        ${[['dermAlerts', 'Dermatologist replies', 'Alert me when my dermatologist responds or adjusts my routine.'],
           ['shipReminders', 'Shipment & trial reminders', 'Day 3, 7, 10 and 14 check-in reminders and delivery updates.'],
           ['emailUpdates', 'Product & science updates', 'Occasional emails about formulations and skin science.']].map(s =>
          `<div class="togglerow"><div><strong style="font-weight:500;font-size:.92rem">${s[1]}</strong><div class="tiny">${s[2]}</div></div>
            <button class="switch ${st.settings[s[0]] ? 'is-on' : ''}" data-toggle="${s[0]}" role="switch" aria-checked="${!!st.settings[s[0]]}" aria-label="${s[1]}"></button></div>`).join('')}
      </div>`,
    privacy: () => `
      <div class="card card--pad-lg"><span class="card__label">Privacy &amp; data</span>
        <div class="togglerow"><div><strong style="font-weight:500;font-size:.92rem">Contribute anonymised data to skin research</strong>
          <div class="tiny">Aggregated, de-identified indicators only. Never your photographs.</div></div>
          <button class="switch ${st.settings.shareAnon ? 'is-on' : ''}" data-toggle="shareAnon" role="switch" aria-checked="${!!st.settings.shareAnon}" aria-label="Share anonymised data"></button></div>
        <hr class="hairline" style="margin:18px 0">
        <div class="btnrow">
          <button class="btn btn--ghost btn--sm" id="viewData">View my stored data</button>
          <button class="btn btn--quiet btn--sm" id="wipeData" style="--fg:var(--clay)">Delete my data</button>
        </div>
        <p class="tiny" style="margin-top:14px">Deleting removes your profile, analysis, routine, photos and messages from this browser. It cannot be undone.</p>
      </div>`
  };

  return {
    html: `<div class="view--app"><div class="wrap">
      <div class="pagehead viewin"><span class="eyebrow eyebrow--gold">Account</span>
        <h1>${esc(u.name)}</h1><p class="small">${esc(u.email)} · member since ${fmtDate(u.createdAt)}</p></div>
      <div class="acctgrid">
        <nav class="acctnav">
          ${tabs.map(t => `<button class="${tab === t[0] ? 'is-on' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}
          <hr class="hairline" style="margin:8px 0">
          <button data-logout style="color:var(--clay)">Log out</button>
        </nav>
        <div id="acctPanel">${(panels[tab] || panels.personal)()}</div>
      </div>
    </div></div>`,
    after() {
      $$('[data-tab]').forEach(b => b.addEventListener('click', () => Router.go('/account?tab=' + b.dataset.tab)));
      $('[data-logout]').addEventListener('click', () => Auth.signOut());

      const pf = $('#profForm');
      if (pf) pf.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = $('#pf-name').value.trim() || u.name;
        Store.commit(s => {
          s.profile.name = newName;
          s.profile.age = $('#pf-age').value.trim();
          s.profile.phone = $('#pf-phone').value.trim();
          s.profile.goals = $('#pf-goals').value.trim();
          s.profile.address = Object.assign({}, s.profile.address || {}, { line: $('#pf-addr').value.trim() });
        });
        Store.save(); Shell.render();
        UI.toast('Your details have been updated', 'good');
      });

      $$('[data-toggle]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.toggle;
        Store.commit(s => { s.settings[k] = !s.settings[k]; });
        b.classList.toggle('is-on');
        b.setAttribute('aria-checked', String(Store.state().settings[k]));
      }));

      $$('[data-order]').forEach(b => b.addEventListener('click', () => Router.go('/order?id=' + b.dataset.order)));
      bindFeedback();
      bindRatings();

      const addPay = $('#addPay');
      if (addPay) addPay.addEventListener('click', () => UI.modal(`<h3>Add a payment method</h3>
        <p class="small">Prototype only — nothing is stored beyond a masked label in this browser. Please don’t enter a real card.</p>
        <div class="field" style="margin-top:16px"><label>Card number</label><input class="input" id="np-num" placeholder="0000 0000 0000 0000" inputmode="numeric"></div>
        <div class="fieldrow"><div class="field"><label>Expiry</label><input class="input" id="np-exp" placeholder="MM/YY"></div>
          <div class="field"><label>Brand</label><select class="select" id="np-brand"><option>Visa</option><option>Mastercard</option><option>KNET</option></select></div></div>
        <button class="btn btn--block" data-ok>Save method</button>`, {
        after(m) {
          $('[data-ok]', m).addEventListener('click', () => {
            const num = $('#np-num', m).value.replace(/\D/g, ''), exp = $('#np-exp', m).value.trim();
            if (num.length < 4 || !/^\d{2}\/\d{2}$/.test(exp)) { UI.toast('Enter a card number and MM/YY expiry.', 'warn'); return; }
            Store.commit(s => { s.payments = s.payments || []; s.payments.push({ label: $('#np-brand', m).value + ' •••• ' + num.slice(-4), exp }); });
            UI.closeModal(); UI.toast('Payment method saved', 'good'); Router.render();
          });
        }
      }));
      $$('[data-delpay]').forEach(b => b.addEventListener('click', () => {
        Store.commit(s => s.payments.splice(+b.dataset.delpay, 1));
        Router.render();
      }));

      const vd = $('#viewData');
      if (vd) vd.addEventListener('click', () => {
        const copy = JSON.parse(JSON.stringify(Store.state()));
        copy.photo = copy.photo ? '[image data · ' + Math.round(copy.photo.length / 1024) + ' KB, stored locally]' : null;
        copy.progress = copy.progress.map(p => ({ day: p.day, label: p.label, at: p.at, src: '[image data]' }));
        copy.messages = copy.messages.map(m => ({ who: m.who, at: m.at, text: m.text, img: m.img ? '[image]' : null }));
        UI.modal(`<h3>Your stored data</h3><p class="small">Everything Lumea holds for you in this browser.</p>
          <pre class="card card--flat" style="max-height:340px;overflow:auto;font-size:.72rem;line-height:1.5;white-space:pre-wrap;word-break:break-word">${esc(JSON.stringify(copy, null, 2))}</pre>
          <button class="btn btn--sm" data-copy>Copy to clipboard</button>`, {
          after(m) {
            $('[data-copy]', m).addEventListener('click', () => {
              const text = JSON.stringify(copy, null, 2);
              if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => UI.toast('Copied to clipboard', 'good'), () => UI.toast('Copy failed — select the text manually.', 'warn'));
              else UI.toast('Select the text above to copy it.', 'warn');
            });
          }
        });
      });
      const wipe = $('#wipeData');
      if (wipe) wipe.addEventListener('click', () => UI.confirm('Delete all of your data?',
        'Your profile, analysis, routine, photos, orders and messages will be permanently removed from this browser.',
        'Delete everything', () => {
          Store.reset();
          UI.curtain(() => { Shell.render(); Router.go('/'); UI.toast('Your data has been deleted.', 'good'); });
        }, true));
    }
  };
};

/* ===================== ROUTER ===================== */
const ROUTES = {
  '':             { view: 'landing', pub: true },
  '/':            { view: 'landing', pub: true },
  'signin':       { view: 'signin', pub: true, guestOnly: true },
  'signup':       { view: 'signup', pub: true, guestOnly: true },
  'dashboard':    { view: 'dashboard' },
  'analyze':      { view: 'analyze' },
  'report':       { view: 'report' },
  'plan':         { view: 'plan', gate: 'routine' },
  'routine':      { view: 'routine', gate: 'routine' },
  'trial':        { view: 'trial', gate: 'trial' },
  'progress':     { view: 'progress', gate: 'review' },
  'messages':     { view: 'messages', gate: 'review' },
  'subscription': { view: 'subscription', gate: 'routine' },
  'basket':       { view: 'basket' },
  'checkout':     { view: 'checkout' },
  'order':        { view: 'order' },
  'account':      { view: 'account' }
};

const Router = {
  _raw() { return location.hash.replace(/^#/, ''); },
  isRoute() { const h = location.hash; return h === '' || h === '#' || h.indexOf('#/') === 0; },
  path() { const r = this._raw().split('?')[0]; return r === '/' ? '/' : r.replace(/^\//, ''); },
  query() {
    const qs = this._raw().split('?')[1];
    const out = {};
    if (qs) qs.split('&').forEach(kv => { const [k, v] = kv.split('='); out[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return out;
  },
  go(path) {
    const target = '#' + (path.charAt(0) === '/' ? path : '/' + path);
    if (location.hash === target) this.render(); else location.hash = target;
  },
  render() {
    while (CLEAN.length) { try { CLEAN.pop()(); } catch (e) {} }
    UI.closeModal();

    const p = this.path();
    const known = Object.prototype.hasOwnProperty.call(ROUTES, p);
    const route = known ? ROUTES[p] : ROUTES[''];
    const signed = !!Store.session();

    /* an unknown path (an old bookmark, a stale link) should land somewhere sensible
       rather than paint the marketing page over the signed-in app shell */
    if (!known) { this.go(signed ? '/dashboard' : '/'); return; }

    if (!route.pub && !signed) { UI.toast('Please sign in to continue.', 'warn'); this.go('/signin'); return; }
    if (signed && (route.guestOnly || p === '' || p === '/')) { this.go('/dashboard'); return; }
    if (route.gate && signed && !Journey.can(route.gate)) {
      UI.toast(Journey.reason(route.gate), 'warn');
      this.go('/dashboard'); return;
    }

    const v = Views[route.view]();
    const host = $('#view');
    host.innerHTML = v.html;
    document.title = ({
      landing: 'Lumea Skin Studio', signin: 'Sign in · Lumea', signup: 'Create account · Lumea',
      dashboard: 'Dashboard · Lumea', analyze: 'Skin analysis · Lumea', report: 'Your skin analysis · Lumea',
      plan: 'Your dermatologist’s report · Lumea', routine: 'Your skin line · Lumea', trial: '14-day trial · Lumea', progress: 'Skin progress · Lumea',
      messages: 'Messages · Lumea', subscription: 'Subscription · Lumea', basket: 'Basket · Lumea',
      checkout: 'Checkout · Lumea', order: 'Your receipt · Lumea', account: 'Account · Lumea'
    })[route.view] || 'Lumea Skin Studio';

    Shell.render();
    if (v.after) v.after();
    UI.reveal(host);
    window.scrollTo({ top: 0, behavior: 'auto' });
  },
  start() {
    window.addEventListener('hashchange', () => {
      if (!this.isRoute()) return;                  /* in-page anchor — let the browser scroll */
      this.render();
    });
    if (!this.isRoute()) location.replace(location.pathname + location.search + '#/');
    this.render();
  }
};

/* ===================== BOOT ===================== */
Store.boot();
(async function boot() {
  const cameFromEmail = /[?&]code=/.test(location.search) || /access_token=/.test(location.hash);
  $('#view').innerHTML = '<div class="view--app"><div class="wrap wrap--narrow"><div class="card card--pad-lg">' +
    '<div class="skel skel--title"></div><div class="skel skel--line"></div>' +
    '<div class="skel skel--line" style="width:72%"></div><div class="skel skel--line" style="width:54%"></div></div></div></div>';

  let session = null;
  try { session = await Cloud.session(); } catch (e) { console.warn('session lookup failed', e); }
  if (session && session.user) {
    Cloud.user = session.user;
    try { await Auth.load(); } catch (e) { console.warn('hydrate failed', e); }
  }

  Shell.render();
  Review.schedule();
  Router.start();

  if (cameFromEmail) {
    history.replaceState(null, '', location.pathname);
    if (Cloud.user) { Router.go('/dashboard'); UI.toast('Email confirmed — welcome to Lumea.', 'good', 5000); }
    else { Router.go('/signin'); UI.toast('That link has expired. Please sign in or request a new one.', 'warn', 5000); }
  }
  if (!Cloud.online) UI.toast('Offline — changes will stay in this browser only.', 'warn', 5000);
})();

/* expose a small surface for debugging / future API swap */
window.LUMEA = { Store, Engine, Cart, Trial, Ratings, Review, Journey, Router, Views, PRODUCTS, UI, Cloud, Auth,
  reset() { Store.reset(); Shell.render(); Router.go('/'); } };
})();
