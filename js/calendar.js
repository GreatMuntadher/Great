/* ── Calendar Page ── */

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed
let calSelectedDate = null;

/* ── data helpers ── */
function getCalDayData(dateStr){
  const tasks       = load(K.tasks) || {};
  const dayTasks    = tasks[dateStr] || {};
  const doneTasks   = Object.values(dayTasks).filter(Boolean).length;
  const totalTasks  = TASKS.length;
  const taskPct     = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;

  const assessments = load(K.dailyAssessments) || {};
  const assessment  = assessments[dateStr] || null;
  const score       = assessment?.scores?.dailyProgressScore ?? null;

  const journal     = load(K.journal) || [];
  const hasJournal  = journal.some(e => e.date === dateStr);

  const challenges  = JSON.parse(localStorage.getItem('recovery_challenges') || '[]');
  const chLogs      = challenges.filter(ch => ch.log && ch.log.some(l => l.date === dateStr));

  /* overall score: prefer assessment score, fall back to task %, null if nothing */
  const hasData     = score !== null || doneTasks > 0 || hasJournal || chLogs.length > 0;
  const overallPct  = score !== null ? score : (doneTasks > 0 ? taskPct : null);

  return { doneTasks, totalTasks, taskPct, score, overallPct, assessment, hasJournal, chLogs, hasData };
}

function getDayColorClass(data, isPast){
  if(!isPast || !data.hasData) return '';
  const pct = data.overallPct;
  if(pct === null) return 'cal-day-nodata';
  if(pct >= 75) return 'cal-day-great';
  if(pct >= 50) return 'cal-day-good';
  if(pct >= 25) return 'cal-day-weak';
  return 'cal-day-bad';
}

/* ── month summary ── */
function calcMonthSummary(year, month){
  const todayStr  = today();
  const daysInMo  = new Date(year, month + 1, 0).getDate();
  let withData=0, totalScore=0, scoreCount=0, best=null, bestScore=-1, streakCur=0, streakMax=0, weak=0;

  for(let d=1; d<=daysInMo; d++){
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(ds > todayStr) break;
    const data = getCalDayData(ds);
    if(data.hasData){ withData++; }
    if(data.overallPct !== null){
      totalScore += data.overallPct; scoreCount++;
      if(data.overallPct > bestScore){ bestScore = data.overallPct; best = ds; }
      if(data.overallPct < 25) weak++;
      streakCur++;
      if(streakCur > streakMax) streakMax = streakCur;
    } else {
      streakCur = 0;
    }
  }
  return {
    daysInMo,
    withData,
    avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
    bestDay: best,
    bestScore,
    weak,
    streak: streakMax
  };
}

/* ── month names ── */
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const AR_DAYS   = ['أح','إث','ثل','أر','خم','جم','سب'];

/* ── render summary cards ── */
function renderCalSummary(){
  const el = document.getElementById('cal-summary');
  if(!el) return;
  const s = calcMonthSummary(calYear, calMonth);
  el.innerHTML = `
<div class="cal-sum-grid mb20">
  <div class="cal-sum-card"><div class="cal-sum-val">${s.daysInMo}</div><div class="cal-sum-lbl">أيام الشهر</div></div>
  <div class="cal-sum-card"><div class="cal-sum-val" style="color:var(--green)">${s.withData}</div><div class="cal-sum-lbl">أيام مسجلة</div></div>
  <div class="cal-sum-card"><div class="cal-sum-val" style="color:var(--blue)">${s.avgScore}%</div><div class="cal-sum-lbl">متوسط الإنجاز</div></div>
  <div class="cal-sum-card"><div class="cal-sum-val" style="color:var(--gold)">${s.bestDay ? s.bestDay.slice(8) : '—'}</div><div class="cal-sum-lbl">أفضل يوم</div></div>
  <div class="cal-sum-card"><div class="cal-sum-val" style="color:var(--red)">${s.weak}</div><div class="cal-sum-lbl">أيام ضعيفة</div></div>
  <div class="cal-sum-card"><div class="cal-sum-val" style="color:var(--purple)">${s.streak}</div><div class="cal-sum-lbl">أطول سلسلة ✨</div></div>
</div>`;
}

