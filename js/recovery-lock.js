function getRecoveryLock(){
  try{
    const data=JSON.parse(localStorage.getItem('rj_recovery_lock')||'null');
    if(!data)return null;
    if(data.active&&new Date()>=new Date(data.expiresAt)){
      data.active=false;
      localStorage.setItem('rj_recovery_lock',JSON.stringify(data));
    }
    return data.active?data:null;
  }catch{return null;}
}

function getRawRecoveryLock(){
  try{return JSON.parse(localStorage.getItem('rj_recovery_lock')||'null');}
  catch{return null;}
}

function activateRecoveryLock(relapseData){
  const now=new Date();
  const expires=new Date(now.getTime()+24*3600*1000);
  const lock={
    active:true,startedAt:now.toISOString(),expiresAt:expires.toISOString(),
    reason:relapseData.reason||'—',when:relapseData.when||'—',
    feel:relapseData.feel||'—',change:relapseData.change||'—',completed:false,
  };
  localStorage.setItem('rj_recovery_lock',JSON.stringify(lock));
  initRecoveryLockTasks(lock);
}

function completeRecoveryLock(){
  const data=getRawRecoveryLock();if(!data)return;
  data.completed=true;data.active=false;
  localStorage.setItem('rj_recovery_lock',JSON.stringify(data));
  toast('✅ أغلقت الثغرة. الآن عد للطريق بهدوء.','var(--green)');
  renderRecoveryLockCard();renderRecoveryLockPlan();renderRecoveryLockStats();
}

function initRecoveryLockTasks(lock){
  const all=JSON.parse(localStorage.getItem('rj_recovery_lock_tasks')||'{}');
  if(!all[lock.startedAt]){
    all[lock.startedAt]={lockId:lock.startedAt,tasks:RECOVERY_LOCK_TASKS.map(text=>({text,done:false}))};
    localStorage.setItem('rj_recovery_lock_tasks',JSON.stringify(all));
  }
}

function getRecoveryLockTasksForCurrent(){
  const raw=getRawRecoveryLock();if(!raw)return null;
  const all=JSON.parse(localStorage.getItem('rj_recovery_lock_tasks')||'{}');
  return all[raw.startedAt]||null;
}

function toggleRecoveryLockTask(index){
  const raw=getRawRecoveryLock();if(!raw)return;
  const all=JSON.parse(localStorage.getItem('rj_recovery_lock_tasks')||'{}');
  const rec=all[raw.startedAt];
  if(!rec||rec.tasks[index]===undefined)return;
  rec.tasks[index].done=!rec.tasks[index].done;
  localStorage.setItem('rj_recovery_lock_tasks',JSON.stringify(all));
  renderRecoveryLockPlan();renderRecoveryLockCard();
}

function getRecoveryLockProgress(){
  const rec=getRecoveryLockTasksForCurrent();
  if(!rec||!rec.tasks.length)return 0;
  return Math.round(rec.tasks.filter(t=>t.done).length/rec.tasks.length*100);
}

function formatTimeRemaining(expiresAt){
  const remaining=new Date(expiresAt)-new Date();
  if(remaining<=0)return'انتهى الوقت';
  const h=Math.floor(remaining/3600000);
  const m=Math.floor((remaining%3600000)/60000);
  if(h===0)return`${m} دقيقة متبقية`;
  return`${h} ساعة و ${m} دقيقة متبقية`;
}

function renderRecoveryLockCard(){
  const el=document.getElementById('dash-recovery-lock');if(!el)return;
  const raw=getRawRecoveryLock();
  if(!raw){el.innerHTML='';return;}
  if(raw.completed){
    el.innerHTML=`
      <div style="background:linear-gradient(135deg,rgba(67,217,141,.10),rgba(67,217,141,.04));border:1px solid rgba(67,217,141,.28);border-radius:18px;padding:18px 24px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
        <span style="font-size:28px">✅</span>
        <div>
          <div style="font-size:14px;font-weight:900;color:var(--green)">أغلقت الثغرة</div>
          <div style="font-size:13px;color:var(--t2);margin-top:3px">أكملت حماية 24 ساعة — الآن عد للطريق بهدوء.</div>
        </div>
      </div>`;
    return;
  }
  if(!raw.active&&!raw.completed){el.innerHTML='';return;}
  const lock=getRecoveryLock();if(!lock){el.innerHTML='';return;}
  const pct=getRecoveryLockProgress();
  const expired=new Date()>=new Date(lock.expiresAt);
  const canComplete=expired||pct===100;
  const timeStr=formatTimeRemaining(lock.expiresAt);
  const msgIdx=Math.floor(Date.now()/86400000)%RECOVERY_LOCK_MESSAGES.length;
  el.innerHTML=`
    <div class="rl-card">
      <div class="rl-badge"><i class="fas fa-shield-alt"></i>وضع حماية 24 ساعة</div>
      <div class="rl-msg">"${RECOVERY_LOCK_MESSAGES[msgIdx]}"</div>
      <div class="rl-timer">
        <i class="fas fa-clock" style="color:var(--purple);font-size:20px;flex-shrink:0"></i>
        <div><div class="rl-timer-val">${timeStr}</div><div class="rl-timer-lbl">حتى انتهاء فترة الحماية</div></div>
      </div>
      <div class="rl-pb"><div class="rl-pb-fill" style="width:${pct}%"></div></div>
      <div style="font-size:12px;color:var(--t3);font-weight:600;margin-bottom:14px">${pct}% من مهام الحماية مكتملة</div>
      <div class="rl-info-row"><span class="rl-info-lbl">السبب:</span><span class="rl-info-val">${lock.reason}</span></div>
      <div class="rl-info-row"><span class="rl-info-lbl">الوقت:</span><span class="rl-info-val">${lock.when}</span></div>
      ${lock.change&&lock.change!=='—'?`<div class="rl-info-row"><span class="rl-info-lbl">التغيير:</span><span class="rl-info-val">${lock.change}</span></div>`:''}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <button class="btn btn-ghost" onclick="go('dayplan')"><i class="fas fa-shield-alt"></i>فتح خطة الحماية</button>
        ${canComplete?`<button class="btn btn-green" onclick="completeRecoveryLock()"><i class="fas fa-check-circle"></i>أنهيت حماية 24 ساعة</button>`:''}
      </div>
    </div>`;
}

