function dpChip(groupId,btn){
  document.querySelectorAll(`#${groupId} .chip`).forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
}
function getDpChip(groupId){
  const b=document.querySelector(`#${groupId} .chip.sel`);
  return b?b.dataset.v:null;
}
function getDpFormData(){
  return{
    sleep:           getDpChip('dp-sleep'),
    stress:          parseInt(document.getElementById('dp-stress').value),
    expectedUrge:    parseInt(document.getElementById('dp-urge').value),
    mood:            getDpChip('dp-mood'),
    lateNight:       getR('dp-late')==='true',
    socialOveruse:   getR('dp-social')==='true',
    phoneInBedOrBathroom:getR('dp-phone')==='true',
    dangerTime:      getDpChip('dp-dtime'),
    topTasks:[
      document.getElementById('dp-task1').value.trim(),
      document.getElementById('dp-task2').value.trim(),
      document.getElementById('dp-task3').value.trim(),
    ].filter(Boolean),
  };
}

function calculateRiskScore(data){
  let score=0;const reasons=[];
  if(data.sleep==='bad'){score+=2;reasons.push('نوم سيئ');}
  else if(data.sleep==='medium'){score+=1;}
  if(data.stress>=4){score+=2;reasons.push('توتر مرتفع');}
  if(['حزين','وحيد','ملل'].includes(data.mood)){score+=2;reasons.push(`شعور: ${data.mood}`);}
  if(data.expectedUrge>=7){score+=3;reasons.push('رغبة متوقعة مرتفعة');}
  else if(data.expectedUrge>=4){score+=1;}
  if(data.lateNight){score+=3;reasons.push('سهر متأخر');}
  if(data.socialOveruse){score+=2;reasons.push('إفراط في السوشيال ميديا');}
  if(data.phoneInBedOrBathroom){score+=4;reasons.push('الهاتف في السرير أو الحمام');}
  const level=score>=9?'high':score>=5?'medium':'low';
  const topRiskReason=reasons.length?reasons[0]:'لا يوجد خطر واضح';
  return{score,level,topRiskReason,allReasons:reasons};
}

function buildRiskHtml(plan){
  const CFG={
    low:   {cls:'risk-low', ico:'🟢',lv:'low', label:'منخفض',msg:'اليوم في منطقة آمنة. حافظ على القواعد الأساسية واستمر بهدوء.'},
    medium:{cls:'risk-med', ico:'🟡',lv:'med', label:'متوسط',msg:'اليوم يحتاج انتباهاً. لا تترك الهاتف قريباً وقت السهر، وتجنب العزلة.'},
    high:  {cls:'risk-high',ico:'🔴',lv:'high',label:'مرتفع',msg:'اليوم يحتاج حماية عالية. لا تختبر نفسك. اجعل الهاتف خارج الغرفة واستخدم زر الطوارئ مبكراً.'},
  };
  const c=CFG[plan.riskLevel]||CFG.low;
  const reasons=plan.allReasons&&plan.allReasons.length
    ?`<div class="risk-why">⚠️ العوامل: ${plan.allReasons.join('، ')}</div>`:'';
  return`
    <div class="risk-card ${c.cls}">
      <div class="risk-ico">${c.ico}</div>
      <div style="flex:1">
        <div class="risk-lv ${c.lv}">مستوى الخطر: ${c.label} · ${plan.riskScore} نقطة</div>
        <div class="risk-msg">${c.msg}</div>
        ${reasons}
      </div>
    </div>`;
}

function saveDailyPlan(){
  const data  =getDpFormData();
  const risk  =calculateRiskScore(data);
  const plan  ={
    ...data,riskScore:risk.score,riskLevel:risk.level,
    topRiskReason:risk.topRiskReason,allReasons:risk.allReasons,
    savedAt:new Date().toISOString(),
  };
  const all   =load(K.dailyPlan)||{};
  all[today()]=plan;
  save(K.dailyPlan,all);
  toast('✅ خطة اليوم محفوظة','var(--green)');
  renderDailyPlan();
  renderDashboardRiskCard();
  renderDashboardProtectionCard();
  renderProtectionPlanCard();
  renderProtectionTasks();
  renderDayPlanTriggerCard();
  renderDashboardExpectedTrigger();
}

function loadDailyPlan(){
  const all=load(K.dailyPlan)||{};
  return all[today()]||null;
}

