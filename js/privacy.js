let _qhTimer=null;

function getPrivacySettings(){
  try{return JSON.parse(localStorage.getItem('rj_privacy_settings')||'null')||{privacyMode:false,quickHideEnabled:true,pinEnabled:false,pin:null};}
  catch{return{privacyMode:false,quickHideEnabled:true,pinEnabled:false,pin:null};}
}
function savePrivacySettings(s){localStorage.setItem('rj_privacy_settings',JSON.stringify(s));}

function applyPrivacyMode(){
  const s=getPrivacySettings();
  const fab=document.getElementById('qh-fab');
  if(fab)fab.style.display=s.quickHideEnabled?'flex':'none';
  const mt=document.getElementById('priv-mode-toggle');if(mt)mt.checked=!!s.privacyMode;
  const qht=document.getElementById('priv-qh-toggle');if(qht)qht.checked=s.quickHideEnabled!==false;
  const pst=document.getElementById('pin-status-text');
  if(pst)pst.textContent=s.pinEnabled?'مفعّل — اضغط لإلغاء التفعيل':'غير مفعّل — اضغط للتفعيل';
  const peb=document.getElementById('pin-enable-btn');
  if(peb){
    if(s.pinEnabled){peb.innerHTML='<i class="fas fa-lock-open"></i>إلغاء التفعيل';peb.onclick=disablePin;}
    else{peb.innerHTML='<i class="fas fa-lock"></i>تفعيل';peb.onclick=showSetPinModal;}
  }
}

function togglePrivacyMode(enabled){
  const s=getPrivacySettings();s.privacyMode=enabled;savePrivacySettings(s);
  toast(enabled?'🔒 وضع الخصوصية مفعّل':'🔓 وضع الخصوصية معطّل','var(--blue)');
}

function toggleQuickHideEnabled(enabled){
  const s=getPrivacySettings();s.quickHideEnabled=enabled;savePrivacySettings(s);
  const fab=document.getElementById('qh-fab');if(fab)fab.style.display=enabled?'flex':'none';
}

function quickHide(){
  const overlay=document.getElementById('qh-overlay');if(overlay)overlay.classList.add('open');
  let elapsed=0;const totalSec=25*60;
  clearInterval(_qhTimer);
  const dispEl=document.getElementById('qh-timer-disp');
  const fillEl=document.getElementById('qh-focus-fill');
  _qhTimer=setInterval(()=>{
    elapsed++;const remaining=totalSec-elapsed;
    if(remaining<=0){clearInterval(_qhTimer);return;}
    const m=Math.floor(remaining/60);const s=remaining%60;
    if(dispEl)dispEl.textContent=`${m}:${String(s).padStart(2,'0')}`;
    const pct=Math.min(100,elapsed/totalSec*100);
    if(fillEl)fillEl.style.width=pct+'%';
  },1000);
}

function quickShow(){
  clearInterval(_qhTimer);
  const overlay=document.getElementById('qh-overlay');if(overlay)overlay.classList.remove('open');
}

function showLockScreen(){
  const s=getPrivacySettings();if(!s.pinEnabled||!s.pin)return;
  ['pin-d1','pin-d2','pin-d3','pin-d4'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const errEl=document.getElementById('pin-error');if(errEl)errEl.textContent='';
  const overlay=document.getElementById('pin-overlay');if(overlay)overlay.classList.add('open');
  setTimeout(()=>{const f=document.getElementById('pin-d1');if(f)f.focus();},200);
}

function unlockApp(){
  const s=getPrivacySettings();
  const entered=['pin-d1','pin-d2','pin-d3','pin-d4'].map(id=>{const e=document.getElementById(id);return e?e.value:'';}).join('');
  if(entered===String(s.pin)){
    const overlay=document.getElementById('pin-overlay');if(overlay)overlay.classList.remove('open');
    const errEl=document.getElementById('pin-error');if(errEl)errEl.textContent='';
  }else{
    const errEl=document.getElementById('pin-error');if(errEl)errEl.textContent='الرمز غير صحيح';
    ['pin-d1','pin-d2','pin-d3','pin-d4'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const f=document.getElementById('pin-d1');if(f)f.focus();
  }
}

function pinInput(el,num){
  el.value=el.value.replace(/\D/g,'').slice(-1);
  if(el.value.length===1&&num<4){const next=document.getElementById(`pin-d${num+1}`);if(next)next.focus();}
  if(num===4&&el.value.length===1)setTimeout(unlockApp,100);
}

function showSetPinModal(){
  ['np-d1','np-d2','np-d3','np-d4'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const errEl=document.getElementById('set-pin-error');if(errEl)errEl.textContent='';
  document.getElementById('set-pin-overlay').classList.add('open');
  setTimeout(()=>{const f=document.getElementById('np-d1');if(f)f.focus();},200);
}

function closeSetPinModal(){document.getElementById('set-pin-overlay').classList.remove('open');}

function newPinInput(el,num){
  el.value=el.value.replace(/\D/g,'').slice(-1);
  if(el.value.length===1&&num<4){const next=document.getElementById(`np-d${num+1}`);if(next)next.focus();}
}

function setPin(){
  const digits=['np-d1','np-d2','np-d3','np-d4'].map(id=>{const el=document.getElementById(id);return el?el.value:'';});
  if(digits.some(d=>d===''||!/^\d$/.test(d))){
    const errEl=document.getElementById('set-pin-error');if(errEl)errEl.textContent='أدخل 4 أرقام كاملة';return;
  }
  const s=getPrivacySettings();s.pinEnabled=true;s.pin=digits.join('');savePrivacySettings(s);
  closeSetPinModal();applyPrivacyMode();
  toast('✅ تم تفعيل قفل PIN','var(--green)');
}

function disablePin(){
  const s=getPrivacySettings();s.pinEnabled=false;s.pin=null;savePrivacySettings(s);
  applyPrivacyMode();toast('🔓 تم إلغاء قفل PIN','var(--blue)');
}

function renderPrivacyPage(){applyPrivacyMode();renderPastReports();}
