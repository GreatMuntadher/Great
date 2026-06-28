let sosTimer=null;

function openSOS(){
  document.getElementById('sos-overlay').classList.add('open');
  clearInterval(sosTimer);
  [1,2,3,4].forEach(n=>{
    const ph=document.getElementById(`sos-phase-${n}`);if(ph)ph.style.display='none';
    const dot=document.getElementById(`ph-dot-${n}`);if(dot){dot.classList.remove('active','done');}
    const line=document.getElementById(`ph-line-${n}`);if(line)line.classList.remove('done');
  });
  document.getElementById('sos-log-form').style.display='none';
  document.getElementById('sos-victory').classList.remove('show');
  document.getElementById('sos-phase-1').style.display='block';
  document.getElementById('ph-dot-1').classList.add('active');
  const r=SOS_REASONS[Math.floor(Math.random()*SOS_REASONS.length)];
  document.getElementById('sos-reason-text').textContent=r;
}

function closeSOS(){
  document.getElementById('sos-overlay').classList.remove('open');
  clearInterval(sosTimer);
}

function sosMoveToPhase(n){
  clearInterval(sosTimer);
  [1,2,3,4].forEach(i=>{const ph=document.getElementById(`sos-phase-${i}`);if(ph)ph.style.display='none';});
  document.getElementById('sos-log-form').style.display='none';
  for(let i=1;i<n;i++){
    const dot=document.getElementById(`ph-dot-${i}`);
    if(dot){dot.classList.remove('active');dot.classList.add('done');}
    const line=document.getElementById(`ph-line-${i}`);
    if(line)line.classList.add('done');
  }
  const activeDot=document.getElementById(`ph-dot-${n}`);
  if(activeDot){activeDot.classList.remove('done');activeDot.classList.add('active');}
  const target=document.getElementById(`sos-phase-${n}`);
  if(target)target.style.display='block';
  if(n===2){
    let s=60;const el=document.getElementById('sos-timer-2');el.textContent=s;
    sosTimer=setInterval(()=>{s--;el.textContent=s>0?s:'✓';if(s<=0)clearInterval(sosTimer);},1000);
  }
  if(n===3){
    let s=300;const fmt=sec=>`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
    const el=document.getElementById('sos-timer-3');el.textContent=fmt(s);
    sosTimer=setInterval(()=>{s--;el.textContent=s>0?fmt(s):'✓';if(s<=0)clearInterval(sosTimer);},1000);
  }
}

function sosShowLogForm(){
  clearInterval(sosTimer);
  [1,2,3,4].forEach(i=>{
    const ph=document.getElementById(`sos-phase-${i}`);if(ph)ph.style.display='none';
    const dot=document.getElementById(`ph-dot-${i}`);if(dot){dot.classList.remove('active');dot.classList.add('done');}
    const line=document.getElementById(`ph-line-${i}`);if(line)line.classList.add('done');
  });
  document.querySelectorAll('#sos-log-form .chip').forEach(c=>c.classList.remove('sel'));
  const st=document.getElementById('log-self-thanks');if(st)st.value='';
  document.getElementById('sos-log-form').style.display='block';
}

function logChip(groupId,btn){
  document.querySelectorAll(`#${groupId} .chip`).forEach(c=>c.classList.remove('sel'));
  btn.classList.add('sel');
  if(groupId==='log-trigger'){
    const trigger=btn.textContent.trim();
    renderTriggerPlanCard(trigger,'sos-trigger-plan');
  }
}

function getLogChip(groupId){
  const b=document.querySelector(`#${groupId} .chip.sel`);
  return b?b.textContent.trim():'';
}

function saveUrgeLog(){
  const log={
    timestamp:new Date().toISOString(),
    location: getLogChip('log-location'),
    trigger:  getLogChip('log-trigger'),
    fixUsed:  getLogChip('log-fix'),
    selfThanks:(document.getElementById('log-self-thanks').value||'').trim(),
  };
  const logs=JSON.parse(localStorage.getItem('rj_urge_logs')||'[]');
  logs.push(log);
  localStorage.setItem('rj_urge_logs',JSON.stringify(logs));
  save(K.urge,(load(K.urge)||0)+1);
  document.getElementById('sos-log-form').style.display='none';
  const v=document.getElementById('sos-victory');v.classList.add('show');
  renderDash();renderStats();
  setTimeout(closeSOS,3500);
}
