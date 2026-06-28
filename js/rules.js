function renderRules(){
  const rules=load(K.rules)||DEF_RULES;
  const el=document.getElementById('rules-list');if(!el)return;
  el.innerHTML=rules.map((r,i)=>`
    <div class="rule">
      <div class="rule-dot"></div>
      <span class="rule-txt">${r}</span>
      <button class="rule-del" onclick="delRule(${i})"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

function addRule(){
  const inp=document.getElementById('new-rule');
  const txt=inp.value.trim();if(!txt)return;
  const r=load(K.rules)||[];r.push(txt);save(K.rules,r);
  inp.value='';renderRules();
  toast('✅ تمت إضافة القاعدة','var(--green)');
}

function delRule(i){
  const r=load(K.rules)||[];r.splice(i,1);save(K.rules,r);renderRules();
}

document.getElementById('new-rule').addEventListener('keydown',e=>{if(e.key==='Enter')addRule();});
