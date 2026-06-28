/* ══ DASHBOARD ENHANCEMENTS ══ */

function renderDashTodaySection(){
  const el = document.getElementById('dash-today-section');
  if(!el) return;
  const hr = new Date().getHours();
  const cd = cleanDays();

  // رسالة حسب الوقت واليوم
  let msg='', ico='';
  if(hr < 5){        ico='🌙'; msg='الليل الهادئ فرصة للتأمل — حافظ على نظامك.'; }
  else if(hr < 9){   ico='🌅'; msg='الصباح الباكر بداية المحارب. اليوم في يدك.'; }
  else if(hr < 12){  ico='☀️'; msg='الضغط في أوجه — ابقَ واعياً ومتحركاً.'; }
  else if(hr < 17){  ico='⚡'; msg='بعد الزوال وقت خطير — خطط لساعاتك القادمة.'; }
  else if(hr < 20){  ico='🌆'; msg='المساء يقترب. حضّر بيئتك قبل الليل.'; }
  else {             ico='🌙'; msg='ليلك يبدأ الآن — الهاتف خارج الغرفة قبل النوم.'; }

  // رسالة إضافية حسب عدد الأيام
  let streak='';
  if(cd===0)      streak='ابدأ رحلتك اليوم — كل يوم نظيف يصنع فرقاً.';
  else if(cd<7)   streak=`${cd} أيام نظيفة — الأيام الأولى هي الأصعب والأهم.`;
  else if(cd<30)  streak=`${cd} يوماً من الانضباط — أنت تبني نفسك من جديد.`;
  else if(cd<90)  streak=`${cd} يوماً نظيفاً — الثبات أقوى من الحماس.`;
  else            streak=`${cd} يوماً 🏆 — هذا المستوى يستحق الاحتفال.`;

  el.innerHTML=`
<div class="dash-today-card mb16">
  <div class="dash-today-row">
    <div class="dash-today-ico">${ico}</div>
    <div>
      <div class="dash-today-msg">${msg}</div>
      <div class="dash-today-streak">${streak}</div>
    </div>
  </div>
  <div class="dash-today-btns">
    <button class="btn btn-blue dash-today-btn" onclick="go('challenges')">
      <i class="fas fa-trophy"></i>التحديات
    </button>
    <button class="btn btn-ghost dash-today-btn" onclick="go('backup')">
      <i class="fas fa-database"></i>النسخ الاحتياطي
    </button>
    <button class="btn btn-ghost dash-today-btn" onclick="go('dayplan')">
      <i class="fas fa-sun"></i>خطة اليوم
    </button>
  </div>
</div>`;
}

