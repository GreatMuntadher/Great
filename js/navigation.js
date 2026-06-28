function go(id){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('[data-sec]').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll(`[data-sec="${id}"]`).forEach(b=>b.classList.add('active'));
  if(id==='dashboard'){ renderDashTodaySection(); renderDashChallenges(); }
  if(id==='stats') renderStats();
  if(id==='journal') renderJournalEntries();
  if(id==='timeline') renderTL();
  if(id==='dayplan') renderDailyPlan();
  if(id==='triggers') renderTriggers();
  if(id==='reasons') renderReasons();
  if(id==='weeklyreview') renderWeeklyReview();
  if(id==='privacy') renderPrivacyPage();
  if(id==='memoirs'){ renderMemoirQuestions(); renderMemoirArchive(); loadTodayMemoirToForm(); }
  if(id==='tasks'){ renderDailyAssessmentQuestions(); loadTodayAssessmentResult(); }
  if(id==='challenges') renderChallenges();
  if(id==='calendar') renderCalendarPage();
  if(id==='evaluations') renderEvaluationsPage();
  if(id==='backup') renderBackupPage();
}

function openConfig(){
  go('privacy');
}

document.querySelectorAll('[data-sec]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.sec)));
