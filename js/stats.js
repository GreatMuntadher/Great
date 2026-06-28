/* ── Stats Page — مركز التحليل الشامل ── */

function renderStats(){
  renderStatsMainCards();
  renderStatsInsight();
  renderStatsWave();
  renderStatsChallenges();
  renderStatsAchievement();
  renderRecoveryLockStats();
  renderStatsSmartSummary();
  renderAssessmentStats();
  renderMemoirStats();
}

/* ─────────────── helpers ─────────────── */

function stGetDayScore(ds){
  const assessments = load(K.dailyAssessments) || {};
  const a = assessments[ds];
  if(a?.scores?.dailyProgressScore != null) return a.scores.dailyProgressScore;
  const tasks = load(K.tasks) || {};
  const day = tasks[ds] || {};
  const keys = Object.keys(day);
  if(!keys.length) return null;
  const done = Object.values(day).filter(Boolean).length;
  return Math.round(done / TASKS.length * 100);
}

function stBuildSeries(n){
  const pts = [];
  for(let i = n-1; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.toISOString().slice(0,10);
    pts.push({ date:ds, v:stGetDayScore(ds) });
  }
  return pts;
}

/* ─────────────── 1. Main stat cards ─────────────── */

function renderStatsMainCards(){
  const cd   = cleanDays();
  const best = Math.max(cd, load(K.best)||0);
  const urge = load(K.urge)||0;
  const j    = load(K.journal)||[];
  const td   = load(K.tasks)||{};

  let tot=0, done=0;
  Object.values(td).forEach(day=>{
    tot  += TASKS.length;
    done += Object.values(day).filter(Boolean).length;
  });
  const taskPct = tot ? Math.round(done/tot*100) : 0;

  const triggers={};
  j.forEach(e=>{ if(e.trigger) triggers[e.trigger]=(triggers[e.trigger]||0)+1; });
  const top = Object.entries(triggers).sort((a,b)=>b[1]-a[1])[0];

  /* set existing elements */
  const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('st-days',    cd);
  set('st-best',    best);
  set('st-urge',    urge);
  set('st-journal', j.length);
  set('st-tasks',   taskPct+'%');
  set('st-trigger', top ? top[0] : '—');

  /* extended cards */
  const el = document.getElementById('st-ext-cards');
  if(!el) return;

  const chs      = JSON.parse(localStorage.getItem('recovery_challenges')||'[]');
  const activeC  = chs.filter(c=>c.status==='active').length;
  const doneC    = chs.filter(c=>c.status==='completed').length;
  const chAvg    = chs.length
    ? Math.round(chs.map(ch=>challengeStats(ch).pct).reduce((s,v)=>s+v,0)/chs.length)
    : 0;

  const series7  = stBuildSeries(7).filter(p=>p.v!=null);
  const series30 = stBuildSeries(30).filter(p=>p.v!=null);
  const avg7     = series7.length  ? Math.round(series7.reduce((s,p)=>s+p.v,0)/series7.length)   : null;
  const avg30    = series30.length ? Math.round(series30.reduce((s,p)=>s+p.v,0)/series30.length)  : null;

  const todayStr = today();
  const yr = parseInt(todayStr.slice(0,4)), mo = parseInt(todayStr.slice(5,7))-1;
  const dayN = parseInt(todayStr.slice(8));
  let withData=0;
  for(let d=1; d<=dayN; d++){
    const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(stGetDayScore(ds)!==null) withData++;
  }

  const pCol = v => v>=60?'var(--green)':v>=40?'var(--gold)':'var(--red)';
  const sc = (ico,val,lbl,col='')=>
    `<div class="sc"><div class="sc-ico">${ico}</div><div class="sc-val"${col?` style="color:${col}"`:''}>${val}</div><div class="sc-lbl">${lbl}</div></div>`;

  el.innerHTML = [
    sc('🎯', activeC,                     'تحديات نشطة',       'var(--blue)'),
    sc('🏅', doneC,                       'تحديات مكتملة',     'var(--green)'),
    sc('📈', chs.length ? chAvg+'%':'—',  'متوسط التحديات',    chAvg>=50?'var(--green)':'var(--gold)'),
    sc('⚡', avg7!=null  ? avg7+'%':'—',  'متوسط 7 أيام',      avg7!=null?pCol(avg7):''),
    sc('📅', avg30!=null ? avg30+'%':'—', 'متوسط 30 يوم',      avg30!=null?pCol(avg30):''),
    sc('🗓️', withData,                    'أيام هذا الشهر',    'var(--purple)'),
  ].join('');
}

/* ─────────────── 2. Smart insight ─────────────── */

