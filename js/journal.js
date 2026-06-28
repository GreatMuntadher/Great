function pickR(gid,btn){
  document.querySelectorAll(`#${gid} .rbtn`).forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
}
function getR(gid){const b=document.querySelector(`#${gid} .rbtn.sel`);return b?b.dataset.v:'لا';}

function saveJournal(){
  const e={
    date:today(),
    urge:document.getElementById('j-urge').value,
    mood:document.getElementById('j-mood').value,
    watched:getR('rg-watched'),did:getR('rg-did'),
    trigger:document.getElementById('j-trigger').value,
    alt:document.getElementById('j-alt').value,
    note:document.getElementById('j-note').value,
    days:cleanDays()
  };
  const j=load(K.journal)||[];
  const i=j.findIndex(x=>x.date===today());
  if(i>=0)j.splice(i,1);
  j.unshift(e);save(K.journal,j);
  toast('✅ تم حفظ تقرير اليوم','var(--green)');
  renderJournalEntries();
}

function renderJournalEntries(){
  const j=load(K.journal)||[];
  const el=document.getElementById('j-entries');if(!el)return;
  if(!j.length){el.innerHTML='<p class="tm" style="text-align:center;padding:24px;font-size:14px">لم تسجّل أي تقارير بعد</p>';return;}
  el.innerHTML=j.slice(0,7).map(e=>{
    const d=new Date(e.date);
    return`<div class="je-card">
      <div class="je-date">
        <div class="jed-d">${e.date.slice(8)}</div>
        <div class="jed-m">${d.toLocaleDateString('ar-SA',{month:'short'})}</div>
      </div>
      <div style="flex:1">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <span class="badge bn">رغبة: ${e.urge}/10</span>
          <span class="badge bn">${e.mood}</span>
          <span class="badge ${e.did==='لا'?'bc':'bd'}">${e.did==='لا'?'✓ نظيف':'انتكاسة'}</span>
          ${e.trigger?`<span class="badge bw">${e.trigger}</span>`:''}
        </div>
        ${e.note?`<p style="font-size:13px;color:var(--t2);line-height:1.7">${e.note}</p>`:''}
      </div>
    </div>`;
  }).join('');
}