function renderDashChallenges(){
  const el = document.getElementById('dash-challenges-wrap');
  if(!el) return;

  const all = JSON.parse(localStorage.getItem('recovery_challenges')||'[]');
  const active    = all.filter(c=>c.status==='active');
  const completed = all.filter(c=>c.status==='completed');

  // حساب متوسط التقدم
  let avgPct = 0;
  if(all.length){
    const sum = all.reduce((acc,c)=>{
      const done = c.log.filter(e=>e.status==='done').length;
      return acc + (c.totalDays>0 ? Math.min(100, Math.round(done/c.totalDays*100)) : 0);
    },0);
    avgPct = Math.round(sum/all.length);
  }

  // إذا لا توجد تحديات — Empty State
  if(!all.length){
    el.innerHTML=`
<div class="card dash-ch-empty">
  <div style="font-size:44px;margin-bottom:12px">🏆</div>
  <div style="font-size:16px;font-weight:800;color:var(--t1);margin-bottom:8px">لا يوجد تحدٍّ نشط</div>
  <p style="font-size:13px;color:var(--t2);line-height:1.9;margin-bottom:16px">أنشئ تحديك الأول — 30 يوماً، 90 يوماً، أو أي هدف تختاره.</p>
  <button class="btn btn-blue" onclick="go('challenges')"><i class="fas fa-plus"></i>إنشاء أول تحدي</button>
</div>`;
    return;
  }

  // بطاقات الإحصاء
  const statsHtml=`
<div class="dash-ch-stats">
  <div class="dash-ch-stat">
    <div class="dash-ch-stat-val" style="color:var(--blue)">${active.length}</div>
    <div class="dash-ch-stat-lbl">تحدٍّ نشط</div>
  </div>
  <div class="dash-ch-stat">
    <div class="dash-ch-stat-val" style="color:var(--green)">${completed.length}</div>
    <div class="dash-ch-stat-lbl">مكتمل</div>
  </div>
  <div class="dash-ch-stat">
    <div class="dash-ch-stat-val" style="color:var(--gold)">${avgPct}%</div>
    <div class="dash-ch-stat-lbl">متوسط التقدم</div>
  </div>
</div>`;

  // أول 3 تحديات نشطة
  const preview = active.slice(0,3).map(c=>{
    const done = c.log.filter(e=>e.status==='done').length;
    const pct  = c.totalDays>0 ? Math.min(100, Math.round(done/c.totalDays*100)) : 0;
    const typeIco = c.type==='build'?'💪':c.type==='quit'?'🚫':'🎯';
    const pbColor = pct>=80?'var(--green)':pct>=40?'var(--blue)':'var(--purple)';
    return `
<div class="dash-ch-item">
  <div class="dash-ch-item-top">
    <span class="dash-ch-item-ico">${typeIco}</span>
    <span class="dash-ch-item-name">${c.name}</span>
    <span class="dash-ch-item-pct">${pct}%</span>
  </div>
  <div class="pb-wrap" style="height:6px;border-radius:6px;margin:6px 0">
    <div class="pb-fill" style="width:${pct}%;background:${pbColor};border-radius:6px"></div>
  </div>
  <div class="dash-ch-item-sub">${done} من ${c.totalDays} يوم</div>
</div>`;
  }).join('');

  const moreBtn = active.length > 3
    ? `<div style="text-align:center;margin-top:4px"><button class="btn btn-ghost" style="font-size:13px;padding:8px 16px" onclick="go('challenges')">عرض كل التحديات (${active.length})</button></div>`
    : `<div style="text-align:center;margin-top:4px"><button class="btn btn-ghost" style="font-size:13px;padding:8px 16px" onclick="go('challenges')"><i class="fas fa-trophy"></i>إدارة التحديات</button></div>`;

  el.innerHTML=`
<div class="card">
  <div class="fb mb14">
    <div class="sec-t" style="margin-bottom:0"><i class="fas fa-trophy" style="color:var(--gold)"></i>تحدياتي</div>
    <button class="btn btn-ghost" style="font-size:12px;padding:6px 12px" onclick="go('challenges')">
      <i class="fas fa-arrow-left"></i>الكل
    </button>
  </div>
  ${statsHtml}
  ${preview ? `<div class="dash-ch-list">${preview}</div>${moreBtn}` : ''}
</div>`;
}

function renderDash(){
  const now=new Date();
  const hr=now.getHours();
  const greet=hr<5?'ليلة طيبة':hr<12?'صباح الخير':hr<17?'مساء الخير':'أهلاً بك';
  document.getElementById('greeting').textContent=`${greet} — أهلاً بك في يوم جديد من السيطرة`;
  document.getElementById('today-str').textContent=
    now.toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  const cd=cleanDays();
  document.getElementById('hero-days').textContent=cd;
  document.getElementById('sb-days').textContent=cd;

  let best=load(K.best)||0;
  if(cd>best){best=cd;save(K.best,best);}
  document.getElementById('best-lbl').textContent=best;

  const startD=load(K.start);
  document.getElementById('start-lbl').textContent=startD?
    new Date(startD).toLocaleDateString('ar-SA',{year:'numeric',month:'long',day:'numeric'}):'—';

  document.getElementById('week-rate').textContent=weekRate()+'%';

  const dy=Math.floor((Date.now()-new Date(now.getFullYear(),0,0))/86400000);
  document.getElementById('quote').textContent=QUOTES[dy%QUOTES.length];

  renderDashTodaySection();
  renderDashChallenges();
  renderDashTasks();
  renderWeekBars();
  renderDashWeeklyCard();
  renderDashboardProtectionCard();
  renderProtectionTasks();
  renderDashboardExpectedTrigger();
  renderTriggerTasks();
  renderRecoveryLockCard();
  renderDashboardSmartReportCard();
  renderDashboardMemoirCard();
  renderDashboardDailyAssessmentCard();
}

function renderDashTasks(){
  const td=load(K.tasks)||{};
  const day=td[today()]||{};
  const el=document.getElementById('dash-tasks');
  if(!el)return;
  el.innerHTML=TASKS.slice(0,5).map(t=>`
    <div class="task-item ${day[t.id]?'done':''}" onclick="toggleTask(${t.id})">
      <div class="task-cb"></div>
      <span class="task-ic">${t.ic}</span>
      <span class="task-lbl">${t.lbl}</span>
    </div>`).join('');
  updatePb();
}

