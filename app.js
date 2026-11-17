/* Mama Journey v2 — app logic. Plain JS, no libraries. State lives in this browser only. */
(function () {
'use strict';

/* ================= helpers ================= */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const KEY = 'mamaJourney.v1';
const DAY = 864e5;
let S;
let current = 'home';
let ringAnimated = false;

const T = (ar, en) => (S.lang === 'en' ? en : ar);
const L = (o) => (o == null ? '' : Array.isArray(o) ? (S.lang === 'en' ? o[1] : o[0]) : (S.lang === 'en' ? o.en : o.ar));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (x, d) => (x == null || isNaN(x) ? '—' : Number(x).toLocaleString('en-US', { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: 0 }));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 9);

function parse(s) { if (!s) return null; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (!m) return null; const d = new Date(+m[1], +m[2] - 1, +m[3], 12); return isNaN(d) ? null : d; }
function iso(d) { const z = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
function today() { const d = new Date(); d.setHours(12, 0, 0, 0); return d; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(12, 0, 0, 0); return x; }
function diffDays(a, b) { return Math.round((a - b) / DAY); }
function loc() { return S.lang === 'en' ? 'en-GB' : 'ar-u-ca-gregory-nu-latn'; }
function fmt(d, opt) { if (!d) return '—'; try { return new Intl.DateTimeFormat(loc(), opt || { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch (e) { return iso(d); } }
function fmtShort(d) { return fmt(d, { day: 'numeric', month: 'short' }); }
function fmtDM(d) { return fmt(d, { weekday: 'long', day: 'numeric', month: 'long' }); }
function fmtHijri(d) { try { return new Intl.DateTimeFormat(S.lang === 'en' ? 'en-u-ca-islamic-umalqura' : 'ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch (e) { return ''; } }
function fmtTime(ms) { return new Intl.DateTimeFormat(S.lang === 'en' ? 'en-GB' : 'ar-u-nu-latn', { hour: 'numeric', minute: '2-digit' }).format(new Date(ms)); }
function mmss(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

function cnt(n, f) {
  if (S.lang === 'en') return n + ' ' + (n === 1 ? f.e1 : f.en);
  if (n === 0) return '0 ' + f.many;
  if (n === 1) return f.one; if (n === 2) return f.two; if (n >= 3 && n <= 10) return n + ' ' + f.few; return n + ' ' + f.many;
}
const W_WEEK = { one: 'أسبوع واحد', two: 'أسبوعان', few: 'أسابيع', many: 'أسبوعًا', e1: 'week', en: 'weeks' };
const W_DAY = { one: 'يوم واحد', two: 'يومان', few: 'أيام', many: 'يومًا', e1: 'day', en: 'days' };
const W_KICK = { one: 'حركة واحدة', two: 'حركتان', few: 'حركات', many: 'حركة', e1: 'movement', en: 'movements' };
const W_MIN = { one: 'دقيقة واحدة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة', e1: 'min', en: 'min' };
const W_CT = { one: 'انقباضة واحدة', two: 'انقباضتان', few: 'انقباضات', many: 'انقباضة', e1: 'contraction', en: 'contractions' };
const weeksW = (n) => cnt(n, W_WEEK);
const daysW = (n) => cnt(n, W_DAY);
function gaText(ga) { if (S.lang === 'en') return ga.w + 'w ' + ga.d + 'd'; return ga.d ? weeksW(ga.w) + ' و' + daysW(ga.d) : weeksW(ga.w); }
const TRI = () => ['', T('الأول', '1st'), T('الثاني', '2nd'), T('الثالث', '3rd')];

function getPath(o, p) { return p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o); }
function setPath(o, p, v) { const ks = p.split('.'); let a = o; ks.slice(0, -1).forEach((k) => { if (a[k] == null || typeof a[k] !== 'object') a[k] = {}; a = a[k]; }); a[ks[ks.length - 1]] = v; }

/* ================= icons ================= */
const svg = (p, w) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  pre: '<path d="M12 21c-4.5-2.6-8-6-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 4-3.5 7.4-8 10Z"/>',
  preg: '<circle cx="12" cy="5" r="2.5"/><path d="M10 9h3.5c2.5 0 4.5 2.3 4.5 5s-2 4.5-4.5 4.5H12V22M10 9v13"/>',
  post: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  baby: '<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="11" r=".6" fill="currentColor"/><circle cx="15" cy="11" r=".6" fill="currentColor"/><path d="M9.5 15c1.4 1.2 3.6 1.2 5 0M12 3.5c-1.2 1.4-1 3 .5 3.8"/>',
  labs: '<path d="M9 3h6M10 3v6.5L4.8 18.6A1.6 1.6 0 0 0 6.2 21h11.6a1.6 1.6 0 0 0 1.4-2.4L14 9.5V3M7.5 14h9"/>',
  guide: '<path d="M12 3 4 6v6c0 4.4 3.4 8 8 9 4.6-1 8-4.6 8-9V6z"/><path d="M12 8.5v6M9 11.5h6"/>',
  food: '<path d="M12 7c-1.5-2.5-6-2.5-7 1-1 3.8 1.6 9.5 4.4 12 1.2 1 2 .5 2.6 0 .6.5 1.4 1 2.6 0 2.8-2.5 5.4-8.2 4.4-12-1-3.5-5.5-3.5-7-1Z"/><path d="M12 7c0-2 1-3.5 3-4"/>',
  summary: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4"/>',
  about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  scale: '<path d="M5 21h14M7 21l1.5-12h7L17 21M12 9V5M9 5h6"/>',
  gauge: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="m12 15 4-5"/><circle cx="12" cy="15" r="1.4"/>',
  drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/>',
  kick: '<path d="M12 21c-4.5-2.6-8-6-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 4-3.5 7.4-8 10Z"/><path d="M8.5 12h2l1.5-2.5 1.5 5 1.5-2.5h2"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  flower: '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V4M12 20v-5.5M9.5 12H4M20 12h-5.5M10.2 10.2 6.3 6.3M17.7 17.7l-3.9-3.9M13.8 10.2l3.9-3.9M6.3 17.7l3.9-3.9"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  check: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  mood: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.9 1.7 5.1 1.7 7 0M9 9.5h.01M15 9.5h.01"/>',
  band: '<rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M10.5 10.5h.01M13.5 13.5h.01M10.5 13.5h.01M13.5 10.5h.01"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  tally: '<path d="M5 5v14M9 5v14M13 5v14M17 5v14M3 15 19 9"/>',
  bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M7 9V6h4v3"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
  shield: '<path d="M12 3 4 6v6c0 4.4 3.4 8 8 9 4.6-1 8-4.6 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/><path d="M17 3v3M15.5 4.5h3"/>',
  run: '<circle cx="14" cy="4.5" r="1.8"/><path d="m8 21 3-6 3 2v4M6 12l3-4 4 1 2 3h3M11 15l-1-4"/>',
  milk: '<path d="M8 3h8v3l2 3v12H6V9l2-3zM6 13h12"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  homeLv: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  clinicLv: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M12 13v5M9.5 15.5h5"/>',
  erLv: '<path d="M5 18v-7a7 7 0 0 1 14 0v7M3 18h18v3H3zM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>'
};
const ic = (k, w) => svg(P[k], w);
const I = {
  good: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor" opacity=".18"/><path d="M4.8 8.2l2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  watch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l6.6 11.6H1.4z" fill="currentColor" opacity=".18"/><path d="M8 1.8l6.6 11.6H1.4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6.2v3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1" fill="currentColor"/></svg>',
  urgent: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 1.5h5.4l3.8 3.8v5.4l-3.8 3.8H5.3l-3.8-3.8V5.3z" fill="currentColor"/><path d="M8 4.6v4.2" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><circle cx="8" cy="11.3" r="1.1" fill="#fff"/></svg>'
};
const LVL = { good: () => T('طبيعي', 'Normal'), watch: () => T('يحتاج إلى متابعة', 'Needs follow-up'), urgent: () => T('يحتاج إلى مراجعة سريعة', 'Prompt review') };
const chip = (lv, text) => '<span class="chip ' + lv + '">' + (I[lv] || '') + esc(text == null ? LVL[lv]() : text) + '</span>';
const LVCOL = { good: 'var(--good)', watch: 'var(--warn)', urgent: 'var(--bad)' };

/* ================= state ================= */
function baseState() {
  return {
    v: 1, demo: false, lang: 'ar', theme: null,
    profile: { stage: 'pregnant', lmp: '', cycle: 28, height: '', preWeight: '', twins: false, lastPeriod: '', deliveryDate: '', feeding: 'breast', flags: { gdm: false, htn: false, cs: false } },
    labs: [], checks: {}, kicks: [], kickRun: null, contr: { active: null, list: [] },
    epds: [], epdsDraft: {}, baby: { birthDate: '', birthWeight: '', weights: [], log: {} },
    calc: {}, notes: '', ui: { labTest: 'hb', guideG: 'all', guideQ: '', foodStage: 't2', tool: { pre: 'ovu', preg: 'edd', post: 'plan', baby: 'info', food: 'needs' } }
  };
}
function demoState(lang) {
  const s = baseState(); s.demo = true; s.lang = lang || 'ar';
  const t = today(); const lmp = addDays(t, -(26 * 7 + 3));
  s.profile.lmp = iso(lmp); s.profile.height = 160; s.profile.preWeight = 62; s.profile.lastPeriod = iso(addDays(t, -9));
  const at = (w) => iso(addDays(lmp, Math.round(w * 7)));
  const E = (test, w, v, v2) => ({ id: uid(), test: test, date: at(w), v: v, v2: v2 });
  s.labs = [
    E('hb', 10, 12.1), E('hb', 20, 11.2), E('hb', 26, 10.3),
    E('ferritin', 10, 34), E('ferritin', 20, 22),
    E('fbg', 10, 84), E('tsh', 10, 2.1), E('vitd', 10, 17), E('hba1c', 9, 5.3),
    E('bp', 10, 110, 70), E('bp', 14, 112, 72), E('bp', 18, 114, 73), E('bp', 22, 118, 76), E('bp', 26, 121, 79),
    E('weight', 10, 62.8), E('weight', 14, 63.4), E('weight', 18, 64.9), E('weight', 22, 66.8), E('weight', 26, 68.9)
  ];
  s.checks = { first: true, nt: true, anomaly: true, folic: true, premarital: true, cbc: true, group: true, rubella: true, sugar: true };
  s.kicks = [{ date: iso(addDays(t, -1)), min: 18, n: 10 }, { date: iso(addDays(t, -3)), min: 24, n: 10 }];
  return s;
}
function demoPostState(lang) {
  const s = baseState(); s.demo = true; s.lang = lang || 'ar';
  const t = today(); const dd = addDays(t, -18); const lmp = addDays(dd, -(39 * 7 + 2));
  Object.assign(s.profile, { stage: 'post', lmp: iso(lmp), deliveryDate: iso(dd), height: 160, preWeight: 62, lastPeriod: '', feeding: 'breast' });
  const at = (w) => iso(addDays(lmp, Math.round(w * 7))); const pp = (d) => iso(addDays(dd, d));
  const E = (test, date, v, v2) => ({ id: uid(), test: test, date: date, v: v, v2: v2 });
  s.labs = [
    E('hb', at(10), 12.1), E('hb', at(26), 10.8), E('hb', at(36), 11.2), E('hb', pp(2), 9.6),
    E('ferritin', at(10), 34), E('ferritin', at(26), 21), E('fbg', at(10), 84), E('tsh', at(10), 2.1), E('vitd', at(10), 17),
    E('bp', at(10), 110, 70), E('bp', at(20), 115, 74), E('bp', at(30), 121, 78), E('bp', at(36), 126, 80), E('bp', pp(5), 128, 82),
    E('weight', at(10), 62.8), E('weight', at(20), 65.9), E('weight', at(30), 70.2), E('weight', at(38), 74.0)
  ];
  MJ.PRENATAL.forEach((x) => { s.checks[x.id] = x.id !== 'postdates'; });
  s.kicks = [{ date: iso(addDays(dd, -2)), min: 15, n: 10 }];
  s.baby = { birthDate: iso(dd), birthWeight: 3250, weights: [{ date: pp(3), g: 3020 }, { date: pp(10), g: 3240 }, { date: pp(17), g: 3480 }], log: {} };
  s.baby.log[iso(t)] = { feed: 7, wet: 5, dirty: 3 };
  return s;
}
function load() { try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && o.v === 1) return o; } } catch (e) { /* storage unavailable */ } return null; }
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }, 120); }
function fill(base, o) { Object.keys(base).forEach((k) => { if (o[k] === undefined) o[k] = base[k]; else if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && o[k] && typeof o[k] === 'object') fill(base[k], o[k]); }); return o; }

/* ================= pregnancy maths ================= */
function effLmp() { const l = parse(S.profile.lmp); if (!l) return null; const cy = +S.profile.cycle || 28; return addDays(l, clamp(cy, 21, 45) - 28); }
function eddDate() { const l = effLmp(); return l ? addDays(l, 280) : null; }
function gaOn(date) { const l = effLmp(); if (!l) return null; const d = diffDays(date, l); if (d < 0 || d > 301) return null; return { days: d, w: Math.floor(d / 7), d: d % 7, tri: d < 98 ? 1 : d < 196 ? 2 : 3 }; }
function postDays(date) { const dd = parse(S.profile.deliveryDate); if (!dd) return null; const d = diffDays(date, dd); return d >= 0 ? d : null; }
function ctxFor(date) {
  const pd = postDays(date);
  if (pd != null) return pd <= 84 ? { post: true, pd: pd } : { non: true };
  const ga = gaOn(date);
  if (ga && (S.profile.stage !== 'pre' || S.profile.deliveryDate)) return { preg: true, tri: ga.tri, ga: ga };
  return { non: true };
}
function fetalFor(w) { let f = MJ.FETAL[0]; MJ.FETAL.forEach((x) => { if (x.w <= w) f = x; }); return f; }
function bmiOf(h, w) { h = +h; w = +w; if (!(h > 100 && h < 230 && w > 30 && w < 250)) return null; return w / Math.pow(h / 100, 2); }
function bmiCat(b) { return b < 18.5 ? 'under' : b < 25 ? 'normal' : b < 30 ? 'over' : 'obese'; }
const BMI_LBL = { under: { ar: 'نحافة', en: 'Underweight' }, normal: { ar: 'وزن طبيعي', en: 'Normal weight' }, over: { ar: 'زيادة في الوزن', en: 'Overweight' }, obese: { ar: 'سمنة', en: 'Obesity' } };
const IOM = {
  single: { under: [12.5, 18], normal: [11.5, 16], over: [7, 11.5], obese: [5, 9] },
  twins: { under: null, normal: [17, 25], over: [14, 23], obese: [11, 19] },
  rate: { under: [0.44, 0.58], normal: [0.35, 0.5], over: [0.23, 0.33], obese: [0.17, 0.27] }
};
function gainRange(cat, twins, wk) {
  const tot = (twins ? IOM.twins : IOM.single)[cat]; if (!tot) return null;
  const w = clamp(wk, 0, 40);
  if (w <= 13) return [0.5 * w / 13, 2 * w / 13];
  return [0.5 + (tot[0] - 0.5) * (w - 13) / 27, 2 + (tot[1] - 2) * (w - 13) / 27];
}

/* ================= lab tests ================= */
const TESTS = {
  hb: {
    n: { ar: 'الهيموغلوبين', en: 'Haemoglobin' }, u: 'g/dL', step: 0.1,
    thr(c) { return c.preg ? (c.tri === 2 ? 10.5 : 11) : c.post ? 10 : 12; },
    lvl(e, c) { if (e.v < 7) return 'urgent'; return e.v < this.thr(c) ? 'watch' : 'good'; },
    band(c) { return [this.thr(c), 15]; },
    msg(e, c) {
      const th = this.thr(c); const lv = this.lvl(e, c);
      const where = c.preg ? T('للثلث ' + TRI()[c.tri], 'for the ' + TRI()[c.tri] + ' trimester') : c.post ? T('بعد الولادة', 'after birth') : T('لغير الحامل', 'outside pregnancy');
      if (lv === 'urgent') return T('فقر دم شديد (أقل من 7). راجعي طبيبك اليوم.', 'Severe anaemia (below 7). See your doctor today.');
      if (lv === 'watch') return T('أقل من ' + th + ' غ/دل، وهذا يُعدّ فقر دم ' + where + '. ناقشي مع طبيبك مكملات الحديد وتحليل الفيريتين.', 'Below ' + th + ' g/dL, which is anaemia ' + where + '. Ask your doctor about iron and a ferritin test.');
      return T('ضمن المعدل الطبيعي ' + where + ' (' + th + ' فأعلى).', 'Normal ' + where + ' (' + th + ' or higher).');
    },
    about: { ar: 'بروتين في كريات الدم الحمراء ينقل الأكسجين. ينخفض طبيعيًا في الثلث الثاني بسبب زيادة حجم البلازما، لذلك يكون حدّه أقل (10.5). يُفحص في الزيارة الأولى وبين الأسبوعين 24 و28، وبعد الولادة عند حدوث نزيف.', en: 'The protein in red cells that carries oxygen. It dips normally in the 2nd trimester as plasma volume expands, so the cut-off is lower (10.5). Checked at booking, at 24–28 weeks, and after birth if there was bleeding.' }
  },
  ferritin: {
    n: { ar: 'الفيريتين', en: 'Ferritin' }, u: 'ng/mL', step: 1,
    lvl(e) { return e.v < 30 ? 'watch' : 'good'; },
    band() { return [30, 150]; },
    msg(e) { if (e.v < 15) return T('أقل من 15: نقص مؤكد في الحديد، وغالبًا تحتاجين إلى مكمل حديد يصفه الطبيب.', 'Below 15: confirmed iron deficiency. You likely need iron as your doctor prescribes.'); if (e.v < 30) return T('بين 15 و29: مخزون الحديد منخفض. ركّزي على مصادر الحديد واسألي طبيبك عن المكمل.', '15–29: low iron stores. Focus on iron-rich food and ask about a supplement.'); return T('30 فأعلى: مخزون الحديد كافٍ.', '30 or higher: adequate iron stores.'); },
    about: { ar: 'أفضل مؤشر لمخزون الحديد في الجسم. ينخفض قبل انخفاض الهيموغلوبين، فيكشف النقص مبكرًا. القيمة الأقل من 30 تشير إلى نقص الحديد أثناء الحمل.', en: 'The best marker of iron stores. It falls before haemoglobin does, so it shows deficiency early. Below 30 suggests iron deficiency in pregnancy.' }
  },
  fbg: {
    n: { ar: 'سكر الصائم', en: 'Fasting glucose' }, u: 'mg/dL', step: 1,
    lvl(e, c) { const v = e.v; if (v < 70) return 'watch'; if (v >= 126) return 'urgent'; if (c.preg) return v >= 92 ? 'watch' : 'good'; return v >= 100 ? 'watch' : 'good'; },
    band(c) { return [70, c.preg ? 91 : 99]; },
    msg(e, c) {
      const v = e.v;
      if (v < 70) return T('منخفض (أقل من 70). عند الشعور برجفة أو تعرق تناولي شيئًا سكريًا وأبلغي طبيبك.', 'Low (below 70). If shaky or sweaty, eat something sugary and tell your doctor.');
      if (v >= 126) return T('126 فأعلى: قد يدل على السكري. راجعي طبيبك قريبًا للتأكيد.', '126 or higher: may indicate diabetes. See your doctor soon to confirm.');
      if (c.preg && v >= 92) return T('92 فأعلى أثناء الحمل يطابق معيار سكر الحمل (IADPSG)، ويحتاج إلى تقييم الطبيب.', '92 or higher in pregnancy meets the gestational diabetes cut-off (IADPSG). Needs review.');
      if (!c.preg && v >= 100) return T('بين 100 و125: مرحلة ما قبل السكري.', '100–125: prediabetes range.');
      return T('ضمن المعدل الطبيعي.', 'Within normal range.');
    },
    about: { ar: 'سكر الدم بعد صيام 8 ساعات. حدّه أثناء الحمل أقل (أقل من 92) لأن الحمل يغيّر طريقة تعامل الجسم مع السكر.', en: 'Blood sugar after an 8-hour fast. The pregnancy cut-off is lower (below 92) because pregnancy changes how the body handles sugar.' }
  },
  hba1c: {
    n: { ar: 'السكر التراكمي', en: 'HbA1c' }, u: '%', step: 0.1,
    lvl(e) { return e.v >= 6.5 ? 'urgent' : e.v >= 5.7 ? 'watch' : 'good'; },
    band() { return [4, 5.6]; },
    msg(e) { if (e.v >= 6.5) return T('6.5% فأعلى: يتوافق مع السكري، ويحتاج إلى متابعة قريبة، ويُفضّل ضبطه قبل الحمل.', '6.5% or higher: consistent with diabetes. Needs prompt follow-up, ideally controlled before pregnancy.'); if (e.v >= 5.7) return T('بين 5.7% و6.4%: مرحلة ما قبل السكري.', '5.7–6.4%: prediabetes range.'); return T('أقل من 5.7%: طبيعي.', 'Below 5.7%: normal.'); },
    about: { ar: 'متوسط السكر خلال الأشهر الثلاثة الأخيرة تقريبًا. مفيد قبل الحمل وفي الزيارة الأولى لاكتشاف السكري غير المشخّص.', en: 'Average blood sugar over the last 2–3 months. Useful before pregnancy and at booking to find undiagnosed diabetes.' }
  },
  tsh: {
    n: { ar: 'هرمون الغدة الدرقية', en: 'Thyroid (TSH)' }, u: 'mIU/L', step: 0.01,
    lims(c) { return c.preg ? [0.1, 4.0] : [0.4, 4.0]; },
    lvl(e, c) { const [a, b] = this.lims(c); if (e.v > 10) return 'urgent'; return e.v < a || e.v > b ? 'watch' : 'good'; },
    band(c) { return this.lims(c); },
    msg(e, c) { const [a, b] = this.lims(c); if (e.v > 10) return T('أعلى من 10: قصور واضح في الغدة. راجعي طبيبك قريبًا.', 'Above 10: clear hypothyroidism. See your doctor soon.'); if (e.v > b) return T('أعلى من ' + b + ': قد يحتاج إلى علاج أثناء الحمل، خاصة مع وجود أجسام مضادة للغدة.', 'Above ' + b + ': may need treatment in pregnancy, especially with thyroid antibodies.'); if (e.v < a) return T('أقل من ' + a + ': يحتاج إلى تقييم، وقد يكون طبيعيًا في الثلث الأول.', 'Below ' + a + ': needs review (can be normal in the 1st trimester).'); return T('ضمن المدى ' + a + '–' + b + '. يُفضّل الاعتماد على مدى مختبرك إن وُجد.', 'Within ' + a + '–' + b + '. Your lab’s own range is preferred if given.'); },
    about: { ar: 'هرمون ينظّم عمل الغدة الدرقية، واضطرابها يؤثر في نمو دماغ الجنين. وفق إرشادات ATA لعام 2017 يُعتمد 4.0 حدًا أعلى أثناء الحمل عند عدم توفر مدى خاص بالمختبر.', en: 'The hormone that drives the thyroid, which matters for baby’s brain development. Per ATA 2017, 4.0 is used as the pregnancy upper limit when no lab-specific range exists.' }
  },
  vitd: {
    n: { ar: 'فيتامين د', en: 'Vitamin D' }, u: 'ng/mL', step: 1,
    lvl(e) { return e.v < 30 || e.v > 100 ? 'watch' : 'good'; },
    band() { return [30, 100]; },
    msg(e) { if (e.v < 20) return T('أقل من 20: نقص. اسألي طبيبك عن المكمل المناسب.', 'Below 20: deficiency. Ask your doctor about a supplement.'); if (e.v < 30) return T('بين 20 و29: غير كافٍ.', '20–29: insufficient.'); if (e.v > 100) return T('أعلى من 100: مرتفع، راجعي جرعة المكمل.', 'Above 100: high; review your supplement dose.'); return T('كافٍ (30 فأعلى).', 'Sufficient (30 or higher).'); },
    about: { ar: 'مهم لعظام الأم والجنين. نقصه شائع في المملكة رغم وفرة الشمس بسبب قلة التعرض المباشر لها.', en: 'Important for mother and baby’s bones. Deficiency is common in Saudi Arabia despite the sun, due to little direct exposure.' }
  },
  bp: {
    n: { ar: 'ضغط الدم', en: 'Blood pressure' }, u: 'mmHg', step: 1, two: true,
    lvl(e) { if (e.v >= 160 || e.v2 >= 110) return 'urgent'; if (e.v >= 140 || e.v2 >= 90) return 'watch'; return 'good'; },
    msg(e, c) {
      const lv = this.lvl(e, c);
      if (lv === 'urgent') return T('160/110 فأعلى: ارتفاع شديد. توجّهي إلى الطوارئ فورًا.', '160/110 or higher: severe. Go to the emergency department now.');
      if (lv === 'watch') return T('140/90 فأعلى: مرتفع. أعيدي القياس بعد 15 دقيقة من الراحة، وتواصلي مع طبيبك اليوم.', '140/90 or higher: raised. Recheck after 15 minutes’ rest and contact your doctor today.');
      if (e.v < 90 && e.v2 < 60) return T('منخفض نسبيًا، وهو شائع أثناء الحمل، لكن راجعي الطبيب إذا صاحبه دوار أو إغماء.', 'On the low side. Common in pregnancy, but see a doctor if dizzy or fainting.');
      return T('أقل من 140/90: ضمن المعدل الطبيعي.', 'Below 140/90: within normal.');
    },
    about: { ar: 'ارتفاع الضغط بعد الأسبوع 20 قد يكون بداية تسمم الحمل. قيسيه وأنتِ جالسة بعد 5 دقائق من الراحة، مع وضع الذراع بمستوى القلب.', en: 'High blood pressure after week 20 can signal pre-eclampsia. Measure seated after 5 minutes’ rest, arm at heart level.' }
  },
  weight: {
    n: { ar: 'الوزن', en: 'Weight' }, u: 'kg', step: 0.1,
    ref(date) {
      const b = bmiOf(S.profile.height, S.profile.preWeight); const ga = gaOn(date);
      if (!b || !ga || S.profile.stage === 'pre' || postDays(date) != null) return null;
      const r = gainRange(bmiCat(b), S.profile.twins, ga.days / 7); if (!r) return null;
      return [+S.profile.preWeight + r[0], +S.profile.preWeight + r[1]];
    },
    lvl(e) { const r = this.ref(parse(e.date)); if (!r) return 'good'; return e.v < r[0] - 0.05 || e.v > r[1] + 0.05 ? 'watch' : 'good'; },
    band(c, date) { return this.ref(date); },
    msg(e) {
      const r = this.ref(parse(e.date));
      if (!r) return T('أضيفي الطول والوزن قبل الحمل لمقارنة وزنك بالمدى الموصى به.', 'Add your height and pre-pregnancy weight to compare with the recommended range.');
      const g = e.v - S.profile.preWeight; const lo = num(r[0] - S.profile.preWeight, 1), hi = num(r[1] - S.profile.preWeight, 1);
      if (e.v < r[0] - 0.05) return T('الزيادة ' + num(g, 1) + ' كغ، وهي أقل من المدى الموصى به لهذا الأسبوع (' + lo + '–' + hi + ' كغ).', 'Gain of ' + num(g, 1) + ' kg is below the recommended range for this week (' + lo + '–' + hi + ' kg).');
      if (e.v > r[1] + 0.05) return T('الزيادة ' + num(g, 1) + ' كغ، وهي أعلى من المدى الموصى به لهذا الأسبوع (' + lo + '–' + hi + ' كغ).', 'Gain of ' + num(g, 1) + ' kg is above the recommended range for this week (' + lo + '–' + hi + ' kg).');
      return T('الزيادة ' + num(g, 1) + ' كغ، ضمن المدى الموصى به (IOM).', 'Gain of ' + num(g, 1) + ' kg is within the recommended range (IOM).');
    },
    about: { ar: 'تعتمد الزيادة الموصى بها على مؤشر كتلة الجسم قبل الحمل وفق إرشادات IOM لعام 2009. تمثل المنطقة الخضراء في الرسم الوزن الموصى به لكل أسبوع.', en: 'Recommended gain depends on pre-pregnancy BMI (IOM 2009). The green band on the chart is the recommended weight for each week.' }
  }
};
const TEST_ORDER = ['hb', 'ferritin', 'fbg', 'hba1c', 'tsh', 'vitd', 'bp', 'weight'];
function evalEntry(e) { const t = TESTS[e.test]; const c = ctxFor(parse(e.date)); return { lv: t.lvl(e, c), msg: t.msg(e, c), c: c }; }
function valText(e) { const t = TESTS[e.test]; return t.two ? e.v + '/' + e.v2 : num(e.v, t.step < 1 ? (t.step < 0.1 ? 2 : 1) : 0); }
function labsOf(test) { return S.labs.filter((x) => x.test === test).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)); }
function latest(test) { const a = labsOf(test); return a.length ? a[a.length - 1] : null; }

