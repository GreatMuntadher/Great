function renderReasons(){
  const reasons=load(K.reasons)||DEF_REASONS;
  const el=document.getElementById('reasons-list');if(!el)return;
  el.innerHTML=reasons.map((r,i)=>`
    <div class="reason-item">
      <div class="reason-dot"></div>
      <span class="reason-txt">${r}</span>
      <button class="reason-del" onclick="delReason(${i})"><i class="fas fa-times"></i></button>
    </div>`).join('');
  const drEl=document.getElementById('daily-reason');
  if(drEl&&reasons.length){
    const dy=Math.floor(Date.now()/86400000);
    drEl.textContent=reasons[dy%reasons.length];
  }
}

function addReason(){
  const inp=document.getElementById('new-reason');
  const txt=inp.value.trim();if(!txt)return;
  const r=load(K.reasons)||[];r.push(txt);save(K.reasons,r);
  inp.value='';renderReasons();
  toast('✅ تمت إضافة السبب','var(--green)');
}

function delReason(i){
  const r=load(K.reasons)||[];r.splice(i,1);save(K.reasons,r);renderReasons();
}

document.addEventListener('DOMContentLoaded',()=>{
  const inp=document.getElementById('new-reason');
  if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter')addReason();});
});