/* ── render calendar grid ── */
function renderCalGrid(){
  const el = document.getElementById('cal-grid');
  if(!el) return;

  const todayStr  = today();
  const firstDay  = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMo  = new Date(calYear, calMonth + 1, 0).getDate();
  /* Arabic week starts Sunday; Sun=0 so offset matches */
  const offset    = firstDay;

  let html = `<div class="cal-grid-hd">${AR_DAYS.map(d=>`<div class="cal-dname">${d}</div>`).join('')}</div><div class="cal-grid-cells">`;

  /* blank cells before first day */
  for(let i=0; i<offset; i++) html += `<div class="cal-cell cal-cell-blank"></div>`;

  for(let d=1; d<=daysInMo; d++){
    const ds   = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isPast = ds <= todayStr;
    const isToday = ds === todayStr;
    const isSel   = ds === calSelectedDate;
    const data    = isPast ? getCalDayData(ds) : null;
    const cls     = isPast ? getDayColorClass(data, true) : 'cal-day-future';
    const todayCls= isToday ? ' cal-day-today' : '';
    const selCls  = isSel  ? ' cal-day-selected' : '';

    const pct     = data?.overallPct;
    const icons   = isPast ? `${data.hasJournal?'<span class="cal-ico">📔</span>':''}${data.chLogs.length?'<span class="cal-ico">🏆</span>':''}` : '';

    html += `<div class="cal-cell ${cls}${todayCls}${selCls}" onclick="calSelectDay('${ds}')">
  <div class="cal-cell-num">${d}</div>
  ${pct != null ? `<div class="cal-cell-pct">${pct}%</div>` : ''}
  ${icons ? `<div class="cal-cell-icons">${icons}</div>` : ''}
</div>`;
  }

  html += '</div>';
  el.innerHTML = html;
}

/* ── select day → show detail ── */
function calSelectDay(ds){
  calSelectedDate = calSelectedDate === ds ? null : ds;
  renderCalGrid();
  renderCalDayDetail();
}

function renderCalDayDetail(){
  const el = document.getElementById('cal-day-detail');
  if(!el) return;
  if(!calSelectedDate){ el.style.display='none'; el.innerHTML=''; return; }

  const ds   = calSelectedDate;
  const data = getCalDayData(ds);
  el.style.display = '';

  const dayNum  = parseInt(ds.slice(8));
  const mo      = parseInt(ds.slice(5,7)) - 1;
  const yr      = parseInt(ds.slice(0,4));
  const label   = `${dayNum} ${AR_MONTHS[mo]} ${yr}`;

  const scoreLine = data.score !== null
    ? `<div class="cal-det-row"><span class="cal-det-lbl">درجة التقييم اليومي</span><span class="cal-det-val" style="color:var(--blue)">${data.score}%</span></div>`
    : '';
  const taskLine = `<div class="cal-det-row"><span class="cal-det-lbl">مهام اليوم</span><span class="cal-det-val">${data.doneTasks} / ${data.totalTasks} <small style="color:var(--t3)">(${data.taskPct}%)</small></span></div>`;

  const chLines = data.chLogs.length
    ? `<div class="cal-det-row"><span class="cal-det-lbl">تحديات مسجلة</span><span class="cal-det-val" style="color:var(--green)">${data.chLogs.map(c=>`🏆 ${c.name}`).join('<br>')}</span></div>`
    : '';
  const jLine = data.hasJournal
    ? `<div class="cal-det-row"><span class="cal-det-lbl">السجل اليومي</span><span class="cal-det-val" style="color:var(--purple)">📔 موجود</span></div>`
    : '';
  const assess = data.assessment;
  const riskLine = assess?.scores?.riskLevel
    ? `<div class="cal-det-row"><span class="cal-det-lbl">مستوى الخطر</span><span class="cal-det-val">${{low:'🟢 منخفض',med:'🟡 متوسط',high:'🔴 مرتفع',rescue:'🚨 طوارئ'}[assess.scores.riskLevel]||'—'}</span></div>`
    : '';
  const noData = !data.hasData ? `<div class="cal-det-empty">لا توجد بيانات مسجلة لهذا اليوم</div>` : '';

  el.innerHTML = `
<div class="card cal-det-card">
  <div class="cal-det-hd">
    <span class="cal-det-date">${label}</span>
    <button class="cal-det-close" onclick="calSelectDay('${ds}')"><i class="fas fa-times"></i></button>
  </div>
  ${noData}
  ${data.overallPct !== null ? `
  <div class="cal-det-score-wrap">
    <div class="cal-det-score-lbl">الإنجاز الكلي</div>
    <div class="cal-det-score-val">${data.overallPct}%</div>
    <div class="cal-pb-track"><div class="cal-pb-fill" style="width:${data.overallPct}%"></div></div>
  </div>` : ''}
  <div class="cal-det-rows">
    ${scoreLine}${taskLine}${chLines}${jLine}${riskLine}
  </div>
</div>`;
}

/* ── navigate months ── */
function calPrevMonth(){
  calMonth--;
  if(calMonth < 0){ calMonth = 11; calYear--; }
  calSelectedDate = null;
  renderCalendarPage();
}
function calNextMonth(){
  calMonth++;
  if(calMonth > 11){ calMonth = 0; calYear++; }
  calSelectedDate = null;
  renderCalendarPage();
}
function calGoToday(){
  calYear  = new Date().getFullYear();
  calMonth = new Date().getMonth();
  calSelectedDate = null;
  renderCalendarPage();
}

/* ── main render ── */
function renderCalendarPage(){
  const hd = document.getElementById('cal-month-hd');
  if(hd) hd.textContent = `${AR_MONTHS[calMonth]} ${calYear}`;
  renderCalSummary();
  renderCalGrid();
  renderCalDayDetail();
}
