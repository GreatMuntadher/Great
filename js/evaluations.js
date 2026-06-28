/* ── Evaluations Page ── */

let evalPeriod   = 30;   // days: 7, 30, 0=this month, -1=all
let evalSelected = null; // selected metric id

/* ── metric definitions ── */
const EVAL_METRICS = [
  { id:'tasks_overall', lbl:'إنجاز المهام اليومي',   ico:'✅', color:'#4f8ef7' },
  { id:'assess_score',  lbl:'درجة التقييم اليومي',   ico:'📊', color:'#a78bfa' },
  { id:'protect_score', lbl:'نقاط الحماية',           ico:'🛡️', color:'#43d98d' },
  { id:'body_score',    lbl:'نقاط الجسد والصحة',      ico:'💪', color:'#f472b6' },
  { id:'victory_score', lbl:'نقاط الانتصارات',        ico:'🏆', color:'#fbbf24' },
  { id:'urge_level',    lbl:'مستوى الرغبة (عكسي)',    ico:'🌡️', color:'#ef4444' },
  { id:'commit_level',  lbl:'قوة الالتزام',            ico:'🔥', color:'#fb923c' },
];

/* ── date range helper ── */
function getEvalDates(){
  const todayStr = today();
  const dates    = [];
  let   start;

  if(evalPeriod === 0){
    /* this month */
    const now   = new Date();
    start       = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if(evalPeriod === -1){
    /* all data — go back 365 days max */
    start       = new Date();
    start.setDate(start.getDate() - 364);
  } else {
    start       = new Date();
    start.setDate(start.getDate() - (evalPeriod - 1));
  }

  const cur = new Date(start);
  while(cur.toISOString().slice(0,10) <= todayStr){
    dates.push(cur.toISOString().slice(0,10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/* ── get metric value for a date ── */
function getMetricValue(metricId, dateStr){
  const tasks       = load(K.tasks) || {};
  const assessments = load(K.dailyAssessments) || {};
  const assess      = assessments[dateStr] || null;

  if(metricId === 'tasks_overall'){
    const dt  = tasks[dateStr] || {};
    const done = Object.values(dt).filter(Boolean).length;
    return TASKS.length > 0 ? Math.round(done / TASKS.length * 100) : null;
  }
  if(!assess) return null;
  const sc = assess.scores || {};
  if(metricId === 'assess_score')  return sc.dailyProgressScore   ?? null;
  if(metricId === 'protect_score') return sc.protectionScore      ?? null;
  if(metricId === 'body_score')    return sc.bodyScore            ?? null;
  if(metricId === 'victory_score') return sc.victoryScore         ?? null;
  if(metricId === 'urge_level'){
    /* invert: high urge = bad. show 100 - urge% so higher = better */
    const u = sc.urgeRiskScore ?? null;
    return u !== null ? 100 - u : null;
  }
  if(metricId === 'commit_level'){
    const ans = assess.answers || {};
    const v   = parseInt(ans['dq_17']?.rating);
    return isNaN(v) ? null : Math.round(v / 10 * 100);
  }
  return null;
}

/* ── build data series ── */
function buildSeries(metricId){
  const dates = getEvalDates();
  const pts   = [];
  dates.forEach(ds => {
    const v = getMetricValue(metricId, ds);
    if(v !== null) pts.push({ date: ds, value: v });
  });
  return pts;
}

/* ── summary stats from series ── */
function seriesSummary(pts){
  if(!pts.length) return { avg:0, best:null, worst:null, up:0, down:0 };
  const avg   = Math.round(pts.reduce((s,p) => s + p.value, 0) / pts.length);
  const best  = pts.reduce((a,b) => b.value > a.value ? b : a);
  const worst = pts.reduce((a,b) => b.value < a.value ? b : a);
  let up=0, down=0;
  for(let i=1; i<pts.length; i++){
    if(pts[i].value > pts[i-1].value) up++;
    else if(pts[i].value < pts[i-1].value) down++;
  }
  return { avg, best, worst, up, down };
}

/* ── SVG wave chart ── */
function buildSVGChart(pts, color, w, h){
  if(pts.length === 0) return `<div class="eval-chart-empty">لا بيانات في هذه الفترة</div>`;

  const PAD_L=28, PAD_R=10, PAD_T=14, PAD_B=28;
  const cw = w - PAD_L - PAD_R;
  const ch = h - PAD_T - PAD_B;
  const n  = pts.length;
  const avg = pts.reduce((s,p)=>s+p.value,0)/n;

  const toX = i => PAD_L + (n>1 ? i/(n-1)*cw : cw/2);
  const toY = v => PAD_T + (1 - v/100) * ch;

  /* smooth bezier path */
  const coords = pts.map((p,i) => ({ x: toX(i), y: toY(p.value) }));
  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  for(let i=1; i<coords.length; i++){
    const cx1 = (coords[i-1].x + coords[i].x) / 2;
    linePath += ` C ${cx1} ${coords[i-1].y} ${cx1} ${coords[i].y} ${coords[i].x} ${coords[i].y}`;
  }

  /* fill path */
  const fillPath = linePath
    + ` L ${coords[coords.length-1].x} ${PAD_T+ch}`
    + ` L ${coords[0].x} ${PAD_T+ch} Z`;

  /* avg line */
  const avgY = toY(avg);
  const uid  = color.replace(/[^a-z0-9]/gi,'');

  /* y axis labels */
  const yLabels = [0,50,100].map(v =>
    `<text x="${PAD_L-4}" y="${toY(v)+4}" class="eval-svg-lbl" text-anchor="end">${v}</text>`
  ).join('');

  /* x axis labels — show max 6 labels */
  const step  = Math.max(1, Math.floor(n / 6));
  const xLabels = coords.map((c,i) => {
    if(i % step !== 0 && i !== n-1) return '';
    const d = pts[i].date.slice(5); // MM-DD
    return `<text x="${c.x}" y="${PAD_T+ch+14}" class="eval-svg-lbl" text-anchor="middle">${d}</text>`;
  }).join('');

  /* dots */
  const dots = coords.map((c,i) =>
    `<circle class="eval-dot" cx="${c.x}" cy="${c.y}" r="4" fill="${color}"
       data-date="${pts[i].date}" data-val="${pts[i].value}">
       <title>${pts[i].date}: ${pts[i].value}%</title>
     </circle>`
  ).join('');

  return `
<svg viewBox="0 0 ${w} ${h}" class="eval-svg" role="img" aria-label="مخطط الأداء">
  <defs>
    <linearGradient id="eg${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${color}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="ef${uid}">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- grid lines -->
  <line x1="${PAD_L}" y1="${toY(100)}" x2="${PAD_L+cw}" y2="${toY(100)}" class="eval-grid-line"/>
  <line x1="${PAD_L}" y1="${toY(50)}"  x2="${PAD_L+cw}" y2="${toY(50)}"  class="eval-grid-line"/>
  <line x1="${PAD_L}" y1="${toY(0)}"   x2="${PAD_L+cw}" y2="${toY(0)}"   class="eval-grid-line"/>

  <!-- fill -->
  <path d="${fillPath}" fill="url(#eg${uid})" class="eval-fill"/>

  <!-- avg line -->
  <line x1="${PAD_L}" y1="${avgY}" x2="${PAD_L+cw}" y2="${avgY}"
        stroke="${color}" stroke-width="1" stroke-dasharray="5 4" opacity="0.5"/>
  <text x="${PAD_L+4}" y="${avgY-4}" class="eval-svg-lbl" fill="${color}">متوسط ${Math.round(avg)}%</text>

  <!-- line -->
  <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round" class="eval-line"/>

  <!-- dots -->
  ${dots}

  <!-- labels -->
  ${yLabels}
  ${xLabels}
</svg>`;
}

/* ── overall summary cards ── */
function renderEvalSummary(){
  const el = document.getElementById('eval-summary');
  if(!el) return;

  const pts = buildSeries('assess_score');
  const taskPts = buildSeries('tasks_overall');
  const allPts  = [...pts, ...taskPts];

  if(allPts.length === 0){
    el.innerHTML = `<div class="eval-no-data card">لا توجد بيانات في هذه الفترة. ابدأ بتسجيل مهامك اليومية وتقييماتك.</div>`;
    return;
  }

  /* best/worst metric */
  const metricAvgs = EVAL_METRICS.map(m => {
    const s = buildSeries(m.id);
    if(!s.length) return null;
    return { m, avg: Math.round(s.reduce((a,b)=>a+b.value,0)/s.length) };
  }).filter(Boolean);

  const bestMetric  = metricAvgs.reduce((a,b) => b.avg>a.avg?b:a, metricAvgs[0]);
  const worstMetric = metricAvgs.reduce((a,b) => b.avg<a.avg?b:a, metricAvgs[0]);

  const allScores = allPts.map(p=>p.value);
  const avgAll    = allScores.length ? Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length) : 0;

  /* trend: compare last 3 vs first 3 */
  const recentAvg = pts.slice(-3).reduce((s,p)=>s+p.value,0)/Math.max(1,Math.min(3,pts.length));
  const oldAvg    = pts.slice(0,3).reduce((s,p)=>s+p.value,0)/Math.max(1,Math.min(3,pts.length));
  const trend     = recentAvg > oldAvg+5 ? '📈 صاعد' : recentAvg < oldAvg-5 ? '📉 منخفض' : '➡️ ثابت';
  const trendCol  = recentAvg > oldAvg+5 ? 'var(--green)' : recentAvg < oldAvg-5 ? 'var(--red)' : 'var(--t2)';

  el.innerHTML = `
<div class="eval-sum-grid mb24">
  <div class="eval-sum-card"><div class="eval-sum-val" style="color:var(--blue)">${avgAll}%</div><div class="eval-sum-lbl">متوسط الإنجاز العام</div></div>
  <div class="eval-sum-card"><div class="eval-sum-val" style="color:var(--green)">${bestMetric?.m.ico||''} ${bestMetric?.avg||0}%</div><div class="eval-sum-lbl">${bestMetric?.m.lbl||'—'}</div></div>
  <div class="eval-sum-card"><div class="eval-sum-val" style="color:var(--red)">${worstMetric?.m.ico||''} ${worstMetric?.avg||0}%</div><div class="eval-sum-lbl">${worstMetric?.m.lbl||'—'}</div></div>
  <div class="eval-sum-card"><div class="eval-sum-val" style="color:var(--gold)">${pts.length}</div><div class="eval-sum-lbl">أيام بتقييم مسجل</div></div>
  <div class="eval-sum-card" style="grid-column:span 2"><div class="eval-sum-val" style="color:${trendCol}">${trend}</div><div class="eval-sum-lbl">اتجاه الأداء</div></div>
</div>`;
}

/* ── metric cards list ── */
function renderEvalMetrics(){
  const el = document.getElementById('eval-metrics');
  if(!el) return;

  el.innerHTML = EVAL_METRICS.map(m => {
    const pts  = buildSeries(m.id);
    const s    = seriesSummary(pts);
    const isSel = evalSelected === m.id;
    return `
<div class="eval-metric-card ${isSel?'eval-metric-sel':''}" onclick="selectEvalMetric('${m.id}')" style="--eval-col:${m.color}">
  <div class="eval-metric-ico">${m.ico}</div>
  <div class="eval-metric-info">
    <div class="eval-metric-name">${m.lbl}</div>
    <div class="eval-metric-stats">
      <span style="color:var(--blue)">${s.avg}%</span>
      <span class="eval-meta-sep">·</span>
      <span class="eval-pts-count">${pts.length} يوم</span>
    </div>
  </div>
  <div class="eval-metric-avg" style="color:${m.color}">${s.avg}%</div>
</div>`;
  }).join('');
}

/* ── selected metric detail ── */
function renderEvalDetail(){
  const el = document.getElementById('eval-detail');
  if(!el) return;
  if(!evalSelected){ el.style.display='none'; el.innerHTML=''; return; }

  const m    = EVAL_METRICS.find(x => x.id === evalSelected);
  const pts  = buildSeries(m.id);
  const s    = seriesSummary(pts);
  el.style.display = '';

  const chartW = Math.min(window.innerWidth - 40, 700);
  const chart  = buildSVGChart(pts, m.color, chartW, 200);

  el.innerHTML = `
<div class="card eval-det-card">
  <div class="eval-det-hd">
    <span class="eval-det-title">${m.ico} ${m.lbl}</span>
    <button class="eval-det-close" onclick="selectEvalMetric('${m.id}')"><i class="fas fa-times"></i></button>
  </div>

  <div class="eval-det-stats-row">
    <div class="eval-det-stat"><div class="eval-det-val" style="color:${m.color}">${s.avg}%</div><div class="eval-det-lbl">المتوسط</div></div>
    <div class="eval-det-stat"><div class="eval-det-val" style="color:var(--green)">${s.best ? s.best.value+'%' : '—'}</div><div class="eval-det-lbl">أفضل يوم</div></div>
    <div class="eval-det-stat"><div class="eval-det-val" style="color:var(--red)">${s.worst ? s.worst.value+'%' : '—'}</div><div class="eval-det-lbl">أصعب يوم</div></div>
    <div class="eval-det-stat"><div class="eval-det-val" style="color:var(--green)">↑${s.up}</div><div class="eval-det-lbl">أيام تحسّن</div></div>
    <div class="eval-det-stat"><div class="eval-det-val" style="color:var(--red)">↓${s.down}</div><div class="eval-det-lbl">أيام انخفاض</div></div>
  </div>

  <div class="eval-chart-wrap">${chart}</div>
</div>`;
}

/* ── select metric ── */
function selectEvalMetric(id){
  evalSelected = evalSelected === id ? null : id;
  renderEvalMetrics();
  renderEvalDetail();
  if(evalSelected){
    document.getElementById('eval-detail')?.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
}

/* ── set period ── */
function setEvalPeriod(p){
  evalPeriod = p;
  evalSelected = null;
  document.querySelectorAll('.eval-period-btn').forEach(b => {
    b.classList.toggle('eval-period-active', parseInt(b.dataset.period) === p);
  });
  renderEvaluationsPage();
}

/* ── main render ── */
function renderEvaluationsPage(){
  renderEvalSummary();
  renderEvalMetrics();
  renderEvalDetail();
}
