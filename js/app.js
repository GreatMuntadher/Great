function init(){
  if(!load(K.start))save(K.start,today());
  if(!load(K.best))save(K.best,0);
  if(!load(K.urge))save(K.urge,0);
  if(!load(K.journal))save(K.journal,[]);
  if(!load(K.relapses))save(K.relapses,[]);
  if(!load(K.rules))save(K.rules,DEF_RULES);
  if(!load(K.tasks))save(K.tasks,{});
  if(!load(K.dailyPlan))save(K.dailyPlan,{});
  if(!load(K.reasons))save(K.reasons,DEF_REASONS);
  if(!load(K.weeklyReviews))save(K.weeklyReviews,[]);
  if(!load(K.privacySettings))save(K.privacySettings,{privacyMode:false,quickHideEnabled:true,pinEnabled:false,pin:null});
  if(!load(K.smartReports))save(K.smartReports,[]);
  if(!load(K.memoirs))save(K.memoirs,[]);
  if(!load(K.memoirQuestions))save(K.memoirQuestions,DEF_MEMOIR_QUESTIONS);
  if(!load(K.dailyQuestions))save(K.dailyQuestions,DAILY_ASSESSMENT_QUESTIONS);
  if(!load(K.dailyAssessments))save(K.dailyAssessments,{});
  if(!localStorage.getItem('recovery_challenges'))localStorage.setItem('recovery_challenges','[]');
  const ps=load(K.privacySettings);
  if(ps&&ps.pinEnabled&&ps.pin)showLockScreen();
  renderAll();
}

function renderAll(){
  renderDash();renderTasks();renderTL();renderJournalEntries();renderStats();renderRules();
  renderDailyPlan();renderDashboardRiskCard();
  renderTriggers();renderReasons();renderWeeklyReview();renderDashWeeklyCard();
  renderDashboardProtectionCard();renderProtectionPlanCard();renderProtectionTasks();
  renderDashboardExpectedTrigger();renderTriggerTasks();
  renderRecoveryLockCard();renderRecoveryLockPlan();renderRecoveryLockStats();
  renderDashboardSmartReportCard();renderStatsSmartSummary();
  applyPrivacyMode();renderPastReports();
  renderDashboardMemoirCard();renderMemoirStats();
  renderDashboardDailyAssessmentCard();renderAssessmentStats();
}

function renderTasks(){
  const td=load(K.tasks)||{};const day=td[today()]||{};
  const el=document.getElementById('all-tasks');if(!el)return;
  el.innerHTML=TASKS.map(t=>`
    <div class="task-item ${day[t.id]?'done':''}" onclick="toggleTask(${t.id})">
      <div class="task-cb"></div>
      <span class="task-ic">${t.ic}</span>
      <span class="task-lbl">${t.lbl}</span>
    </div>`).join('');
  updatePb();
}

function toggleTask(id){
  const td=load(K.tasks)||{};
  if(!td[today()])td[today()]={};
  td[today()][id]=!td[today()][id];
  save(K.tasks,td);
  renderTasks();renderDashTasks();renderWeekBars();
}

function openRelapse(){document.getElementById('relapse-overlay').classList.add('open');}
function closeRelapse(){document.getElementById('relapse-overlay').classList.remove('open');}

function saveRelapse(){
  const prev=cleanDays();
  const r={date:today(),when:document.getElementById('r-when').value,
    reason:document.getElementById('r-reason').value,
    feel:document.getElementById('r-feel').value,
    change:document.getElementById('r-change').value,prev};
  const rs=load(K.relapses)||[];rs.push(r);save(K.relapses,rs);
  const b=load(K.best)||0;if(prev>b)save(K.best,prev);
  save(K.start,today());
  activateRecoveryLock(r);
  closeRelapse();renderAll();
  toast('🌱 تم التسجيل. وضع الحماية فعّال الآن لـ 24 ساعة.','var(--purple)');
}

function resetAll(){
  if(confirm('هل أنت متأكد؟\nسيتم حذف جميع بياناتك نهائياً ولا يمكن التراجع.')){
    Object.values(K).forEach(k=>localStorage.removeItem(k));
    ['rj_daily_plan','rj_urge_logs','rj_protection_tasks','rj_trigger_tasks',
     'rj_recovery_lock','rj_recovery_lock_tasks','rj_smart_reports',
     'rj_memoirs','rj_memoir_questions',
     'rj_daily_questions','rj_daily_assessments'].forEach(k=>localStorage.removeItem(k));
    toast('تم مسح البيانات. البداية من جديد.','var(--purple)');
    init();
  }
}

init();

/* ── PWA: Service Worker registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/recovery-journey/sw.js', { scope: '/recovery-journey/' })
      .catch(() => {/* silent — SW is optional */});
  });
}

/* ── PWA: Install prompt ── */
let _pwaPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _pwaPrompt = e;
  const card = document.getElementById('pwa-install-card');
  if (card) card.style.display = '';
});
window.addEventListener('appinstalled', () => {
  _pwaPrompt = null;
  const card = document.getElementById('pwa-install-card');
  if (card) card.style.display = 'none';
  toast('✅ تم تثبيت التطبيق بنجاح!', 'var(--green)');
});
function triggerPwaInstall() {
  if (_pwaPrompt) {
    _pwaPrompt.prompt();
    _pwaPrompt.userChoice.then(() => { _pwaPrompt = null; });
  }
}

/* ── Space Parallax: mouse → CSS vars --mx / --my ── */
(function () {
  const root = document.documentElement;
  let pending = false;
  document.addEventListener('mousemove', function (e) {
    if (!pending) {
      pending = true;
      requestAnimationFrame(function () {
        root.style.setProperty('--mx', ((e.clientX / window.innerWidth  - 0.5) * 2).toFixed(3));
        root.style.setProperty('--my', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
        pending = false;
      });
    }
  });
}());
