const load = k => { try{return JSON.parse(localStorage.getItem(k))}catch{return null} };
const save = (k,v) => localStorage.setItem(k,JSON.stringify(v));

function today(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

const daysDiff = (a,b) => Math.floor((new Date(b)-new Date(a))/86400000);
const cleanDays = () => { const s=load(K.start); return s?Math.max(0,daysDiff(s,today())):0; };

function toast(msg,col){
  const t=document.getElementById('toast');
  t.textContent=msg;t.style.borderColor=col||'var(--border)';
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);
}
