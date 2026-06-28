function getTopFromLogs(field){
  const logs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]');
  if(!logs.length)return null;
  const freq={};
  logs.forEach(l=>{if(l[field])freq[l[field]]=(freq[l[field]]||0)+1;});
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
  return top?top[0]:null;
}

function getTopTime(){
  const logs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]');
  if(!logs.length)return null;
  const slots={};
  logs.forEach(l=>{
    const h=new Date(l.timestamp).getHours();
    const s=h<6?'بعد منتصف الليل':h<12?'الصباح':h<17?'الظهر':h<21?'المساء':'الليل';
    slots[s]=(slots[s]||0)+1;
  });
  const top=Object.entries(slots).sort((a,b)=>b[1]-a[1])[0];
  return top?top[0]:null;
}

function getWeeklyUrgeCount(){
  const logs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]');
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-7);
  return logs.filter(l=>new Date(l.timestamp)>=cutoff).length;
}

function renderTriggers(){
  const logs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]');
  const total=load(K.urge)||0;
  const emptyEl=document.getElementById('triggers-empty');
  const statsEl=document.getElementById('triggers-stats');
  if(!emptyEl||!statsEl)return;
  if(logs.length<2){emptyEl.style.display='block';statsEl.style.display='none';}
  else{
    emptyEl.style.display='none';statsEl.style.display='block';
    document.getElementById('tri-trigger').textContent=getTopFromLogs('trigger')||'—';
    document.getElementById('tri-location').textContent=getTopFromLogs('location')||'—';
    document.getElementById('tri-time').textContent=getTopTime()||'—';
    document.getElementById('tri-fix').textContent=getTopFromLogs('fixUsed')||'—';
    document.getElementById('tri-weekly').textContent=getWeeklyUrgeCount();
    document.getElementById('tri-total').textContent=total;
  }
  const altsEl=document.getElementById('alts-list');
  if(altsEl){
    altsEl.innerHTML=ALTS.map((a,i)=>`
      <div class="alt-item">
        <div class="alt-num">${i+1}</div>
        <span>${a}</span>
      </div>`).join('');
  }
  renderTopTriggerPlan();
}

function getTriggerPlan(trigger){
  return TRIGGER_PLANS[trigger]||{...TRIGGER_PLAN_DEFAULT,trigger:trigger||'عام'};
}

function inferExpectedTrigger(plan){
  if(!plan)return null;
  if(plan.lateNight||plan.dangerTime==='بعد منتصف الليل'||plan.dangerTime==='الليل')return'سهر';
  if(plan.mood==='وحيد')return'وحدة';
  if(plan.mood==='ملل')return'ملل';
  if(plan.mood==='متوتر')return'توتر';
  if(plan.mood==='حزين')return'حزن';
  if(plan.mood==='متعب')return'تعب';
  if(plan.socialOveruse)return'سوشيال ميديا';
  return null;
}

function buildFullTriggerPlanHtml(tp,headerLabel){
  const label=headerLabel||'خطة المحفز';
  const immHtml=tp.immediateActions.map(a=>`<div class="tplan-item"><i class="fas fa-bolt" style="color:var(--gold)"></i><span>${a}</span></div>`).join('');
  const prevHtml=tp.preventionRules.map(r=>`<div class="tplan-item"><i class="fas fa-shield-alt" style="color:var(--blue)"></i><span>${r}</span></div>`).join('');
  const replHtml=tp.replacementActions.map(r=>`<div class="tplan-item"><i class="fas fa-leaf" style="color:var(--green)"></i><span>${r}</span></div>`).join('');
  return`
    <div class="tplan-full">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span style="font-size:32px">${tp.icon}</span>
        <div>
          <div style="font-size:11px;color:var(--gold);font-weight:800;letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px">${label}</div>
          <div style="font-size:19px;font-weight:900">${tp.title}</div>
        </div>
      </div>
      <div class="tplan-danger-pattern">⚠️ ${tp.dangerPattern}</div>
      <div class="tplan-evening">🌙 ${tp.eveningRule}</div>
      <div class="tplan-full-section"><div class="tplan-full-label"><i class="fas fa-bolt"></i>إجراءات فورية</div>${immHtml}</div>
      <div class="tplan-full-section"><div class="tplan-full-label"><i class="fas fa-shield-alt"></i>قواعد وقاية</div>${prevHtml}</div>
      <div class="tplan-full-section"><div class="tplan-full-label"><i class="fas fa-leaf"></i>بدائل صحية</div>${replHtml}</div>
      <div class="tplan-emergency"><i class="fas fa-exclamation-triangle"></i> ${tp.emergencyMessage}</div>
    </div>`;
}