/* ================= charts ================= */
function niceStep(range, count) { const raw = range / Math.max(1, count); const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
function lineChart(o) {
  const wide = window.innerWidth > 900; const W = wide ? 860 : 640, H = wide ? 300 : 280; const P0 = { l: 46, r: o.series.length > 1 ? 88 : 22, t: 16, b: 32 };
  const all = [].concat.apply([], o.series.map((s) => s.pts));
  if (!all.length) return '<p class="empty">' + T('لا توجد قراءات بعد. أضيفي أول قراءة من النموذج أدناه.', 'No readings yet. Add your first one with the form below.') + '</p>';
  let x0 = Math.min.apply(null, all.map((p) => +p.x)), x1 = Math.max.apply(null, all.map((p) => +p.x));
  if (x1 - x0 < 21 * DAY) { const m = (x0 + x1) / 2; x0 = m - 10.5 * DAY; x1 = m + 10.5 * DAY; }
  const padX = (x1 - x0) * 0.05; x0 -= padX; x1 += padX;
  const ys = all.map((p) => p.y); (o.refs || []).forEach((r) => ys.push(r.y));
  const steps = 60; const band = [];
  if (o.band) for (let i = 0; i < steps; i++) { const tm = x0 + (x1 - x0) * (i + 0.5) / steps; const b = o.band(new Date(tm)); band.push(b); if (b) { ys.push(b[0]); if (o.bandFull) ys.push(b[1]); } }
  let y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys); if (y1 - y0 < 1e-6) { y0 -= 1; y1 += 1; }
  const padY = (y1 - y0) * 0.12; y0 -= padY; y1 += padY;
  const st = niceStep(y1 - y0, 4); y0 = Math.floor(y0 / st) * st; y1 = Math.ceil(y1 / st) * st;
  const X = (t) => P0.l + (t - x0) / (x1 - x0) * (W - P0.l - P0.r);
  const Y = (v) => P0.t + (1 - (v - y0) / (y1 - y0)) * (H - P0.t - P0.b);
  let g = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || '') + '">';
  for (let v = y0; v <= y1 + st / 2; v += st) { const yy = Y(v).toFixed(1); g += '<line x1="' + P0.l + '" x2="' + (W - P0.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--line)" stroke-width="1"/><text x="' + (P0.l - 8) + '" y="' + yy + '" dy="3.5" text-anchor="end">' + num(v, st < 1 ? 1 : 0) + '</text>'; }
  if (o.band) {
    let d = ''; const bw = (W - P0.l - P0.r) / steps;
    band.forEach((b, i) => { if (!b) return; const top = Y(Math.min(b[1], y1)), bot = Y(Math.max(b[0], y0)); if (bot <= top) return; const xx = P0.l + i * bw; d += 'M' + xx.toFixed(1) + ' ' + top.toFixed(1) + 'h' + (bw + 0.6).toFixed(1) + 'V' + bot.toFixed(1) + 'h' + (-(bw + 0.6)).toFixed(1) + 'Z'; });
    g += '<path d="' + d + '" fill="var(--good)" opacity=".14"/>';
  }
  (o.refs || []).forEach((r) => { const yy = Y(r.y).toFixed(1); g += '<line x1="' + P0.l + '" x2="' + (W - P0.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/><text x="' + (W - P0.r) + '" y="' + yy + '" dy="-5" text-anchor="end">' + esc(r.label) + '</text>'; });
  for (let i = 0; i < 5; i++) { const tm = x0 + padX + (x1 - x0 - 2 * padX) * i / 4; g += '<text x="' + X(tm).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(fmtShort(new Date(tm))) + '</text>'; }
  g += '<line x1="' + P0.l + '" x2="' + (W - P0.r) + '" y1="' + (H - P0.b) + '" y2="' + (H - P0.b) + '" stroke="var(--muted)" stroke-width="1" opacity=".5"/>';
  o.series.forEach((s) => {
    const pts = s.pts.slice().sort((a, b) => a.x - b.x);
    if (pts.length > 1) g += '<path d="' + pts.map((p, i) => (i ? 'L' : 'M') + X(+p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join('') + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    pts.forEach((p) => { g += '<circle cx="' + X(+p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '" r="5.5" fill="' + (LVCOL[p.lv] || s.color) + '" stroke="var(--surface)" stroke-width="2"/>'; });
    if (o.series.length > 1 && pts.length) { const lp = pts[pts.length - 1]; g += '<text class="lbl-strong" x="' + (X(+lp.x) + 10).toFixed(1) + '" y="' + Y(lp.y).toFixed(1) + '" dy="4" style="fill:' + s.color + '">' + esc(s.name) + '</text>'; }
  });
  o.series.forEach((s) => s.pts.forEach((p) => { g += '<circle cx="' + X(+p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '" r="14" fill="transparent" data-tip="' + esc(p.tip) + '"/>'; }));
  return g + '</svg>';
}

function beadRing(n, cur, colorOf, marks, animate) {
  const c = 150, R = 126, gap = (2 * Math.PI * R) / n, rb = clamp(gap * 0.36, 4, 12.5);
  let s = '<svg viewBox="-24 -24 348 348" aria-hidden="true"><circle cx="150" cy="150" r="' + R + '" fill="none" stroke="var(--line)" stroke-width="1.5"/>';
  for (let i = 0; i < n; i++) {
    const a = (-90 + 360 * (i + 0.5) / n) * Math.PI / 180;
    const x = (c + R * Math.cos(a)).toFixed(1), y = (c + R * Math.sin(a)).toFixed(1);
    const col = colorOf(i); const an = animate && col ? ' class="bead-in" style="animation-delay:' + (i * 16) + 'ms"' : '';
    if (i === cur) {
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + (rb * 1.9).toFixed(1) + '" fill="' + (col || 'var(--rose)') + '" opacity=".22"/>';
      s += '<circle class="bead-now" cx="' + x + '" cy="' + y + '" r="' + (rb * 1.25).toFixed(1) + '" fill="' + (col || 'var(--rose)') + '" stroke="var(--surface)" stroke-width="3"/>';
    } else {
      s += '<circle' + an + ' cx="' + x + '" cy="' + y + '" r="' + rb.toFixed(1) + '" fill="' + (col || 'var(--surface)') + '" stroke="' + (col ? 'var(--surface)' : 'var(--bead-empty)') + '" stroke-width="2"/>';
    }
  }
  (marks || []).forEach((m) => {
    const a = (-90 + 360 * (m.i + 0.5) / n) * Math.PI / 180;
    const x = (c + (R + 24) * Math.cos(a)).toFixed(1), y = (c + (R + 24) * Math.sin(a)).toFixed(1);
    s += '<text x="' + x + '" y="' + y + '" dy="4" text-anchor="middle" style="font:600 11px var(--font-body);fill:var(--muted)">' + esc(m.t) + '</text>';
  });
  return s + '</svg>';
}

function calMonth(y, m, cls) {
  const first = new Date(y, m, 1, 12); const days = new Date(y, m + 1, 0).getDate();
  let h = '<div class="cal"><h4>' + esc(fmt(first, { month: 'long', year: 'numeric' })) + '</h4><div class="cal-grid">';
  for (let i = 0; i < 7; i++) { const d = new Date(2023, 0, 1 + i, 12); h += '<div class="dow">' + esc(fmt(d, { weekday: 'narrow' })) + '</div>'; }
  for (let i = 0; i < first.getDay(); i++) h += '<div></div>';
  for (let d = 1; d <= days; d++) { const dt = new Date(y, m, d, 12); h += '<div class="d ' + cls(dt) + '">' + d + '</div>'; }
  return h + '</div></div>';
}

/* journey rail: 12 weeks planning, 40 weeks pregnancy, 12 weeks after birth */
function journeyPos() {
  const st = S.profile.stage; const t = today();
  if (st === 'pre') { const f = MJ.PRECONCEPTION.filter((x) => S.checks[x.id]).length / MJ.PRECONCEPTION.length; return { seg: 0, frac: clamp(f, 0.04, 1) }; }
  if (st === 'post') { const pd = postDays(t); return { seg: 2, frac: pd == null ? 0.02 : clamp(pd / 84, 0.02, 1) }; }
  const ga = gaOn(t); return { seg: 1, frac: ga ? clamp(ga.days / 280, 0.01, 1) : 0.01 };
}
const RAIL = [{ u: 12, col: 'var(--peach)' }, { u: 40, col: 'var(--rose)' }, { u: 12, col: 'var(--plum-mid)' }];
function journeyRail() {
  const p = journeyPos(); const total = 64; let before = 0;
  RAIL.forEach((r, i) => { if (i < p.seg) before += r.u; });
  const pin = ((before + p.frac * RAIL[p.seg].u) / total * 100).toFixed(2);
  const lbl = [[T('قبل الحمل', 'Planning'), T('نحو 3 أشهر', 'about 3 months')], [T('الحمل', 'Pregnancy'), T('40 أسبوعًا', '40 weeks')], [T('بعد الولادة', 'After birth'), T('12 أسبوعًا', '12 weeks')]];
  return '<div class="rail"><div class="rail-h"><b>' + T('رحلتكِ كاملة', 'Your whole journey') + '</b><span>' + T('نحو 15 شهرًا لكل حمل', 'About 15 months per pregnancy') + '</span></div>' +
    '<div class="rail-track" role="img" aria-label="' + T('موقعك في الرحلة', 'Your place in the journey') + ': ' + esc(lbl[p.seg][0]) + '">' + RAIL.map((r, i) => '<div class="rail-seg" style="flex:' + r.u + '"><i style="width:' + (i < p.seg ? 100 : i === p.seg ? (p.frac * 100).toFixed(1) : 0) + '%;background:' + r.col + '"></i></div>').join('') +
    '<span class="rail-pin" style="inset-inline-start:' + pin + '%;border-color:' + RAIL[p.seg].col + '"></span></div>' +
    '<div class="rail-labels">' + RAIL.map((r, i) => '<div style="flex:' + r.u + '"><b>' + lbl[i][0] + '</b>' + lbl[i][1] + '</div>').join('') + '</div></div>';
}
function miniRail() { const p = journeyPos(); return '<div class="mini-rail" aria-hidden="true">' + RAIL.map((r, i) => '<span style="flex:' + r.u + '"><i style="width:' + (i < p.seg ? 100 : i === p.seg ? (p.frac * 100).toFixed(1) : 0) + '%;background:' + r.col + '"></i></span>').join('') + '</div>'; }

/* ================= UI bits ================= */
const field = (lbl, html, id) => '<div class="field"><label' + (id ? ' for="' + id + '"' : '') + '>' + lbl + '</label>' + html + '</div>';
const inp = (id, bind, type, attrs) => '<input id="' + id + '" type="' + (type || 'number') + '" data-bind="' + bind + '" ' + (attrs || '') + '>';
const seg = (act, items, cur, label) => '<div class="seg" role="group" aria-label="' + esc(label || '') + '">' + items.map((it) => '<button type="button" data-act="' + act + '" data-v="' + it[0] + '" aria-pressed="' + (String(cur) === String(it[0])) + '">' + it[1] + '</button>').join('') + '</div>';
const go = (route, text, tool) => '<a href="#' + route + '" class="btn ghost small"' + (tool ? ' data-tool="' + tool + '"' : '') + '>' + text + '</a>';
const kv = (pairs) => '<div class="kv">' + pairs.map((p) => '<div><span>' + p[0] + '</span><b>' + p[1] + '</b></div>').join('') + '</div>';
const res = (lv, big, body) => '<div class="result ' + (lv || '') + '">' + (big ? '<div class="big">' + big + '</div>' : '') + (body || '') + '</div>';
const hint = (t) => '<p class="hint">' + t + '</p>';
const head = (title, lead, right) => '<div class="page-head"><div><h1>' + title + '</h1>' + (lead ? '<p>' + lead + '</p>' : '') + '</div>' + (right || '') + '</div>';
const demoBadge = () => (S.demo ? '<span class="badge-demo">' + svg(P.info, 2) + T('بيانات تجريبية للعرض', 'Sample data for the demo') + '</span>' : '');
function toolSwitch(page, tools) {
  const cur = S.ui.tool[page];
  return '<div class="tools" role="tablist" aria-label="' + T('الأدوات', 'Tools') + '">' + tools.map((t) => '<button type="button" role="tab" id="tab-' + page + '-' + t.id + '" aria-selected="' + (t.id === cur) + '" aria-controls="panel-' + page + '" tabindex="' + (t.id === cur ? 0 : -1) + '" data-act="tool" data-page="' + page + '" data-v="' + t.id + '">' + ic(t.i) + '<span><b>' + t.t + '</b><small>' + t.d + '</small></span></button>').join('') + '</div>';
}
function panel(page, title, desc, body, right) {
  return '<section class="panel" role="tabpanel" id="panel-' + page + '" aria-labelledby="tab-' + page + '-' + S.ui.tool[page] + '"><header><div><h2>' + title + '</h2>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>' + (right || '') + '</header>' + body + '</section>';
}
function curTool(page, tools) { if (!tools.some((t) => t.id === S.ui.tool[page])) S.ui.tool[page] = tools[0].id; return S.ui.tool[page]; }

/* ================= navigation shell ================= */
const ROUTES = {
  home: { i: 'home', t: { ar: 'الرئيسية', en: 'Home' } },
  pre: { i: 'pre', t: { ar: 'قبل الحمل', en: 'Before pregnancy' }, dot: 'var(--peach)' },
  preg: { i: 'preg', t: { ar: 'أثناء الحمل', en: 'Pregnancy' }, dot: 'var(--rose)' },
  post: { i: 'post', t: { ar: 'بعد الولادة', en: 'After birth' }, dot: 'var(--plum-mid)' },
  baby: { i: 'baby', t: { ar: 'المولود', en: 'Newborn' }, dot: 'var(--cyan)' },
  labs: { i: 'labs', t: { ar: 'سجل التحاليل', en: 'Lab tracker' } },
  guide: { i: 'guide', t: { ar: 'دليل الأعراض', en: 'Symptom guide' } },
  food: { i: 'food', t: { ar: 'التغذية ونمط الحياة', en: 'Nutrition & lifestyle' } },
  summary: { i: 'summary', t: { ar: 'ملخص الطبيبة', en: 'Doctor summary' } },
  about: { i: 'about', t: { ar: 'عن المنصة', en: 'About' } }
};
const GROUPS = [
  [{ ar: 'رحلتي', en: 'My journey' }, ['home', 'pre', 'preg', 'post', 'baby']],
  [{ ar: 'الأدوات', en: 'Tools' }, ['labs', 'guide', 'food', 'summary']],
  [{ ar: 'المنصة', en: 'Platform' }, ['about']]
];
function stageRoute() { return S.profile.stage === 'pre' ? 'pre' : S.profile.stage === 'post' ? 'post' : 'preg'; }
function renderShell() {
  $('#nav').innerHTML = GROUPS.map((g) => '<div class="nav-group"><h2>' + L(g[0]) + '</h2>' + g[1].map((k) => { const r = ROUTES[k]; return '<a href="#' + k + '"' + (current === k ? ' aria-current="page"' : '') + '>' + ic(r.i) + '<span>' + L(r.t) + '</span>' + (r.dot ? '<i class="st" style="background:' + r.dot + '"></i>' : '') + '</a>'; }).join('') + '</div>').join('');
  $('#nav').setAttribute('aria-label', T('الأقسام', 'Sections'));
  const st = S.profile.stage; const t = today();
  let lbl;
  if (st === 'pre') lbl = T('التخطيط للحمل', 'Planning a pregnancy');
  else if (st === 'post') { const pd = postDays(t); lbl = pd != null ? T('اليوم ' + pd + ' بعد الولادة', 'Day ' + pd + ' after birth') : T('بعد الولادة', 'After birth'); }
  else { const ga = gaOn(t); lbl = ga ? T('الأسبوع ' + (ga.w + 1) + ' من الحمل', 'Week ' + (ga.w + 1) + ' of pregnancy') : T('أثناء الحمل', 'Pregnancy'); }
  $('#sideStage').innerHTML = '<span class="lbl">' + T('مرحلتكِ الحالية', 'Your current stage') + '</span><b>' + lbl + '</b>' + miniRail();
  const sr = stageRoute();
  const tabs = [['home', 'home', T('الرئيسية', 'Home')], [sr, ROUTES[sr].i, T('مرحلتي', 'My stage')], ['labs', 'labs', T('التحاليل', 'Labs')], ['guide', 'guide', T('الأعراض', 'Symptoms')]];
  $('#tabbar').innerHTML = tabs.map((x) => '<a href="#' + x[0] + '"' + (current === x[0] ? ' aria-current="page"' : '') + '>' + ic(x[1]) + '<span>' + x[2] + '</span></a>').join('') + '<button type="button" id="moreBtn" aria-controls="side" aria-expanded="false">' + ic('more') + '<span>' + T('المزيد', 'More') + '</span></button>';
  $('#tabbar').setAttribute('aria-label', T('التنقل السريع', 'Quick navigation'));
}

/* ================= alerts ================= */
function prenatalStatus(item, ga) {
  if (S.checks[item.id]) return 'done';
  if (!ga) return 'up';
  if (ga.w > item.e) return 'late';
  if (ga.w >= item.s) return 'now';
  return 'up';
}
function collectAlerts() {
  const out = [];
  TEST_ORDER.forEach((k) => { const e = latest(k); if (!e) return; const r = evalEntry(e); if (r.lv !== 'good') out.push({ lv: r.lv, h: '<b>' + esc(L(TESTS[k].n)) + '</b> <bdi dir="ltr">' + valText(e) + ' ' + TESTS[k].u + '</bdi><br>' + esc(r.msg), href: 'labs', test: k }); });
  const ga = S.profile.stage === 'pregnant' ? gaOn(today()) : null;
  if (ga) MJ.PRENATAL.forEach((it) => { if (prenatalStatus(it, ga) === 'late' && it.id !== 'antid' && it.id !== 'postdates') out.push({ lv: 'watch', h: '<b>' + T('فات موعد: ', 'Overdue: ') + esc(L(it.t)) + '</b><br>' + T('موعده الأسبوع ' + it.s + '–' + it.e + '. إذا أجريتِه فعلّميه في الجدول، وإلا فاسألي طبيبك.', 'Due in weeks ' + it.s + '–' + it.e + '. Tick it if done, otherwise ask your doctor.'), href: 'preg', tool: 'preg:sch' }); });
  if (S.profile.stage === 'post' && S.epds.length) { const e = S.epds[S.epds.length - 1]; if (e.score >= 10 || e.q10 > 0) out.push({ lv: e.q10 > 0 || e.score >= 13 ? 'urgent' : 'watch', h: '<b>' + T('مقياس إدنبرة: ', 'Edinburgh score: ') + e.score + ' / 30</b><br>' + T('تحدثي مع طبيبتك عن حالتك النفسية.', 'Talk to your doctor about how you feel.'), href: 'post', tool: 'post:epds' }); }
  const rank = { urgent: 0, watch: 1, good: 2 };
  return out.sort((a, b) => rank[a.lv] - rank[b.lv]);
}

/* ===================================================== VIEWS ===================================================== */
const VIEWS = {};

/* ---------- HOME ---------- */
VIEWS.home = function () {
  const st = S.profile.stage;
  let h = '<h1 class="sr">' + T('الرئيسية', 'Home') + '</h1><div class="home-top">' + seg('stage', [['pre', T('قبل الحمل', 'Planning')], ['pregnant', T('أثناء الحمل', 'Pregnant')], ['post', T('بعد الولادة', 'After birth')]], st, T('مرحلتي', 'My stage')) + demoBadge() + '</div>';
  h += st === 'pre' ? heroPre() : st === 'post' ? heroPost() : heroPreg();
  h += homeCards(st);
  return h;
};
function animOnce() { const a = !ringAnimated; ringAnimated = true; return a && !matchMedia('(prefers-reduced-motion: reduce)').matches; }
function heroPreg() {
  const t = today(); const ga = gaOn(t); const edd = eddDate();
  const editor = '<details class="edit"' + (S.profile.lmp ? '' : ' open') + '><summary>' + svg(P.pencil, 2) + T('تعديل بيانات الحمل', 'Edit pregnancy details') + '</summary><div class="fields">' +
    field(T('أول يوم من آخر دورة', 'First day of last period'), inp('h-lmp', 'profile.lmp', 'date', 'data-rr'), 'h-lmp') +
    field(T('طول الدورة (بالأيام)', 'Cycle length (days)'), inp('h-cy', 'profile.cycle', 'number', 'min="21" max="45" data-rr'), 'h-cy') +
    field(T('الطول (سم)', 'Height (cm)'), inp('h-h', 'profile.height', 'number', 'min="120" max="210" data-rr'), 'h-h') +
    field(T('الوزن قبل الحمل (كغ)', 'Pre-pregnancy weight (kg)'), inp('h-w', 'profile.preWeight', 'number', 'min="30" max="200" step="0.1" data-rr'), 'h-w') +
    '</div><label class="check"><input type="checkbox" data-bind="profile.twins" data-rr><span><b>' + T('حمل بتوأم', 'Twin pregnancy') + '</b></span></label></details>';
  if (!ga) {
    return '<section class="hero"><div class="ring-wrap">' + beadRing(40, -1, () => null) + '<div class="ring-center"><div class="n">40</div><div class="u">' + T('أسبوعًا', 'weeks') + '</div></div></div><div class="hero-body"><h2 style="font-size:clamp(1.7rem,3vw,2.2rem)">' + T('لنبدأ رحلتكِ', 'Let’s start your journey') + '</h2><p class="lead">' +
      (S.profile.lmp ? T('التاريخ المُدخل يعطي عمر حمل خارج النطاق (أكثر من 43 أسبوعًا أو تاريخًا مستقبليًا). راجعي التاريخ، أو انتقلي إلى مرحلة ما بعد الولادة.', 'The date entered gives a pregnancy age out of range (over 43 weeks or in the future). Check it, or switch to after birth.') : T('أدخلي تاريخ أول يوم من آخر دورة لعرض أسبوع الحمل وموعد الولادة المتوقع والفحوصات المستحقة.', 'Enter the first day of your last period to see your pregnancy week, due date and tests that are due.')) + '</p>' + editor + '</div>' + journeyRail() + '</section>';
  }
  const daysLeft = diffDays(edd, t); const f = fetalFor(ga.w); const triCol = ['', 'var(--t1)', 'var(--t2)', 'var(--t3)'];
  const ring = beadRing(40, ga.w, (i) => (i <= ga.w ? (i < 13 ? 'var(--t1)' : i < 27 ? 'var(--t2)' : 'var(--t3)') : null), [{ i: 9, t: '10' }, { i: 19, t: '20' }, { i: 29, t: '30' }, { i: 39, t: '40' }], animOnce());
  const fruitR = (6 + 12 * Math.min(ga.w, 40) / 40).toFixed(1);
  return '<section class="hero"><div><div class="ring-wrap">' + ring + '<div class="ring-center"><div class="s">' + T('الأسبوع', 'Week') + '</div><div class="n num">' + ga.w + '</div><div class="u">+ ' + daysW(ga.d) + '</div></div></div>' +
    '<div class="legend" style="justify-content:center;margin-top:6px"><span><i class="dot" style="background:var(--t1)"></i>' + T('الثلث الأول', '1st trimester') + '</span><span><i class="dot" style="background:var(--t2)"></i>' + T('الثاني', '2nd') + '</span><span><i class="dot" style="background:var(--t3)"></i>' + T('الثالث', '3rd') + '</span></div></div>' +
    '<div class="hero-body"><span class="chip rose">' + T('الثلث ' + TRI()[ga.tri], TRI()[ga.tri] + ' trimester') + '</span>' +
    '<h2 style="font-size:clamp(1.8rem,3.4vw,2.5rem);margin:10px 0 8px">' + T('أنتِ في الأسبوع ' + (ga.w + 1) + ' من الحمل', 'You are in week ' + (ga.w + 1) + ' of your pregnancy') + '</h2>' +
    '<p class="lead">' + T('عمر الحمل ' + gaText(ga) + '، ' + (daysLeft >= 0 ? 'ويتبقى ' + daysW(daysLeft) + ' على الموعد المتوقع.' : 'وقد تجاوزتِ الموعد المتوقع بـ' + daysW(-daysLeft) + '.'), 'Gestational age ' + gaText(ga) + ', ' + (daysLeft >= 0 ? daysW(daysLeft) + ' to your due date.' : daysW(-daysLeft) + ' past your due date.')) + '</p>' +
    '<dl class="facts"><div><dt>' + T('موعد الولادة المتوقع', 'Estimated due date') + '</dt><dd>' + esc(fmt(edd)) + '</dd><dd class="sub">' + esc(fmtHijri(edd)) + '</dd></div>' +
    '<div><dt>' + T('المتبقي', 'Remaining') + '</dt><dd>' + daysW(Math.max(0, daysLeft)) + '</dd><dd class="sub">' + T('نحو ', 'about ') + weeksW(Math.max(0, Math.round(daysLeft / 7))) + '</dd></div>' +
    '<div><dt>' + T('حجم الجنين تقريبًا', 'Baby is about the size of') + '</dt><dd class="size-fact"><svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="' + fruitR + '" fill="' + triCol[ga.tri] + '"/></svg><span>' + L(f) + '</span></dd><dd class="sub">' + (f.cm >= 1 ? num(f.cm, 1) + T(' سم', ' cm') : T('أقل من 1 سم', 'under 1 cm')) + (f.g ? T(' و', ', ') + num(f.g) + T(' غ', ' g') : '') + '</dd></div></dl>' +
    editor + '</div>' + journeyRail() + '</section>';
}
function heroPre() {
  const lp = parse(S.profile.lastPeriod), cy = clamp(+S.profile.cycle || 28, 21, 45), t = today();
  const editor = '<details class="edit"' + (lp ? '' : ' open') + '><summary>' + svg(P.pencil, 2) + T('تعديل بيانات الدورة', 'Edit cycle details') + '</summary><div class="fields">' +
    field(T('أول يوم من آخر دورة', 'First day of last period'), inp('p-lp', 'profile.lastPeriod', 'date', 'data-rr'), 'p-lp') +
    field(T('طول الدورة (بالأيام)', 'Cycle length (days)'), inp('p-cy', 'profile.cycle', 'number', 'min="21" max="45" data-rr'), 'p-cy') + '</div></details>';
  const done = MJ.PRECONCEPTION.filter((x) => S.checks[x.id]).length;
  if (!lp || diffDays(t, lp) < 0) {
    return '<section class="hero"><div class="ring-wrap">' + beadRing(28, -1, () => null) + '<div class="ring-center"><div class="n">28</div><div class="u">' + T('يومًا', 'days') + '</div></div></div><div class="hero-body"><h2 style="font-size:clamp(1.7rem,3vw,2.2rem)">' + T('استعدّي لحمل صحي', 'Get ready for a healthy pregnancy') + '</h2><p class="lead">' + T('أدخلي أول يوم من آخر دورة وطولها لعرض يوم الإباضة وأيام الخصوبة.', 'Enter the first day of your last period and cycle length to see ovulation and fertile days.') + '</p>' + editor + '</div>' + journeyRail() + '</section>';
  }
  let start = lp; while (diffDays(t, addDays(start, cy)) >= 0) start = addDays(start, cy);
  const dayIdx = diffDays(t, start); const ovIdx = cy - 14; const ov = addDays(start, ovIdx); const f0 = addDays(ov, -5), f1 = addDays(ov, 1); const next = addDays(start, cy);
  const ring = beadRing(cy, dayIdx, (i) => (i < 5 ? 'var(--rose)' : i === ovIdx ? 'var(--peach)' : i >= ovIdx - 5 && i <= ovIdx + 1 ? 'var(--peach-soft)' : null), [{ i: 0, t: '1' }, { i: ovIdx, t: String(ovIdx + 1) }], animOnce());
  const inFertile = dayIdx >= ovIdx - 5 && dayIdx <= ovIdx + 1; const toF = ovIdx - 5 - dayIdx;
  return '<section class="hero"><div><div class="ring-wrap">' + ring + '<div class="ring-center"><div class="s">' + T('يوم الدورة', 'Cycle day') + '</div><div class="n num">' + (dayIdx + 1) + '</div><div class="u">' + T('من ' + cy, 'of ' + cy) + '</div></div></div>' +
    '<div class="legend" style="justify-content:center;margin-top:6px"><span><i class="dot" style="background:var(--rose)"></i>' + T('الدورة', 'Period') + '</span><span><i class="dot" style="background:var(--peach-soft);outline:1px solid var(--peach)"></i>' + T('أيام الخصوبة', 'Fertile days') + '</span><span><i class="dot" style="background:var(--peach)"></i>' + T('الإباضة', 'Ovulation') + '</span></div></div>' +
    '<div class="hero-body"><span class="chip peach">' + T('التخطيط للحمل', 'Planning') + '</span><h2 style="font-size:clamp(1.8rem,3.4vw,2.5rem);margin:10px 0 8px">' + (inFertile ? T('أنتِ الآن في أيام الخصوبة', 'You are in your fertile window') : toF > 0 ? T('يتبقى ' + daysW(toF) + ' على أيام الخصوبة', daysW(toF) + ' until your fertile window') : T('انتهت أيام الخصوبة في هذه الدورة', 'This cycle’s fertile window has passed')) + '</h2>' +
    '<p class="lead">' + T('التقدير مبني على دورة منتظمة، إذ تحدث الإباضة عادةً قبل الدورة التالية بـ14 يومًا.', 'Estimates assume a regular cycle; ovulation is usually 14 days before the next period.') + '</p>' +
    '<dl class="facts"><div><dt>' + T('الإباضة المتوقعة', 'Expected ovulation') + '</dt><dd>' + esc(fmtDM(ov)) + '</dd></div><div><dt>' + T('أيام الخصوبة', 'Fertile window') + '</dt><dd>' + esc(fmtShort(f0)) + ' – ' + esc(fmtShort(f1)) + '</dd></div><div><dt>' + T('الدورة القادمة', 'Next period') + '</dt><dd>' + esc(fmtShort(next)) + '</dd></div>' +
    '<div><dt>' + T('قائمة الاستعداد', 'Readiness checklist') + '</dt><dd>' + done + ' / ' + MJ.PRECONCEPTION.length + '</dd><dd class="sub"><div class="progress" style="--accent:var(--peach);margin-top:6px"><i style="width:' + (100 * done / MJ.PRECONCEPTION.length).toFixed(0) + '%"></i></div></dd></div></dl>' + editor + '</div>' + journeyRail() + '</section>';
}
function postTimeline() {
  const dd = parse(S.profile.deliveryDate); if (!dd) return [];
  const f = S.profile.flags || {}; const it = [];
  it.push({ d0: 1, d1: 3, t: { ar: 'فحص حديثي الولادة (عينة الكعب)', en: 'Newborn blood spot screening (heel prick)' }, s: { ar: 'خلال 24–72 ساعة من الولادة، ويمكن إجراؤه حتى 28 يومًا إذا فات.', en: 'Within 24–72 hours of birth; up to 28 days if missed.' }, who: 'baby' });
  it.push({ d0: 0, d1: 2, t: { ar: 'تطعيم التهاب الكبد ب للمولود', en: 'Baby’s hepatitis B vaccine' }, s: { ar: 'جرعة الولادة وفق جدول وزارة الصحة.', en: 'Birth dose per the MOH schedule.' }, who: 'baby' });
  if (f.htn) it.push({ d0: 3, d1: 10, t: { ar: 'قياس ضغط الدم بعد الولادة', en: 'Blood pressure check after birth' }, s: { ar: 'خلال 72 ساعة في الارتفاع الشديد، وخلال 7–10 أيام في غيره.', en: 'Within 72 hours if severe, otherwise within 7–10 days.' }, who: 'mom' });
  it.push({ d0: 3, d1: 5, t: { ar: 'الزيارة الأولى للمولود وفحص اليرقان', en: 'Baby’s first check and jaundice review' }, s: { ar: 'قياس الوزن وتقييم الرضاعة ولون الجلد.', en: 'Weight, feeding and colour check.' }, who: 'baby' });
  it.push({ d0: 10, d1: 14, t: { ar: 'تقييم المزاج بمقياس إدنبرة', en: 'Edinburgh mood check' }, s: { ar: 'يُفترض أن تخف كآبة النفاس خلال أسبوعين، وإلا فقيّمي حالتك النفسية.', en: 'Baby blues should ease by 2 weeks; if not, check your mood.' }, who: 'mom' });
  it.push({ d0: 0, d1: 21, t: { ar: 'أول تواصل مع طبيبتك', en: 'First contact with your doctor' }, s: { ar: 'خلال الأسابيع الثلاثة الأولى وفق توصية ACOG.', en: 'Within the first 3 weeks (ACOG).' }, who: 'mom' });
  if (f.gdm) it.push({ d0: 28, d1: 84, t: { ar: 'تحليل تحمل السكر بعد سكر الحمل', en: 'Glucose tolerance test after gestational diabetes' }, s: { ar: 'بين الأسبوعين 4 و12 بعد الولادة.', en: 'Between 4 and 12 weeks after birth.' }, who: 'mom' });
  it.push({ d0: 56, d1: 63, t: { ar: 'تطعيمات الشهرين للمولود', en: 'Baby’s 2-month vaccines' }, s: { ar: 'شلل الأطفال، والثلاثي البكتيري، والتهاب الكبد ب، والمستدمية النزلية، والمكورات الرئوية، والروتا.', en: 'Polio, DTaP, hepatitis B, Hib, pneumococcal and rotavirus.' }, who: 'baby' });
  it.push({ d0: 21, d1: 84, t: { ar: 'الزيارة الشاملة بعد الولادة', en: 'Comprehensive postpartum visit' }, s: { ar: 'قبل نهاية الأسبوع 12: المزاج والرضاعة وتنظيم الحمل والأمراض المزمنة والتعافي.', en: 'By 12 weeks: mood, feeding, contraception, chronic conditions and recovery.' }, who: 'mom' });
  return it.map((x) => Object.assign(x, { date0: addDays(dd, x.d0), date1: addDays(dd, x.d1) })).sort((a, b) => a.d1 - b.d1 || a.d0 - b.d0);
}
function lochiaStage(pd) {
  if (pd <= 3) return { ar: 'أحمر (اللوكيا الحمراء): نزيف متوسط، وقد تظهر جلطات صغيرة.', en: 'Red (lochia rubra): moderate flow, small clots possible.' };
  if (pd <= 10) return { ar: 'وردي إلى بني (اللوكيا المصلية): أخف من السابق.', en: 'Pink to brown (lochia serosa): lighter than before.' };
  if (pd <= 42) return { ar: 'أصفر فاتح أو أبيض (اللوكيا البيضاء): خفيف ويقل تدريجيًا.', en: 'Yellowish-white (lochia alba): light and fading.' };
  return { ar: 'يُفترض أن النزيف قد توقف؛ أبلغي طبيبك عن أي نزيف جديد.', en: 'Bleeding should have stopped; report any new bleeding.' };
}
function heroPost() {
  const t = today(); const pd = postDays(t);
  const editor = '<details class="edit"' + (pd != null ? '' : ' open') + '><summary>' + svg(P.pencil, 2) + T('تعديل بيانات الولادة', 'Edit birth details') + '</summary><div class="fields">' +
    field(T('تاريخ الولادة', 'Date of birth'), inp('o-dd', 'profile.deliveryDate', 'date', 'data-rr'), 'o-dd') + '</div>' +
    (pd == null ? '<button class="btn soft small" type="button" data-act="demoPost">' + T('عرض مثال (ولادة قبل 18 يومًا)', 'Show an example (birth 18 days ago)') + '</button>' : '') + '</details>';
  if (pd == null) {
    return '<section class="hero"><div class="ring-wrap">' + beadRing(12, -1, () => null) + '<div class="ring-center"><div class="n">12</div><div class="u">' + T('أسبوعًا', 'weeks') + '</div></div></div><div class="hero-body"><span class="chip plum">' + T('الثلث الرابع', 'Fourth trimester') + '</span><h2 style="font-size:clamp(1.7rem,3vw,2.2rem);margin-top:10px">' + T('الأسابيع الاثنا عشر الأولى بعد الولادة', 'Your first 12 weeks after birth') + '</h2><p class="lead">' + T('أدخلي تاريخ الولادة لعرض يوم التعافي ومواعيد المتابعة لكِ ولمولودك.', 'Enter the birth date to see your recovery day and follow-ups for you and your baby.') + '</p>' + editor + '</div>' + journeyRail() + '</section>';
  }
  const wk = Math.floor(pd / 7); const next = postTimeline().find((x) => diffDays(x.date1, t) >= 0);
  const ring = beadRing(12, Math.min(wk, 11), (i) => (i <= wk ? 'var(--plum-mid)' : null), [{ i: 5, t: '6' }, { i: 11, t: '12' }], animOnce());
  const ep = S.epds.length ? S.epds[S.epds.length - 1] : null;
  return '<section class="hero"><div><div class="ring-wrap">' + ring + '<div class="ring-center"><div class="s">' + T('اليوم', 'Day') + '</div><div class="n num">' + pd + '</div><div class="u">' + T('بعد الولادة', 'after birth') + '</div></div></div>' +
    '<div class="legend" style="justify-content:center;margin-top:6px"><span><i class="dot" style="background:var(--plum-mid)"></i>' + T('كل خرزة أسبوع من الثلث الرابع', 'Each bead is a week of the fourth trimester') + '</span></div></div>' +
    '<div class="hero-body"><span class="chip plum">' + T('الثلث الرابع', 'Fourth trimester') + '</span>' +
    '<h2 style="font-size:clamp(1.8rem,3.4vw,2.5rem);margin:10px 0 8px">' + (pd <= 84 ? T('الأسبوع ' + (wk + 1) + ' من التعافي', 'Week ' + (wk + 1) + ' of recovery') : T('أكملتِ الثلث الرابع', 'You have completed the fourth trimester')) + '</h2>' +
    '<p class="lead">' + T('يتعافى جسمكِ وينمو مولودكِ، وتتابعين الاثنين من هنا.', 'Your body is recovering and your baby is growing. Track both here.') + '</p>' +
    '<dl class="facts"><div><dt>' + T('النزيف المتوقع الآن', 'Expected bleeding now') + '</dt><dd style="font-size:.95rem;font-weight:600">' + L(lochiaStage(pd)) + '</dd></div>' +
    '<div><dt>' + T('الموعد القادم', 'Next follow-up') + '</dt><dd style="font-size:.98rem">' + (next ? L(next.t) : T('لا توجد مواعيد قادمة', 'Nothing upcoming')) + '</dd>' + (next ? '<dd class="sub">' + esc(fmtShort(next.date0)) + (next.d1 !== next.d0 ? ' – ' + esc(fmtShort(next.date1)) : '') + '</dd>' : '') + '</div>' +
    '<div><dt>' + T('مقياس إدنبرة', 'Edinburgh score') + '</dt><dd>' + (ep ? ep.score + ' / 30' : T('لم يُجرَ بعد', 'Not done yet')) + '</dd><dd class="sub">' + (ep ? esc(fmtShort(parse(ep.date))) : '<a class="link" href="#post" data-tool="post:epds">' + T('ابدئي التقييم', 'Take it now') + '</a>') + '</dd></div></dl>' + editor + '</div>' + journeyRail() + '</section>';
}
function latestCard() {
  const rows = TEST_ORDER.map((k) => { const e = latest(k); if (!e) return ''; const r = evalEntry(e);
    return '<li><div><b>' + L(TESTS[k].n) + '</b><small>' + esc(fmtShort(parse(e.date))) + '</small></div><div class="rv"><bdi dir="ltr"><span class="num">' + valText(e) + '</span> <small>' + TESTS[k].u + '</small></bdi>' + chip(r.lv) + '</div></li>'; }).join('');
  return '<section class="card"><h3>' + T('آخر نتائجكِ', 'Your latest results') + '</h3><div class="sub">' + T('مقارنةً بالمعدل الطبيعي لمرحلتكِ', 'Compared with the normal range for your stage') + '</div>' + (rows ? '<ul class="rows">' + rows + '</ul>' : '<p class="empty">' + T('لا توجد نتائج مسجلة بعد. أضيفي أول نتيجة من سجل التحاليل.', 'No results yet. Add your first one in the lab tracker.') + '</p>') + '<div class="btn-row" style="margin-top:14px">' + go('labs', T('فتح سجل التحاليل', 'Open lab tracker')) + '</div></section>';
}
function alertsCard() {
  const a = collectAlerts();
  if (!a.length) return '<section class="card ok-line"><span class="chip good" style="padding:5px 8px">' + I.good + '</span><div><b>' + T('لا توجد تنبيهات', 'No alerts') + '</b><span class="hint"> ' + T('جميع نتائجكِ ومواعيدكِ ضمن المتوقع.', 'All your results and visits are on track.') + '</span></div></section>';
  return '<section class="card alerts"><h3>' + T('يحتاج إلى انتباهكِ', 'Needs your attention') + ' <span class="count">' + a.length + '</span></h3><ul class="alert-list">' +
    a.slice(0, 5).map((x) => '<li class="' + x.lv + '"><span class="ic">' + I[x.lv] + '</span><div>' + x.h + '</div><a href="#' + x.href + '" class="more link"' + (x.tool ? ' data-tool="' + x.tool + '"' : '') + (x.test ? ' data-lab="' + x.test + '"' : '') + '>' + T('التفاصيل', 'Details') + '</a></li>').join('') + '</ul></section>';
}
function tlItems(items) {
  return '<ol class="tl">' + items.map((o) => '<li class="' + (o.cls || '') + '"><div class="when">' + o.when + '</div><div class="what">' + o.what + '</div>' + (o.det ? '<div class="det">' + o.det + '</div>' : '') + (o.extra || '') + '</li>').join('') + '</ol>';
}
const wkRange = (s, e) => T('الأسبوع ' + s + (e !== s ? '–' + e : ''), 'Week ' + s + (e !== s ? '–' + e : ''));
function homeCards(st) {
  const t = today(); let main = '', side = '';
  if (st === 'pregnant') {
    const ga = gaOn(t);
    if (ga) {
      main += alertsCard();
      const items = MJ.PRENATAL.map((x) => ({ x: x, s: prenatalStatus(x, ga) })).filter((o) => o.s === 'now' || o.s === 'up').slice(0, 3);
      main += '<section class="card"><h3>' + T('المستحق الآن والقادم', 'Due now and next') + '</h3><div class="sub">' + T('بحسب عمر الحمل', 'Based on your pregnancy week') + '</div>' +
        (items.length ? tlItems(items.map((o) => ({ cls: o.s === 'now' ? 'now' : '', when: wkRange(o.x.s, o.x.e) + (o.s === 'now' ? ' · ' + T('مستحق الآن', 'due now') : ''), what: L(o.x.t), det: L(o.x.d) }))) : '<p class="empty">' + T('لا يوجد ما هو مستحق حاليًا.', 'Nothing is due right now.') + '</p>') +
        '<div class="btn-row">' + go('preg', T('عرض جدول المتابعة', 'View the schedule'), 'preg:sch') + '</div></section>';
      const tips = MJ.WEEK_TIPS.find((x) => ga.w >= x.from && ga.w <= x.to) || MJ.WEEK_TIPS[0];
      side += '<section class="card tint"><h3>' + T('إرشادات لهذه المرحلة', 'Tips for this stage') + '</h3><ul class="bul">' + L([tips.ar, tips.en]).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><div class="btn-row" style="margin-top:16px">' +
        '<a class="btn small" href="#preg" data-tool="preg:kick">' + T('عدّاد حركة الجنين', 'Kick counter') + '</a><a class="btn ghost small" href="#preg" data-tool="preg:bp">' + T('قياس الضغط', 'Blood pressure') + '</a></div></section>';
      side += latestCard();
    } else side += latestCard();
  } else if (st === 'pre') {
    const left = MJ.PRECONCEPTION.filter((x) => !S.checks[x.id]);
    main += alertsCard();
    main += '<section class="card"><h3>' + T('قائمة الاستعداد للحمل', 'Pregnancy readiness') + '</h3><div class="sub">' + T('تبقى ' + left.length + ' من ' + MJ.PRECONCEPTION.length, left.length + ' of ' + MJ.PRECONCEPTION.length + ' left') + '</div><ul class="rows">' + left.slice(0, 5).map((x) => '<li><div><b>' + L(x.t) + '</b><small>' + L(x.d) + '</small></div></li>').join('') + '</ul><div class="btn-row" style="margin-top:14px">' + go('pre', T('عرض القائمة كاملة', 'View the full list'), 'pre:check') + '</div></section>';
    side += latestCard();
  } else {
    const pd = postDays(t);
    main += alertsCard();
    if (pd != null) {
      const tl = postTimeline().filter((x) => diffDays(x.date1, t) >= 0).slice(0, 4);
      main += '<section class="card"><h3>' + T('مواعيدكِ ومواعيد مولودكِ', 'Your and your baby’s follow-ups') + '</h3><div class="sub">' + T('المواعيد القادمة', 'Coming up') + '</div>' +
        (tl.length ? tlItems(tl.map((x) => ({ cls: diffDays(t, x.date0) >= 0 ? 'now' : '', when: esc(fmtShort(x.date0)) + (x.d1 !== x.d0 ? ' – ' + esc(fmtShort(x.date1)) : '') + ' · ' + (x.who === 'baby' ? T('المولود', 'Baby') : T('الأم', 'Mother')), what: L(x.t), det: L(x.s) }))) : '<p class="empty">' + T('لا توجد مواعيد قادمة.', 'Nothing upcoming.') + '</p>') +
        '<div class="btn-row">' + go('post', T('صفحة ما بعد الولادة', 'After-birth page')) + go('baby', T('صفحة المولود', 'Newborn page')) + '</div></section>';
    }
    side += '<section class="card danger-card"><h3>' + T('علامات تستدعي الطوارئ', 'Signs that need emergency care') + '</h3><ul class="bul">' + MJ.POSTBIRTH.slice(0, 6).map((x) => '<li>' + L(x) + '</li>').join('') + '</ul><div class="btn-row" style="margin-top:12px">' + go('guide', T('دليل الأعراض', 'Symptom guide')) + '</div></section>';
    side += latestCard();
  }
  return '<div class="dash"><div class="dash-col">' + main + '</div><div class="dash-col">' + side + '</div></div>';
}

/* ---------- PRE ---------- */
const PRE_TOOLS = () => [
  { id: 'ovu', i: 'flower', t: T('الإباضة والخصوبة', 'Ovulation'), d: T('أيام الخصوبة على التقويم', 'Fertile days on a calendar') },
  { id: 'bmi', i: 'ruler', t: T('مؤشر كتلة الجسم', 'Body mass index'), d: T('والزيادة الموصى بها', 'and recommended gain') },
  { id: 'check', i: 'check', t: T('قائمة الاستعداد', 'Readiness checklist'), d: T('12 فحصًا وإجراءً', '12 checks and steps') },
  { id: 'tips', i: 'bulb', t: T('إرشادات مهمة', 'Key guidance'), d: T('الفوليك والتطعيمات', 'Folic acid and vaccines') }
];
VIEWS.pre = function () {
  const tools = PRE_TOOLS(); const cur = curTool('pre', tools);
  let h = head(T('الاستعداد للحمل', 'Getting ready for pregnancy'), T('احسبي أيام الخصوبة، وتعرّفي على وزنكِ الصحي، وتابعي الفحوصات اللازمة قبل الحمل.', 'Work out your fertile days, check your weight, and follow the checks to do before you conceive.'));
  h += toolSwitch('pre', tools);
  if (cur === 'ovu') h += panel('pre', T('حاسبة الإباضة وأيام الخصوبة', 'Ovulation and fertile days'), T('تفترض الحاسبة دورة منتظمة، إذ تحدث الإباضة عادةً قبل الدورة التالية بـ14 يومًا.', 'Assumes a regular cycle; ovulation is usually 14 days before the next period.'),
    '<div data-calc><div class="fields" style="max-width:520px">' + field(T('أول يوم من آخر دورة', 'First day of last period'), inp('ov-lp', 'profile.lastPeriod', 'date'), 'ov-lp') + field(T('طول الدورة (بالأيام)', 'Cycle length (days)'), inp('ov-cy', 'profile.cycle', 'number', 'min="21" max="45"'), 'ov-cy') + '</div><div class="out" data-out="ovu"></div></div>');
  if (cur === 'bmi') h += panel('pre', T('مؤشر كتلة الجسم', 'Body mass index'), T('يحدد المؤشر قبل الحمل مقدار الزيادة الموصى بها في الوزن أثناء الحمل.', 'Your BMI before pregnancy sets your recommended weight gain.'),
    '<div class="split" data-calc><div class="fields" style="grid-template-columns:1fr 1fr">' + field(T('الطول (سم)', 'Height (cm)'), inp('b-h', 'profile.height', 'number', 'min="120" max="210"'), 'b-h') + field(T('الوزن (كغ)', 'Weight (kg)'), inp('b-w', 'profile.preWeight', 'number', 'min="30" max="200" step="0.1"'), 'b-w') + '</div><div class="out" data-out="bmi"></div></div>');
  if (cur === 'check') {
    const done = MJ.PRECONCEPTION.filter((x) => S.checks[x.id]).length;
    h += panel('pre', T('قائمة الاستعداد للحمل', 'Pregnancy readiness checklist'), T('علّمي ما أنجزتِه. تُحفظ القائمة في هذا المتصفح.', 'Tick what you’ve done. The list is saved in this browser.'),
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div class="progress" style="flex:1"><i style="width:' + (100 * done / MJ.PRECONCEPTION.length).toFixed(0) + '%"></i></div><b class="num">' + done + ' / ' + MJ.PRECONCEPTION.length + '</b></div>' +
      '<div class="grid" style="gap:2px 16px">' + MJ.PRECONCEPTION.map((x) => '<label class="check"><input type="checkbox" data-bind="checks.' + x.id + '" data-rr><span><b>' + L(x.t) + '</b><small>' + L(x.d) + '</small></span></label>').join('') + '</div>');
  }
  if (cur === 'tips') h += panel('pre', T('إرشادات مهمة قبل الحمل', 'Key guidance before pregnancy'), '',
    '<div class="grid">' + [[T('حمض الفوليك', 'Folic acid'), T('تناول 400 ميكروغرام يوميًا قبل الحمل بثلاثة أشهر وحتى الأسبوع 12 يقلل عيوب الأنبوب العصبي.', '400 mcg daily from 3 months before conception to week 12 lowers neural tube defects.')],
      [T('التطعيمات', 'Vaccines'), T('لقاحا الحصبة الألمانية والجديري يُعطيان قبل الحمل بشهر على الأقل لأنهما لقاحان حيّان، أما لقاح الإنفلونزا فآمن في أي وقت.', 'Rubella and chickenpox vaccines go at least 1 month before pregnancy (live vaccines). Flu vaccine is safe any time.')],
      [T('الأمراض المزمنة', 'Long-term conditions'), T('اضبطي السكري والضغط والغدة الدرقية والصرع قبل الحمل، وراجعي أدويتك مع الطبيب.', 'Get diabetes, blood pressure, thyroid and epilepsy controlled first and review your medicines.')]].map((x) => '<div class="card tint"><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div>').join('') + '</div>');
  return h;
};

/* ---------- PREG ---------- */
const PREG_TOOLS = () => [
  { id: 'edd', i: 'cal', t: T('موعد الولادة', 'Due date'), d: T('وعمر الحمل', 'and pregnancy age') },
  { id: 'wg', i: 'scale', t: T('زيادة الوزن', 'Weight gain'), d: T('حسب مؤشر الكتلة', 'by BMI') },
  { id: 'bp', i: 'gauge', t: T('ضغط الدم', 'Blood pressure'), d: T('وعلامات تسمم الحمل', 'and pre-eclampsia') },
  { id: 'og', i: 'drop', t: T('سكر الحمل', 'Glucose test'), d: T('نتيجة OGTT', 'OGTT result') },
  { id: 'kick', i: 'kick', t: T('حركة الجنين', 'Baby movements'), d: T('عدّاد الركلات', 'Kick counter') },
  { id: 'ct', i: 'timer', t: T('مؤقت الطلق', 'Contractions'), d: T('قاعدة 5-1-1', 'The 5-1-1 rule') },
  { id: 'sch', i: 'list', t: T('جدول المتابعة', 'Schedule'), d: T('الزيارات والفحوصات', 'Visits and tests') },
  { id: 'red', i: 'alert', t: T('علامات الخطر', 'Warning signs'), d: T('متى أذهب للطوارئ', 'When to go to hospital') }
];
VIEWS.preg = function () {
  const ga = gaOn(today()); const tools = PREG_TOOLS(); const cur = curTool('preg', tools);
  let h = head(T('متابعة الحمل', 'Pregnancy care'), T('حاسبات تعمل فورًا وتقارن نتائجكِ بالإرشادات الطبية المعتمدة.', 'Calculators that work instantly and compare your results with established guidelines.'), ga ? '<span class="chip rose" style="font-size:.95rem;padding:5px 14px">' + T('عمر الحمل: ', 'Pregnancy age: ') + gaText(ga) + '</span>' : '');
  h += toolSwitch('preg', tools);
  if (cur === 'edd') {
    const m = (S.calc.edd || {}).method || 'lmp'; let f = '';
    if (m === 'lmp') f = field(T('أول يوم من آخر دورة', 'First day of last period'), inp('e-l', 'calc.edd.lmp', 'date'), 'e-l') + field(T('طول الدورة', 'Cycle length'), inp('e-c', 'calc.edd.cycle', 'number', 'min="21" max="45"'), 'e-c');
    if (m === 'conc') f = field(T('تاريخ الإخصاب', 'Conception date'), inp('e-cn', 'calc.edd.conc', 'date'), 'e-cn');
    if (m === 'us') f = field(T('تاريخ السونار', 'Scan date'), inp('e-u', 'calc.edd.us', 'date'), 'e-u') + field(T('العمر بالسونار (أسابيع)', 'Age at scan (weeks)'), inp('e-uw', 'calc.edd.usW', 'number', 'min="4" max="40"'), 'e-uw') + field(T('وأيام', 'plus days'), inp('e-ud', 'calc.edd.usD', 'number', 'min="0" max="6"'), 'e-ud');
    if (m === 'ivf') f = field(T('تاريخ إرجاع الأجنة', 'Embryo transfer date'), inp('e-i', 'calc.edd.ivf', 'date'), 'e-i') + field(T('عمر الجنين عند الإرجاع', 'Embryo age at transfer'), '<select id="e-id" data-bind="calc.edd.ivfDay"><option value="3">' + T('اليوم الثالث', 'Day 3') + '</option><option value="5">' + T('اليوم الخامس', 'Day 5') + '</option></select>', 'e-id');
    h += panel('preg', T('حاسبة موعد الولادة وعمر الحمل', 'Due date and pregnancy age'), T('وفق قاعدة نيغلي مع تعديل طول الدورة. اختاري طريقة الحساب المتوفرة لديك.', 'Naegele’s rule, adjusted for cycle length. Pick the method you have data for.'),
      '<div style="margin-bottom:14px">' + seg('eddMethod', [['lmp', T('آخر دورة', 'Last period')], ['conc', T('الإخصاب', 'Conception')], ['us', T('السونار', 'Ultrasound')], ['ivf', T('أطفال الأنابيب', 'IVF')]], m, T('طريقة الحساب', 'Method')) + '</div><div class="split" data-calc><div class="fields">' + f + '</div><div class="out" data-out="edd"></div></div>');
  }
  if (cur === 'wg') h += panel('preg', T('زيادة الوزن الموصى بها', 'Recommended weight gain'), T('وفق مؤشر كتلة الجسم قبل الحمل وإرشادات IOM لعام 2009.', 'By pre-pregnancy BMI, per IOM 2009.'),
    '<div class="split" data-calc><div><div class="fields" style="grid-template-columns:1fr 1fr">' + field(T('الطول (سم)', 'Height (cm)'), inp('w-h', 'profile.height', 'number'), 'w-h') + field(T('الوزن قبل الحمل (كغ)', 'Pre-pregnancy weight (kg)'), inp('w-p', 'profile.preWeight', 'number', 'step="0.1"'), 'w-p') +
    field(T('وزنكِ الحالي (كغ)', 'Current weight (kg)'), inp('w-c', 'calc.wg.cur', 'number', 'step="0.1"'), 'w-c') + field(T('أسبوع الحمل', 'Pregnancy week'), inp('w-k', 'calc.wg.week', 'number', 'min="0" max="42"'), 'w-k') +
    '</div><label class="check"><input type="checkbox" data-bind="profile.twins"><span><b>' + T('حمل بتوأم', 'Twin pregnancy') + '</b></span></label></div><div class="out" data-out="wg"></div></div>');
  if (cur === 'bp') h += panel('preg', T('تصنيف ضغط الدم', 'Blood pressure check'), T('أدخلي القراءة وأي أعراض مصاحبة لتقييم علامات تسمم الحمل.', 'Enter your reading and any symptoms to check for pre-eclampsia warning signs.'),
    '<div class="split" data-calc><div><div class="fields" style="grid-template-columns:1fr 1fr">' + field(T('الانقباضي (الرقم العلوي)', 'Systolic (top number)'), inp('bp-s', 'calc.bp.sys', 'number', 'min="60" max="250"'), 'bp-s') + field(T('الانبساطي (الرقم السفلي)', 'Diastolic (bottom number)'), inp('bp-d', 'calc.bp.dia', 'number', 'min="30" max="160"'), 'bp-d') + '</div>' +
    '<fieldset style="border:0;padding:0;margin:0"><legend class="hint" style="margin-bottom:4px;font-weight:600">' + T('هل لديكِ أي من هذه الأعراض؟', 'Do you have any of these?') + '</legend><div class="inline-checks">' +
    [['head', T('صداع شديد', 'Severe headache')], ['vision', T('تشوش الرؤية أو ومضات', 'Blurred vision or flashes')], ['epi', T('ألم في أعلى البطن', 'Upper abdominal pain')], ['swell', T('تورم مفاجئ في الوجه أو اليدين', 'Sudden face or hand swelling')], ['sob', T('ضيق في التنفس', 'Shortness of breath')]].map((x) => '<label class="check"><input type="checkbox" data-bind="calc.bp.' + x[0] + '"><span>' + x[1] + '</span></label>').join('') + '</div></fieldset></div><div class="out" data-out="bp"></div></div>');
  if (cur === 'og') h += panel('preg', T('نتيجة تحليل تحمل الجلوكوز (OGTT)', 'Glucose tolerance test (OGTT)'), T('تحليل 75 غرامًا بين الأسبوعين 24 و28، وفق معايير IADPSG.', '75 g test at weeks 24–28, IADPSG criteria.'),
    '<div style="margin-bottom:14px">' + seg('ogUnit', [['mg', 'mg/dL'], ['mmol', 'mmol/L']], (S.calc.og || {}).unit || 'mg', T('الوحدة', 'Unit')) + '</div><div class="split" data-calc><div class="fields">' +
    field(T('صائم', 'Fasting'), inp('og-f', 'calc.og.f', 'number', 'step="0.1"'), 'og-f') + field(T('بعد ساعة', 'At 1 hour'), inp('og-1', 'calc.og.h1', 'number', 'step="0.1"'), 'og-1') + field(T('بعد ساعتين', 'At 2 hours'), inp('og-2', 'calc.og.h2', 'number', 'step="0.1"'), 'og-2') + '</div><div class="out" data-out="og"></div></div>');
  if (cur === 'kick') h += panel('preg', T('عدّاد حركة الجنين', 'Kick counter'), T('ابدئي من الأسبوع 28: استلقي على جانبكِ واضغطي مع كل حركة. الهدف 10 حركات خلال ساعتين.', 'From week 28: lie on your side and tap for each movement. Aim for 10 within 2 hours.'), '<div data-live="kick">' + kickPanel() + '</div>');
  if (cur === 'ct') h += panel('preg', T('مؤقت الطلق', 'Contraction timer'), T('اضغطي مع بداية الانقباضة، ثم اضغطي مرة أخرى عند انتهائها.', 'Tap when a contraction starts and again when it ends.'), '<div data-live="ct">' + ctPanel() + '</div>');
  if (cur === 'sch') h += panel('preg', T('جدول الزيارات والفحوصات', 'Visits and tests schedule'), T('تكون الزيارات عادةً كل 4 أسابيع حتى الأسبوع 28، ثم كل أسبوعين حتى الأسبوع 36، ثم أسبوعيًا. علّمي ما أجريتِه.', 'Visits are usually every 4 weeks to week 28, every 2 weeks to 36, then weekly. Tick what’s done.'),
    tlItems(MJ.PRENATAL.map((it) => { const s = prenatalStatus(it, ga); return { cls: s === 'done' ? 'done' : s === 'now' ? 'now' : s === 'late' ? 'late' : '', when: wkRange(it.s, it.e) + (s === 'now' ? ' · ' + T('مستحق الآن', 'due now') : s === 'late' ? ' · ' + T('فات موعده', 'overdue') : ''), what: L(it.t), det: L(it.d), extra: '<label class="check"><input type="checkbox" data-bind="checks.' + it.id + '" data-rr> ' + T('أُجري', 'Done') + '</label>' }; })));
  if (cur === 'red') h += panel('preg', T('علامات الخطر أثناء الحمل', 'Warning signs in pregnancy'), T('عند ظهور أي منها توجّهي إلى المستشفى فورًا، أو اتصلي بالرقم 997.', 'If you have any of these, go to hospital now or call 997.'),
    '<ul class="bul" style="columns:2 260px;column-gap:32px">' + [T('نزيف مهبلي أو نزول ماء', 'Vaginal bleeding or leaking fluid'), T('قلة حركة الجنين أو توقفها', 'Fewer or no baby movements'), T('صداع شديد مع تشوش الرؤية، أو ألم في أعلى البطن', 'Severe headache with vision changes, or upper abdominal pain'), T('ضغط دم 160/110 فأعلى', 'BP 160/110 or higher'), T('تورم مفاجئ في الوجه واليدين', 'Sudden swelling of face and hands'), T('انقباضات منتظمة قبل الأسبوع 37', 'Regular contractions before week 37'), T('حرارة 38 درجة فأعلى', 'Temperature of 38 °C or more'), T('ألم في الصدر أو ضيق في التنفس أو تشنجات', 'Chest pain, breathlessness or seizures')].map((x) => '<li>' + x + '</li>').join('') + '</ul><div class="btn-row" style="margin-top:16px">' + go('guide', T('افتحي دليل الأعراض', 'Open the symptom guide')) + '</div>');
  return h;
};

/* ---------- POST ---------- */
const POST_TOOLS = () => [
  { id: 'plan', i: 'cal', t: T('المواعيد', 'Follow-ups'), d: T('لكِ ولمولودكِ', 'for you and baby') },
  { id: 'epds', i: 'mood', t: T('مقياس إدنبرة', 'Edinburgh scale'), d: T('الصحة النفسية', 'Emotional health') },
  { id: 'rec', i: 'band', t: T('التعافي', 'Recovery'), d: T('النزيف والجرح والدورة', 'Bleeding, wound, periods') },
  { id: 'red', i: 'alert', t: T('علامات الخطر', 'Warning signs'), d: T('متى أذهب للطوارئ', 'When to go to hospital') }
];
VIEWS.post = function () {
  const pd = postDays(today()); const tools = POST_TOOLS(); const cur = curTool('post', tools);
  let h = head(T('التعافي بعد الولادة', 'Recovery after birth'), T('متابعة الأسابيع الاثني عشر الأولى بعد الولادة: المواعيد، والصحة النفسية، والتعافي الجسدي.', 'The first 12 weeks after birth: follow-ups, emotional health and physical recovery.'), pd != null ? '<span class="chip plum" style="font-size:.95rem;padding:5px 14px">' + T('اليوم ' + pd + ' بعد الولادة', 'Day ' + pd + ' after birth') + '</span>' : '');
  h += toolSwitch('post', tools);
  if (cur === 'plan') {
    const tl = postTimeline(); const t = today();
    h += panel('post', T('بيانات الولادة والمواعيد', 'Birth details and follow-ups'), T('تُحسب مواعيد المتابعة لكِ ولمولودكِ وفق توصيات ACOG ووزارة الصحة.', 'Your and your baby’s follow-ups, per ACOG and MOH recommendations.'),
      '<div class="split"><div><div class="fields">' + field(T('تاريخ الولادة', 'Date of birth'), inp('pp-d', 'profile.deliveryDate', 'date', 'data-rr'), 'pp-d') + field(T('نوع الرضاعة', 'Feeding'), '<select id="pp-f" data-bind="profile.feeding" data-rr><option value="breast">' + T('طبيعية فقط', 'Breast only') + '</option><option value="mixed">' + T('مختلطة', 'Mixed') + '</option><option value="formula">' + T('صناعية', 'Formula') + '</option></select>', 'pp-f') + '</div>' +
      '<div>' + [['cs', T('ولادة قيصرية', 'Caesarean birth')], ['gdm', T('أُصبت بسكر الحمل', 'Had gestational diabetes')], ['htn', T('أُصبت بارتفاع الضغط أو تسمم الحمل', 'Had high BP or pre-eclampsia')]].map((x) => '<label class="check"><input type="checkbox" data-bind="profile.flags.' + x[0] + '" data-rr><span>' + x[1] + '</span></label>').join('') + '</div>' +
      (pd == null ? '<div class="btn-row" style="margin-top:10px"><button class="btn soft small" type="button" data-act="demoPost">' + T('عرض مثال (ولادة قبل 18 يومًا)', 'Show an example (birth 18 days ago)') + '</button></div>' : '') + '</div><div>' +
      (tl.length ? tlItems(tl.map((x) => { const past = diffDays(t, x.date1) > 0, now = !past && diffDays(t, x.date0) >= 0; return { cls: past ? 'done' : now ? 'now' : '', when: esc(fmtShort(x.date0)) + (x.d1 !== x.d0 ? ' – ' + esc(fmtShort(x.date1)) : '') + ' · ' + (x.who === 'baby' ? T('المولود', 'Baby') : T('الأم', 'Mother')) + (now ? ' · ' + T('الآن', 'now') : ''), what: L(x.t), det: L(x.s) }; })) : '<p class="empty">' + T('أدخلي تاريخ الولادة لعرض المواعيد.', 'Enter the birth date to see follow-ups.') + '</p>') + '</div></div>');
  }
  if (cur === 'epds') h += panel('post', T('مقياس إدنبرة لاكتئاب ما بعد الولادة', 'Edinburgh Postnatal Depression Scale'), T('أجيبي عن مشاعركِ خلال الأيام السبعة الماضية. عشرة أسئلة، والنتيجة من 30. هذه أداة فحص وليست تشخيصًا.', 'About the past 7 days. Ten questions, scored out of 30. A screening tool, not a diagnosis.'),
    '<div data-calc><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr));gap:0 32px">' + MJ.EPDS.map((q, i) => '<fieldset class="q" style="border:0;margin:0;padding-inline:0"><legend class="qt">' + (i + 1) + '. ' + L(q.q) + '</legend><div class="opts">' + q.o.map((o) => '<label><input type="radio" name="epds' + i + '" value="' + o[2] + '" data-bind="epdsDraft.' + i + '" data-num> ' + esc(L(o)) + '</label>').join('') + '</div></fieldset>').join('') + '</div>' +
    '<div class="out" data-out="epds" style="margin-top:14px"></div></div>' + hint(T('الصياغة العربية هنا للعرض التوضيحي، ويُعتمد في الاستخدام السريري على النسخة العربية المقننة. المصدر: Cox وHolden وSagovsky، 1987.', 'Arabic wording here is for demonstration; clinical use needs the validated Arabic version. Source: Cox, Holden & Sagovsky, 1987.')));
  if (cur === 'rec') {
    const lo = pd != null ? L(lochiaStage(pd)) : T('أدخلي تاريخ الولادة في تبويب المواعيد.', 'Enter the birth date in the follow-ups tab.'); const cs = S.profile.flags && S.profile.flags.cs;
    h += panel('post', T('مراحل التعافي', 'Recovery'), pd != null ? T('اليوم ' + pd + ' بعد الولادة', 'Day ' + pd + ' after birth') : '',
      '<ul class="rows">' + [[T('النزيف (النفاس)', 'Bleeding (lochia)'), lo],
        [cs ? T('جرح القيصرية', 'Caesarean wound') : T('الغرز ومنطقة العجان', 'Stitches and perineum'), cs ? T('يلتئم الجلد خلال أسبوعين تقريبًا، ويستغرق التعافي الكامل نحو 6 أسابيع. تجنبي حمل ما هو أثقل من مولودكِ في البداية.', 'Skin heals in about 2 weeks; full recovery takes about 6 weeks. Lift nothing heavier than your baby at first.') : T('تلتئم عادةً خلال أسبوعين إلى ثلاثة. اغسلي المنطقة بالماء الدافئ بعد قضاء الحاجة، وتخفف الجلسات في الماء الدافئ الألم.', 'Usually heal in 2–3 weeks. Rinse with warm water after the toilet; warm sitz baths ease pain.')],
        [T('قاع الحوض', 'Pelvic floor'), T('ابدئي تمارين كيجل بلطف منذ الأيام الأولى، وعودي إلى الرياضة تدريجيًا بعد موافقة الطبيب.', 'Start gentle Kegels in the first days, and return to exercise gradually once your doctor agrees.')],
        [T('عودة الدورة وتنظيم الحمل', 'Periods and contraception'), S.profile.feeding === 'breast' ? T('مع الرضاعة الطبيعية الكاملة قد تتأخر الدورة أشهرًا. ولا تمنع الرضاعة الحمل إلا إذا كان عمر المولود أقل من 6 أشهر، والرضاعة كاملة ليلًا ونهارًا، ولم تعد الدورة.', 'With exclusive breastfeeding periods may return after months. Breastfeeding prevents pregnancy only if: under 6 months, fully breastfeeding day and night, and no period yet.') : T('دون رضاعة طبيعية كاملة تعود الدورة غالبًا خلال 6 إلى 8 أسابيع، وقد تسبقها الإباضة، لذا ناقشي وسيلة تنظيم الحمل مبكرًا.', 'Without exclusive breastfeeding periods usually return in 6–8 weeks, and ovulation can come first, so discuss contraception early.')]]
        .map((x) => '<li><div><b>' + x[0] + '</b><small style="font-size:.92rem;color:var(--ink-2)">' + x[1] + '</small></div></li>').join('') + '</ul>');
  }
  if (cur === 'red') h += panel('post', T('علامات الخطر بعد الولادة', 'Warning signs after birth'), T('عند ظهور أي منها توجّهي إلى الطوارئ أو اتصلي بالرقم 997. قد يظهر تسمم الحمل حتى 6 أسابيع بعد الولادة.', 'Any of these: emergency department or call 997. Pre-eclampsia can appear up to 6 weeks after birth.'),
    '<ul class="bul" style="columns:2 260px;column-gap:32px">' + MJ.POSTBIRTH.map((x) => '<li>' + L(x) + '</li>').join('') + '</ul><div class="btn-row" style="margin-top:16px">' + go('guide', T('افتحي دليل الأعراض', 'Open the symptom guide')) + go('food', T('تغذية المرضع', 'Breastfeeding nutrition'), 'food:lact') + '</div>');
  return h;
};

/* ---------- BABY ---------- */
const DIAPERS = [
  { d: 1, wet: 1, dirty: 1, s: { ar: 'عِقْي (أسود ولزج)', en: 'Meconium (black, sticky)' } },
  { d: 2, wet: 2, dirty: 1, s: { ar: 'عِقْي', en: 'Meconium' } },
  { d: 3, wet: 3, dirty: 2, s: { ar: 'انتقالي (أخضر مائل للبني)', en: 'Transitional (green-brown)' } },
  { d: 4, wet: 4, dirty: 3, s: { ar: 'أصفر ولين', en: 'Yellow, soft' } },
  { d: 5, wet: 5, dirty: 3, s: { ar: 'أصفر ولين', en: 'Yellow, soft' } },
  { d: 6, wet: 6, dirty: 3, s: { ar: 'أصفر ولين', en: 'Yellow, soft' } }
];
function babyBirth() { return parse(S.baby.birthDate) || parse(S.profile.deliveryDate); }
const BABY_TOOLS = () => [
  { id: 'info', i: 'baby', t: T('بيانات المولود', 'Baby details'), d: T('والفحوصات الأولى', 'and first checks') },
  { id: 'bw', i: 'scale', t: T('الوزن', 'Weight'), d: T('مقارنةً بوزن الولادة', 'vs birth weight') },
  { id: 'log', i: 'tally', t: T('سجل اليوم', 'Today’s log'), d: T('الرضعات والحفاضات', 'Feeds and nappies') },
  { id: 'apgar', i: 'star', t: T('مقياس أبغار', 'Apgar score'), d: T('تقييم لحظة الولادة', 'Score at birth') },
  { id: 'care', i: 'bed', t: T('الرعاية اليومية', 'Daily care'), d: T('النوم والسرة والبكاء', 'Sleep, cord, crying') }
];
VIEWS.baby = function () {
  const bd = babyBirth(); const t = today(); const age = bd ? diffDays(t, bd) : null; const tools = BABY_TOOLS(); const cur = curTool('baby', tools);
  let h = head(T('مولودكِ في أسابيعه الأولى', 'Your baby’s first weeks'), T('كيف تطمئنين على مولودكِ: الوزن والرضاعة والحفاضات والفحوصات الأولى.', 'How to know your baby is doing well: weight, feeding, nappies and first checks.'), age != null ? '<span class="chip cyan" style="font-size:.95rem;padding:5px 14px">' + T('العمر: ', 'Age: ') + daysW(age) + '</span>' : '');
  h += toolSwitch('baby', tools);
  if (cur === 'info') {
    const items = bd ? [[0, 2, T('تطعيم التهاب الكبد ب (جرعة الولادة)', 'Hepatitis B vaccine (birth dose)')], [1, 3, T('فحص حديثي الولادة من الكعب (24–72 ساعة)', 'Newborn heel-prick screening (24–72 h)')], [0, 2, T('فحص السمع وقياس الأكسجين قبل الخروج', 'Hearing and pulse-oximetry checks before discharge')], [3, 5, T('زيارة المتابعة الأولى: الوزن واليرقان والرضاعة', 'First follow-up: weight, jaundice, feeding')], [10, 14, T('العودة إلى وزن الولادة', 'Back to birth weight')], [7, 21, T('سقوط الحبل السري', 'Cord falls off')], [56, 63, T('تطعيمات الشهرين', '2-month vaccines')]] : [];
    h += panel('baby', T('بيانات المولود والفحوصات الأولى', 'Baby details and first checks'), T('وفق البرنامج الوطني لفحص حديثي الولادة وجدول التطعيمات لوزارة الصحة.', 'Per the national newborn screening programme and MOH schedule.'),
      '<div class="split"><div><div class="fields">' + field(T('تاريخ الولادة', 'Date of birth'), inp('bb-d', 'baby.birthDate', 'date', 'data-rr'), 'bb-d') + field(T('وزن الولادة (غ)', 'Birth weight (g)'), inp('bb-w', 'baby.birthWeight', 'number', 'min="500" max="6500" data-rr'), 'bb-w') + '</div>' +
      (S.profile.deliveryDate && !S.baby.birthDate ? hint(T('يُستخدم تاريخ الولادة المسجّل في صفحة ما بعد الولادة.', 'Using the birth date from the after-birth page.')) : '') +
      (!bd ? '<div class="btn-row" style="margin-top:10px"><button class="btn soft small" type="button" data-act="demoPost">' + T('عرض مثال', 'Show an example') + '</button></div>' : '') + '</div><div>' +
      (items.length ? tlItems(items.map((x) => { const d0 = addDays(bd, x[0]), d1 = addDays(bd, x[1]); const past = diffDays(t, d1) > 0, now = !past && diffDays(t, d0) >= 0; return { cls: past ? 'done' : now ? 'now' : '', when: esc(fmtShort(d0)) + (x[1] !== x[0] ? ' – ' + esc(fmtShort(d1)) : ''), what: x[2] }; })) : '<p class="empty">' + T('أدخلي تاريخ الولادة لعرض الفحوصات.', 'Enter the birth date to see the checks.') + '</p>') + '</div></div>');
  }
  if (cur === 'bw') h += panel('baby', T('فحص وزن المولود', 'Weight check'), T('النزول حتى 7–10% طبيعي في الأيام الأولى، ويعود المولود إلى وزن الولادة خلال 10–14 يومًا.', 'Losing up to 7–10% is normal in the first days; back to birth weight by 10–14 days.'),
    '<div class="split" data-calc><div class="fields">' + field(T('الوزن (غ)', 'Weight (g)'), inp('bw-w', 'calc.bw.w', 'number', 'min="500" max="9000"'), 'bw-w') + field(T('تاريخ الوزن', 'Date weighed'), inp('bw-d', 'calc.bw.date', 'date'), 'bw-d') + '</div><div class="out" data-out="bw"></div></div>');
  if (cur === 'log') {
    const key = iso(t); const lg = S.baby.log[key] || { feed: 0, wet: 0, dirty: 0 }; const dexp = age != null ? DIAPERS[clamp(age, 1, 6) - 1] : null;
    const cell = (k, lbl, exp) => '<div><span>' + lbl + '</span><b class="num">' + (lg[k] || 0) + '</b><small>' + exp + '</small><div class="btn-row"><button type="button" data-act="tally" data-k="' + k + '" data-v="-1" aria-label="' + T('إنقاص ', 'Decrease ') + lbl + '">−</button><button type="button" data-act="tally" data-k="' + k + '" data-v="1" aria-label="' + T('زيادة ', 'Increase ') + lbl + '">+</button></div></div>';
    h += panel('baby', T('سجل اليوم', 'Today’s log'), esc(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' })) + (dexp ? ' — ' + T('المتوقع لليوم ' + clamp(age, 1, 6) + (age >= 6 ? ' فما بعده' : '') + ' من العمر', 'Expected for day ' + clamp(age, 1, 6) + (age >= 6 ? '+' : '')) : ''),
      '<div class="tally" style="max-width:640px">' + cell('feed', T('الرضعات', 'Feeds'), T('المتوقع 8–12', 'Expect 8–12')) + cell('wet', T('حفاضات مبللة', 'Wet nappies'), dexp ? T('المتوقع ' + dexp.wet + ' فأكثر', 'Expect ' + dexp.wet + '+') : '') + cell('dirty', T('حفاضات براز', 'Dirty nappies'), dexp ? T('المتوقع ' + dexp.dirty + ' فأكثر', 'Expect ' + dexp.dirty + '+') : '') + '</div>' +
      (dexp ? '<p style="margin-top:12px">' + T('شكل البراز المتوقع: ', 'Expected stool: ') + '<b>' + L(dexp.s) + '</b></p>' : ''));
  }
  if (cur === 'apgar') h += panel('baby', T('مقياس أبغار', 'Apgar score'), T('يساعدكِ على فهم الرقم المدوّن في تقرير الولادة عند الدقيقة الأولى والخامسة.', 'Understand the number on the birth report (at 1 and 5 minutes).'),
    '<div class="split" data-calc><div>' + MJ.APGAR.map((c) => '<div class="field" style="margin-bottom:10px"><label for="ap-' + c.k + '">' + L(c.t) + '</label><select id="ap-' + c.k + '" data-bind="calc.apgar.' + c.k + '"><option value="">' + T('اختاري', 'Choose') + '</option>' + c.o.map((o, i) => '<option value="' + i + '">' + i + ' — ' + esc(L(o)) + '</option>').join('') + '</select></div>').join('') + '</div><div class="out" data-out="apgar"></div></div>');
  if (cur === 'care') {
    const info = [[T('النوم الآمن', 'Safe sleep'), T('على الظهر، في سرير خاص، على مرتبة صلبة دون وسائد أو ألعاب، وفي غرفتكِ خلال الأشهر الستة الأولى.', 'On the back, in their own cot, on a firm mattress with no pillows or toys, in your room for the first 6 months.')],
      [T('اليرقان (الصفار)', 'Jaundice'), T('شائع بين اليومين 2 و5. افحصي بياض العين والجلد في ضوء النهار. ظهوره في أول 24 ساعة يستدعي الطوارئ.', 'Common between days 2 and 5. Check the whites of the eyes and skin in daylight. Jaundice in the first 24 hours needs urgent care.')],
      [T('العناية بالسرة', 'Cord care'), T('حافظي عليها نظيفة وجافة، واطوي الحفاض أسفلها. تسقط عادة خلال أسبوع إلى ثلاثة أسابيع.', 'Keep it clean and dry with the nappy folded below. It usually falls off in 1–3 weeks.')],
      [T('البكاء', 'Crying'), T('يزداد عادةً ويبلغ ذروته نحو الأسبوع 6–8 ثم يخف. لا تهزّي المولود بعنف أبدًا.', 'Usually builds to a peak around weeks 6–8, then eases. Never shake a baby.')],
      [T('الحرارة', 'Fever'), T('حرارة 38 درجة فأعلى لمن هم دون 3 أشهر تستدعي التوجه إلى الطوارئ فورًا.', '38 °C or higher under 3 months: emergency now.')]];
    h += panel('baby', T('الرعاية اليومية', 'Daily care'), '', '<div class="grid">' + info.map((x) => '<div class="card tint"><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div>').join('') + '</div><div class="btn-row" style="margin-top:16px">' + go('guide', T('حالات المولود في دليل الأعراض', 'Newborn cases in the symptom guide')) + '</div>');
  }
  return h;
};

/* ---------- LABS ---------- */
VIEWS.labs = function () {
  const k = S.ui.labTest in TESTS ? S.ui.labTest : 'hb'; const t = TESTS[k];
  let h = head(T('سجل التحاليل', 'Lab tracker'), T('تُقارن كل نتيجة بمعدلها الطبيعي حسب مرحلتكِ وثلث الحمل. تمثل المنطقة الخضراء في الرسم المدى الطبيعي.', 'Each value is compared with the normal range for your stage and trimester. The green band on the chart is the normal range.'), demoBadge());
  const list = labsOf(k); const last = list[list.length - 1]; const lr = last ? evalEntry(last) : null;
  let series;
  const tipOf = (e, r) => fmtShort(parse(e.date)) + ': ' + valText(e) + ' ' + t.u + '\n' + LVL[r.lv]();
  if (t.two) series = [{ name: T('الانقباضي', 'Systolic'), color: 'var(--s1)', pts: list.map((e) => { const r = evalEntry(e); return { x: parse(e.date), y: e.v, lv: r.lv, tip: tipOf(e, r) }; }) }, { name: T('الانبساطي', 'Diastolic'), color: 'var(--s2)', pts: list.map((e) => { const r = evalEntry(e); return { x: parse(e.date), y: e.v2, lv: r.lv, tip: tipOf(e, r) }; }) }];
  else series = [{ name: L(t.n), color: 'var(--s1)', pts: list.map((e) => { const r = evalEntry(e); return { x: parse(e.date), y: e.v, lv: r.lv, tip: tipOf(e, r) }; }) }];
  const chart = lineChart({ title: L(t.n), series: series, band: t.band ? (d) => t.band(ctxFor(d), d) : null, bandFull: k === 'weight', refs: t.two ? [{ y: 140, label: '140' }, { y: 90, label: '90' }] : [] });
  h += '<div class="labs-layout"><div class="test-list" role="tablist" aria-label="' + T('التحاليل', 'Tests') + '" aria-orientation="vertical">' + TEST_ORDER.map((x) => { const e = latest(x); const r = e ? evalEntry(e) : null; return '<button type="button" role="tab" id="tab-lab-' + x + '" aria-selected="' + (x === k) + '" aria-controls="lab-panel" tabindex="' + (x === k ? 0 : -1) + '" data-act="labTest" data-v="' + x + '"><span><b>' + L(TESTS[x].n) + '</b><span>' + (e ? '<bdi dir="ltr">' + valText(e) + ' ' + TESTS[x].u + '</bdi>' : T('لا توجد قراءات', 'No readings')) + '</span></span>' + (r ? '<i class="dot" style="background:' + LVCOL[r.lv] + '" aria-label="' + LVL[r.lv]() + '"></i>' : '') + '</button>'; }).join('') + '</div>';
  h += '<div class="stack" id="lab-panel" role="tabpanel" aria-labelledby="tab-lab-' + k + '"><section class="panel"><div class="lab-head"><div><h2>' + L(t.n) + ' <span class="hint" style="font-family:var(--font-body);font-weight:400">(' + t.u + ')</span></h2>' +
    (last ? '<div style="margin-top:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><bdi dir="ltr" class="lab-value num">' + valText(last) + '</bdi>' + chip(lr.lv) + '<span class="hint">' + esc(fmt(parse(last.date))) + '</span></div><p style="margin-top:8px;max-width:66ch">' + esc(lr.msg) + '</p>' : '') + '</div>' +
    (t.band ? '<div class="legend"><span><i class="dot" style="background:var(--good);opacity:.45"></i>' + (k === 'weight' ? T('المدى الموصى به', 'Recommended range') : T('المدى الطبيعي', 'Normal range')) + '</span></div>' : '') + '</div><div style="margin-top:14px">' + chart + '</div></section>';
  const d = S.calc.lab || {};
  h += '<div class="split" style="gap:16px"><section class="card"><h3>' + T('إضافة قراءة', 'Add a reading') + '</h3><div class="sub">' + L(t.n) + '</div><form data-act-submit="addLab"><div class="fields">' +
    field(T('التاريخ', 'Date'), '<input id="lab-d" type="date" name="date" value="' + esc(d.date || iso(today())) + '" required>', 'lab-d') +
    (t.two ? field(T('الانقباضي', 'Systolic'), '<input id="lab-v" type="number" name="v" min="50" max="260" required>', 'lab-v') + field(T('الانبساطي', 'Diastolic'), '<input id="lab-v2" type="number" name="v2" min="30" max="170" required>', 'lab-v2') : field(T('القيمة', 'Value') + ' (' + t.u + ')', '<input id="lab-v" type="number" name="v" step="' + t.step + '" min="0" required>', 'lab-v')) +
    '</div><button class="btn" type="submit">' + T('إضافة القراءة', 'Add reading') + '</button></form>' + hint(T('يُحسب عمر الحمل والثلث تلقائيًا من تاريخ القراءة.', 'Pregnancy week and trimester are worked out from the reading date.')) + '</section>';
  h += '<section class="card tint"><h3>' + T('عن هذا التحليل', 'About this test') + '</h3><p>' + L(t.about) + '</p></section></div>';
  h += '<section class="card"><h3>' + T('جميع القراءات', 'All readings') + '</h3><div class="sub">' + T('الأحدث أولًا', 'Newest first') + '</div>' + (list.length ? '<div class="table-wrap"><table><thead><tr><th>' + T('التاريخ', 'Date') + '</th><th>' + T('المرحلة', 'Stage') + '</th><th class="r">' + T('القيمة', 'Value') + '</th><th>' + T('الحالة', 'Status') + '</th><th>' + T('التفسير', 'What it means') + '</th><th><span class="sr">' + T('إجراءات', 'Actions') + '</span></th></tr></thead><tbody>' +
    list.slice().reverse().map((e) => { const r = evalEntry(e); const c = r.c; return '<tr><td class="nw">' + esc(fmt(parse(e.date), { day: 'numeric', month: 'short', year: 'numeric' })) + '</td><td class="nw">' + (c.preg ? T('الحمل، ', 'Pregnancy, ') + gaText(c.ga) : c.post ? T('بعد الولادة', 'After birth') : T('خارج الحمل', 'Not pregnant')) + '</td><td class="r num"><b><bdi dir="ltr">' + valText(e) + '</bdi></b></td><td>' + chip(r.lv) + '</td><td style="min-width:220px">' + esc(r.msg) + '</td><td><button class="btn ghost small" type="button" data-act="delLab" data-v="' + e.id + '" aria-label="' + T('حذف قراءة ', 'Delete reading of ') + esc(fmtShort(parse(e.date))) + '">' + T('حذف', 'Delete') + '</button></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="empty">' + T('لا توجد قراءات بعد.', 'No readings yet.') + '</p>') + '</section></div></div>';
  return h;
};

/* ---------- GUIDE ---------- */
VIEWS.guide = function () {
  let h = head(T('متى أطلب الرعاية الطبية؟', 'When should I seek medical care?'), T('ابحثي عن العَرَض لمعرفة ما يمكن عمله في المنزل، ومتى تلزم مراجعة العيادة، ومتى يجب التوجه إلى الطوارئ.', 'Search a symptom to see what can be done at home, when to see a clinic, and when to go to the emergency department.'));
  h += '<div class="banner" role="note">' + svg(P.alert, 2) + '<div><b>' + T('في الحالات الطارئة اتصلي بالرقم 997 (هيئة الهلال الأحمر السعودي) أو 911.', 'In an emergency call 997 (Saudi Red Crescent Authority) or 911.') + '</b> ' + T('هذا الدليل لأغراض التثقيف الصحي ولا يغني عن التقييم الطبي.', 'This guide is for health education and does not replace a medical assessment.') + '</div></div>';
  h += '<div class="toolbar"><div class="search"><input id="g-q" type="search" data-bind="ui.guideQ" data-live-filter placeholder="' + T('ابحثي عن عَرَض، مثل: صداع، نزيف، اصفرار، حرارة', 'Search a symptom, e.g. headache, bleeding, jaundice, fever') + '" aria-label="' + T('بحث في الأعراض', 'Search symptoms') + '">' + svg(P.search, 2) + '</div>' +
    seg('guideG', [['all', T('الكل', 'All')], ['preg', T('الحمل', 'Pregnancy')], ['post', T('ما بعد الولادة', 'After birth')], ['baby', T('المولود', 'Newborn')]], S.ui.guideG, T('تصفية حسب المرحلة', 'Filter by stage')) + '</div>';
  h += '<div class="legend" style="margin:0 0 16px"><span><i class="dot" style="background:var(--good)"></i>' + T('رعاية منزلية', 'Home care') + '</span><span><i class="dot" style="background:var(--warn)"></i>' + T('مراجعة العيادة خلال 24–48 ساعة', 'Clinic within 24–48 hours') + '</span><span><i class="dot" style="background:var(--bad)"></i>' + T('التوجه إلى الطوارئ فورًا', 'Emergency department now') + '</span></div>';
  h += '<p class="sr" id="g-count" role="status" aria-live="polite"></p><div class="grid" id="g-list"></div>';
  return h;
};
function guideItems() { const q = (S.ui.guideQ || '').trim().toLowerCase(); const g = S.ui.guideG; return MJ.TRIAGE.filter((x) => (g === 'all' || x.g === g) && (!q || (x.k + ' ' + x.t.ar + ' ' + x.t.en + ' ' + (x.er ? x.er.ar + x.er.en : '')).toLowerCase().indexOf(q) >= 0)); }
function guideList() {
  const lv = (cls, icon, lbl, txt) => '<div class="' + cls + (txt ? '' : ' none') + '">' + svg(P[icon], 2) + '<span class="lv">' + lbl + '</span><p>' + (txt ? esc(L(txt)) : T('هذه الحالة لا تحتمل الانتظار.', 'This situation cannot wait.')) + '</p></div>';
  const items = guideItems();
  if (!items.length) return '<p class="empty">' + T('لا توجد نتائج مطابقة. جرّبي كلمة أخرى، وفي الحالات الطارئة اتصلي بالرقم 997.', 'No matching results. Try another word; in an emergency call 997.') + '</p>';
  return items.map((x) => '<article class="card g-card"><h3>' + L(x.t) + ' <span class="chip ' + (x.g === 'preg' ? 'rose' : x.g === 'post' ? 'plum' : 'cyan') + '" style="margin-inline-start:auto;font-family:var(--font-body)">' + (x.g === 'preg' ? T('الحمل', 'Pregnancy') : x.g === 'post' ? T('ما بعد الولادة', 'After birth') : T('المولود', 'Newborn')) + '</span></h3><div class="tri">' +
    lv('home', 'homeLv', T('رعاية منزلية', 'Home care'), x.home) + lv('clinic', 'clinicLv', T('مراجعة العيادة خلال 24–48 ساعة', 'See a clinic within 24–48 hours'), x.clinic) + lv('er', 'erLv', T('التوجه إلى الطوارئ فورًا', 'Go to the emergency department now'), x.er) + '</div></article>').join('');
}
function refreshGuide() { const l = $('#g-list'); if (!l) return; l.innerHTML = guideList(); const c = $('#g-count'); if (c) c.textContent = T('عدد النتائج: ' + guideItems().length, guideItems().length + ' results'); }

/* ---------- FOOD ---------- */
const FOOD_TOOLS = () => [
  { id: 'needs', i: 'food', t: T('الاحتياج اليومي', 'Daily needs'), d: T('حسب المرحلة', 'by stage') },
  { id: 'caf', i: 'coffee', t: T('حاسبة الكافيين', 'Caffeine'), d: T('الحد 200 ملغ يوميًا', 'Limit 200 mg a day') },
  { id: 'safety', i: 'shield', t: T('سلامة الغذاء', 'Food safety'), d: T('الممنوع ومصادر العناصر', 'What to avoid, where to find nutrients') },
  { id: 'ramadan', i: 'moon', t: T('الصيام في رمضان', 'Fasting in Ramadan'), d: T('للحامل والمرضع', 'Pregnancy and breastfeeding') },
  { id: 'activity', i: 'run', t: T('النشاط والنوم', 'Activity and sleep'), d: T('أثناء الحمل', 'in pregnancy') },
  { id: 'lact', i: 'milk', t: T('تغذية المرضع', 'Breastfeeding'), d: T('بعد الولادة', 'after birth') }
];
VIEWS.food = function () {
  const tools = FOOD_TOOLS(); const cur = curTool('food', tools); const st = S.ui.foodStage || 't2'; const R = MJ.FOODS.ramadan;
  let h = head(T('التغذية ونمط الحياة', 'Nutrition and lifestyle'), T('الاحتياج اليومي، وحاسبة الكافيين، وسلامة الغذاء، والصيام في رمضان، والنشاط البدني.', 'Daily needs, a caffeine calculator, food safety, fasting in Ramadan, and activity.'));
  h += toolSwitch('food', tools);
  if (cur === 'needs') h += panel('food', T('احتياجكِ اليومي', 'Your daily needs'), T('القيم المرجعية للمرأة من عمر 19 إلى 50 سنة (National Academies DRIs). تُصرف المكملات بوصفة الطبيب.', 'Reference intakes for women aged 19–50 (National Academies DRIs). Supplements as prescribed.'),
    '<div style="margin-bottom:14px">' + seg('foodStage', MJ.DRI.stages.map((s) => [s.id, L(s.t)]), st, T('المرحلة', 'Stage')) + '</div><div class="table-wrap" style="max-width:680px"><table><thead><tr><th>' + T('العنصر', 'Nutrient') + '</th><th class="r">' + T('الكمية', 'Amount') + '</th><th>' + T('الوحدة', 'Unit') + '</th></tr></thead><tbody>' + MJ.DRI.rows.map((r) => '<tr><td>' + L(r.t) + '</td><td class="r num"><b>' + (r.plus && r.v[st] > 0 ? '+' : '') + num(r.v[st], 1) + '</b></td><td>' + L(r.u) + '</td></tr>').join('') + '</tbody></table></div>' + hint(T('السعرات الإضافية تُضاف إلى احتياجكِ قبل الحمل.', 'Extra calories are on top of your pre-pregnancy needs.')));
  if (cur === 'caf') h += panel('food', T('حاسبة الكافيين اليومية', 'Daily caffeine calculator'), T('الحد الأقصى أثناء الحمل 200 ملغ يوميًا. القيم تقريبية.', 'Pregnancy limit 200 mg a day. Values are approximate.'),
    '<div class="split" data-calc><ul class="rows">' + MJ.CAFFEINE.map((c) => '<li><div><b style="font-weight:500">' + L(c.t) + '</b><small>' + T('نحو ', 'about ') + c.mg + T(' ملغ', ' mg') + '</small></div><div class="btn-row" style="flex-wrap:nowrap"><button class="step-btn" type="button" data-act="caf" data-k="' + c.id + '" data-v="-1" aria-label="' + T('إنقاص ', 'Less ') + esc(L(c.t)) + '">−</button><b class="num" style="min-width:22px;text-align:center" data-caf="' + c.id + '" aria-live="polite">' + ((S.calc.caf || {})[c.id] || 0) + '</b><button class="step-btn" type="button" data-act="caf" data-k="' + c.id + '" data-v="1" aria-label="' + T('زيادة ', 'More ') + esc(L(c.t)) + '">+</button></div></li>').join('') + '</ul><div class="out" data-out="caf" style="position:sticky;top:20px"></div></div>');
  if (cur === 'safety') h += panel('food', T('سلامة الغذاء ومصادر العناصر', 'Food safety and nutrient sources'), '',
    '<div class="split"><div><h3 style="color:var(--bad-ink);margin-bottom:6px">' + T('تجنبي أثناء الحمل', 'Avoid in pregnancy') + '</h3><ul class="bul">' + MJ.FOODS.avoid.map((x) => '<li>' + L(x) + '</li>').join('') + '</ul></div><div><h3 style="margin-bottom:10px">' + T('من أين أحصل عليها؟', 'Where to get them') + '</h3><ul class="rows">' + MJ.FOODS.sources.map((s) => '<li><div><b>' + L(s.n) + '</b><small style="font-size:.92rem;color:var(--ink-2)">' + L(s.f) + '</small></div></li>').join('') + '</ul></div></div>');
  if (cur === 'ramadan') h += panel('food', T('الحامل والمرضع في رمضان', 'Ramadan, pregnancy and breastfeeding'), '',
    '<div class="split"><div><h3 style="margin-bottom:6px">' + T('قبل رمضان', 'Before Ramadan') + '</h3><ul class="bul">' + L([R.before.ar, R.before.en]).map((x) => '<li>' + x + '</li>').join('') + '</ul><h3 style="margin:16px 0 6px">' + T('إذا قررتِ الصيام', 'If you decide to fast') + '</h3><ul class="bul">' + L([R.during.ar, R.during.en]).map((x) => '<li>' + x + '</li>').join('') + '</ul></div>' +
    '<div class="card danger-card"><h3>' + T('أفطري فورًا عند حدوث', 'Break your fast at once if you have') + '</h3><ul class="bul">' + L([R.stop.ar, R.stop.en]).map((x) => '<li>' + x + '</li>').join('') + '</ul></div></div>');
  if (cur === 'activity') h += panel('food', T('النشاط البدني والنوم', 'Activity and sleep'), '', '<ul class="bul">' + L([MJ.FOODS.activity.ar, MJ.FOODS.activity.en]).map((x) => '<li>' + x + '</li>').join('') + '</ul>');
  if (cur === 'lact') h += panel('food', T('تغذية المرضع', 'Breastfeeding nutrition'), '', '<ul class="bul">' + L([MJ.FOODS.lactation.ar, MJ.FOODS.lactation.en]).map((x) => '<li>' + x + '</li>').join('') + '</ul>');
  return h;
};

/* ---------- SUMMARY ---------- */
function summaryData() {
  const t = today(); const st = S.profile.stage; const rows = [];
  const ga = gaOn(t), edd = eddDate();
  if (st === 'pregnant' && ga) { rows.push([T('عمر الحمل', 'Gestational age'), gaText(ga)]); rows.push([T('موعد الولادة المتوقع', 'Estimated due date'), fmt(edd) + ' (' + fmtHijri(edd) + ')']); }
  if (st === 'post') { const pd = postDays(t); if (pd != null) rows.push([T('بعد الولادة', 'After birth'), T('اليوم ' + pd, 'Day ' + pd)]); }
  if (st === 'pre') rows.push([T('المرحلة', 'Stage'), T('التخطيط للحمل', 'Planning pregnancy')]);
  const b = bmiOf(S.profile.height, S.profile.preWeight); if (b) rows.push([T('مؤشر الكتلة قبل الحمل', 'Pre-pregnancy BMI'), num(b, 1) + ' (' + L(BMI_LBL[bmiCat(b)]) + ')']);
  if (S.profile.twins) rows.push([T('نوع الحمل', 'Pregnancy'), T('توأم', 'Twins')]);
  const labs = TEST_ORDER.map((k) => { const e = latest(k); if (!e) return null; return { k: k, e: e, r: evalEntry(e) }; }).filter(Boolean);
  const kick = S.kicks.length ? S.kicks[S.kicks.length - 1] : null;
  const ep = S.epds.length ? S.epds[S.epds.length - 1] : null;
  const missed = ga && st === 'pregnant' ? MJ.PRENATAL.filter((x) => prenatalStatus(x, ga) === 'late' && x.id !== 'antid') : [];
  return { rows: rows, labs: labs, kick: kick, ep: ep, missed: missed };
}
VIEWS.summary = function () {
  const d = summaryData();
  let h = head(T('ملخص الطبيبة', 'Doctor summary'), T('ملخص جاهز لعرضه في زيارتكِ، أو نسخه وإرساله.', 'A summary ready to show at your visit, or to copy and send.'));
  h += '<article class="sheet"><div class="sheet-top"><div><h2>' + T('ملخص متابعة صحة الأم', 'Maternal health summary') + '</h2><div class="meta">' + T('رحلة الأم', 'Mama Journey') + ' — ' + esc(fmt(today())) + '</div></div>' + uniLogo() + '</div><div class="sheet-body">' +
    '<section><h3>' + T('المرحلة الحالية', 'Current stage') + '</h3>' + (d.rows.length ? kv(d.rows) : '<p class="empty">' + T('لا توجد بيانات بعد.', 'No data yet.') + '</p>') + '</section>' +
    '<section><h3>' + T('آخر النتائج', 'Latest results') + '</h3>' + (d.labs.length ? '<div class="table-wrap"><table><thead><tr><th>' + T('التحليل', 'Test') + '</th><th class="r">' + T('القيمة', 'Value') + '</th><th>' + T('التاريخ', 'Date') + '</th><th>' + T('الحالة', 'Status') + '</th></tr></thead><tbody>' + d.labs.map((x) => '<tr><td>' + L(TESTS[x.k].n) + '</td><td class="r num"><bdi dir="ltr"><b>' + valText(x.e) + '</b> ' + TESTS[x.k].u + '</bdi></td><td>' + esc(fmtShort(parse(x.e.date))) + '</td><td>' + chip(x.r.lv) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="empty">' + T('لا توجد نتائج.', 'No results.') + '</p>') + '</section>' +
    '<section><h3>' + T('ملاحظات المتابعة', 'Follow-up notes') + '</h3><ul class="bul">' +
    (d.kick ? '<li>' + T('آخر عدّ لحركة الجنين: ', 'Last kick count: ') + cnt(d.kick.n, W_KICK) + T(' خلال ', ' in ') + cnt(d.kick.min, W_MIN) + ' (' + esc(fmtShort(parse(d.kick.date))) + ')</li>' : '') +
    (d.ep ? '<li>' + T('مقياس إدنبرة: ', 'Edinburgh score: ') + d.ep.score + ' / 30' + (d.ep.q10 > 0 ? T('، مع إجابة إيجابية عن سؤال إيذاء النفس', ' · answered yes to the self-harm item') : '') + '</li>' : '') +
    d.missed.map((x) => '<li>' + T('لم يُسجّل: ', 'Not recorded: ') + L(x.t) + '</li>').join('') +
    d.labs.filter((x) => x.r.lv !== 'good').map((x) => '<li>' + L(TESTS[x.k].n) + ': ' + esc(x.r.msg) + '</li>').join('') + '</ul></section>' +
    '<section><h3><label for="s-notes">' + T('أسئلتي للطبيبة', 'My questions for the doctor') + '</label></h3><textarea id="s-notes" rows="4" data-bind="notes" placeholder="' + T('مثال: هل أحتاج إلى مكمل حديد؟', 'e.g. Do I need an iron supplement?') + '"></textarea></section>' +
    '<section class="btn-row"><button class="btn" type="button" data-act="copySummary">' + T('نسخ الملخص', 'Copy summary') + '</button><span class="hint" id="copyMsg" role="status"></span></section><textarea id="copyFallback" class="sr" aria-hidden="true" tabindex="-1"></textarea></div></article>';
  return h;
};
function summaryText() {
  const d = summaryData(); const out = [T('ملخص متابعة صحة الأم', 'Maternal health summary') + ' — ' + fmt(today()), ''];
  d.rows.forEach((r) => out.push(r[0] + ': ' + r[1]));
  if (d.labs.length) { out.push('', T('آخر النتائج:', 'Latest results:')); d.labs.forEach((x) => out.push('- ' + L(TESTS[x.k].n) + ': ' + valText(x.e) + ' ' + TESTS[x.k].u + ' (' + fmtShort(parse(x.e.date)) + ') — ' + LVL[x.r.lv]())); }
  if (d.kick) out.push('', T('آخر عدّ لحركة الجنين: ', 'Last kick count: ') + cnt(d.kick.n, W_KICK) + T(' خلال ', ' in ') + cnt(d.kick.min, W_MIN));
  if (d.ep) out.push(T('مقياس إدنبرة: ', 'Edinburgh score: ') + d.ep.score + '/30');
  if (S.notes) out.push('', T('أسئلتي:', 'My questions:'), S.notes);
  return out.join('\n');
}

/* ---------- ABOUT ---------- */
VIEWS.about = function () {
  let h = head(T('عن المنصة', 'About'), T('منصة تثقيفية ثنائية اللغة ترافق الأم من التخطيط للحمل حتى نهاية الثلث الرابع بعد الولادة.', 'A bilingual education platform that walks with a mother from planning a pregnancy to the end of the fourth trimester.'));
  h += '<div class="stack"><section class="panel"><div class="split"><div><div class="about-logo" style="margin-bottom:14px">' + uniLogo() + '</div><h2 style="margin-bottom:8px">' + T('عن المشروع', 'About the project') + '</h2><p>' + T('مشروع طلابي في كلية التمريض بجامعة سليمان الراجحي ضمن برنامج بكالوريوس التمريض. المنصة نموذج تعليمي وليست موقعًا رسميًا للجامعة.', 'A student project at the College of Nursing, Sulaiman Alrajhi University, within the BSN programme. The platform is an educational prototype, not an official university website.') + '</p></div>' +
    '<div><h3 style="margin-bottom:6px">' + T('الفكرة', 'The idea') + '</h3><p>' + T('تجمع المنصة الحاسبات ومتابعة التحاليل والتثقيف وتوجيه الحالات في مكان واحد، ويتغيّر محتواها حسب مرحلة الأم. مدة الاستفادة نحو 15 شهرًا لكل حمل: 3 أشهر قبل الحمل، و40 أسبوعًا للحمل، و12 أسبوعًا بعد الولادة.', 'Calculators, lab tracking, education and symptom guidance in one place, changing with the mother’s stage. About 15 months of use per pregnancy: 3 months before, 40 weeks of pregnancy and 12 weeks after birth.') + '</p></div></div></section>';
  h += '<div class="grid"><section class="card"><h3>' + T('الفئة المستهدفة', 'Who it’s for') + '</h3><ul class="bul"><li>' + T('المرأة المخطِّطة للحمل', 'Women planning a pregnancy') + '</li><li>' + T('الحامل في أي ثلث', 'Pregnant women in any trimester') + '</li><li>' + T('الأم بعد الولادة ومولودها', 'Mothers after birth and their babies') + '</li><li>' + T('الممرض والقابلة بوصفها أداة تثقيف', 'Nurses and midwives as a teaching tool') + '</li></ul></section>';
  h += '<section class="card"><h3>' + T('دور التمريض', 'The nursing role') + '</h3><p>' + T('تطبّق المنصة دور الممرض في التثقيف الصحي والمتابعة والتوجيه، وتتعامل مع الأم والمولود بوصفهما وحدة واحدة (Mother–Newborn Dyad).', 'It applies the nurse’s role in health education, follow-up and referral, treating mother and baby as one unit (the mother–newborn dyad).') + '</p></section>';
  h += '<section class="card"><h3>' + T('الخصوصية', 'Privacy') + '</h3><p>' + T('لا يوجد تسجيل دخول. تُحفظ البيانات في متصفح هذا الجهاز فقط ولا تُرسل إلى أي جهة.', 'No sign-in. All data is saved in this device’s browser only and is never sent anywhere.') + '</p><div class="btn-row" style="margin-top:12px"><button class="btn ghost small" type="button" data-act="resetDemo" data-confirm>' + T('استعادة البيانات التجريبية', 'Restore sample data') + '</button><button class="btn danger small" type="button" data-act="clearAll" data-confirm>' + T('مسح جميع البيانات', 'Clear all data') + '</button></div></section></div>';
  h += '<section class="card"><h3>' + T('المصادر', 'Sources') + '</h3><ul class="bul sources">' + MJ.SOURCES.map((s) => '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a></li>').join('') + '<li>AWHONN POST-BIRTH Warning Signs</li><li>AAP Safe Sleep recommendations</li></ul></section></div>';
  return h;
};

/* ===================================================== CALCULATORS ===================================================== */
const CALC = {};
CALC.ovu = function () {
  const lp = parse(S.profile.lastPeriod), cy = +S.profile.cycle, t = today();
  if (!lp || !(cy >= 21 && cy <= 45)) return hint(T('أدخلي أول يوم من آخر دورة، وطول الدورة بين 21 و45 يومًا.', 'Enter the first day of your last period and a cycle length of 21–45 days.'));
  if (diffDays(t, lp) < 0) return hint(T('التاريخ المُدخل في المستقبل. أدخلي تاريخًا سابقًا.', 'That date is in the future. Enter a past date.'));
  let start = lp; while (diffDays(t, addDays(start, cy)) >= 0) start = addDays(start, cy);
  const mk = (k) => { const s = addDays(start, k * cy); const ov = addDays(s, cy - 14); return { s: s, ov: ov, f0: addDays(ov, -5), f1: addDays(ov, 1), next: addDays(s, cy) }; };
  const cyc = [0, 1, 2].map(mk); const marked = [mk(-1)].concat(cyc, [mk(3)]); const c0 = cyc[0];
  const cls = (d) => { let c = ''; marked.forEach((x) => { const i = diffDays(d, x.s); if (i >= 0 && i < 5) c = 'period'; else if (diffDays(d, x.ov) === 0) c = 'ovu'; else if (diffDays(d, x.f0) >= 0 && diffDays(x.f1, d) >= 0) c = 'fertile'; }); return c + (diffDays(d, t) === 0 ? ' today' : ''); };
  const m0 = start.getMonth(), y0 = start.getFullYear();
  return '<div class="split"><div>' + res('', T('الإباضة: ', 'Ovulation: ') + esc(fmtDM(c0.ov)), '<span>' + T('أيام الخصوبة: ', 'Fertile window: ') + '<b>' + esc(fmtShort(c0.f0)) + ' – ' + esc(fmtShort(c0.f1)) + '</b></span><span>' + T('الدورة القادمة: ', 'Next period: ') + '<b>' + esc(fmtDM(c0.next)) + '</b></span>') +
    '<div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>' + T('الدورة', 'Cycle') + '</th><th>' + T('أيام الخصوبة', 'Fertile window') + '</th><th>' + T('الإباضة', 'Ovulation') + '</th></tr></thead><tbody>' + cyc.map((x, i) => '<tr><td>' + (i + 1) + '</td><td>' + esc(fmtShort(x.f0)) + ' – ' + esc(fmtShort(x.f1)) + '</td><td><b>' + esc(fmtShort(x.ov)) + '</b></td></tr>').join('') + '</tbody></table></div>' +
    hint(T('الدورة غير المنتظمة تقلل دقة التقدير، واختبارات الإباضة المنزلية أدق.', 'Irregular cycles reduce accuracy; home ovulation tests are more precise.')) + '</div><div><div class="cal-wrap">' + calMonth(y0, m0, cls) + calMonth(m0 === 11 ? y0 + 1 : y0, (m0 + 1) % 12, cls) + '</div>' +
    '<div class="legend" style="margin-top:10px"><span><i class="dot" style="background:var(--rose-soft);outline:1px solid var(--rose)"></i>' + T('الدورة (5 أيام تقديرًا)', 'Period (5 days, estimated)') + '</span><span><i class="dot" style="background:var(--peach-soft);outline:1px solid var(--peach)"></i>' + T('أيام الخصوبة', 'Fertile') + '</span><span><i class="dot" style="background:var(--peach)"></i>' + T('الإباضة', 'Ovulation') + '</span><span><i class="dot" style="outline:2px solid var(--ink)"></i>' + T('اليوم', 'Today') + '</span></div></div></div>';
};
CALC.bmi = function () {
  const b = bmiOf(S.profile.height, S.profile.preWeight);
  if (!b) return hint(T('أدخلي الطول بالسنتيمتر والوزن بالكيلوغرام.', 'Enter height in cm and weight in kg.'));
  const c = bmiCat(b); const r1 = IOM.single[c], r2 = IOM.twins[c];
  return res(c === 'normal' ? 'good' : 'watch', num(b, 1) + ' <small>kg/m²</small>', '<span>' + chip(c === 'normal' ? 'good' : 'watch', L(BMI_LBL[c])) + '</span>' +
    kv([[T('الزيادة الموصى بها (حمل مفرد)', 'Recommended gain (singleton)'), r1[0] + '–' + r1[1] + T(' كغ', ' kg')], [T('حمل بتوأم', 'Twins'), r2 ? r2[0] + '–' + r2[1] + T(' كغ', ' kg') : T('لا توجد توصية', 'No guideline')]])) +
    hint(T('تصنيف منظمة الصحة العالمية: أقل من 18.5 نحافة، و18.5–24.9 طبيعي، و25–29.9 زيادة، و30 فأكثر سمنة.', 'WHO categories: under 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, 30+ obesity.'));
};
CALC.edd = function () {
  const c = S.calc.edd || {}; const m = c.method || 'lmp'; let edd = null;
  if (m === 'lmp') { const l = parse(c.lmp); const cy = clamp(+c.cycle || 28, 21, 45); if (l) edd = addDays(l, 280 + cy - 28); }
  if (m === 'conc') { const d = parse(c.conc); if (d) edd = addDays(d, 266); }
  if (m === 'us') { const d = parse(c.us); const w = +c.usW, dd = +c.usD || 0; if (d && w > 0) edd = addDays(d, 280 - (w * 7 + dd)); }
  if (m === 'ivf') { const d = parse(c.ivf); const k = +c.ivfDay || 5; if (d) edd = addDays(d, 266 - k); }
  if (!edd) return hint(T('أدخلي التاريخ المطلوب لعرض النتيجة.', 'Enter the required date to see the result.'));
  const t = today(); const gd = 280 - diffDays(edd, t);
  const ga = { days: gd, w: Math.floor(gd / 7), d: ((gd % 7) + 7) % 7, tri: gd < 98 ? 1 : gd < 196 ? 2 : 3 };
  const conc = addDays(edd, -266);
  let body = '<span>' + esc(fmtHijri(edd)) + '، ' + esc(fmt(edd, { weekday: 'long' })) + '</span>';
  if (gd < 0) body += hint(T('التاريخ المُدخل يعطي حملًا لم يبدأ بعد.', 'This date gives a pregnancy that hasn’t started yet.'));
  else if (gd > 301) body += hint(T('عمر الحمل يتجاوز 43 أسبوعًا؛ راجعي التاريخ.', 'Pregnancy age is over 43 weeks; check the date.'));
  else body += kv([[T('عمر الحمل اليوم', 'Age today'), gaText(ga)], [T('الثلث', 'Trimester'), TRI()[ga.tri]], [T('المتبقي', 'Remaining'), daysW(Math.max(0, diffDays(edd, t)))], [T('الإخصاب التقديري', 'Estimated conception'), esc(fmtShort(conc))]]) +
    '<div class="btn-row" style="margin-top:12px"><button class="btn soft small" type="button" data-act="useEdd" data-v="' + iso(edd) + '">' + T('اعتماده حملي في الصفحة الرئيسية', 'Use as my pregnancy on the home page') + '</button></div>';
  return res('', esc(fmt(edd)), body) + hint(T('تلد نحو 5% فقط من النساء في الموعد المحدد تمامًا، ومعظم الولادات بين الأسبوعين 37 و42.', 'Only about 5% give birth on the exact date; most births are between weeks 37 and 42.'));
};
CALC.wg = function () {
  const b = bmiOf(S.profile.height, S.profile.preWeight); const c = S.calc.wg || {};
  if (!b) return hint(T('أدخلي الطول والوزن قبل الحمل.', 'Enter height and pre-pregnancy weight.'));
  const cat = bmiCat(b); const tw = !!S.profile.twins; const tot = (tw ? IOM.twins : IOM.single)[cat];
  let h = kv([[T('مؤشر الكتلة قبل الحمل', 'Pre-pregnancy BMI'), num(b, 1) + ' — ' + L(BMI_LBL[cat])], [T('الزيادة الكلية الموصى بها', 'Total recommended gain'), tot ? tot[0] + '–' + tot[1] + T(' كغ', ' kg') + (tw ? T(' (توصية مبدئية للتوأم)', ' (provisional, twins)') : '') : '—']].concat(!tw ? [[T('معدل الثلثين الثاني والثالث', '2nd–3rd trimester rate'), IOM.rate[cat][0] + '–' + IOM.rate[cat][1] + T(' كغ أسبوعيًا', ' kg/week')]] : []));
  if (!tot) return h + hint(T('لا توجد توصية معتمدة لحمل التوأم مع النحافة؛ تحتاجين إلى خطة فردية مع طبيبك.', 'There is no guideline for twins with underweight; you need an individual plan with your doctor.'));
  const wk = +c.week, cur = +c.cur;
  if (wk > 0 && cur > 0) {
    const r = gainRange(cat, tw, wk); const g = cur - S.profile.preWeight;
    const lv = g < r[0] - 0.05 || g > r[1] + 0.05 ? 'watch' : 'good';
    h = res(lv, (g >= 0 ? '+' : '') + num(g, 1) + ' <small>' + T('كغ منذ بداية الحمل', 'kg since pregnancy began') + '</small>', '<span>' + T('المدى الموصى به في الأسبوع ' + wk + ': ', 'Recommended range at week ' + wk + ': ') + '<b>' + num(r[0], 1) + '–' + num(r[1], 1) + T(' كغ', ' kg') + '</b></span><span>' + chip(lv, lv === 'good' ? T('ضمن المدى', 'Within range') : g < r[0] ? T('أقل من الموصى به', 'Below range') : T('أعلى من الموصى به', 'Above range')) + '</span>') + h;
  }
  return h + hint(T('تكون الزيادة في الثلث الأول عادةً بين 0.5 و2 كغ فقط.', 'First-trimester gain is usually only 0.5–2 kg.'));
};
CALC.bp = function () {
  const c = S.calc.bp || {}; const s = +c.sys, d = +c.dia;
  if (!(s > 50 && d > 30)) return hint(T('أدخلي القراءتين.', 'Enter both numbers.'));
  const sym = ['head', 'vision', 'epi', 'swell', 'sob'].some((k) => c[k]);
  let lv = TESTS.bp.lvl({ v: s, v2: d }); let msg = TESTS.bp.msg({ v: s, v2: d }, {});
  if (sym && lv !== 'good') { lv = 'urgent'; msg = T('ضغط مرتفع مع أعراض، وهذه من علامات تسمم الحمل. توجّهي إلى الطوارئ فورًا.', 'High blood pressure with symptoms: signs of pre-eclampsia. Go to emergency now.'); }
  else if (sym) { lv = 'watch'; msg = T('الضغط طبيعي، لكن هذه الأعراض بعد الأسبوع 20 تحتاج إلى تقييم في اليوم نفسه.', 'BP is normal, but these symptoms after week 20 need a same-day assessment.'); }
  return res(lv, '<bdi dir="ltr">' + s + '/' + d + '</bdi> <small>mmHg</small>', '<span>' + chip(lv) + '</span><span>' + esc(msg) + '</span>') +
    '<div class="btn-row" style="margin-top:12px"><button class="btn soft small" type="button" data-act="saveBp">' + T('حفظ القراءة في السجل', 'Save to lab tracker') + '</button></div>' + hint(T('قيسي الضغط وأنتِ جالسة بعد 5 دقائق من الراحة، مع وضع الذراع بمستوى القلب.', 'Measure seated after 5 minutes’ rest, arm at heart level.'));
};
CALC.og = function () {
  const c = S.calc.og || {}; const mm = c.unit === 'mmol';
  const thr = mm ? [5.1, 10.0, 8.5] : [92, 180, 153]; const vals = [c.f, c.h1, c.h2].map((x) => (x === '' || x == null ? null : +x));
  if (vals.every((v) => v == null)) return hint(T('أدخلي قيمة واحدة على الأقل.', 'Enter at least one value.'));
  const lbl = [T('صائم', 'Fasting'), T('بعد ساعة', '1 hour'), T('بعد ساعتين', '2 hours')];
  const over = vals.map((v, i) => v != null && v >= thr[i]);
  const any = over.some(Boolean); const overt = vals[0] != null && vals[0] >= (mm ? 7.0 : 126);
  const lv = overt ? 'urgent' : any ? 'watch' : 'good';
  const msg = overt ? T('قيمة الصائم 126 (7.0) فأعلى، وقد تدل على سكري سابق للحمل. راجعي طبيبك قريبًا.', 'Fasting 126 (7.0) or higher: may indicate pre-existing diabetes. See your doctor soon.') : any ? T('وصلت قيمة واحدة أو أكثر إلى الحد، وهذا يطابق تشخيص سكر الحمل وفق IADPSG. يحدد طبيبك خطة الرعاية.', 'One or more values met the cut-off: this matches gestational diabetes (IADPSG). Your doctor will plan care.') : T('جميع القيم المُدخلة أقل من الحدود.', 'All values entered are below the cut-offs.');
  return res(lv, any || overt ? T('تطابق سكر الحمل', 'Meets gestational diabetes') : T('لا تطابق سكر الحمل', 'Does not meet gestational diabetes'), '<span>' + esc(msg) + '</span>' +
    kv(vals.map((v, i) => [lbl[i] + ' (' + T('الحد ', 'cut-off ') + thr[i] + ')', v == null ? '—' : num(v, 1) + (over[i] ? ' ▲' : ' ✓')]))) +
    (vals[0] != null ? '<div class="btn-row" style="margin-top:12px"><button class="btn soft small" type="button" data-act="saveFbg">' + T('حفظ قيمة الصائم في السجل', 'Save fasting value to tracker') + '</button></div>' : '');
};
CALC.epds = function () {
  const ans = S.epdsDraft || {}; const n = Object.keys(ans).filter((k) => ans[k] !== '' && ans[k] != null).length;
  const q10 = ans[9] != null && ans[9] !== '' ? +ans[9] : null;
  let urgent = '';
  if (q10 > 0) urgent = '<div class="banner" role="alert" style="margin:0 0 12px">' + svg(P.alert, 2) + '<div><b>' + T('شكرًا لصدقكِ. إذا راودتكِ أفكار بإيذاء نفسكِ فأنتِ تستحقين الدعم الآن.', 'Thank you for being honest. If you have thoughts of harming yourself, you deserve support now.') + '</b> ' + T('إذا كنتِ في خطر الآن فاتصلي بالرقم 997 أو 911. وللاستشارة النفسية: 920033360 (المركز الوطني لتعزيز الصحة النفسية) أو 937. وأخبري طبيبتك اليوم.', 'If you are in danger now call 997 or 911. For psychological support: 920033360 (National Center for Mental Health Promotion) or 937. And tell your doctor today.') + '</div></div>';
  if (n < 10) return urgent + hint(T('أجبتِ عن ' + n + ' من 10 أسئلة.', 'Answered ' + n + ' of 10.'));
  const score = Object.keys(ans).reduce((a, k) => a + (+ans[k] || 0), 0);
  const lv = score >= 13 || q10 > 0 ? 'urgent' : score >= 10 ? 'watch' : 'good';
  const msg = score >= 13 ? T('13 فأكثر: احتمال اكتئاب ما بعد الولادة. احجزي موعدًا مع طبيبتك أو مختص نفسي قريبًا، فهذه حالة قابلة للعلاج.', '13 or more: likely postnatal depression. Book with your doctor or a mental health professional soon; it is treatable.') : score >= 10 ? T('من 10 إلى 12: احتمال اكتئاب. تحدثي مع طبيبتك وأعيدي المقياس بعد أسبوعين.', '10–12: possible depression. Talk to your doctor and repeat in 2 weeks.') : T('أقل من 10: احتمال الاكتئاب منخفض. أعيدي المقياس إذا تغيّرت مشاعرك.', 'Below 10: depression is unlikely. Repeat if your feelings change.');
  return urgent + res(lv, score + ' <small>/ 30</small>', '<span>' + chip(lv) + '</span><span>' + msg + '</span>') + '<div class="btn-row" style="margin-top:12px"><button class="btn soft small" type="button" data-act="saveEpds">' + T('حفظ النتيجة', 'Save result') + '</button>' + (S.epds.length ? '<span class="hint">' + T('النتائج السابقة: ', 'Previous: ') + S.epds.slice(-4).map((e) => e.score + ' (' + fmtShort(parse(e.date)) + ')').join('، ') + '</span>' : '') + '</div>';
};
CALC.apgar = function () {
  const c = S.calc.apgar || {}; const ks = MJ.APGAR.map((x) => x.k); const n = ks.filter((k) => c[k] !== '' && c[k] != null).length;
  if (n < 5) return hint(T('اختاري المعايير الخمسة (' + n + ' من 5).', 'Choose all five (' + n + ' of 5).'));
  const s = ks.reduce((a, k) => a + +c[k], 0);
  const lv = s >= 7 ? 'good' : s >= 4 ? 'watch' : 'urgent';
  return res(lv, s + ' <small>/ 10</small>', '<span>' + (s >= 7 ? T('من 7 إلى 10: مطمئن.', '7–10: reassuring.') : s >= 4 ? T('من 4 إلى 6: يحتاج إلى دعم بسيط مثل التحفيز أو الأكسجين.', '4–6: needs some support, such as stimulation or oxygen.') : T('من 0 إلى 3: يحتاج إلى إنعاش فوري.', '0–3: needs immediate resuscitation.')) + '</span>') + hint(T('يصف مقياس أبغار حالة المولود لحظة الولادة، ولا يتنبأ وحده بصحته على المدى البعيد. قراءة الدقيقة الخامسة أهم.', 'Apgar describes the baby at birth and does not on its own predict long-term health. The 5-minute score matters more.'));
};
CALC.bw = function () {
  const bwt = +S.baby.birthWeight; const bd = babyBirth(); const c = S.calc.bw || {}; const w = +c.w; const d = parse(c.date) || today();
  if (!(bwt > 400)) return hint(T('أدخلي وزن الولادة في تبويب بيانات المولود.', 'Enter the birth weight in the baby details tab.'));
  const list = (S.baby.weights || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  let h = '';
  if (w > 400 && bd) {
    const age = diffDays(d, bd); const pct = (w - bwt) / bwt * 100;
    let lv = 'good', msg;
    if (pct < -10) { lv = 'urgent'; msg = T('نزول يتجاوز 10%: تواصلي مع طبيب الأطفال اليوم لتقييم الرضاعة.', 'Over 10% loss: contact the paediatrician today to review feeding.'); }
    else if (pct < -7) { lv = 'watch'; msg = T('نزول بين 7% و10%: راقبي الرضعات والحفاضات، واطلبي تقييمًا للرضاعة.', '7–10% loss: watch feeds and nappies and ask for a feeding review.'); }
    else if (age > 14 && w < bwt) { lv = 'watch'; msg = T('لم يعد المولود إلى وزن الولادة بعد 14 يومًا: راجعي طبيب الأطفال.', 'Not back to birth weight after 14 days: see the paediatrician.'); }
    else if (pct < 0) msg = T('نزول طبيعي لعمره.', 'A normal dip for this age.');
    else msg = T('الوزن أعلى من وزن الولادة. بعد الأسبوعين الأولين تُتوقع زيادة نحو 150–200 غ أسبوعيًا.', 'Above birth weight. After the first 2 weeks expect about 150–200 g a week.');
    h += res(lv, (pct >= 0 ? '+' : '') + num(pct, 1) + '% <small>' + T('من وزن الولادة', 'from birth weight') + '</small>', '<span>' + T('العمر ', 'Age ') + daysW(Math.max(0, age)) + '</span><span>' + chip(lv) + '</span><span>' + msg + '</span>') +
      '<div class="btn-row" style="margin-top:12px"><button class="btn soft small" type="button" data-act="saveBw">' + T('حفظ الوزن', 'Save weight') + '</button></div>';
  }
  if (list.length) h += '<div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>' + T('التاريخ', 'Date') + '</th><th class="r">' + T('الوزن', 'Weight') + '</th><th class="r">' + T('التغيّر', 'Change') + '</th></tr></thead><tbody>' + list.map((x) => '<tr><td>' + esc(fmtShort(parse(x.date))) + (bd ? T('، اليوم ', ', day ') + diffDays(parse(x.date), bd) : '') + '</td><td class="r num">' + num(x.g) + T(' غ', ' g') + '</td><td class="r num"><bdi dir="ltr">' + num((x.g - bwt) / bwt * 100, 1) + '%</bdi></td></tr>').join('') + '</tbody></table></div>';
  return h || hint(T('أدخلي الوزن الحالي.', 'Enter the current weight.'));
};
CALC.caf = function () {
  const c = S.calc.caf || {}; const total = MJ.CAFFEINE.reduce((a, x) => a + (c[x.id] || 0) * x.mg, 0);
  const lv = total > 200 ? 'watch' : 'good';
  return res(lv, num(total) + ' <small>' + T('ملغ اليوم', 'mg today') + '</small>', '<div class="progress" style="--accent:' + (total > 200 ? 'var(--warn)' : 'var(--good)') + '"><i style="width:' + clamp(total / 2, 0, 100) + '%"></i></div><span>' + (total > 200 ? T('تجاوزتِ 200 ملغ. خففي الكافيين اليوم.', 'Over 200 mg. Cut back for today.') : T('يتبقى ' + num(200 - total) + ' ملغ قبل الحد.', num(200 - total) + ' mg left under the limit.')) + '</span>');
};

/* ---------- kick counter & contraction timer ---------- */
function kickPanel() {
  const run = S.kickRun; const now = Date.now();
  let h = '<div class="split"><div class="counter">';
  if (run) {
    const el = (now - run.start) / 1000;
    h += '<button class="tap" type="button" data-act="kickTap" aria-label="' + T('سجّلي حركة', 'Record a movement') + '"><b class="num">' + run.n + '</b><span>' + T('من 10 — اضغطي مع كل حركة', 'of 10 — tap each movement') + '</span></button><div class="timer num" data-timer="kick" aria-hidden="true">' + mmss(el) + '</div>';
    if (el > 7200) h += res('urgent', '', '<b>' + T('مرّت ساعتان وأقل من 10 حركات. تواصلي مع المستشفى الآن.', 'Two hours and fewer than 10 movements. Contact the hospital now.') + '</b>');
    h += '<div class="btn-row"><button class="btn ghost small" type="button" data-act="kickStop">' + T('إنهاء وحفظ', 'Finish and save') + '</button><button class="btn ghost small" type="button" data-act="kickCancel">' + T('إلغاء', 'Cancel') + '</button></div>';
  } else h += '<button class="tap" type="button" data-act="kickTap"><b>+</b><span>' + T('ابدئي العدّ', 'Start counting') + '</span></button>';
  h += '</div><div>';
  const last = S.kicks.slice(-5).reverse();
  h += '<h3 style="margin-bottom:6px">' + T('الجلسات السابقة', 'Previous sessions') + '</h3>' + (last.length ? '<ul class="rows">' + last.map((k) => { const ok = k.n >= 10 && k.min <= 120; return '<li><div><b>' + cnt(k.n, W_KICK) + T(' خلال ', ' in ') + cnt(k.min, W_MIN) + '</b><small>' + esc(fmtDM(parse(k.date))) + '</small></div>' + chip(ok ? 'good' : 'urgent', ok ? T('طبيعي', 'Normal') : T('تواصلي مع المستشفى', 'Call the hospital')) + '</li>'; }).join('') + '</ul>' : '<p class="empty">' + T('لا توجد جلسات بعد.', 'No sessions yet.') + '</p>');
  return h + hint(T('أي انخفاض واضح عن النمط المعتاد لحركة جنينكِ يستدعي التواصل مع المستشفى في اليوم نفسه، حتى لو وصلتِ إلى 10.', 'Any clear drop from your baby’s usual pattern needs a same-day call, even if you reach 10.')) + '</div></div>';
}
function ctAnalyze() {
  const list = S.contr.list; const now = Date.now(); const rec = list.filter((c) => c.s >= now - 3600e3 && c.e);
  if (rec.length < 2) return null;
  const ints = []; for (let i = 1; i < rec.length; i++) ints.push((rec[i].s - rec[i - 1].s) / 60000);
  const avgI = ints.reduce((a, b) => a + b, 0) / ints.length; const avgD = rec.reduce((a, c) => a + (c.e - c.s) / 1000, 0) / rec.length;
  const span = (now - rec[0].s) / 60000;
  return { n: rec.length, avgI: avgI, avgD: avgD, span: span, go511: span >= 50 && avgI <= 5.5 && avgD >= 50 };
}
function ctPanel() {
  const act = S.contr.active; const now = Date.now(); const ga = gaOn(today());
  let h = '<div class="split"><div class="counter"><button class="tap alt' + (act ? ' running' : '') + '" type="button" data-act="ctTap"><b>' + (act ? '■' : '▶') + '</b><span>' + (act ? T('انتهت الانقباضة', 'Contraction ended') : T('بدأت انقباضة', 'Contraction started')) + '</span></button>' +
    (act ? '<div class="timer num" data-timer="ct" aria-hidden="true">' + mmss((now - act) / 1000) + '</div>' : '') +
    '<div class="btn-row"><button class="btn ghost small" type="button" data-act="ctDemo">' + T('تعبئة مثال للعرض', 'Fill a demo example') + '</button>' + (S.contr.list.length ? '<button class="btn ghost small" type="button" data-act="ctClear">' + T('مسح السجل', 'Clear') + '</button>' : '') + '</div></div><div>';
  const a = ctAnalyze();
  if (a) {
    let lv = 'good', msg = T('واصلي التوقيت. قاعدة 5-1-1: انقباضة كل 5 دقائق، مدتها دقيقة، لمدة ساعة.', 'Keep timing. 5-1-1: every 5 minutes, lasting 1 minute, for 1 hour.');
    if (a.go511) { lv = 'urgent'; msg = T('وصلتِ إلى قاعدة 5-1-1: حان وقت التوجه إلى المستشفى.', 'You have reached 5-1-1: time to go to the hospital.'); }
    if (ga && ga.w < 37 && a.n >= 4) { lv = 'urgent'; msg = T('انقباضات منتظمة قبل الأسبوع 37: توجّهي إلى المستشفى الآن.', 'Regular contractions before week 37: go to hospital now.'); }
    h += res(lv, '', '<span>' + chip(lv, lv === 'urgent' ? T('المستشفى الآن', 'Hospital now') : T('واصلي المتابعة', 'Keep going')) + '</span><span>' + msg + '</span>' + kv([[T('آخر ساعة', 'Last hour'), cnt(a.n, W_CT)], [T('متوسط الفاصل', 'Average interval'), num(a.avgI, 1) + T(' دقيقة', ' min')], [T('متوسط المدة', 'Average length'), num(a.avgD) + T(' ثانية', ' sec')]]));
  }
  const last = S.contr.list.filter((c) => c.e).slice(-6).reverse();
  if (last.length) h += '<div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>' + T('البداية', 'Start') + '</th><th class="r">' + T('المدة', 'Length') + '</th><th class="r">' + T('الفاصل', 'Interval') + '</th></tr></thead><tbody>' + last.map((c) => { const all = S.contr.list; const i = all.indexOf(c); const prev = i > 0 ? all[i - 1] : null; return '<tr><td>' + esc(fmtTime(c.s)) + '</td><td class="r num">' + mmss((c.e - c.s) / 1000) + '</td><td class="r num">' + (prev ? mmss((c.s - prev.s) / 1000) : '—') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  else if (!a) h += '<p class="empty">' + T('لم تُسجَّل انقباضات بعد.', 'No contractions recorded yet.') + '</p>';
  return h + hint(T('نزول الماء أو النزيف أو قلة حركة الجنين تستدعي التوجه إلى المستشفى فورًا مهما كان التوقيت.', 'Waters breaking, bleeding, or fewer movements: hospital now, whatever the timing.')) + '</div></div>';
}
function refreshLive(name) { const el = $('[data-live="' + name + '"]'); if (el) el.innerHTML = name === 'kick' ? kickPanel() : ctPanel(); }

/* ===================================================== ACTIONS ===================================================== */
const ACT = {};
ACT.stage = (el) => { S.profile.stage = el.dataset.v; ringAnimated = false; save(); render(); };
ACT.tool = (el) => { S.ui.tool[el.dataset.page] = el.dataset.v; save(); render(); const b = $('#tab-' + el.dataset.page + '-' + el.dataset.v); if (b) b.focus(); };
ACT.eddMethod = (el) => { S.calc.edd.method = el.dataset.v; save(); render(); };
ACT.ogUnit = (el) => { S.calc.og.unit = el.dataset.v; save(); render(); };
ACT.foodStage = (el) => { S.ui.foodStage = el.dataset.v; save(); render(); };
ACT.guideG = (el) => { S.ui.guideG = el.dataset.v; save(); $$('[data-act="guideG"]').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); refreshGuide(); };
ACT.labTest = (el) => { S.ui.labTest = el.dataset.v; save(); render(); const b = $('#tab-lab-' + el.dataset.v); if (b) b.focus(); };
ACT.useEdd = (el) => { const edd = parse(el.dataset.v); S.profile.lmp = iso(addDays(edd, -280)); S.profile.cycle = 28; S.profile.stage = 'pregnant'; ringAnimated = false; save(); location.hash = '#home'; };
ACT.delLab = (el) => { S.labs = S.labs.filter((x) => x.id !== el.dataset.v); save(); render(); flash(T('حُذفت القراءة', 'Reading deleted')); };
ACT.saveBp = () => { const c = S.calc.bp; S.labs.push({ id: uid(), test: 'bp', date: iso(today()), v: +c.sys, v2: +c.dia }); save(); flash(T('حُفظت القراءة في سجل التحاليل', 'Saved to the lab tracker')); };
ACT.saveFbg = () => { const c = S.calc.og; const v = c.unit === 'mmol' ? Math.round(+c.f * 18.016) : +c.f; S.labs.push({ id: uid(), test: 'fbg', date: iso(today()), v: v }); save(); flash(T('حُفظت قيمة الصائم في السجل', 'Fasting value saved')); };
ACT.saveEpds = () => { const a = S.epdsDraft; const score = Object.keys(a).reduce((s, k) => s + (+a[k] || 0), 0); S.epds.push({ date: iso(today()), score: score, q10: +a[9] || 0 }); save(); render(); flash(T('حُفظت النتيجة', 'Result saved')); };
ACT.saveBw = () => { const c = S.calc.bw; S.baby.weights.push({ date: c.date || iso(today()), g: +c.w }); save(); updateCalc('bw'); flash(T('حُفظ الوزن', 'Weight saved')); };
ACT.tally = (el) => { const k = iso(today()); const lg = S.baby.log[k] || (S.baby.log[k] = { feed: 0, wet: 0, dirty: 0 }); lg[el.dataset.k] = Math.max(0, (lg[el.dataset.k] || 0) + +el.dataset.v); save(); render(); const again = $('[data-act="tally"][data-k="' + el.dataset.k + '"][data-v="' + el.dataset.v + '"]'); if (again) again.focus(); };
ACT.caf = (el) => { const c = S.calc.caf || (S.calc.caf = {}); c[el.dataset.k] = clamp((c[el.dataset.k] || 0) + +el.dataset.v, 0, 20); save(); const b = $('[data-caf="' + el.dataset.k + '"]'); if (b) b.textContent = c[el.dataset.k]; updateCalc('caf'); };
ACT.kickTap = () => {
  if (!S.kickRun) S.kickRun = { start: Date.now(), n: 0 };
  S.kickRun.n++;
  if (S.kickRun.n >= 10) { const min = Math.max(1, Math.round((Date.now() - S.kickRun.start) / 60000)); S.kicks.push({ date: iso(today()), min: min, n: 10 }); S.kickRun = null; flash(T('أحسنتِ! 10 حركات خلال ', 'Great! 10 movements in ') + cnt(min, W_MIN)); }
  save(); refreshLive('kick'); const b = $('[data-act="kickTap"]'); if (b) b.focus();
};
ACT.kickStop = () => { const r = S.kickRun; if (r && r.n > 0) S.kicks.push({ date: iso(today()), min: Math.max(1, Math.round((Date.now() - r.start) / 60000)), n: r.n }); S.kickRun = null; save(); refreshLive('kick'); };
ACT.kickCancel = () => { S.kickRun = null; save(); refreshLive('kick'); };
ACT.ctTap = () => { const now = Date.now(); if (S.contr.active) { S.contr.list.push({ s: S.contr.active, e: now }); S.contr.active = null; } else S.contr.active = now; if (S.contr.list.length > 60) S.contr.list = S.contr.list.slice(-60); save(); refreshLive('ct'); const b = $('[data-act="ctTap"]'); if (b) b.focus(); };
ACT.ctDemo = () => { const now = Date.now(); const l = []; for (let i = 12; i >= 0; i--) { const s = now - i * 5 * 60000 - 70000 + Math.round(Math.sin(i) * 20000); l.push({ s: s, e: s + 58000 + (i % 3) * 5000 }); } S.contr = { active: null, list: l }; save(); refreshLive('ct'); };
ACT.ctClear = () => { S.contr = { active: null, list: [] }; save(); refreshLive('ct'); };
ACT.demoPost = () => {
  const t = today(); const dd = addDays(t, -18);
  if (S.demo) { const lang = S.lang, theme = S.theme; S = demoPostState(lang); S.theme = theme; ensureCalc(); }
  else { S.profile.deliveryDate = iso(dd); S.profile.stage = 'post'; S.baby.birthDate = iso(dd); S.baby.birthWeight = S.baby.birthWeight || 3250; }
  ringAnimated = false; save(); render();
};
ACT.copySummary = () => {
  const txt = summaryText(); const msg = $('#copyMsg');
  const ok = () => { if (msg) msg.textContent = T('نُسخ الملخص', 'Summary copied'); };
  const fallback = () => { const ta = $('#copyFallback'); if (!ta) return; ta.value = txt; ta.classList.remove('sr'); ta.style.cssText = 'width:100%;margin-top:10px;min-height:160px'; ta.removeAttribute('aria-hidden'); ta.select(); if (msg) msg.textContent = T('حُدد النص، انسخيه يدويًا', 'Text selected; copy it manually'); };
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback(); } catch (e) { fallback(); }
};
ACT.resetDemo = () => { const lang = S.lang, theme = S.theme; S = demoState(lang); S.theme = theme; ringAnimated = false; save(); render(); flash(T('استُعيدت البيانات التجريبية', 'Sample data restored')); };
ACT.clearAll = () => { const lang = S.lang, theme = S.theme; S = baseState(); S.lang = lang; S.theme = theme; ensureCalc(); save(); render(); flash(T('مُسحت جميع البيانات', 'All data cleared')); };
ACT.closeDrawer = () => closeDrawer();

let flashT;
function flash(text) {
  let f = $('#flash'); if (!f) { f = document.createElement('div'); f.id = 'flash'; f.setAttribute('role', 'status'); f.style.cssText = 'position:fixed;bottom:calc(84px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:130;background:var(--ink);color:var(--paper);padding:10px 20px;border-radius:999px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:opacity .2s;opacity:0;max-width:90vw;text-align:center'; document.body.appendChild(f); }
  f.textContent = text; f.style.opacity = '1'; clearTimeout(flashT); flashT = setTimeout(() => { f.style.opacity = '0'; }, 2400);
}

/* ---------- emergency drawer & mobile nav ---------- */
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement; const p = $('#drawerPanel');
  const ph = (n, t, s, red) => '<a class="phone' + (red ? ' red' : '') + '" href="tel:' + n + '"><b>' + n + '</b><span>' + t + '<small>' + s + '</small></span></a>';
  p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 id="drawerTitle">' + T('أرقام الطوارئ في المملكة', 'Emergency numbers in Saudi Arabia') + '</h2><button class="icon-btn" type="button" data-act="closeDrawer" aria-label="' + T('إغلاق', 'Close') + '">✕</button></div>' +
    ph('997', T('هيئة الهلال الأحمر السعودي', 'Saudi Red Crescent'), T('الإسعاف لأي حالة طبية طارئة', 'Ambulance for any medical emergency'), true) +
    ph('911', T('مركز البلاغات الموحد', 'Unified emergency number'), T('في المناطق المفعّلة', 'In regions where active'), true) +
    ph('937', T('وزارة الصحة', 'Ministry of Health'), T('استشارات طبية على مدار الساعة', '24/7 medical advice')) +
    ph('920033360', T('المركز الوطني لتعزيز الصحة النفسية', 'National Center for Mental Health Promotion'), T('استشارات نفسية', 'Psychological counselling')) +
    '<p class="hint" style="margin-top:14px">' + T('إذا لم يبدأ الاتصال من هنا، فاتصلي بالرقم مباشرة من هاتفك.', 'If the call doesn’t start from here, dial the number on your phone.') + '</p><div class="btn-row" style="margin-top:10px"><a class="btn soft small" href="#guide" data-act="closeDrawer">' + T('دليل الأعراض', 'Symptom guide') + '</a></div>';
  $('#drawer').classList.add('on'); const b = p.querySelector('button'); if (b) b.focus();
}
function closeDrawer() { const d = $('#drawer'); if (!d.classList.contains('on')) return; d.classList.remove('on'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
function setNav(open) { document.body.classList.toggle('nav-open', open); ['#menuBtn', '#moreBtn'].forEach((s) => { const b = $(s); if (b) b.setAttribute('aria-expanded', String(open)); }); if (open) { const a = $('#nav a'); if (a) a.focus(); } }

/* ===================================================== RENDER ===================================================== */
function ensureCalc() {
  const c = S.calc;
  c.edd = Object.assign({ method: 'lmp', lmp: S.profile.lmp || '', cycle: S.profile.cycle || 28, conc: '', us: '', usW: '', usD: '', ivf: '', ivfDay: '5' }, c.edd || {});
  const ga = gaOn(today());
  c.wg = Object.assign({ cur: (latest('weight') || {}).v || '', week: ga ? ga.w : '' }, c.wg || {});
  c.bp = Object.assign({ sys: 118, dia: 76 }, c.bp || {});
  c.og = Object.assign({ unit: 'mg', f: '', h1: '', h2: '' }, c.og || {});
  c.apgar = c.apgar || {}; c.bw = Object.assign({ w: '', date: iso(today()) }, c.bw || {}); c.caf = c.caf || {};
  S.ui.tool = Object.assign({ pre: 'ovu', preg: 'edd', post: 'plan', baby: 'info', food: 'needs' }, S.ui.tool || {});
}
function bindValues(root) {
  $$('[data-bind]', root).forEach((el) => {
    const v = getPath(S, el.dataset.bind);
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'radio') el.checked = v != null && String(v) === el.value;
    else el.value = v == null ? '' : v;
  });
}
function updateCalc(name) { const o = $('[data-out="' + name + '"]'); if (o && CALC[name]) o.innerHTML = CALC[name](); }
function uniLogo() {
  const alt = esc(T('شعار جامعة سليمان الراجحي', 'Sulaiman Alrajhi University logo'));
  return '<img class="uni-logo light" src="logo-light.png" alt="' + alt + '"><img class="uni-logo dark" src="logo-dark.png" alt="" aria-hidden="true">';
}
function applyChrome() {
  const html = document.documentElement; html.lang = S.lang; html.dir = S.lang === 'en' ? 'ltr' : 'rtl';
  if (S.theme) html.dataset.theme = S.theme; else delete html.dataset.theme;
  document.title = T('رحلة الأم | Mama Journey', 'Mama Journey | رحلة الأم');
  $$('[data-t="brand"],[data-t="brand2"]').forEach((e) => { e.textContent = T('رحلة الأم', 'Mama Journey'); });
  $('[data-t="brandSub"]').textContent = T('صحة الأم من التخطيط للحمل إلى ما بعد الولادة', 'Maternal health from planning to after birth');
  $('[data-t="sos"]').textContent = T('الطوارئ', 'Emergency'); $('#sosBtn').setAttribute('aria-label', T('أرقام الطوارئ', 'Emergency numbers'));
  $('#skip').textContent = T('تخطَّ إلى المحتوى', 'Skip to content');
  $('#side').setAttribute('aria-label', T('القائمة الرئيسية', 'Main menu'));
  ['#langBtn', '#langBtn2'].forEach((s) => { const b = $(s); b.textContent = S.lang === 'en' ? 'ع' : 'EN'; b.setAttribute('aria-label', S.lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'); b.setAttribute('lang', S.lang === 'en' ? 'ar' : 'en'); });
  $('#themeBtn').setAttribute('aria-label', T('تبديل الوضع الليلي', 'Toggle dark mode'));
  $('#menuBtn').setAttribute('aria-label', T('فتح القائمة', 'Open menu'));
  $('#sosTop').setAttribute('aria-label', T('أرقام الطوارئ', 'Emergency numbers'));
  $('#affil').innerHTML = uniLogo() + '<span class="fac">' + T('كلية التمريض', 'College of Nursing') + '</span>';
  $('#disclaimer').innerHTML = uniLogo() + '<span><b>' + T('مشروع طلابي في كلية التمريض بجامعة سليمان الراجحي.', 'Student project, College of Nursing, Sulaiman Alrajhi University.') + '</b> ' + T('رحلة الأم منصة للتثقيف والمتابعة ولا تغني عن الطبيب أو الممرضة. في الحالات الطارئة اتصلي بالرقم 997. تُحفظ البيانات في هذا المتصفح فقط.', 'Mama Journey is for education and self-tracking and does not replace your doctor or nurse. In an emergency call 997. Data stays in this browser only.') + '</span>';
}
function render() {
  ensureCalc(); applyChrome(); renderShell();
  $$('.view').forEach((v) => v.classList.remove('on'));
  const v = $('#v-' + current); v.innerHTML = VIEWS[current](); v.classList.add('on');
  bindValues(v);
  $$('[data-out]', v).forEach((o) => { if (CALC[o.dataset.out]) o.innerHTML = CALC[o.dataset.out](); });
  if (current === 'guide') refreshGuide();
}
function route() {
  const h = (location.hash || '').replace('#', '');
  const prev = current;
  current = ROUTES[h] ? h : 'home';
  render(); setNav(false);
  if (prev !== current) { window.scrollTo(0, 0); }
}

/* ---------- events ---------- */
const confirmWait = new WeakMap();
document.addEventListener('click', (e) => {
  const tl = e.target.closest('[data-tool]'); if (tl) { const p = tl.dataset.tool.split(':'); S.ui.tool[p[0]] = p[1]; save(); }
  const lb = e.target.closest('[data-lab]'); if (lb) { S.ui.labTest = lb.dataset.lab; save(); }
  const lk = tl || lb; if (lk && lk.getAttribute('href') === '#' + current) { e.preventDefault(); render(); window.scrollTo(0, 0); }
  if (e.target.closest('[data-close]')) { closeDrawer(); return; }
  if (e.target.closest('#moreBtn')) { setNav(!document.body.classList.contains('nav-open')); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  if (el.hasAttribute('data-confirm')) {
    if (!confirmWait.get(el)) { const orig = el.textContent; el.textContent = T('هل أنتِ متأكدة؟ اضغطي مرة أخرى', 'Sure? Tap again'); confirmWait.set(el, setTimeout(() => { el.textContent = orig; confirmWait.delete(el); }, 3000)); return; }
    clearTimeout(confirmWait.get(el)); confirmWait.delete(el);
  }
  if (el.tagName === 'BUTTON') e.preventDefault();
  fn(el, e);
});
function onBind(e, isChange) {
  const el = e.target; if (!el.dataset || !el.dataset.bind) return;
  let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (el.type === 'radio') { if (!el.checked) return; v = el.hasAttribute('data-num') ? +el.value : el.value; }
  else if (el.type === 'number') v = el.value === '' ? '' : +el.value;
  else v = el.value;
  setPath(S, el.dataset.bind, v);
  save();
  if (el.hasAttribute('data-live-filter')) { refreshGuide(); return; }
  const box = el.closest('[data-calc]');
  if (box) $$('[data-out]', box).forEach((o) => updateCalc(o.dataset.out));
  if (isChange && el.hasAttribute('data-rr')) { render(); const again = el.id && document.getElementById(el.id); if (again && again.type !== 'date') again.focus(); }
}
document.addEventListener('input', (e) => onBind(e, false));
document.addEventListener('change', (e) => onBind(e, true));
document.addEventListener('submit', (e) => {
  const f = e.target; if (!f.dataset || f.dataset.actSubmit !== 'addLab') return; e.preventDefault();
  const fd = new FormData(f); const k = S.ui.labTest; const t = TESTS[k];
  const date = fd.get('date'); const v = parseFloat(fd.get('v')); const v2 = t.two ? parseFloat(fd.get('v2')) : undefined;
  if (!parse(date) || isNaN(v) || (t.two && isNaN(v2))) return;
  S.labs.push({ id: uid(), test: k, date: date, v: v, v2: v2 }); S.calc.lab = { date: date }; save(); render();
  flash(T('أُضيفت القراءة', 'Reading added'));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeDrawer(); setNav(false); }
  const tab = e.target.closest && e.target.closest('[role="tab"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(e.key) >= 0) {
    const list = $$('[role="tab"]', tab.parentElement); const i = list.indexOf(tab); const rtl = document.documentElement.dir === 'rtl';
    let n = i;
    if (e.key === 'Home') n = 0; else if (e.key === 'End') n = list.length - 1;
    else if (e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = (i + 1) % list.length;
    else n = (i - 1 + list.length) % list.length;
    e.preventDefault(); list[n].click();
  }
});
const tipEl = () => $('#tip');
document.addEventListener('pointerover', (e) => { const t = e.target.closest && e.target.closest('[data-tip]'); if (!t) return; const el = tipEl(); el.innerHTML = esc(t.getAttribute('data-tip')).replace(/\n/g, '<br>'); el.classList.add('on'); posTip(e); });
document.addEventListener('pointermove', (e) => { if (tipEl().classList.contains('on')) posTip(e); });
document.addEventListener('pointerout', (e) => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) tipEl().classList.remove('on'); });
function posTip(e) { const el = tipEl(); const w = el.offsetWidth, h = el.offsetHeight; let x = e.clientX + 14, y = e.clientY - h - 12; if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y < 8) y = e.clientY + 16; el.style.left = x + 'px'; el.style.top = y + 'px'; }

const toggleLang = () => { S.lang = S.lang === 'en' ? 'ar' : 'en'; save(); render(); };
$('#langBtn').addEventListener('click', toggleLang);
$('#langBtn2').addEventListener('click', toggleLang);
$('#themeBtn').addEventListener('click', () => { const dark = S.theme ? S.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; S.theme = dark ? 'light' : 'dark'; save(); applyChrome(); });
$('#sosBtn').addEventListener('click', openDrawer);
$('#sosTop').addEventListener('click', openDrawer);
$('#menuBtn').addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
$('#navScrim').addEventListener('click', () => setNav(false));
window.addEventListener('hashchange', () => { closeDrawer(); route(); });

setInterval(() => {
  if (S.kickRun) { const t = $('[data-timer="kick"]'); if (t) { const el = (Date.now() - S.kickRun.start) / 1000; t.textContent = mmss(el); if (el > 7200 && !$('[data-live="kick"] .result')) refreshLive('kick'); } }
  if (S.contr.active) { const t = $('[data-timer="ct"]'); if (t) t.textContent = mmss((Date.now() - S.contr.active) / 1000); }
}, 1000);

function start() {
  const loaded = load();
  S = loaded ? fill(baseState(), loaded) : demoState('ar');
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => S); } catch (e) { /* optional */ }
  route();
}
window.__MJ = { get state() { return S; }, CALC: CALC, TESTS: TESTS, gainRange: gainRange, gaOn: gaOn };
start();
})();
