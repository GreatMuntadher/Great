let _currentReport=null;

function getCurrentWeekId(){
  const d=new Date();d.setHours(0,0,0,0);
  d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  const w=new Date(d.getFullYear(),0,4);
  const weekNum=1+Math.round(((d-w)/86400000-3+(w.getDay()+6)%7)/7);
  return`${d.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
}

function getWeekDateRange(){
  const now=new Date();const start=new Date(now);start.setDate(now.getDate()-6);
  const fmt=d=>d.toLocaleDateString('ar-SA',{month:'short',day:'numeric'});
  return`${fmt(start)} – ${fmt(now)}`;
}

function generateSmartWeeklyReport(){
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-7);
  const cutoffStr=cutoff.toISOString().slice(0,10);
  const journal=(load(K.journal)||[]).filter(e=>e.date>=cutoffStr);
  const urgeLogs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]').filter(l=>new Date(l.timestamp)>=cutoff);
  const plans=load(K.dailyPlan)||{};
  const weeklyPlanDays=Object.keys(plans).filter(d=>d>=cutoffStr);
  const tasks=load(K.tasks)||{};
  const relapses=(load(K.relapses)||[]).filter(r=>r.date>=cutoffStr);
  const rawLock=(typeof getRawRecoveryLock==='function')?getRawRecoveryLock():null;
  const journalCount=journal.length;
  const avgUrge=journal.length?Math.round(journal.reduce((s,e)=>s+(parseFloat(e.urge)||0),0)/journal.length*10)/10:0;
  const maxUrge=journal.length?Math.max(...journal.map(e=>parseFloat(e.urge)||0)):0;
  const triggerFreq={};
  urgeLogs.forEach(l=>{if(l.trigger)triggerFreq[l.trigger]=(triggerFreq[l.trigger]||0)+1;});
  journal.forEach(e=>{if(e.trigger)triggerFreq[e.trigger]=(triggerFreq[e.trigger]||0)+1;});
  const topTrigger=Object.entries(triggerFreq).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  const timeFreq={};
  urgeLogs.forEach(l=>{const h=new Date(l.timestamp).getHours();const slot=h<6?'بعد منتصف الليل':h<12?'الصباح':h<17?'الظهر':h<21?'المساء':'الليل';timeFreq[slot]=(timeFreq[slot]||0)+1;});
  weeklyPlanDays.forEach(d=>{const p=plans[d];if(p&&p.dangerTime)timeFreq[p.dangerTime]=(timeFreq[p.dangerTime]||0)+0.5;});
  const topDangerTime=Object.entries(timeFreq).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  const locFreq={};urgeLogs.forEach(l=>{if(l.location)locFreq[l.location]=(locFreq[l.location]||0)+1;});
  const topLocation=Object.entries(locFreq).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  const fixFreq={};urgeLogs.forEach(l=>{if(l.fixUsed)fixFreq[l.fixUsed]=(fixFreq[l.fixUsed]||0)+1;});
  const bestFix=Object.entries(fixFreq).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  const resistanceCount=urgeLogs.length;
  const relapseCount=relapses.length;
  let totalTasks=0,doneTasks=0;
  weeklyPlanDays.forEach(d=>{const day=tasks[d]||{};totalTasks+=TASKS.length;doneTasks+=Object.values(day).filter(Boolean).length;});
  const taskCommitment=totalTasks?Math.round(doneTasks/totalTasks*100):0;
  const planDaysCount=weeklyPlanDays.length;
  const riskFreq={};weeklyPlanDays.forEach(d=>{const p=plans[d];if(p&&p.riskLevel)riskFreq[p.riskLevel]=(riskFreq[p.riskLevel]||0)+1;});
  const topRisk=Object.entries(riskFreq).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  const lockActivatedThisWeek=!!(rawLock&&rawLock.startedAt>=cutoffStr);
  const weeklyReviews=load(K.weeklyReviews)||[];
  const lastDecision=weeklyReviews[0]?.decision||null;
  const hasEnoughData=journalCount>0||resistanceCount>0||planDaysCount>0;
  const weeklyAssess=(typeof calculateWeeklyAssessmentSummary==='function')?calculateWeeklyAssessmentSummary():null;
  return{weekId:getCurrentWeekId(),weekRange:getWeekDateRange(),journalCount,avgUrge,maxUrge,topTrigger,topDangerTime,topLocation,bestFix,resistanceCount,relapseCount,taskCommitment,planDaysCount,topRisk,lockActivatedThisWeek,lastDecision,hasEnoughData,assessAvgProgress:weeklyAssess?.avgProgress??null,assessProtection:weeklyAssess?.avgProtection??null,assessCommit:weeklyAssess?.commitRate??null,assessVictories:weeklyAssess?.totalVictories??null,assessTopRisk:weeklyAssess?.topRisk??null};
}

function getWeeklyRecommendation(report){
  if(!report.hasEnoughData)return'سجّل خطتك وسجلك اليومي عدة أيام حتى يظهر تقرير أدق.';
  if(report.topTrigger==='سهر')return'توصية الأسبوع: ركّز على النوم. الهاتف خارج الغرفة بعد 10:30.';
  if(report.topTrigger==='وحدة')return'توصية الأسبوع: لا تبقَ وحيداً وقت الخطر. خطط لتواصل يومي بسيط.';
  if(report.topTrigger==='ملل')return'توصية الأسبوع: حضّر قائمة مهام قصيرة قبل أوقات الفراغ.';
  if(report.topTrigger==='توتر')return'توصية الأسبوع: استخدم التنفس والمشي قبل أن يتحول الضغط إلى موجة.';
  if(report.topTrigger==='حزن')return'توصية الأسبوع: عالج الحزن بالكتابة أو التحدث — لا بالهروب.';
  if(report.topTrigger==='تعب')return'توصية الأسبوع: النوم المبكر هو أقوى درع لديك هذا الأسبوع.';
  if(report.topTrigger==='سوشيال ميديا')return'توصية الأسبوع: حدد وقتاً يومياً ثابتاً للسوشيال وأغلقه خارجه.';
  if(report.taskCommitment<50)return'توصية الأسبوع: قلّل عدد المهام. ركز فقط على 3 قواعد أساسية.';
  if(report.topRisk==='high')return'توصية الأسبوع: فعّل وضع الحماية العالية مبكراً ولا تنتظر الموجة.';
  if(report.relapseCount>0)return'توصية الأسبوع: ابحث عن النمط قبل التراجع وحضّر خطة للحظة القادمة.';
  if(report.resistanceCount>3)return'توصية الأسبوع: أنت تقاوم بشكل ممتاز. واصل وثّق كل انتصار.';
  return'توصية الأسبوع: واصل الالتزام بخطة يومك — الاتساق هو المفتاح.';
}

function renderSmartWeeklyReport(report,savedDecision){
  const rec=getWeeklyRecommendation(report);
  const taskColor=report.taskCommitment>=70?'green':report.taskCommitment>=40?'gold':'red';
  const riskLabel=report.topRisk==='high'?'مرتفع':report.topRisk==='medium'?'متوسط':'منخفض';
  const riskColor=report.topRisk==='high'?'red':report.topRisk==='medium'?'gold':'green';
  if(!report.hasEnoughData)return`<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:14px;padding:24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">📊</div><div style="font-size:14px;font-weight:700;color:var(--t2);line-height:2">${rec}</div></div>`;
  return`
    <div>
      <div class="swr-header">
        <div><div style="font-size:17px;font-weight:900;margin-bottom:4px">تقرير الأسبوع</div><div style="font-size:13px;color:var(--t2)">${report.weekRange}</div></div>
        <div class="swr-week-badge"><i class="fas fa-calendar-week"></i>${report.weekId}</div>
      </div>
      <div class="swr-grid">
        <div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-book-open"></i>تقارير مسجلة</div><div class="swr-m-val ${report.journalCount>3?'green':''}">${report.journalCount} يوم</div></div>
        <div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-chart-line"></i>متوسط الرغبة</div><div class="swr-m-val ${report.avgUrge>=7?'red':report.avgUrge>=4?'gold':'green'}">${report.avgUrge}/10</div></div>
        <div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-fist-raised"></i>مرات المقاومة</div><div class="swr-m-val ${report.resistanceCount>0?'green':''}">${report.resistanceCount}</div></div>
        <div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-check-circle"></i>الالتزام بالمهام</div><div class="swr-m-val ${taskColor}">${report.taskCommitment}%</div></div>
        ${report.topTrigger?`<div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-fire-flame-curved"></i>أكثر محفز</div><div class="swr-m-val gold" style="font-size:16px">${report.topTrigger}</div></div>`:''}
        ${report.topDangerTime?`<div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-clock"></i>أخطر وقت</div><div class="swr-m-val" style="font-size:16px">${report.topDangerTime}</div></div>`:''}
        ${report.bestFix?`<div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-leaf"></i>أفضل حل نجح</div><div class="swr-m-val green" style="font-size:14px">${report.bestFix}</div></div>`:''}
        ${report.topRisk?`<div class="swr-metric"><div class="swr-m-lbl"><i class="fas fa-shield-alt"></i>مستوى الخطر الغالب</div><div class="swr-m-val ${riskColor}">${riskLabel}</div></div>`:''}
      </div>
      ${report.relapseCount>0?`<div style="background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2);border-radius:12px;padding:12px 16px;font-size:13px;font-weight:700;color:var(--red);margin-bottom:14px"><i class="fas fa-redo"></i> ${report.relapseCount} تراجع هذا الأسبوع — كل تراجع فرصة تعلّم.</div>`:''}
      <div class="swr-recommendation">
        <div class="swr-rec-lbl"><i class="fas fa-lightbulb"></i>توصية الأسبوع القادم</div>
        <div class="swr-rec-text">${rec}</div>
      </div>
      <div class="swr-decision-box">
        <div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:10px"><i class="fas fa-bullseye" style="color:var(--blue)"></i> قراري للأسبوع القادم</div>
        <textarea class="ft" id="swr-next-decision" rows="2" placeholder="التزام واحد محدد للأسبوع القادم...">${savedDecision||''}</textarea>
        <button class="btn btn-green btn-full mt12" onclick="saveReportDecision()"><i class="fas fa-save"></i>حفظ القرار</button>
      </div>
    </div>`;
}

function generateAndShowReport(){
  _currentReport=generateSmartWeeklyReport();
  const el=document.getElementById('swr-display');if(!el)return;
  const allReports=JSON.parse(localStorage.getItem('rj_smart_reports')||'[]');
  const saved=allReports.find(r=>r.week===_currentReport.weekId);
  el.innerHTML=renderSmartWeeklyReport(_currentReport,saved?.nextWeekDecision||'');
  saveSmartWeeklyReport(_currentReport,saved?.nextWeekDecision||'');
  renderDashboardSmartReportCard();renderStatsSmartSummary();
}

function saveReportDecision(){
  if(!_currentReport)return;
  const decision=(document.getElementById('swr-next-decision')?.value||'').trim();
  saveSmartWeeklyReport(_currentReport,decision);
  toast('✅ تم حفظ القرار','var(--green)');
}

function saveSmartWeeklyReport(report,nextWeekDecision){
  const all=JSON.parse(localStorage.getItem('rj_smart_reports')||'[]');
  const entry={week:report.weekId,createdAt:new Date().toISOString(),weekRange:report.weekRange,
    summary:{journalCount:report.journalCount,avgUrge:report.avgUrge,resistanceCount:report.resistanceCount,relapseCount:report.relapseCount,taskCommitment:report.taskCommitment,topTrigger:report.topTrigger,topDangerTime:report.topDangerTime,bestFix:report.bestFix},
    recommendation:getWeeklyRecommendation(report),nextWeekDecision:nextWeekDecision||''};
  const idx=all.findIndex(r=>r.week===report.weekId);
  if(idx>=0)all.splice(idx,1);
  all.unshift(entry);
  localStorage.setItem('rj_smart_reports',JSON.stringify(all));
}

function renderDashboardSmartReportCard(){
  const el=document.getElementById('dash-smart-report');if(!el)return;
  const all=JSON.parse(localStorage.getItem('rj_smart_reports')||'[]');
  if(!all.length){el.innerHTML='';return;}
  const last=all[0];
  const rec=last.recommendation&&last.recommendation.length>65?last.recommendation.slice(0,65)+'…':(last.recommendation||'افتح التقرير لرؤية التوصية');
  el.innerHTML=`
    <div class="dash-smart" onclick="go('privacy')">
      <i class="fas fa-chart-line" style="font-size:22px;color:var(--blue);flex-shrink:0"></i>
      <div style="flex:1">
        <div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:2px">تقرير الأسبوع · ${last.week}</div>
        <div style="font-size:13px;font-weight:700;color:var(--blue);line-height:1.6">${rec}</div>
      </div>
      <button class="btn btn-ghost" style="font-size:12px;padding:7px 12px;flex-shrink:0" onclick="event.stopPropagation();go('privacy')"><i class="fas fa-arrow-left"></i>عرض</button>
    </div>`;
}

function renderStatsSmartSummary(){
  const el=document.getElementById('st-smart-summary');if(!el)return;
  const all=JSON.parse(localStorage.getItem('rj_smart_reports')||'[]');
  if(!all.length){el.innerHTML='';return;}
  const r=all[0];const s=r.summary||{};
  const taskColor=(s.taskCommitment||0)>=70?'var(--green)':(s.taskCommitment||0)>=40?'var(--gold)':'var(--red)';
  el.innerHTML=`
    <div class="card">
      <div class="sec-t"><i class="fas fa-chart-line"></i>ملخص الأسبوع الذكي · ${r.week}</div>
      <div class="g3" style="margin-bottom:16px">
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">أكثر محفز</div>
          <div style="font-size:16px;font-weight:800;color:var(--gold)">${s.topTrigger||'—'}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">الالتزام</div>
          <div style="font-size:16px;font-weight:800;color:${taskColor}">${s.taskCommitment||0}%</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">مرات المقاومة</div>
          <div style="font-size:16px;font-weight:800;color:var(--green)">${s.resistanceCount||0}</div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(79,142,247,.08),rgba(167,139,250,.06));border:1px solid rgba(79,142,247,.2);border-radius:12px;padding:14px">
        <div style="font-size:11px;color:var(--blue);font-weight:800;margin-bottom:6px">💡 توصية الأسبوع</div>
        <div style="font-size:13px;font-weight:700;color:var(--t1);line-height:1.8">${r.recommendation||'—'}</div>
      </div>
      <button class="btn btn-ghost btn-full mt16" onclick="go('privacy')"><i class="fas fa-chart-line"></i>عرض التقرير الكامل</button>
    </div>`;
}

function renderPastReports(){
  const el=document.getElementById('swr-past-reports');if(!el)return;
  const all=JSON.parse(localStorage.getItem('rj_smart_reports')||'[]');
  if(!all.length){el.innerHTML='<p class="tm" style="font-size:13px;text-align:center;padding:16px">لم تولّد أي تقارير بعد</p>';return;}
  el.innerHTML=all.slice(0,5).map(r=>{
    const s=r.summary||{};
    return`
      <div class="swr-past-card">
        <div class="swr-past-week"><i class="fas fa-calendar-week"></i>${r.week}${r.weekRange?' · '+r.weekRange:''}</div>
        ${s.topTrigger?`<div class="swr-past-row"><span class="swr-past-lbl">⚡ المحفز:</span><span class="swr-past-val">${s.topTrigger}</span></div>`:''}
        ${s.taskCommitment!==undefined?`<div class="swr-past-row"><span class="swr-past-lbl">✅ الالتزام:</span><span class="swr-past-val">${s.taskCommitment}%</span></div>`:''}
        ${s.resistanceCount!==undefined?`<div class="swr-past-row"><span class="swr-past-lbl">💪 المقاومة:</span><span class="swr-past-val">${s.resistanceCount} مرة</span></div>`:''}
        ${r.recommendation?`<div style="background:rgba(79,142,247,.08);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:700;color:var(--blue);margin-top:8px;line-height:1.6">💡 ${r.recommendation}</div>`:''}
        ${r.nextWeekDecision?`<div style="margin-top:8px;font-size:12px;font-weight:700;color:var(--t2)">🎯 ${r.nextWeekDecision}</div>`:''}
      </div>`;
  }).join('');
}
