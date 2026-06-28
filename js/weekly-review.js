function saveWeeklyReview(){
  const dangerTime=getDpChip('wr-time');
  const rev={
    date:today(),week:getISOWeek(),
    achievement:document.getElementById('wr-achievement').value.trim(),
    trigger:document.getElementById('wr-trigger').value.trim(),
    dangerTime:dangerTime||'—',
    newRule:document.getElementById('wr-newrule').value.trim(),
    decision:document.getElementById('wr-decision').value.trim(),
    savedAt:new Date().toISOString(),
  };
  const all=load(K.weeklyReviews)||[];
  const idx=all.findIndex(r=>r.week===rev.week);
  if(idx>=0)all.splice(idx,1);
  all.unshift(rev);save(K.weeklyReviews,all);
  if(rev.newRule){const rules=load(K.rules)||[];rules.push(rev.newRule);save(K.rules,rules);renderRules();}
  document.getElementById('wr-achievement').value='';
  document.getElementById('wr-trigger').value='';
  document.getElementById('wr-newrule').value='';
  document.getElementById('wr-decision').value='';
  document.querySelectorAll('#wr-time .chip').forEach(c=>c.classList.remove('sel'));
  toast('✅ تم حفظ مراجعة الأسبوع','var(--green)');
  renderWeeklyReview();renderDashWeeklyCard();
}

function getISOWeek(){
  const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  const w=new Date(d.getFullYear(),0,4);
  return d.getFullYear()+'-W'+String(1+Math.round(((d-w)/86400000-3+(w.getDay()+6)%7)/7)).padStart(2,'0');
}

function renderWeeklyReview(){
  const all=load(K.weeklyReviews)||[];
  const el=document.getElementById('wr-entries');if(!el)return;
  if(!all.length){el.innerHTML='<p class="tm" style="font-size:14px;text-align:center;padding:24px">لم تسجّل أي مراجعة بعد</p>';return;}
  el.innerHTML=all.slice(0,4).map(r=>`
    <div class="wrv-card">
      <div class="wrv-date"><i class="fas fa-calendar-week"></i> ${r.date} · ${r.week||''}</div>
      ${r.achievement?`<div class="wrv-row"><span class="wrv-lbl">🏅 الإنجاز:</span><span class="wrv-val">${r.achievement}</span></div>`:''}
      ${r.trigger?`<div class="wrv-row"><span class="wrv-lbl">⚡ المحفز:</span><span class="wrv-val">${r.trigger}</span></div>`:''}
      ${r.dangerTime&&r.dangerTime!=='—'?`<div class="wrv-row"><span class="wrv-lbl">🕐 الوقت الأخطر:</span><span class="wrv-val">${r.dangerTime}</span></div>`:''}
      ${r.decision?`<div class="wrv-decision">🎯 ${r.decision}</div>`:''}
    </div>`).join('');
}

function renderDashWeeklyCard(){
  const el=document.getElementById('dash-weekly-wrap');if(!el)return;
  const all=load(K.weeklyReviews)||[];if(!all.length){el.innerHTML='';return;}
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