function renderDailyPlan(){
  const resultEl=document.getElementById('dp-result-card');
  const savedEl =document.getElementById('dp-saved-view');
  if(!resultEl||!savedEl)return;
  const plan=loadDailyPlan();
  if(!plan){resultEl.style.display='none';savedEl.style.display='none';return;}

  resultEl.style.display='block';
  resultEl.innerHTML=buildRiskHtml(plan);

  const sleepLabel=plan.sleep==='good'?'😴 جيد':plan.sleep==='medium'?'😐 متوسط':'😩 سيئ';
  const tasksHtml=plan.topTasks&&plan.topTasks.length
    ?plan.topTasks.map((t,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div class="dp-task-num">${i+1}</div>
          <span style="font-size:14px;font-weight:600">${t}</span>
        </div>`).join('')
    :'<p class="tm" style="font-size:13px">لم تحدد مهاماً اليوم</p>';

  savedEl.style.display='block';
  savedEl.innerHTML=`
    <div class="card">
      <div class="sec-t"><i class="fas fa-check-circle tc"></i>ملخص خطة اليوم المحفوظة</div>
      <div class="g3" style="margin-bottom:20px">
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">جودة النوم</div>
          <div style="font-size:16px;font-weight:800">${sleepLabel}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">الشعور</div>
          <div style="font-size:16px;font-weight:800">${plan.mood||'—'}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">الوقت الأخطر</div>
          <div style="font-size:15px;font-weight:800">${plan.dangerTime||'—'}</div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:10px">أهم مهام اليوم:</div>
      ${tasksHtml}
    </div>`;
  renderDayPlanTriggerCard();
  renderRecoveryLockPlan();
}

function renderProtectionPlanCard(){
  const el=document.getElementById('dp-protection-card');if(!el)return;
  const plan=loadDailyPlan();
  if(!plan){el.style.display='none';return;}
  const mode=getProtectionMode(plan);
  if(!mode){el.style.display='none';return;}
  const clsMap={safe:'prot-safe',attention:'prot-attention',highProtection:'prot-high',rescue:'prot-rescue'};
  const cardCls=clsMap[mode.key]||'prot-safe';
  const actionsHtml=mode.protectionActions.map(a=>`
    <div class="prot-action-item">
      <i class="fas fa-shield-alt" style="color:${mode.color}"></i>
      <span>${a}</span>
    </div>`).join('');
  el.style.display='block';
  el.innerHTML=`
    <div class="prot-card ${cardCls}">
      <div class="prot-section-label"><i class="fas fa-shield-alt"></i>خطة الحماية المقترحة</div>
      <div class="prot-header">
        <div class="prot-icon">${mode.icon}</div>
        <div>
          <div class="prot-label" style="color:${mode.color}">وضع اليوم</div>
          <div class="prot-name" style="color:${mode.color}">${mode.name}</div>
        </div>
      </div>
      <div class="prot-msg">${mode.shortMessage}</div>
      <div class="prot-actions">${actionsHtml}</div>
      <button class="btn btn-blue btn-full" onclick="addProtectionActionsToTasks()">
        <i class="fas fa-plus-circle"></i>أضف هذه الإجراءات إلى مهام اليوم
      </button>
    </div>`;
}

function addProtectionActionsToTasks(){
  const plan=loadDailyPlan();if(!plan)return;
  const mode=getProtectionMode(plan);if(!mode)return;
  const all=JSON.parse(localStorage.getItem('rj_protection_tasks')||'{}');
  all[today()]=mode.protectionActions.map(text=>({text,done:false}));
  localStorage.setItem('rj_protection_tasks',JSON.stringify(all));
  toast('✅ تم إضافة مهام الحماية','var(--purple)');
  renderProtectionTasks();
  renderDashboardProtectionCard();
}

function renderProtectionTasks(){
  const el=document.getElementById('dash-protection-tasks');if(!el)return;
  const all=JSON.parse(localStorage.getItem('rj_protection_tasks')||'{}');
  const tasks=all[today()];
  if(!tasks||!tasks.length){el.innerHTML='';return;}
  const itemsHtml=tasks.map((t,i)=>`
    <div class="pt-item task-item ${t.done?'done':''}" onclick="toggleProtectionTask(${i})">
      <div class="task-cb"></div>
      <span class="task-lbl">${t.text}</span>
    </div>`).join('');
  el.innerHTML=`
    <div class="pt-section">
      <div class="divider" style="margin:16px 0 10px"></div>
      <div class="pt-title"><i class="fas fa-shield-alt"></i>مهام الحماية</div>
      ${itemsHtml}
    </div>`;
}

function toggleProtectionTask(index){
  const all=JSON.parse(localStorage.getItem('rj_protection_tasks')||'{}');
  const td=today();
  if(!all[td]||all[td][index]===undefined)return;
  all[td][index].done=!all[td][index].done;
  localStorage.setItem('rj_protection_tasks',JSON.stringify(all));
  renderProtectionTasks();
}

function getProtectionMode(plan){
  if(!plan)return null;
  const isRescue=plan.riskLevel==='high'&&(plan.lateNight===true||plan.phoneInBedOrBathroom===true||plan.expectedUrge>=8);
  if(isRescue)return{key:'rescue',name:'وضع إنقاذ',color:'#ef4444',icon:'🚨',shortMessage:'أنت في منطقة خطر. طبّق الحماية الآن وليس لاحقاً.',protectionActions:['ضع الهاتف خارج الغرفة فوراً','اخرج من الغرفة الآن','اشرب ماء','افتح بروتوكول الطوارئ','لا تستخدم الهاتف في العزلة']};
  if(plan.riskLevel==='high')return{key:'highProtection',name:'وضع حماية عالية',color:'var(--red)',icon:'🔴',shortMessage:'اليوم يحتاج حماية عالية. لا تختبر نفسك.',protectionActions:['الهاتف خارج الغرفة','ممنوع سوشيال ليلاً','غيّر المكان عند أول رغبة','أضف مهمة جسدية اليوم']};
  if(plan.riskLevel==='medium')return{key:'attention',name:'وضع انتباه',color:'var(--gold)',icon:'🟡',shortMessage:'اليوم يحتاج انتباهاً. لا تترك نفسك للفراغ.',protectionActions:['قلل السوشيال ميديا','لا تبقى وحدك وقت السهر','افتح زر الطوارئ عند أول رغبة']};
  return{key:'safe',name:'وضع آمن',color:'var(--green)',icon:'🟢',shortMessage:'اليوم مستقر. حافظ على القواعد الأساسية.',protectionActions:['لا هاتف في الحمام','لا هاتف في السرير','أكمل مهام اليوم']};
}

function renderDayPlanTriggerCard(){
  const el=document.getElementById('dp-trigger-plan');if(!el)return;
  const plan=loadDailyPlan();
  if(!plan){el.style.display='none';return;}
  const trigger=inferExpectedTrigger(plan);
  if(!trigger){el.style.display='none';return;}
  const tp=getTriggerPlan(trigger);
  el.style.display='block';
  el.innerHTML=`
    <div class="card">
      <div class="sec-t"><i class="fas fa-fire-flame-curved" style="color:var(--gold)"></i>خطة المحفز المتوقع اليوم · ${trigger}</div>
      ${buildFullTriggerPlanHtml(tp,'خطة المحفز المتوقع اليوم')}
      <button class="btn btn-blue btn-full mt16" onclick="addTriggerPlanToTasks('${trigger}')">
        <i class="fas fa-plus-circle"></i>أضف إجراءات هذه الخطة لمهام المحفز
      </button>
    </div>`;
}

function renderDashboardProtectionCard(){
  const el=document.getElementById('dash-protection-wrap');if(!el)return;
  const plan=loadDailyPlan();
  if(!plan){
    el.innerHTML=`
      <div class="prot-card" style="background:var(--glass);border:1px solid var(--border);cursor:pointer" onclick="go('dayplan')">
        <div class="prot-header">
          <div class="prot-icon">🛡️</div>
          <div>
            <div class="prot-section-label" style="margin-bottom:4px"><i class="fas fa-shield-alt"></i>محرك الحماية الذكي</div>
            <div class="prot-name" style="color:var(--t2);font-size:16px">لم يتم تحديد وضع الحماية بعد. ابدأ بخطة اليوم.</div>
          </div>
        </div>
        <div class="prot-btns mt12">
          <button class="btn btn-blue" onclick="go('dayplan')"><i class="fas fa-sun"></i>فتح خطة اليوم</button>
        </div>
      </div>`;
    return;
  }
  const mode=getProtectionMode(plan);if(!mode)return;
  const clsMap={safe:'prot-safe',attention:'prot-attention',highProtection:'prot-high',rescue:'prot-rescue'};
  const cardCls=clsMap[mode.key]||'prot-safe';
  const top3=mode.protectionActions.slice(0,3);
  const actionsHtml=top3.map(a=>`
    <div class="prot-action-item">
      <i class="fas fa-shield-alt" style="color:${mode.color}"></i>
      <span>${a}</span>
    </div>`).join('');
  const sosBtn=(mode.key==='highProtection'||mode.key==='rescue')
    ?`<button class="btn btn-red" onclick="openSOS()"><i class="fas fa-exclamation-triangle"></i>فتح الطوارئ</button>`:'';
  el.innerHTML=`
    <div class="prot-card ${cardCls}">
      <div class="prot-section-label"><i class="fas fa-shield-alt"></i>وضع الحماية اليوم</div>
      <div class="prot-header">
        <div class="prot-icon">${mode.icon}</div>
        <div>
          <div class="prot-label" style="color:${mode.color}">محرك الحماية الذكي</div>
          <div class="prot-name" style="color:${mode.color}">${mode.name}</div>
        </div>
      </div>
      <div class="prot-msg">${mode.shortMessage}</div>
      <div class="prot-actions">${actionsHtml}</div>
      <div class="prot-btns">
        <button class="btn btn-ghost" onclick="go('dayplan')"><i class="fas fa-sun"></i>فتح خطة اليوم</button>
        ${sosBtn}
      </div>
    </div>`;
}