function renderRecoveryLockPlan(){
  const el=document.getElementById('dp-recovery-lock-plan');if(!el)return;
  const lock=getRecoveryLock();if(!lock){el.style.display='none';return;}
  const rec=getRecoveryLockTasksForCurrent();if(!rec){el.style.display='none';return;}
  const pct=getRecoveryLockProgress();
  const done=rec.tasks.filter(t=>t.done).length;
  const allDone=pct===100;
  const tasksHtml=rec.tasks.map((t,i)=>`
    <div class="rl-task-item ${t.done?'done':''}" onclick="toggleRecoveryLockTask(${i})">
      <div class="task-cb"></div>
      <span class="task-lbl">${t.text}</span>
    </div>`).join('');
  el.style.display='block';
  el.innerHTML=`
    <div class="card">
      <div class="sec-t"><i class="fas fa-shield-alt" style="color:var(--purple)"></i>خطة حماية 24 ساعة</div>
      <div class="rl-msg">"المطلوب الآن ليس الكمال، المطلوب منع التكرار."</div>
      <div class="fb mb8">
        <span style="font-size:13px;color:var(--t3);font-weight:700">${done} / ${rec.tasks.length} مهمة</span>
        <span style="font-size:14px;font-weight:900;color:var(--purple)">${pct}%</span>
      </div>
      <div class="rl-pb"><div class="rl-pb-fill" style="width:${pct}%"></div></div>
      ${tasksHtml}
      ${allDone?`
        <div class="rl-complete-banner">
          <div style="font-size:28px;margin-bottom:8px">🌱</div>
          <div style="font-size:16px;font-weight:900;color:var(--green);margin-bottom:6px">أغلقت الثغرة.</div>
          <div style="font-size:13px;color:var(--t2)">الآن عد للطريق بهدوء.</div>
          <button class="btn btn-green mt16 btn-full" onclick="completeRecoveryLock()"><i class="fas fa-check-circle"></i>أنهيت حماية 24 ساعة</button>
        </div>`:''}
    </div>`;
}

function renderRecoveryLockStats(){
  const el=document.getElementById('st-recovery-lock');if(!el)return;
  const raw=getRawRecoveryLock();if(!raw){el.innerHTML='';return;}
  const all=JSON.parse(localStorage.getItem('rj_recovery_lock_tasks')||'{}');
  const rec=raw.startedAt?all[raw.startedAt]:null;
  let pct=0;
  if(rec&&rec.tasks.length)pct=Math.round(rec.tasks.filter(t=>t.done).length/rec.tasks.length*100);
  const lockDate=raw.startedAt?new Date(raw.startedAt).toLocaleDateString('ar-SA',{year:'numeric',month:'short',day:'numeric'}):'—';
  const status=raw.completed?'✅ تم الإكمال':raw.active?'🔵 جارٍ الآن':'⌛ منتهي';
  const statusColor=raw.completed?'var(--green)':raw.active?'var(--blue)':'var(--t3)';
  el.innerHTML=`
    <div class="card">
      <div class="sec-t"><i class="fas fa-shield-alt" style="color:var(--purple)"></i>آخر وضع حماية</div>
      <div class="rl-info-row"><span class="rl-info-lbl">التاريخ:</span><span class="rl-info-val">${lockDate}</span></div>
      <div class="rl-info-row"><span class="rl-info-lbl">السبب:</span><span class="rl-info-val">${raw.reason||'—'}</span></div>
      <div class="rl-info-row"><span class="rl-info-lbl">الحالة:</span><span class="rl-info-val" style="color:${statusColor};font-weight:800">${status}</span></div>
      <div class="rl-info-row"><span class="rl-info-lbl">الإنجاز:</span><span class="rl-info-val">${pct}% من مهام الحماية</span></div>
      <div class="rl-pb mt8"><div class="rl-pb-fill" style="width:${pct}%"></div></div>
    </div>`;
}