function renderTriggerPlanCard(trigger,targetElementId){
  const el=document.getElementById(targetElementId);if(!el)return;
  const tp=getTriggerPlan(trigger);
  const actionsHtml=tp.immediateActions.slice(0,3).map(a=>`<div class="prot-action-item"><i class="fas fa-bolt" style="color:var(--gold)"></i><span>${a}</span></div>`).join('');
  el.style.display='block';
  el.innerHTML=`
    <div class="tplan-card">
      <div class="tplan-header"><div class="tplan-icon">${tp.icon}</div>
        <div><div class="tplan-badge">خطة فورية لهذا المحفز</div><div class="tplan-title">${tp.title}</div></div>
      </div>
      <div class="tplan-msg">${tp.message}</div>
      <div class="tplan-actions">${actionsHtml}</div>
      <button class="btn btn-blue btn-full mt12" onclick="addTriggerPlanToTasks('${trigger}')">
        <i class="fas fa-plus-circle"></i>أضف هذه الخطة لمهام الحماية اليوم
      </button>
    </div>`;
}

function renderTopTriggerPlan(){
  const el=document.getElementById('tri-top-plan');if(!el)return;
  const logs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]');
  if(logs.length<1){
    el.innerHTML=`<div class="card" style="text-align:center;padding:28px">
      <div style="font-size:36px;margin-bottom:12px">📋</div>
      <div style="font-size:14px;font-weight:700;color:var(--t2);line-height:2">بعد تسجيل أكثر من رغبة، سيقترح الموقع خطة مخصصة لأكثر محفز يتكرر لديك.</div>
    </div>`;
    return;
  }
  const topTrigger=getTopFromLogs('trigger');
  if(!topTrigger){el.innerHTML='';return;}
  const tp=getTriggerPlan(topTrigger);
  el.innerHTML=`
    <div class="card">
      <div class="sec-t"><i class="fas fa-fire-flame-curved" style="color:var(--gold)"></i>خطة المحفز الأكثر تكراراً · ${topTrigger}</div>
      ${buildFullTriggerPlanHtml(tp,'خطة المحفز الأكثر تكراراً')}
      <button class="btn btn-blue btn-full mt16" onclick="addTriggerPlanToTasks('${topTrigger}')">
        <i class="fas fa-plus-circle"></i>أضف إجراءات هذه الخطة لمهام المحفز اليوم
      </button>
    </div>`;
}

function renderDashboardExpectedTrigger(){
  const el=document.getElementById('dash-expected-trigger');if(!el)return;
  const plan=loadDailyPlan();
  if(!plan){el.innerHTML='';return;}
  const trigger=inferExpectedTrigger(plan);
  if(!trigger){el.innerHTML='';return;}
  const tp=getTriggerPlan(trigger);
  el.innerHTML=`
    <div class="tplan-mini" onclick="go('dayplan')">
      <span style="font-size:24px">${tp.icon}</span>
      <div style="flex:1">
        <div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:2px">محفز اليوم المتوقع</div>
        <div style="font-size:15px;font-weight:900;color:var(--gold)">${trigger}</div>
        <div style="font-size:12px;color:var(--t2);margin-top:2px">${tp.immediateActions[0]}</div>
      </div>
      <button class="btn btn-ghost" style="font-size:12px;padding:7px 12px" onclick="event.stopPropagation();go('dayplan')">
        <i class="fas fa-arrow-left"></i>عرض الخطة
      </button>
    </div>`;
}

function addTriggerPlanToTasks(trigger){
  const tp=getTriggerPlan(trigger);
  const all=JSON.parse(localStorage.getItem('rj_trigger_tasks')||'{}');
  const td=today();
  if(!all[td])all[td]=[];
  const existing=new Set(all[td].map(t=>t.text));
  tp.immediateActions.forEach(text=>{if(!existing.has(text))all[td].push({trigger,text,done:false});});
  localStorage.setItem('rj_trigger_tasks',JSON.stringify(all));
  toast('✅ تم إضافة خطة المحفز','var(--gold)');
  renderTriggerTasks();
}

function renderTriggerTasks(){
  const el=document.getElementById('dash-trigger-tasks');if(!el)return;
  const all=JSON.parse(localStorage.getItem('rj_trigger_tasks')||'{}');
  const tasks=all[today()];
  if(!tasks||!tasks.length){el.innerHTML='';return;}
  const itemsHtml=tasks.map((t,i)=>`
    <div class="pt-item task-item ${t.done?'done':''}" onclick="toggleTriggerTask(${i})">
      <div class="task-cb"></div>
      <span class="task-lbl">${t.text}</span>
    </div>`).join('');
  el.innerHTML=`
    <div class="pt-section">
      <div class="divider" style="margin:16px 0 10px"></div>
      <div class="pt-title"><i class="fas fa-fire-flame-curved" style="color:var(--gold)"></i>مهام المحفز</div>
      ${itemsHtml}
    </div>`;
}

function toggleTriggerTask(index){
  const all=JSON.parse(localStorage.getItem('rj_trigger_tasks')||'{}');
  const td=today();
  if(!all[td]||all[td][index]===undefined)return;
  all[td][index].done=!all[td][index].done;
  localStorage.setItem('rj_trigger_tasks',JSON.stringify(all));
  renderTriggerTasks();
}
