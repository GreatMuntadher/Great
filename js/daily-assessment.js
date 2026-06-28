const DAILY_ASSESSMENT_QUESTIONS=[
  {id:'dq_1', title:'هل بقي الهاتف خارج السرير؟',             description:'من أهم قواعد الحماية اليومية.',             category:'protection',weight:3,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_2', title:'هل دخل الهاتف إلى الحمام اليوم؟',         description:'الحمام من أخطر بيئات الانتكاسة.',            category:'risk',      weight:3,answerType:'yesno',positiveAnswer:'no', active:true},
  {id:'dq_3', title:'هل مارست حركة أو رياضة اليوم؟',           description:'الحركة تكسر دورة الرغبة وترفع الطاقة.',      category:'body',      weight:2,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_4', title:'هل استخدمت السوشيال بوعي وبدون إفراط؟',   description:'السوشيال العشوائي من أقوى المحفزات.',        category:'protection',weight:2,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_5', title:'هل خصصت وقتاً للتعلم أو القراءة اليوم؟',  description:'التعلم يبني هوية جديدة أقوى.',              category:'progress',  weight:1,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_6', title:'هل تذكرت سبباً واحداً للاستمرار؟',         description:'السبب الواضح يمنحك قوة وقت الضعف.',         category:'victory',   weight:2,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_7', title:'هل التزمت بوقت نوم مناسب؟',               description:'النوم المنتظم يرفع مقاومة الرغبة.',          category:'body',      weight:2,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_8', title:'هل اهتممت بجسمك وشربت ماء كافياً؟',       description:'الجسد السليم يساند العقل السليم.',           category:'body',      weight:1,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_9', title:'هل تواصلت مع شخص إيجابي اليوم؟',          description:'الوحدة من أكبر عوامل الخطر.',               category:'protection',weight:2,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_10',title:'هل أبعدت أي محتوى أو تطبيق محفز؟',        description:'تنظيف البيئة الرقمية يقلل الإغراء.',         category:'protection',weight:2,answerType:'yesno',positiveAnswer:'yes',active:true},
  {id:'dq_11',title:'مستوى الرغبة الأعلى اليوم؟',               description:'1 = لا توجد رغبة، 10 = أعلى مستوى.',         category:'risk',      weight:3,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_12',title:'مستوى التوتر اليوم؟',                      description:'1 = هادئ تماماً، 10 = توتر شديد.',           category:'mood',      weight:2,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_13',title:'مستوى الحزن اليوم؟',                       description:'1 = لا حزن، 10 = حزن شديد.',                category:'mood',      weight:2,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_14',title:'مستوى الوحدة اليوم؟',                      description:'1 = لا وحدة، 10 = وحدة شديدة.',             category:'mood',      weight:2,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_15',title:'مستوى الملل اليوم؟',                       description:'1 = لا ملل، 10 = ملل شديد.',                category:'mood',      weight:2,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_16',title:'جودة النوم؟',                               description:'1 = نوم سيئ جداً، 10 = نوم ممتاز.',          category:'body',      weight:2,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_17',title:'قوة التزامك باليوم؟',                       description:'1 = ضعيف جداً، 10 = قوي جداً.',             category:'progress',  weight:2,answerType:'rating',positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_18',title:'ما أكبر انتصار صغير حققته اليوم؟',          description:'',                                           category:'victory',   weight:1,answerType:'short', positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_19',title:'ما أكبر ثغرة ظهرت اليوم؟',                 description:'',                                           category:'risk',      weight:1,answerType:'short', positiveAnswer:null,active:true,allowNote:false},
  {id:'dq_20',title:'ما قرارك للغد؟',                            description:'',                                           category:'progress',  weight:1,answerType:'short', positiveAnswer:null,active:true,allowNote:false},
];

function loadDailyQuestions(){
  const q=load(K.dailyQuestions);
  if(!q||!q.length)return DAILY_ASSESSMENT_QUESTIONS;
  // migrate: convert any saved combo questions to yesno
  let changed=false;
  q.forEach(x=>{if(x.answerType==='combo'){x.answerType='yesno';changed=true;}});
  if(changed)save(K.dailyQuestions,q);
  return q;
}
function saveDailyQuestions(qs){save(K.dailyQuestions,qs);}

function getDailyAssessment(date){const all=load(K.dailyAssessments)||{};return all[date]||null;}
function getAssessmentRange(days){
  const all=load(K.dailyAssessments)||{};const out=[];
  for(let i=0;i<days;i++){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().slice(0,10);if(all[ds])out.push(all[ds]);}
  return out;
}

function calculateDailyAssessmentScores(answers,questions){
  const qmap={};questions.forEach(q=>{qmap[q.id]=q;});
  const getYN=id=>(answers[id]?.yesno)||null;
  const getRat=id=>{const v=parseInt(answers[id]?.rating);return isNaN(v)?0:v;};
  const isPos=qid=>{const q=qmap[qid];if(!q)return false;if(q.positiveAnswer==='yes')return getYN(qid)==='yes';if(q.positiveAnswer==='no')return getYN(qid)==='no';return false;};
  const protQs=questions.filter(q=>q.category==='protection'&&q.active&&q.positiveAnswer);
  let protD=0,protT=0;
  protQs.forEach(q=>{const w=q.weight||1;protT+=w;if(isPos(q.id))protD+=w;});
  const protectionScore=protT>0?Math.round(protD/protT*100):50;
  const sleepR=getRat('dq_16');
  const bodyYN=questions.filter(q=>q.category==='body'&&q.active&&q.positiveAnswer);
  let bodyD=0,bodyT=0;
  bodyYN.forEach(q=>{const w=q.weight||1;bodyT+=w;if(isPos(q.id))bodyD+=w;});
  const bodyYNPct=bodyT>0?(bodyD/bodyT*100):50;
  const bodyScore=Math.round(sleepR>0?(bodyYNPct*0.6+sleepR/10*100*0.4):bodyYNPct);
  const moodIds=['dq_12','dq_13','dq_14','dq_15'];
  const moodVals=moodIds.map(id=>getRat(id)).filter(v=>v>0);
  const avgMood=moodVals.length?moodVals.reduce((a,b)=>a+b,0)/moodVals.length:3;
  const moodRiskScore=Math.round(avgMood/10*100);
  const urge=getRat('dq_11');
  const urgeRiskScore=urge>0?Math.round(urge/10*100):10;
  const victQs=questions.filter(q=>q.category==='victory'&&q.active&&q.positiveAnswer);
  let victD=0,victT=0;
  victQs.forEach(q=>{const w=q.weight||1;victT+=w;if(isPos(q.id))victD+=w;});
  const commit=getRat('dq_17');
  const victoryScore=Math.round((victT>0?(victD/victT*70):35)+(commit>0?commit/10*30:15));
  const progressRaw=protectionScore*0.3+bodyScore*0.2+victoryScore*0.25+(commit>0?commit/10*100*0.25:25);
  const riskPenalty=Math.max(0,(urgeRiskScore-50)*0.3)+Math.max(0,(moodRiskScore-60)*0.2);
  const dailyProgressScore=Math.max(0,Math.min(100,Math.round(progressRaw-riskPenalty)));
  const combinedRisk=Math.max(urgeRiskScore,moodRiskScore*0.6);
  const riskLevel=combinedRisk<=30?'low':combinedRisk<=60?'med':combinedRisk<=80?'high':'rescue';
  let mentalState='مستقر';
  if(riskLevel==='rescue')mentalState='عالي الخطر';
  else if(urge>=8)mentalState='يحتاج حماية';
  else if(getRat('dq_14')>=7)mentalState='وحيد';
  else if(getRat('dq_12')>=7)mentalState='مضغوط';
  else if(getRat('dq_13')>=7)mentalState='متعب';
  else if(moodRiskScore>=60)mentalState='مضغوط';
  else if(commit<=3&&commit>0)mentalState='متعب';
  const victories=[];
  const bigV=(answers['dq_18']?.short||'').trim();
  if(bigV)victories.push('🏆 '+bigV);
  questions.filter(q=>q.active&&isPos(q.id)&&(q.category==='protection'||q.category==='victory')).forEach(q=>{victories.push(q.title.replace(/^هل\s*/,'').replace('؟','').trim());});
  const riskFactors=[];
  if(getYN('dq_2')==='yes')riskFactors.push('الهاتف دخل الحمام');
  if(getYN('dq_1')==='no')riskFactors.push('الهاتف في السرير');
  if(getRat('dq_14')>=7)riskFactors.push('وحدة عالية');
  if(getRat('dq_15')>=7)riskFactors.push('ملل مرتفع');
  if(getRat('dq_13')>=7)riskFactors.push('حزن مرتفع');
  if(getRat('dq_12')>=7)riskFactors.push('توتر مرتفع');
  if(urge>=7)riskFactors.push('رغبة مرتفعة');
  if(getRat('dq_16')<=4&&getRat('dq_16')>0)riskFactors.push('نوم ضعيف');
  if(getYN('dq_4')==='no')riskFactors.push('إفراط في السوشيال');
  const gap=(answers['dq_19']?.short||'').trim();
  if(gap)riskFactors.push('ثغرة: '+gap);
  let recommendation='يومك كان متوازناً — حافظ على هذا النهج.';
  if(riskFactors[0]==='الهاتف دخل الحمام'||riskFactors[0]==='الهاتف في السرير')recommendation='قاعدة الغد: الهاتف خارج الغرفة قبل النوم.';
  else if(riskFactors[0]==='وحدة عالية')recommendation='غداً، خطط لتواصل بسيط مع شخص إيجابي.';
  else if(riskFactors[0]==='ملل مرتفع')recommendation='جهّز قائمة بدائل واضحة لوقت الفراغ غداً.';
  else if(riskFactors[0]==='رغبة مرتفعة')recommendation='غداً ابدأ بقاعدة: بيئة آمنة من اللحظة الأولى.';
  else if(riskLevel==='high'||riskLevel==='rescue')recommendation='يوم صعب — لكنك تجاوزته. غداً ابدأ بخطوة صغيرة واحدة فقط.';
  const tomorrowD=(answers['dq_20']?.short||'').trim();
  if(tomorrowD)recommendation=tomorrowD;
  return{protectionScore,bodyScore,moodRiskScore,urgeRiskScore,victoryScore,dailyProgressScore,
    riskLevel,mentalState,victories:victories.slice(0,6),riskFactors:riskFactors.slice(0,5),recommendation};
}

function renderDailyAssessmentQuestions(){
  const el=document.getElementById('dassess-questions-wrap');if(!el)return;
  const questions=loadDailyQuestions().filter(q=>q.active);
  const todayA=getDailyAssessment(today());
  const existing=todayA?.answers||{};
  const cats=[
    {id:'protection',label:'أسئلة الحماية',    icon:'fas fa-shield-alt',          color:'var(--blue)'},
    {id:'risk',      label:'أسئلة الخطر',       icon:'fas fa-exclamation-triangle', color:'var(--red)'},
    {id:'mood',      label:'الحالة النفسية',    icon:'fas fa-brain',               color:'#a78bfa'},
    {id:'body',      label:'الجسد والطاقة',     icon:'fas fa-heartbeat',           color:'var(--green)'},
    {id:'progress',  label:'التقدم والأهداف',   icon:'fas fa-chart-line',          color:'var(--blue)'},
    {id:'victory',   label:'الانتصارات',        icon:'fas fa-trophy',              color:'#fbbf24'},
  ];
  el.innerHTML=cats.map(cat=>{
    const catQs=questions.filter(q=>q.category===cat.id);if(!catQs.length)return'';
    return`<div class="dassess-cat">
      <div class="dassess-cat-hd" onclick="toggleAssessCategory('${cat.id}')" id="dcat-hd-${cat.id}">
        <div class="sec-t" style="margin-bottom:0;color:${cat.color}"><i class="${cat.icon}"></i>${cat.label}<span style="font-size:11px;color:var(--t3);font-weight:600;margin-right:8px">${catQs.length} سؤال</span></div>
        <i class="fas fa-chevron-down" id="dcat-chevron-${cat.id}" style="color:var(--t3);transition:transform .3s"></i>
      </div>
      <div class="dassess-cat-body" id="dcat-body-${cat.id}">${catQs.map(q=>buildAssessQItem(q,existing[q.id])).join('')}</div>
    </div>`;
  }).join('');
  const firstCat=cats.find(cat=>questions.some(q=>q.category===cat.id));
  if(firstCat)toggleAssessCategory(firstCat.id);
}

function toggleAssessCategory(catId){
  const body=document.getElementById('dcat-body-'+catId);
  const hd=document.getElementById('dcat-hd-'+catId);
  const ch=document.getElementById('dcat-chevron-'+catId);
  if(!body)return;
  const open=body.classList.contains('open');
  body.classList.toggle('open',!open);
  if(hd)hd.classList.toggle('open',!open);
  if(ch)ch.style.transform=open?'':'rotate(180deg)';
}

function buildAssessQItem(q,existingAns){
  const ans=existingAns||{};let inp='';
  if(q.answerType==='yesno'){
    const isY=ans.yesno==='yes',isN=ans.yesno==='no';
    inp=`<div class="dassess-yn-row"><button class="dassess-yn-btn${isY?' yn-yes':''}" onclick="dassessYN('${q.id}',this,'yes')">نعم ✓</button><button class="dassess-yn-btn${isN?' yn-no':''}" onclick="dassessYN('${q.id}',this,'no')">لا ✗</button></div>`;
  }
  if(q.answerType==='rating'){
    const v=ans.rating||5;
    inp=`<div class="slider-row"><input type="range" class="slider" min="1" max="10" value="${v}" id="dq_r_${q.id}" oninput="document.getElementById('dq_rv_${q.id}').textContent=this.value"><div class="slider-v" id="dq_rv_${q.id}">${v}</div></div>`;
  }
  if(q.answerType==='short'){inp=`<input class="fi" id="dq_s_${q.id}" value="${ans.short||''}" placeholder="اكتب إجابتك...">`;}
  return`<div class="dassess-qitem" data-dqid="${q.id}"><div class="dassess-q-title">${q.title}</div>${q.description?`<div class="dassess-q-desc">${q.description}</div>`:''}${inp}</div>`;
}

function dassessYN(qid,btn,val){
  const row=btn.closest('.dassess-yn-row');
  row.querySelectorAll('.dassess-yn-btn').forEach(b=>b.className='dassess-yn-btn');
  btn.classList.add(val==='yes'?'yn-yes':'yn-no');
}

function collectDailyAssessmentAnswers(){
  const answers={};
  loadDailyQuestions().filter(q=>q.active).forEach(q=>{
    const qid=q.id;const entry={};
    if(q.answerType==='yesno'){const btn=document.querySelector(`.dassess-qitem[data-dqid="${qid}"] .dassess-yn-btn.yn-yes, .dassess-qitem[data-dqid="${qid}"] .dassess-yn-btn.yn-no`);if(btn)entry.yesno=btn.classList.contains('yn-yes')?'yes':'no';}
    if(q.answerType==='rating'){const el=document.getElementById('dq_r_'+qid);if(el)entry.rating=parseInt(el.value);}
    if(q.answerType==='short'){const el=document.getElementById('dq_s_'+qid);if(el)entry.short=el.value.trim();}
    if(Object.keys(entry).length)answers[qid]=entry;
  });
  return answers;
}

function saveDailyAssessment(){
  const answers=collectDailyAssessmentAnswers();
  const questions=loadDailyQuestions();
  const scores=calculateDailyAssessmentScores(answers,questions);
  const now=new Date().toISOString();const ds=today();
  const all=load(K.dailyAssessments)||{};const existing=all[ds];
  all[ds]={date:ds,answers,scores:{protectionScore:scores.protectionScore,bodyScore:scores.bodyScore,
    moodRiskScore:scores.moodRiskScore,urgeRiskScore:scores.urgeRiskScore,
    victoryScore:scores.victoryScore,dailyProgressScore:scores.dailyProgressScore,
    riskLevel:scores.riskLevel,mentalState:scores.mentalState},
    victories:scores.victories,riskFactors:scores.riskFactors,recommendation:scores.recommendation,
    createdAt:existing?.createdAt||now,updatedAt:now};
  save(K.dailyAssessments,all);
  renderDailyAssessmentResult(scores);renderDashboardDailyAssessmentCard();renderAssessmentStats();
  toast('✅ تم حفظ تقييم اليوم','var(--green)');
}

function loadTodayAssessmentResult(){
  const a=getDailyAssessment(today());
  if(a&&a.scores)renderDailyAssessmentResult(a.scores);
  else{const el=document.getElementById('dassess-result-wrap');if(el)el.innerHTML='';}
}

function renderDailyAssessmentResult(scores){
  const el=document.getElementById('dassess-result-wrap');if(!el||!scores)return;
  const cls={low:'dassess-score-low',med:'dassess-score-med',high:'dassess-score-high',rescue:'dassess-score-rescue'}[scores.riskLevel]||'dassess-score-low';
  const rLabel={low:'منخفض',med:'متوسط',high:'عالٍ',rescue:'إنقاذ'}[scores.riskLevel]||'—';
  const rColor={low:'var(--green)',med:'var(--gold)',high:'var(--red)',rescue:'var(--red)'}[scores.riskLevel]||'var(--t1)';
  const pColor=scores.dailyProgressScore>=70?'var(--green)':scores.dailyProgressScore>=40?'var(--gold)':'var(--red)';
  const victoriesHtml=scores.victories&&scores.victories.length?`<div style="margin-top:12px"><div style="font-size:12px;color:var(--green);font-weight:800;margin-bottom:6px">🏆 انتصارات اليوم:</div>${scores.victories.map(v=>`<div class="dassess-victory-item"><span>✓</span>${v}</div>`).join('')}</div>`:'';
  const risksHtml=scores.riskFactors&&scores.riskFactors.length?`<div style="margin-top:10px"><div style="font-size:12px;color:var(--red);font-weight:800;margin-bottom:6px">⚠️ تستحق الانتباه:</div>${scores.riskFactors.map(r=>`<div class="dassess-risk-item"><span>←</span>${r}</div>`).join('')}</div>`:'';
  el.innerHTML=`<div class="dassess-score-card ${cls}">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <div style="flex:1"><div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:4px">نتيجة اليوم</div><div style="font-size:28px;font-weight:900;color:${pColor}">${scores.dailyProgressScore}%</div><div style="font-size:14px;font-weight:700;color:var(--t2)">${scores.mentalState}</div></div>
      <div style="text-align:center"><div style="font-size:11px;color:var(--t3);font-weight:700">مستوى الخطر</div><div style="font-size:20px;font-weight:900;color:${rColor}">${rLabel}</div></div>
    </div>
    <div class="dassess-scores-grid">
      <div class="dassess-score-item"><div class="dassess-score-label">الحماية</div><div class="dassess-score-val" style="color:var(--blue)">${scores.protectionScore}%</div></div>
      <div class="dassess-score-item"><div class="dassess-score-label">الجسد</div><div class="dassess-score-val" style="color:var(--green)">${scores.bodyScore}%</div></div>
      <div class="dassess-score-item"><div class="dassess-score-label">الانتصارات</div><div class="dassess-score-val" style="color:#fbbf24">${scores.victoryScore}%</div></div>
    </div>
    ${victoriesHtml}${risksHtml}
    <div style="background:rgba(255,255,255,.06);border-radius:10px;padding:12px 14px;font-size:13px;font-weight:700;color:var(--t1);line-height:1.8;margin-top:12px"><span style="color:#fbbf24">💡</span> ${scores.recommendation}</div>
  </div>`;
  el.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderDashboardDailyAssessmentCard(){
  const el=document.getElementById('dash-dassess-wrap');if(!el)return;
  const assess=getDailyAssessment(today());
  if(!assess){
    el.innerHTML=`<div style="background:var(--glass);border:1px solid rgba(79,142,247,.2);border-radius:16px;padding:16px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:var(--tr);margin-bottom:20px" onclick="go('tasks')"><i class="fas fa-clipboard-check" style="font-size:22px;color:var(--blue);flex-shrink:0"></i><div style="flex:1"><div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:2px">تقييم اليوم</div><div style="font-size:13px;font-weight:700;color:var(--t2)">لم تكمل تقييم اليوم بعد</div></div><span class="btn btn-ghost" style="font-size:12px;padding:7px 12px;flex-shrink:0"><i class="fas fa-pen"></i>ابدأ</span></div>`;
    return;
  }
  const s=assess.scores||{};
  const pColor=(s.dailyProgressScore||0)>=70?'var(--green)':(s.dailyProgressScore||0)>=40?'var(--gold)':'var(--red)';
  const rLabel={low:'منخفض',med:'متوسط',high:'عالٍ',rescue:'إنقاذ'}[s.riskLevel]||'—';
  const rColor={low:'var(--green)',med:'var(--gold)',high:'var(--red)',rescue:'var(--red)'}[s.riskLevel]||'var(--t1)';
  el.innerHTML=`<div style="background:linear-gradient(135deg,rgba(79,142,247,.09),rgba(67,217,141,.06));border:1px solid rgba(79,142,247,.2);border-radius:16px;padding:16px 20px;cursor:pointer;margin-bottom:20px" onclick="go('tasks')"><div style="display:flex;align-items:center;gap:14px;margin-bottom:${assess.recommendation?'10px':'0'}"><i class="fas fa-clipboard-check" style="font-size:22px;color:var(--blue);flex-shrink:0"></i><div style="flex:1"><div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:2px">تقييم اليوم</div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:20px;font-weight:900;color:${pColor}">${s.dailyProgressScore||0}%</span><span style="font-size:12px;color:${rColor};font-weight:700">خطر: ${rLabel}</span><span style="font-size:12px;color:var(--t2);font-weight:700">${s.mentalState||'—'}</span></div></div></div>${assess.recommendation?`<div style="font-size:12px;color:var(--t2);font-weight:700;background:rgba(255,255,255,.04);border-radius:8px;padding:8px 10px">💡 ${assess.recommendation}</div>`:''}</div>`;
}

function calculateRangeSummary(days){
  const entries=getAssessmentRange(days);if(!entries.length)return null;
  const n=entries.length;const commitRate=Math.round(n/days*100);
  const avg=f=>Math.round(entries.reduce((s,e)=>s+(e.scores?.[f]||0),0)/n);
  const avgProgress=avg('dailyProgressScore');const avgProtection=avg('protectionScore');const avgMoodRisk=avg('moodRiskScore');
  const totalVictories=entries.reduce((s,e)=>s+(e.victories?.length||0),0);
  const riskFreq={};entries.forEach(e=>{(e.riskFactors||[]).forEach(r=>{riskFreq[r]=(riskFreq[r]||0)+1;});});
  const topRisk=Object.entries(riskFreq).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
  const sorted=[...entries].sort((a,b)=>(b.scores?.dailyProgressScore||0)-(a.scores?.dailyProgressScore||0));
  return{completed:n,days,commitRate,avgProgress,avgProtection,avgMoodRisk,totalVictories,topRisk,bestDay:sorted[0]?.date||'—',hardestDay:sorted[sorted.length-1]?.date||'—'};
}
function calculateWeeklyAssessmentSummary(){return calculateRangeSummary(7);}
function calculateMonthlyAssessmentSummary(){return calculateRangeSummary(30);}

function renderAssessmentStats(){
  const el=document.getElementById('st-assessment-wrap');if(!el)return;
  const w=calculateWeeklyAssessmentSummary();const m=calculateMonthlyAssessmentSummary();
  if(!w&&!m){el.innerHTML='';return;}
  const pColor=s=>s>=70?'var(--green)':s>=40?'var(--gold)':'var(--red)';
  el.innerHTML=`<div class="card mb24"><div class="sec-t"><i class="fas fa-chart-line"></i>التقدم العام</div>
    ${w?`<div style="font-size:13px;font-weight:800;color:var(--blue);margin-bottom:12px"><i class="fas fa-calendar-week"></i> آخر 7 أيام — ${w.completed}/${w.days} تقييم</div>
    <div class="g3 mb12">
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px 8px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:4px">التقدم الأسبوعي</div><div style="font-size:22px;font-weight:900;color:${pColor(w.avgProgress)}">${w.avgProgress}%</div></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px 8px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:4px">متوسط الحماية</div><div style="font-size:22px;font-weight:900;color:var(--blue)">${w.avgProtection}%</div></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px 8px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:4px">الالتزام</div><div style="font-size:22px;font-weight:900;color:var(--green)">${w.commitRate}%</div></div>
    </div>
    <div class="g2 mb12">
      <div style="background:rgba(67,217,141,.07);border:1px solid rgba(67,217,141,.2);border-radius:10px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:3px">🏆 انتصارات</div><div style="font-size:18px;font-weight:900;color:var(--green)">${w.totalVictories}</div></div>
      <div style="background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2);border-radius:10px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:3px">⚠️ أكثر ثغرة</div><div style="font-size:12px;font-weight:800;color:var(--red)">${w.topRisk.slice(0,14)}</div></div>
    </div>
    ${w.bestDay!=='—'?`<div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:12px">🌟 أفضل يوم: ${w.bestDay} &nbsp;|&nbsp; 💪 أصعب يوم: ${w.hardestDay}</div>`:''}`:''}
    ${m&&m.completed>0?`<div class="divider" style="margin:0 0 14px"></div>
    <div style="font-size:13px;font-weight:800;color:#a78bfa;margin-bottom:12px"><i class="fas fa-calendar-alt"></i> آخر 30 يوم — ${m.completed}/${m.days} تقييم</div>
    <div class="g3">
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px 8px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:4px">التقدم الشهري</div><div style="font-size:22px;font-weight:900;color:${pColor(m.avgProgress)}">${m.avgProgress}%</div></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px 8px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:4px">الالتزام</div><div style="font-size:22px;font-weight:900;color:var(--green)">${m.commitRate}%</div></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px 8px;text-align:center"><div style="font-size:10px;color:var(--t3);font-weight:700;margin-bottom:4px">الانتصارات</div><div style="font-size:22px;font-weight:900;color:#fbbf24">${m.totalVictories}</div></div>
    </div>`:''}
    <button class="btn btn-ghost btn-full mt16" onclick="go('tasks')"><i class="fas fa-clipboard-check"></i>فتح تقييم اليوم</button>
  </div>`;
}

function toggleDailyQMgr(){
  const panel=document.getElementById('dqmgr-panel');const icon=document.getElementById('dqmgr-toggle-icon');const txt=document.getElementById('dqmgr-toggle-text');if(!panel)return;
  const vis=panel.style.display!=='none';panel.style.display=vis?'none':'block';
  if(icon)icon.className=vis?'fas fa-eye':'fas fa-eye-slash';if(txt)txt.textContent=vis?'عرض':'إخفاء';if(!vis)renderDailyQuestionManager();
}

function renderDailyQuestionManager(){
  const el=document.getElementById('dqmgr-list');if(!el)return;
  const qs=loadDailyQuestions();
  const tl={yesno:'نعم/لا',rating:'تقييم',short:'قصيرة'};
  const cl={protection:'حماية',risk:'خطر',mood:'مزاج',body:'جسد',progress:'تقدم',victory:'انتصار'};
  el.innerHTML=qs.map(q=>`
    <div class="dassess-qmgr-item${!q.active?' inactive':''}">
      <div style="flex:1"><div class="dassess-qmgr-text">${q.title}</div><div class="dassess-qmgr-meta">${tl[q.answerType]||q.answerType} · ${cl[q.category]||q.category} · وزن:${q.weight||1} · ${q.active?'نشط':'معطّل'}</div></div>
      <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="toggleDailyQuestion('${q.id}')"><i class="fas ${q.active?'fa-toggle-on':'fa-toggle-off'}"></i></button>
      <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="editDailyQuestion('${q.id}')"><i class="fas fa-pencil-alt"></i></button>
      <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px;color:var(--red)" onclick="deleteDailyQuestion('${q.id}')"><i class="fas fa-trash-alt"></i></button>
    </div>`).join('');
}

function addDailyQuestion(){
  const textEl=document.getElementById('ndq-text');const text=(textEl?.value||'').trim();if(!text){toast('اكتب نص السؤال أولاً','var(--gold)');return;}
  const desc=document.getElementById('ndq-desc')?.value.trim()||'';const type=document.getElementById('ndq-type')?.value||'yesno';
  const category=document.getElementById('ndq-category')?.value||'protection';const positive=document.getElementById('ndq-positive')?.value||'yes';
  const weight=parseInt(document.getElementById('ndq-weight')?.value)||1;
  const qs=loadDailyQuestions();
  qs.push({id:'dq_c_'+Date.now(),title:text,description:desc,category,answerType:type,positiveAnswer:positive==='null'?null:positive,weight,active:true});
  saveDailyQuestions(qs);if(textEl)textEl.value='';renderDailyQuestionManager();renderDailyAssessmentQuestions();toast('✅ تمت إضافة السؤال','var(--green)');
}

function editDailyQuestion(id){
  const qs=loadDailyQuestions();const q=qs.find(x=>x.id===id);if(!q)return;
  const t=prompt('تعديل نص السؤال:',q.title);if(t===null)return;q.title=t.trim()||q.title;saveDailyQuestions(qs);renderDailyQuestionManager();renderDailyAssessmentQuestions();toast('✅ تم تعديل السؤال','var(--green)');
}

function deleteDailyQuestion(id){
  if(!confirm('حذف السؤال؟'))return;saveDailyQuestions(loadDailyQuestions().filter(q=>q.id!==id));renderDailyQuestionManager();renderDailyAssessmentQuestions();toast('تم حذف السؤال','var(--t3)');
}

function toggleDailyQuestion(id){
  const qs=loadDailyQuestions();const q=qs.find(x=>x.id===id);if(!q)return;q.active=!q.active;saveDailyQuestions(qs);renderDailyQuestionManager();renderDailyAssessmentQuestions();toast(q.active?'✅ تم تفعيل السؤال':'تم تعطيل السؤال',q.active?'var(--green)':'var(--t3)');
}

function importDailyAssessmentIntoMemoir(){
  const assess=getDailyAssessment(today());if(!assess){toast('لم تحفظ تقييم اليوم بعد','var(--gold)');return;}
  const s=assess.scores||{};const rLabel={low:'منخفض',med:'متوسط',high:'عالٍ',rescue:'إنقاذ'}[s.riskLevel]||'—';
  const lines=['تقييم اليوم:',`- التقدم: ${s.dailyProgressScore||0}%  |  مستوى الخطر: ${rLabel}`,`- الحالة النفسية: ${s.mentalState||'—'}`,`- الحماية: ${s.protectionScore||0}%  |  الجسد: ${s.bodyScore||0}%`,(assess.riskFactors||[]).length?`- عوامل الخطر: ${assess.riskFactors.join('، ')}`:'', (assess.victories||[]).length?`- الانتصارات: ${assess.victories.slice(0,3).join('، ')}`:'',assess.recommendation?`- التوصية: ${assess.recommendation}`:'' ].filter(Boolean).join('\n');
  const el=document.getElementById('memo-summary');
  if(el){el.value=el.value.trim()?el.value.trim()+'\n\n'+lines:lines;el.focus();toast('✅ تم استيراد تقييم اليوم إلى الملخص','var(--green)');}
}