function renderStatsInsight(){
  const el = document.getElementById('st-insight');
  if(!el) return;

  const cd    = cleanDays();
  const pts7  = stBuildSeries(7).filter(p=>p.v!=null);
  const pts7p = stBuildSeries(14).slice(0,7).filter(p=>p.v!=null);
  const avg7  = pts7.length  ? Math.round(pts7.reduce((s,p)=>s+p.v,0)/pts7.length)  : null;
  const avg7p = pts7p.length ? Math.round(pts7p.reduce((s,p)=>s+p.v,0)/pts7p.length) : null;

  const chs   = JSON.parse(localStorage.getItem('recovery_challenges')||'[]');
  const activeC = chs.filter(c=>c.status==='active');

  const j = load(K.journal)||{};
  const jArr = Array.isArray(j) ? j : [];
  const triggers={};
  jArr.forEach(e=>{ if(e.trigger) triggers[e.trigger]=(triggers[e.trigger]||0)+1; });
  const top = Object.entries(triggers).sort((a,b)=>b[1]-a[1])[0];

  const todayStr = today();
  const yr = parseInt(todayStr.slice(0,4)), mo = parseInt(todayStr.slice(5,7))-1;
  const dayN = parseInt(todayStr.slice(8));
  let goodDays=0, badDays=0;
  for(let d=1; d<dayN; d++){
    const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const s=stGetDayScore(ds);
    if(s!=null){ if(s>=50) goodDays++; else badDays++; }
  }

  const rows=[];
  if(avg7!=null && avg7p!=null){
    if(avg7>avg7p+5)     rows.push(`📈 أداؤك يتحسن — متوسط آخر 7 أيام <strong>${avg7}%</strong> أعلى من الأسبوع السابق (${avg7p}%)`);
    else if(avg7<avg7p-5)rows.push(`📉 أداؤك انخفض قليلاً — متوسط آخر 7 أيام <strong>${avg7}%</strong> أقل من الأسبوع السابق (${avg7p}%)`);
    else                  rows.push(`➡️ أداؤك ثابت — متوسط آخر 7 أيام <strong>${avg7}%</strong> — الاستمرارية هي المفتاح`);
  }
  if(cd>=7)             rows.push(`🌟 <strong>${cd} يوماً</strong> نظيفاً متواصلاً — هذا إنجاز حقيقي`);
  if(activeC.length)    rows.push(`🎯 لديك <strong>${activeC.length}</strong> تحدٍّ نشط — لا تنسَ تسجيل يومك اليوم`);
  if(top)               rows.push(`⚡ أكثر محفز تكرر: <strong>"${top[0]}"</strong> (${top[1]} مرة) — كن على حذر منه`);
  if(goodDays>0)        rows.push(`✅ هذا الشهر: <strong>${goodDays}</strong> يوم جيد و<strong>${badDays}</strong> يوم صعب`);
  if(!rows.length)      rows.push('📊 سجّل بياناتك اليومية لرؤية ملخص ذكي يحلّل تقدمك');

  el.innerHTML=`
<div class="card mb24">
  <div class="sec-t"><i class="fas fa-brain" style="color:var(--purple)"></i>ملخص ذكي</div>
  <div class="st-insight-list">
    ${rows.map(r=>`<div class="st-insight-row">${r}</div>`).join('')}
  </div>
</div>`;
}

/* ─────────────── 3. Performance wave ─────────────── */

