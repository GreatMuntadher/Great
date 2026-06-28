const CH_KEY = 'recovery_challenges';

function loadChallenges(){ return JSON.parse(localStorage.getItem(CH_KEY)||'[]'); }
function saveChallenges(arr){ localStorage.setItem(CH_KEY, JSON.stringify(arr)); }

/* ── state ── */
let chFormOpen = true;
let chFilter   = 'all';
let chSort     = 'newest';
const chExpandedGrids = new Set();

/* ── form toggle ── */
function toggleChallengeForm(){
  chFormOpen = !chFormOpen;
  document.getElementById('ch-form-body').style.display = chFormOpen ? '' : 'none';
  document.getElementById('ch-form-icon').className = chFormOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

function initChallengeForm(){
  const el = document.getElementById('ch-start');
  if(el && !el.value) el.value = today();
}

/* ── filter / sort ── */
function setChallengeFilter(f){
  chFilter = f;
  document.querySelectorAll('.ch-filter-btn').forEach(b=>{
    b.classList.toggle('ch-filter-active', b.dataset.filter === f);
  });
  renderChallenges();
}

function setChallengeSort(s){
  chSort = s;
  renderChallenges();
}

/* ── toggle full day grid ── */
function toggleDayGrid(id){
  if(chExpandedGrids.has(id)) chExpandedGrids.delete(id);
  else chExpandedGrids.add(id);
  renderChallenges();
}

/* ── add challenge ── */
function addChallenge(){
  const name  = (document.getElementById('ch-name').value||'').trim();
  const type  = document.getElementById('ch-type').value;
  const days  = parseInt(document.getElementById('ch-days').value)||0;
  const start = document.getElementById('ch-start').value;
  const notes = (document.getElementById('ch-notes').value||'').trim();

  if(!name){ toast('أدخل اسم التحدي','var(--red)'); return; }
  if(days<1){ toast('أدخل عدد أيام صحيح','var(--red)'); return; }
  if(!start){ toast('اختر تاريخ البداية','var(--red)'); return; }

  const list = loadChallenges();
  list.unshift({ id: Date.now(), name, type, totalDays: days, startDate: start, notes, log: [], status: 'active', createdAt: today() });
  saveChallenges(list);

  document.getElementById('ch-name').value='';
  document.getElementById('ch-days').value='';
  document.getElementById('ch-notes').value='';
  document.getElementById('ch-start').value=today();

  toast('🚀 تم إطلاق التحدي!','var(--green)');
  renderChallenges();
}

/* ── helpers ── */
function daysBetween(a, b){
  return Math.floor((new Date(b)-new Date(a))/(1000*60*60*24));
}

function challengeStats(ch){
  const todayStr = today();
  const elapsed  = Math.max(0, daysBetween(ch.startDate, todayStr));
  const done     = ch.log.filter(e=>e.status==='done').length;
  const skipped  = ch.log.filter(e=>e.status==='skip').length;
  const pct      = ch.totalDays>0 ? Math.min(100, Math.round(done/ch.totalDays*100)) : 0;
  const remaining= Math.max(0, ch.totalDays - done);
  const loggedToday = ch.log.find(e=>e.date===todayStr);
  let status = ch.status;
  if(status==='active' && done>=ch.totalDays) status='completed';
  return { elapsed, done, skipped, pct, remaining, loggedToday, status };
}

function typeLabel(t){
  const map = { build:'💪 بناء عادة', quit:'🚫 ترك عادة', general:'🎯 تحدي عام' };
  const col = { build:'var(--green)', quit:'var(--red)', general:'var(--blue)' };
  return `<span class="ch-type-badge" style="color:${col[t]||'var(--blue)'}">${map[t]||t}</span>`;
}

function statusBadge(s){
  if(s==='completed') return '<span class="ch-badge ch-badge-done">مكتمل ✅</span>';
  if(s==='stopped')   return '<span class="ch-badge ch-badge-stop">متوقف ⏸</span>';
  return '<span class="ch-badge ch-badge-active">🔥 نشط</span>';
}

function typeAccent(t){
  if(t==='build')  return 'rgba(67,217,141,.7)';
  if(t==='quit')   return 'rgba(239,68,68,.6)';
  return 'rgba(79,142,247,.7)';
}

/* ── day grid ── */
function buildDayGrid(ch){
  const COLLAPSE_AT = 63;
  const expanded  = chExpandedGrids.has(ch.id);
  const totalDays = ch.totalDays;
  const showAll   = totalDays <= COLLAPSE_AT || expanded;
  const limit     = showAll ? totalDays : COLLAPSE_AT;

  let cells = '';
  for(let i=0; i<limit; i++){
    const d = new Date(ch.startDate);
    d.setDate(d.getDate()+i);
    const ds = d.toISOString().slice(0,10);
    const isToday = ds === today();
    const entry = ch.log.find(e=>e.date===ds);
    let cls = 'ch-day-empty';
    let title = `اليوم ${i+1}`;
    if(entry){
      if(entry.status==='done'){ cls='ch-day-done'; title=`✅ اليوم ${i+1} — منجز`; }
      else { cls='ch-day-skip'; title=`⏭ اليوم ${i+1} — تخطي`; }
    } else if(ds < today()){
      cls='ch-day-missed'; title=`اليوم ${i+1} — فائت`;
    }
    const todayCls = isToday ? ' ch-day-today' : '';
    cells += `<div class="ch-day ${cls}${todayCls}" title="${title}"></div>`;
  }

  let toggleBtn = '';
  if(totalDays > COLLAPSE_AT){
    const rest = totalDays - COLLAPSE_AT;
    toggleBtn = expanded
      ? `<button class="ch-grid-toggle" onclick="toggleDayGrid(${ch.id})"><i class="fas fa-chevron-up"></i> إخفاء</button>`
      : `<button class="ch-grid-toggle" onclick="toggleDayGrid(${ch.id})">+ ${rest} يوم آخر <i class="fas fa-chevron-down"></i></button>`;
  }

  return `<div class="ch-day-grid">${cells}</div>${toggleBtn}`;
}

/* ── page-level stats ── */
function renderChallengePageStats(){
  const el = document.getElementById('ch-page-stats');
  if(!el) return;
  const list = loadChallenges();
  if(list.length===0){ el.innerHTML=''; return; }

  let activeC=0, completedC=0, stoppedC=0, totalDone=0, pctSum=0, longestDays=0;
  list.forEach(ch=>{
    const s = challengeStats(ch);
    if(s.status==='completed') completedC++;
    else if(ch.status==='stopped') stoppedC++;
    else activeC++;
    totalDone += s.done;
    pctSum    += s.pct;
    if(ch.status==='active' && ch.totalDays > longestDays) longestDays = ch.totalDays;
  });
  const avgPct = Math.round(pctSum / list.length);

  el.innerHTML = `
<div class="ch-ps-grid mb20">
  <div class="ch-ps-card"><div class="ch-ps-val" style="color:var(--blue)">${activeC}</div><div class="ch-ps-lbl">نشط</div></div>
  <div class="ch-ps-card"><div class="ch-ps-val" style="color:var(--green)">${completedC}</div><div class="ch-ps-lbl">مكتمل</div></div>
  <div class="ch-ps-card"><div class="ch-ps-val" style="color:var(--t3)">${stoppedC}</div><div class="ch-ps-lbl">متوقف</div></div>
  <div class="ch-ps-card"><div class="ch-ps-val" style="color:var(--gold)">${avgPct}%</div><div class="ch-ps-lbl">متوسط التقدم</div></div>
  <div class="ch-ps-card"><div class="ch-ps-val" style="color:var(--purple)">${longestDays||'—'}</div><div class="ch-ps-lbl">أطول تحدي (يوم)</div></div>
  <div class="ch-ps-card"><div class="ch-ps-val" style="color:var(--green)">${totalDone}</div><div class="ch-ps-lbl">أيام منجزة كلياً</div></div>
</div>`;
}

/* ── main render ── */
function renderChallenges(){
  initChallengeForm();
  renderChallengePageStats();

  const list    = loadChallenges();
  const empty   = document.getElementById('ch-empty');
  const cont    = document.getElementById('ch-list');
  const toolbar = document.getElementById('ch-toolbar');
  if(!cont) return;

  /* apply filter */
  const filtered = list.filter(ch=>{
    if(chFilter==='all') return true;
    const s = challengeStats(ch).status;
    if(chFilter==='active')    return s!=='completed' && ch.status!=='stopped';
    if(chFilter==='completed') return s==='completed';
    if(chFilter==='stopped')   return ch.status==='stopped';
    return true;
  });

  /* apply sort */
  filtered.sort((a,b)=>{
    if(chSort==='newest')      return b.id - a.id;
    if(chSort==='progress_hi') return challengeStats(b).pct - challengeStats(a).pct;
    if(chSort==='progress_lo') return challengeStats(a).pct - challengeStats(b).pct;
    if(chSort==='closest')     return challengeStats(a).remaining - challengeStats(b).remaining;
    return 0;
  });

  const hasAny = list.length > 0;
  if(toolbar) toolbar.style.display = hasAny ? '' : 'none';

  if(filtered.length===0){
    cont.innerHTML='';
    empty.style.display='';
    empty.innerHTML = hasAny
      ? `<div class="ch-empty-state ch-empty-filter">
          <div class="ch-empty-icon">🔍</div>
          <div class="ch-empty-title">لا توجد تحديات في هذه الفئة</div>
          <p class="ch-empty-sub">جرّب فلتراً مختلفاً</p>
          <button class="btn btn-ghost" onclick="setChallengeFilter('all')">عرض الكل</button>
         </div>`
      : `<div class="ch-empty-state">
          <div class="ch-empty-icon">🚀</div>
          <div class="ch-empty-title">لا يوجد تحدي بعد</div>
          <p class="ch-empty-sub">ابدأ تحديك الأول — 30 يوماً، 90 يوماً، أو أي هدف تختاره</p>
          <button class="btn btn-primary btn-lg" onclick="document.getElementById('ch-form-card').scrollIntoView({behavior:'smooth'});if(!chFormOpen)toggleChallengeForm()">
            <i class="fas fa-rocket"></i>أطلق تحديك الأول
          </button>
         </div>`;
    return;
  }
  empty.style.display='none';

  cont.innerHTML = filtered.map(ch=>{
    const {done, skipped, pct, remaining, loggedToday, status} = challengeStats(ch);
    const stopped   = ch.status==='stopped';
    const completed = status==='completed';
    const accent    = typeAccent(ch.type);

    const pbGrad = completed
      ? 'linear-gradient(90deg,var(--green),rgba(67,217,141,.6))'
      : stopped
        ? 'linear-gradient(90deg,rgba(255,255,255,.15),rgba(255,255,255,.08))'
        : 'linear-gradient(90deg,var(--blue),rgba(167,139,250,.8))';

    const cardCls = completed ? 'ch-card-done' : stopped ? 'ch-card-stopped' : '';

    const todayDone = loggedToday && loggedToday.status==='done';
    const todaySkip = loggedToday && loggedToday.status==='skip';

    return `
<div class="card ch-card ${cardCls}" style="--ch-accent:${accent}">

  <div class="ch-card-hd">
    <div class="ch-card-hd-info">
      <div class="ch-card-name">${ch.name}</div>
      <div class="ch-card-meta">
        ${typeLabel(ch.type)}
        <span class="ch-meta-sep">·</span>
        <span class="ch-meta-date">بداية: ${ch.startDate}</span>
      </div>
    </div>
    ${statusBadge(status)}
  </div>

  <div class="ch-stats-row">
    <div class="ch-stat"><div class="ch-stat-val">${ch.totalDays}</div><div class="ch-stat-lbl">إجمالي</div></div>
    <div class="ch-stat"><div class="ch-stat-val" style="color:var(--green)">${done}</div><div class="ch-stat-lbl">منجز</div></div>
    <div class="ch-stat"><div class="ch-stat-val" style="color:var(--gold)">${skipped}</div><div class="ch-stat-lbl">تخطي</div></div>
    <div class="ch-stat"><div class="ch-stat-val" style="color:${remaining===0?'var(--green)':'var(--t1)'}">${remaining}</div><div class="ch-stat-lbl">متبقي</div></div>
  </div>

  <div class="ch-progress-wrap">
    <div class="ch-progress-top">
      <span class="ch-progress-lbl">التقدم</span>
      <span class="ch-progress-pct">${pct}%</span>
    </div>
    <div class="ch-pb-track">
      <div class="ch-pb-fill" style="width:${pct}%;background:${pbGrad}"></div>
    </div>
    ${completed?'<div class="ch-progress-done">🎉 أكملت هذا التحدي! أنت رائع.</div>':''}
  </div>

  <div class="ch-grid-section">
    <div class="ch-grid-hd">
      <span class="ch-grid-title">سجل الأيام</span>
      <span class="ch-grid-count">${done} من ${ch.totalDays}</span>
    </div>
    ${buildDayGrid(ch)}
    <div class="ch-day-legend">
      <span class="ch-leg-item"><span class="ch-leg-dot ch-day-done"></span>منجز</span>
      <span class="ch-leg-item"><span class="ch-leg-dot ch-day-skip"></span>تخطي</span>
      <span class="ch-leg-item"><span class="ch-leg-dot ch-day-missed"></span>فائت</span>
      <span class="ch-leg-item"><span class="ch-leg-dot ch-day-empty"></span>قادم</span>
      <span class="ch-leg-item"><span class="ch-leg-dot ch-day-today-leg"></span>اليوم</span>
    </div>
  </div>

  ${ch.notes?`<div class="ch-notes"><i class="fas fa-sticky-note"></i>${ch.notes}</div>`:''}

  ${!completed&&!stopped?`
  <div class="ch-actions-primary">
    <button class="btn ch-btn-done ${todayDone?'ch-btn-logged':''}" onclick="logChallengeDay(${ch.id},'done')" ${loggedToday?'disabled':''}>
      <i class="fas fa-check-circle"></i>${todayDone?'تم تسجيل اليوم ✅':'أنجزت اليوم'}
    </button>
    <button class="btn ch-btn-skip ${todaySkip?'ch-btn-logged':''}" onclick="logChallengeDay(${ch.id},'skip')" ${loggedToday?'disabled':''}>
      <i class="fas fa-forward"></i>${todaySkip?'تخطيت اليوم ⏭':'تخطيت اليوم'}
    </button>
  </div>`:''}

  <div class="ch-actions-secondary">
    ${!stopped&&!completed?`<button class="ch-sec-btn ch-sec-pause" onclick="toggleChallengeStatus(${ch.id},'stopped')"><i class="fas fa-pause"></i><span>إيقاف</span></button>`:''}
    ${stopped?`<button class="ch-sec-btn ch-sec-resume" onclick="toggleChallengeStatus(${ch.id},'active')"><i class="fas fa-play"></i><span>استئناف</span></button>`:''}
    <button class="ch-sec-btn ch-sec-reset" onclick="resetChallenge(${ch.id})"><i class="fas fa-redo"></i><span>إعادة ضبط</span></button>
    <button class="ch-sec-btn ch-sec-del" onclick="deleteChallenge(${ch.id})"><i class="fas fa-trash"></i><span>حذف</span></button>
  </div>

</div>`;
  }).join('');
}

/* ── actions (unchanged logic) ── */
function logChallengeDay(id, status){
  const list = loadChallenges();
  const ch = list.find(c=>c.id===id);
  if(!ch) return;
  const todayStr = today();
  if(ch.log.find(e=>e.date===todayStr)){ toast('سبق تسجيل اليوم الحالي','var(--gold)'); return; }
  ch.log.push({ date: todayStr, status });
  const {done} = challengeStats(ch);
  if(done >= ch.totalDays) ch.status = 'completed';
  saveChallenges(list);
  if(status==='done') toast('✅ أحسنت! تم تسجيل اليوم','var(--green)');
  else toast('⏭ تم تسجيل تخطي اليوم','var(--gold)');
  renderChallenges();
}

function resetChallenge(id){
  if(!confirm('هل تريد إعادة ضبط هذا التحدي؟ سيتم مسح سجل الأيام.')) return;
  const list = loadChallenges();
  const ch = list.find(c=>c.id===id);
  if(!ch) return;
  ch.log = []; ch.status = 'active'; ch.startDate = today();
  saveChallenges(list);
  toast('🔄 تم إعادة ضبط التحدي','var(--purple)');
  renderChallenges();
}

function toggleChallengeStatus(id, newStatus){
  const list = loadChallenges();
  const ch = list.find(c=>c.id===id);
  if(!ch) return;
  ch.status = newStatus;
  saveChallenges(list);
  toast(newStatus==='stopped'?'⏸ تم إيقاف التحدي مؤقتاً':'▶ تم استئناف التحدي','var(--blue)');
  renderChallenges();
}

function deleteChallenge(id){
  if(!confirm('هل تريد حذف هذا التحدي نهائياً؟')) return;
  const list = loadChallenges().filter(c=>c.id!==id);
  saveChallenges(list);
  chExpandedGrids.delete(id);
  toast('🗑 تم حذف التحدي','var(--red)');
  renderChallenges();
}