function updatePb(){
  const td=load(K.tasks)||{};
  const day=td[today()]||{};
  const done=Object.values(day).filter(Boolean).length;
  const pct=Math.round(done/TASKS.length*100);
  ['dash-pb','tasks-pb'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.width=pct+'%';});
  ['dash-pct','tasks-pct'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=pct+'%';});
}

function weekRate(){
  const td=load(K.tasks)||{};
  let tot=0,done=0;
  for(let i=0;i<7;i++){
    const d=new Date();d.setDate(d.getDate()-i);
    const ds=d.toISOString().slice(0,10);
    const day=td[ds]||{};
    tot+=TASKS.length;done+=Object.values(day).filter(Boolean).length;
  }
  return tot?Math.round(done/tot*100):0;
}

function renderWeekBars(){
  const td=load(K.tasks)||{};
  const el=document.getElementById('week-bars');if(!el)return;
  const short=['أح','إث','ثل','أر','خم','جم','سب'];
  let html='';
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const ds=d.toISOString().slice(0,10);
    const day=td[ds]||{};
    const done=Object.values(day).filter(Boolean).length;
    const pct=Math.max(4,Math.round(done/TASKS.length*100));
    const full=pct>=70;
    html+=`<div class="week-col">
      <div class="week-bar-outer">
        <div class="week-bar-inner ${full?'full':''}" style="height:${pct}%"></div>
      </div>
      <div class="week-dl">${short[d.getDay()]}</div>
    </div>`;
  }
  el.innerHTML=html;
}

function logClean(){
  const cd=cleanDays();
  const b=load(K.best)||0;
  if(cd>b)save(K.best,cd);
  toast('✅ يوم نظيف مسجّل — استمر في الطريق!','var(--green)');
  renderDash();
}

function renderDashboardRiskCard(){
  const el=document.getElementById('dash-risk-wrap');
  if(!el)return;
  const plan=loadDailyPlan();
  if(!plan){
    el.innerHTML=`
      <div class="d-risk" onclick="go('dayplan')">
        <div class="d-risk-dot" style="background:var(--t3)"></div>
        <div class="d-risk-body">
          <div class="d-risk-lbl">تقييم خطورة اليوم</div>
          <div class="d-risk-val" style="color:var(--t2)">لم تحدد خطة اليوم بعد — اضغط لتبدأ</div>
        </div>
        <i class="fas fa-chevron-left" style="color:var(--t3);font-size:12px"></i>
      </div>`;
    return;
  }
  const MAP={
    low:   {dot:'low', val:'low', txt:'منخفض — اليوم في منطقة آمنة'},
    medium:{dot:'med', val:'med', txt:'متوسط — اليوم يحتاج انتباهاً'},
    high:  {dot:'high',val:'high',txt:'مرتفع — يحتاج حماية عالية'},
  };
  const m=MAP[plan.riskLevel]||MAP.low;
  el.innerHTML=`
    <div class="d-risk" onclick="go('dayplan')">
      <div class="d-risk-dot ${m.dot}"></div>
      <div class="d-risk-body">
        <div class="d-risk-lbl">مستوى خطر اليوم · ${plan.topRiskReason}</div>
        <div class="d-risk-val ${m.val}">${m.txt}</div>
      </div>
      <i class="fas fa-chevron-left" style="color:var(--t3);font-size:12px"></i>
    </div>`;
}

function renderDashWeeklyCard(){
  const el=document.getElementById('dash-weekly-wrap');
  if(!el)return;
  const all=load(K.weeklyReviews)||[];
  if(!all.length){el.innerHTML='';return;}
  const last=all[0];
  const dec=last.decision?(last.decision.length>55?last.decision.slice(0,55)+'…':last.decision):'اضغط لعرض التفاصيل';
  el.innerHTML=`
    <div class="dash-weekly" onclick="go('weeklyreview')">
      <div style="width:11px;height:11px;border-radius:50%;background:var(--purple);box-shadow:0 0 8px rgba(167,139,250,.5);flex-shrink:0"></div>
      <div class="d-risk-body">
        <div class="d-risk-lbl">آخر مراجعة أسبوعية · ${last.date}</div>
        <div class="d-risk-val" style="color:var(--purple)">${dec}</div>
      </div>
      <i class="fas fa-chevron-left" style="color:var(--t3);font-size:12px"></i>
    </div>`;
}