function renderStatsWave(){
  const el = document.getElementById('st-wave');
  if(!el) return;

  const pts = stBuildSeries(30);
  const valid = pts.filter(p=>p.v!=null);

  if(valid.length < 2){
    el.innerHTML=`
<div class="card mb24">
  <div class="sec-t"><i class="fas fa-wave-square" style="color:var(--blue)"></i>موجة الأداء — آخر 30 يوم</div>
  <div class="st-empty"><div style="font-size:40px">📊</div><p>سجّل بيانات يومية لرؤية موجة أدائك هنا</p></div>
</div>`;
    return;
  }

  const avg = Math.round(valid.reduce((s,p)=>s+p.v,0)/valid.length);
  const W=600, H=120, PAD=16;
  const IW=W-PAD*2, IH=H-PAD*2;

  const mapped = pts.map((p,i)=>({
    x: PAD + (i/(pts.length-1))*IW,
    y: p.v!=null ? PAD+IH-(p.v/100)*IH : null,
    v: p.v
  }));
  const vPts = mapped.filter(p=>p.y!=null);

  function bezier(arr){
    if(arr.length<2) return '';
    let d=`M${arr[0].x.toFixed(1)},${arr[0].y.toFixed(1)}`;
    for(let i=1;i<arr.length;i++){
      const cx=((arr[i-1].x+arr[i].x)/2).toFixed(1);
      d+=` C${cx},${arr[i-1].y.toFixed(1)} ${cx},${arr[i].y.toFixed(1)} ${arr[i].x.toFixed(1)},${arr[i].y.toFixed(1)}`;
    }
    return d;
  }

  const line    = bezier(vPts);
  const avgY    = (PAD+IH-(avg/100)*IH).toFixed(1);
  const fillD   = line+` L${vPts[vPts.length-1].x.toFixed(1)},${PAD+IH} L${vPts[0].x.toFixed(1)},${PAD+IH} Z`;
  const dots    = vPts.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="var(--blue)" opacity=".85"/>`).join('');

  el.innerHTML=`
<div class="card mb24">
  <div class="st-wave-hd">
    <span class="sec-t" style="margin-bottom:0"><i class="fas fa-wave-square" style="color:var(--blue)"></i>موجة الأداء — آخر 30 يوم</span>
    <span class="st-wave-avg">متوسط <strong style="color:var(--blue)">${avg}%</strong></span>
  </div>
  <div class="st-wave-wrap">
    <svg viewBox="0 0 ${W} ${H}" class="st-wave-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="stFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--blue)" stop-opacity=".28"/>
          <stop offset="100%" stop-color="var(--blue)" stop-opacity=".02"/>
        </linearGradient>
        <filter id="stGlow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="${fillD}" fill="url(#stFill)"/>
      <line x1="${PAD}" y1="${avgY}" x2="${W-PAD}" y2="${avgY}" stroke="rgba(255,255,255,.15)" stroke-width="1" stroke-dasharray="4,3"/>
      <path d="${line}" stroke="var(--blue)" stroke-width="2.5" fill="none" filter="url(#stGlow)" class="st-wave-line"/>
      ${dots}
    </svg>
  </div>
  <div class="st-wave-labels"><span>قبل 30 يوم</span><span>اليوم</span></div>
</div>`;
}

/* ─────────────── 4. Challenges analysis ─────────────── */

function renderStatsChallenges(){
  const el = document.getElementById('st-challenges-wrap');
  if(!el) return;

  const chs = JSON.parse(localStorage.getItem('recovery_challenges')||'[]');
  if(!chs.length){
    el.innerHTML=`
<div class="card mb24">
  <div class="sec-t"><i class="fas fa-trophy" style="color:var(--gold)"></i>تحليل التحديات</div>
  <div class="st-empty"><div style="font-size:40px">🏆</div><p>لا توجد تحديات بعد — ابدأ تحديك الأول</p>
  <button class="btn btn-blue mt16" onclick="go('challenges')"><i class="fas fa-plus"></i>إنشاء تحدي</button></div>
</div>`;
    return;
  }

  const enriched  = chs.map(ch=>({ ch, s:challengeStats(ch) }));
  const active    = enriched.filter(x=>x.ch.status==='active');
  const completed = enriched.filter(x=>x.ch.status==='completed');
  const stopped   = enriched.filter(x=>x.ch.status==='stopped');
  const avgPct    = Math.round(enriched.reduce((s,x)=>s+x.s.pct,0)/enriched.length);
  const totalDone = enriched.reduce((s,x)=>s+x.s.done,0);

  const sorted  = [...enriched].sort((a,b)=>b.s.pct-a.s.pct);
  const bestCh  = sorted[0];
  const closestActive = active.length
    ? [...active].sort((a,b)=>b.s.pct-a.s.pct)[0]
    : null;

  const pb = (pct, col='var(--blue)')=>
    `<div class="ch-pb-track" style="margin-top:8px"><div class="ch-pb-fill" style="width:${pct}%;background:${col}"></div></div>`;

  const sc=(ico,val,lbl,col='')=>
    `<div class="sc"><div class="sc-ico">${ico}</div><div class="sc-val"${col?` style="color:${col}"`:''}>${val}</div><div class="sc-lbl">${lbl}</div></div>`;

  el.innerHTML=`
<div class="card mb24">
  <div class="sec-t"><i class="fas fa-trophy" style="color:var(--gold)"></i>تحليل التحديات</div>
  <div class="st-ch-grid mb16">
    ${sc('🎯', active.length,    'نشطة',          'var(--blue)')}
    ${sc('🏅', completed.length, 'مكتملة',        'var(--green)')}
    ${sc('⏸️', stopped.length,   'متوقفة',        'var(--t3)')}
    ${sc('📊', avgPct+'%',       'متوسط التقدم',  avgPct>=50?'var(--green)':'var(--gold)')}
    ${sc('✅', totalDone,        'أيام منجزة',    'var(--purple)')}
  </div>
  ${bestCh?`
  <div class="st-ch-highlight mb12">
    <div class="st-ch-hl-tag">🌟 أفضل تحدي تقدماً</div>
    <div class="st-ch-hl-name">${bestCh.ch.name}</div>
    <div class="st-ch-hl-pct" style="color:var(--green)">${bestCh.s.pct}%</div>
    ${pb(bestCh.s.pct,'var(--green)')}
  </div>`:''}
  ${closestActive?`
  <div class="st-ch-highlight">
    <div class="st-ch-hl-tag">🎯 الأقرب للاكتمال</div>
    <div class="st-ch-hl-name">${closestActive.ch.name}</div>
    <div class="st-ch-hl-pct" style="color:var(--blue)">${closestActive.s.remaining} يوم متبقٍ</div>
    ${pb(closestActive.s.pct,'var(--blue)')}
  </div>`:''}
  <button class="btn btn-ghost btn-full mt16" onclick="go('challenges')"><i class="fas fa-trophy"></i>عرض جميع التحديات</button>
</div>`;
}

/* ─────────────── 5. Daily achievement analysis ─────────────── */

function renderStatsAchievement(){
  const el = document.getElementById('st-daily-ach');
  if(!el) return;

  const pts = stBuildSeries(30).filter(p=>p.v!=null);
  if(pts.length < 2){
    el.innerHTML=`
<div class="card mb24">
  <div class="sec-t"><i class="fas fa-calendar-check" style="color:var(--green)"></i>تحليل الإنجاز اليومي</div>
  <div class="st-empty"><div style="font-size:40px">📅</div><p>سجّل تقييمات يومية لرؤية تحليل إنجازك هنا</p></div>
</div>`;
    return;
  }

  const last7  = pts.slice(-7);
  const prev7  = pts.slice(-14,-7);
  const avg7   = last7.length  ? Math.round(last7.reduce((s,p)=>s+p.v,0)/last7.length)  : null;
  const avg30  = pts.length    ? Math.round(pts.reduce((s,p)=>s+p.v,0)/pts.length)       : null;
  const avg7p  = prev7.length  ? Math.round(prev7.reduce((s,p)=>s+p.v,0)/prev7.length)   : null;

  const best  = pts.reduce((b,p)=>p.v>b.v?p:b, pts[0]);
  const worst = pts.reduce((w,p)=>p.v<w.v?p:w, pts[0]);
  const goodD = pts.filter(p=>p.v>=50).length;
  const badD  = pts.filter(p=>p.v<25).length;

  let trendTxt='', trendIco='➡️', trendCol='var(--t2)';
  if(avg7!=null && avg7p!=null && prev7.length>=3){
    if(avg7>avg7p+5)      { trendTxt='صاعد';    trendIco='📈'; trendCol='var(--green)'; }
    else if(avg7<avg7p-5) { trendTxt='منخفض';   trendIco='📉'; trendCol='var(--red)';   }
    else                  { trendTxt='ثابت';    trendIco='➡️'; trendCol='var(--t2)';    }
  }

  const fmt  = ds => `${parseInt(ds.slice(8))}/${parseInt(ds.slice(5,7))}`;
  const pCol = v  => v>=60?'var(--green)':v>=40?'var(--gold)':'var(--red)';
  const sc   = (ico,val,lbl,col='')=>
    `<div class="sc"><div class="sc-ico">${ico}</div><div class="sc-val"${col?` style="color:${col}"`:''}>${val}</div><div class="sc-lbl">${lbl}</div></div>`;

  el.innerHTML=`
<div class="card mb24">
  <div class="sec-t"><i class="fas fa-calendar-check" style="color:var(--green)"></i>تحليل الإنجاز اليومي</div>
  <div class="st-ach-grid mb16">
    ${sc('⚡', avg7!=null?avg7+'%':'—',   'متوسط 7 أيام',     avg7!=null?pCol(avg7):'')}
    ${sc('📅', avg30!=null?avg30+'%':'—', 'متوسط 30 يوم',     avg30!=null?pCol(avg30):'')}
    ${sc('🌟', best.v+'%',               'أفضل يوم · '+fmt(best.date),  'var(--green)')}
    ${sc('⚠️', worst.v+'%',              'أصعب يوم · '+fmt(worst.date), 'var(--red)')}
    ${sc('✅', goodD,                    'أيام جيدة ≥50%',   'var(--green)')}
    ${sc('🔴', badD,                     'أيام صعبة <25%',   'var(--red)')}
  </div>
  ${trendTxt?`
  <div class="st-trend-badge" style="border-color:${trendCol}20;background:${trendCol}10">
    ${trendIco} اتجاه الأداء: <strong style="color:${trendCol}">${trendTxt}</strong>
    ${avg7!=null&&avg7p!=null?`— آخر 7 أيام ${avg7}% مقارنةً بـ ${avg7p}% قبلها`:''}
  </div>`:''}
  <button class="btn btn-ghost btn-full mt16" onclick="go('calendar')"><i class="fas fa-calendar-days"></i>عرض في الكالندر</button>
</div>`;
}
