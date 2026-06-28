const DEF_MEMOIR_QUESTIONS=[
  {id:'mq_1', text:'هل بقي الهاتف خارج السرير؟',                         type:'yesno', category:'protection',required:false,active:true},
  {id:'mq_2', text:'هل دخل الهاتف إلى الحمام؟',                          type:'yesno', category:'risk',      required:false,active:true},
  {id:'mq_3', text:'هل استخدمت السوشيال ميديا بعد منتصف الليل؟',         type:'yesno', category:'risk',      required:false,active:true},
  {id:'mq_4', text:'هل شعرت بالوحدة اليوم؟',                             type:'yesno', category:'mood',      required:false,active:true},
  {id:'mq_5', text:'هل بقيت وحدك مع الهاتف وقت الضعف؟',                 type:'yesno', category:'risk',      required:false,active:true},
  {id:'mq_6', text:'هل استخدمت زر الطوارئ عند ظهور الرغبة؟',            type:'yesno', category:'protection',required:false,active:true},
  {id:'mq_7', text:'هل التزمت بقاعدة واحدة على الأقل من قوانينك؟',       type:'yesno', category:'protection',required:false,active:true},
  {id:'mq_8', text:'هل كتبت سبباً للتعافي اليوم؟',                       type:'yesno', category:'reflection',required:false,active:true},
  {id:'mq_9', text:'مستوى الرغبة الأعلى اليوم؟',                         type:'rating',category:'risk',      required:false,active:true},
  {id:'mq_10',text:'مستوى التوتر اليوم؟',                                type:'rating',category:'mood',      required:false,active:true},
  {id:'mq_11',text:'مستوى الحزن اليوم؟',                                 type:'rating',category:'mood',      required:false,active:true},
  {id:'mq_12',text:'مستوى الوحدة اليوم؟',                                type:'rating',category:'mood',      required:false,active:true},
  {id:'mq_13',text:'مستوى الملل اليوم؟',                                 type:'rating',category:'mood',      required:false,active:true},
  {id:'mq_14',text:'مستوى الطاقة اليوم؟',                                type:'rating',category:'mood',      required:false,active:true},
  {id:'mq_15',text:'جودة النوم؟',                                         type:'rating',category:'protection',required:false,active:true},
  {id:'mq_16',text:'قوة الالتزام اليوم؟',                                type:'rating',category:'protection',required:false,active:true},
  {id:'mq_17',text:'ما أقوى محفز ظهر اليوم؟',                            type:'short', category:'risk',      required:false,active:true},
  {id:'mq_18',text:'ما أخطر وقت مر عليك؟',                              type:'short', category:'risk',      required:false,active:true},
  {id:'mq_19',text:'أين كنت عندما ظهرت الرغبة؟',                        type:'short', category:'risk',      required:false,active:true},
  {id:'mq_20',text:'ما الفكرة التي سبقت الرغبة؟',                        type:'short', category:'reflection',required:false,active:true},
  {id:'mq_21',text:'ما أفضل تصرف ساعدك اليوم؟',                         type:'short', category:'protection',required:false,active:true},
  {id:'mq_22',text:'ما الثغرة التي يجب إغلاقها غداً؟',                   type:'short', category:'reflection',required:false,active:true},
  {id:'mq_23',text:'ما قرارك الصغير للغد؟',                              type:'short', category:'reflection',required:false,active:true},
  {id:'mq_24',text:'ماذا تعلمت عن نفسك اليوم؟',                         type:'long',  category:'reflection',required:false,active:true},
  {id:'mq_25',text:'ما الشعور الحقيقي الذي كان خلف الرغبة؟',            type:'long',  category:'reflection',required:false,active:true},
  {id:'mq_26',text:'كيف تريد أن تتصرف لو تكرر نفس الموقف غداً؟',        type:'long',  category:'reflection',required:false,active:true},
];

const MQ_ROLES={
  URGE_LEVEL:'mq_9',STRESS:'mq_10',SADNESS:'mq_11',
  LONELINESS:'mq_12',BOREDOM:'mq_13',SLEEP:'mq_15',
  PHONE_BED:'mq_1',PHONE_BATH:'mq_2',SOCIAL_MID:'mq_3',
  ALONE_PHONE:'mq_5',USED_SOS:'mq_6',
};

function loadMemoirQuestions(){const q=load(K.memoirQuestions);return(q&&q.length)?q:DEF_MEMOIR_QUESTIONS;}
function saveMemoirQuestions(questions){save(K.memoirQuestions,questions);}

function analyzeMemoirLocally(entry){
  const ans=entry.answers||{};let score=0;const factors=[];
  const getYN=id=>ans[id];
  const getRat=id=>{const v=parseInt(ans[id]);return isNaN(v)?0:v;};
  const urge=getRat(MQ_ROLES.URGE_LEVEL);const str=getRat(MQ_ROLES.STRESS);const sad=getRat(MQ_ROLES.SADNESS);
  const lone=getRat(MQ_ROLES.LONELINESS);const bored=getRat(MQ_ROLES.BOREDOM);const sleep=getRat(MQ_ROLES.SLEEP);
  if(urge>=8){score+=20;factors.push('رغبة مرتفعة جداً');}else if(urge>=5)score+=10;
  if(str>=8){score+=12;factors.push('توتر مرتفع');}else if(str>=6)score+=6;
  if(sad>=8){score+=10;factors.push('حزن مرتفع');}else if(sad>=6)score+=5;
  if(lone>=8){score+=12;factors.push('وحدة شديدة');}else if(lone>=6)score+=6;
  if(bored>=8){score+=10;factors.push('ملل مرتفع');}else if(bored>=6)score+=5;
  if(sleep>0&&sleep<=4){score+=12;factors.push('جودة نوم ضعيفة');}
  if(getYN(MQ_ROLES.PHONE_BATH)==='yes'){score+=18;factors.push('الهاتف دخل الحمام');}
  if(getYN(MQ_ROLES.PHONE_BED)==='no'){score+=15;factors.push('الهاتف في السرير');}
  if(getYN(MQ_ROLES.SOCIAL_MID)==='yes'){score+=15;factors.push('سوشيال بعد منتصف الليل');}
  if(getYN(MQ_ROLES.ALONE_PHONE)==='yes'){score+=20;factors.push('وحدة مع الهاتف وقت الضعف');}
  if(urge>=5&&getYN(MQ_ROLES.USED_SOS)==='no'){score+=10;factors.push('لم يُستخدم زر الطوارئ رغم الرغبة');}
  score=Math.min(score,100);
  let riskLevel,riskLabel,riskColor,riskIco;
  if(score<=30){riskLevel='low';riskLabel='منخفض';riskColor='var(--green)';riskIco='🟢';}
  else if(score<=60){riskLevel='med';riskLabel='متوسط';riskColor='var(--gold)';riskIco='🟡';}
  else if(score<=80){riskLevel='high';riskLabel='عالٍ';riskColor='var(--red)';riskIco='🔴';}
  else{riskLevel='rescue';riskLabel='إنقاذ';riskColor='var(--red)';riskIco='🆘';}
  let rec='استمر على هذا النهج — يومك كان متوازناً.';
  const tf=factors[0]||'';
  if(tf==='الهاتف دخل الحمام'||tf==='الهاتف في السرير')rec='قاعدة الغد: لا هاتف في السرير ولا الحمام.';
  else if(tf==='وحدة شديدة'||tf==='وحدة مع الهاتف وقت الضعف')rec='غداً، لا تبقَ وحدك في وقت الخطر. خطط لتواصل بسيط.';
  else if(tf==='ملل مرتفع')rec='جهّز قائمة بدائل قبل وقت الفراغ غداً.';
  else if(tf==='سوشيال بعد منتصف الليل')rec='غداً، اجعل الهاتف خارج الغرفة قبل الساعة 10:30.';
  else if(score>60)rec='يوم صعب — لكنك لا تزال هنا. غداً ابدأ بقاعدة واحدة صغيرة وثابر عليها.';
  const fu=[];
  if(factors.includes('رغبة مرتفعة جداً')){fu.push('ما أول لحظة بدأت فيها تفقد السيطرة؟');fu.push('هل كانت الرغبة جسدية أم هروباً من شعور؟');}
  if(factors.includes('وحدة شديدة')||factors.includes('وحدة مع الهاتف وقت الضعف'))fu.push('ما الشعور الحقيقي تحت الرغبة؟');
  if(factors.length>0){fu.push('ما القاعدة التي كُسرت قبل الخطر؟');fu.push('ما إجراء واحد يمنع تكرار نفس السيناريو غداً؟');}
  if(riskLevel==='rescue'||riskLevel==='high')fu.push('هل تحتاج وضع حماية عادي أم حماية عالية؟');
  fu.push('ما البديل الذي كان ممكناً في تلك اللحظة؟');
  const tp=[];
  if(factors.includes('الهاتف دخل الحمام')||factors.includes('الهاتف في السرير'))tp.push('ضع الهاتف في غرفة أخرى قبل النوم');
  if(factors.includes('سوشيال بعد منتصف الليل'))tp.push('اضبط تنبيهاً للنوم الساعة 10:30 مساءً');
  if(factors.includes('وحدة شديدة')||factors.includes('وحدة مع الهاتف وقت الضعف'))tp.push('تواصل مع شخص إيجابي واحد خلال النهار');
  if(factors.includes('ملل مرتفع'))tp.push('اكتب 3 أنشطة بديلة قبل وقت الفراغ المعتاد');
  if(tp.length===0){tp.push('حافظ على نفس النهج الإيجابي');tp.push('راجع قوانينك في الصباح');}
  return{riskScore:score,riskLevel,riskLabel,riskColor,riskIco,topRiskFactors:factors,recommendation:rec,followUpQuestions:fu.slice(0,5),tomorrowPlan:tp};
}

let _memoirCurrentId=null;

function saveMemoirEntry(){
  const title=(document.getElementById('memo-title')?.value||'').trim();
  const body=(document.getElementById('memo-body')?.value||'').trim();
  const summary=(document.getElementById('memo-summary')?.value||'').trim();
  if(!body&&!title){toast('اكتب شيئاً في المذكرة أولاً','var(--gold)');return;}
  const answers=collectMemoirAnswers();
  const memoirs=load(K.memoirs)||[];const now=new Date().toISOString();const todayStr=today();
  let entry=null;
  if(_memoirCurrentId){
    const idx=memoirs.findIndex(m=>m.id===_memoirCurrentId);
    if(idx>=0){entry=memoirs[idx];entry.title=title;entry.body=body;entry.summary=summary;entry.answers=answers;entry.updatedAt=now;}
    else{_memoirCurrentId=null;}
  }
  if(!_memoirCurrentId){
    entry={id:'m_'+Date.now(),date:todayStr,title:title||'مذكرة '+todayStr,body,summary,answers,localAnalysis:null,createdAt:now,updatedAt:now};
    if(!window._memoirNewMode){const ti=memoirs.findIndex(m=>m.date===todayStr);if(ti>=0)memoirs.splice(ti,1);}
    memoirs.unshift(entry);_memoirCurrentId=entry.id;
  }
  entry.localAnalysis=analyzeMemoirLocally(entry);
  save(K.memoirs,memoirs);window._memoirNewMode=false;
  renderMemoirAnalysisResult(entry.localAnalysis);renderMemoirArchive();renderDashboardMemoirCard();renderMemoirStats();
  toast('✅ تم حفظ المذكرة','var(--green)');
}

function startNewMemoir(){
  _memoirCurrentId=null;window._memoirNewMode=true;
  document.getElementById('memo-title').value='';document.getElementById('memo-body').value='';document.getElementById('memo-summary').value='';
  const ar=document.getElementById('memoir-analysis-result');if(ar)ar.style.display='none';
  renderMemoirQuestions();toast('صفحة جديدة — اكتب مذكرتك','var(--blue)');
}

function loadTodayMemoirToForm(){
  if(_memoirCurrentId)return;
  const memoirs=load(K.memoirs)||[];const te=memoirs.find(m=>m.date===today());if(!te)return;
  _memoirCurrentId=te.id;
  document.getElementById('memo-title').value=te.title||'';
  document.getElementById('memo-body').value=te.body||'';
  document.getElementById('memo-summary').value=te.summary||'';
  if(te.localAnalysis)renderMemoirAnalysisResult(te.localAnalysis);
  renderMemoirQuestionsWithAnswers(te.answers||{});
}

function renderMemoirQuestions(){renderMemoirQuestionsWithAnswers({});}

function renderMemoirQuestionsWithAnswers(existing){
  const el=document.getElementById('memoir-questions-list');if(!el)return;
  const qs=loadMemoirQuestions().filter(q=>q.active);
  if(!qs.length){el.innerHTML='<p class="tm" style="text-align:center;padding:24px;font-size:14px">لا توجد أسئلة نشطة.</p>';return;}
  el.innerHTML=qs.map(q=>`
    <div class="memoir-qitem" data-qid="${q.id}">
      <div class="memoir-q-header">
        <span class="memoir-q-type">${getQTypeLabel(q.type)}</span>
        <div style="flex:1">
          <div class="memoir-q-text">${q.text}</div>
          <div class="memoir-q-cat" style="color:${getQCatColor(q.category)}">${getQCatLabel(q.category)}</div>
        </div>
      </div>
      <div class="memoir-answer-block">${buildAnswerInput(q,existing[q.id])}</div>
    </div>`).join('');
}

function getQTypeLabel(t){return{yesno:'نعم/لا',rating:'تقييم',short:'قصيرة',long:'أطول'}[t]||t;}
function getQCatLabel(c){return{risk:'خطر',mood:'مزاج',protection:'حماية',reflection:'تأمل'}[c]||c;}
function getQCatColor(c){return{risk:'var(--red)',mood:'var(--purple)',protection:'var(--green)',reflection:'var(--blue)'}[c]||'var(--t3)';}

function buildAnswerInput(q,ev){
  const qid=q.id;
  if(q.type==='yesno')return`<div class="memoir-yesno-row"><button class="memoir-yn-btn${ev==='yes'?' sel-yes':''}" onclick="memoirYN('${qid}',this,'yes')">نعم ✓</button><button class="memoir-yn-btn${ev==='no'?' sel-no':''}" onclick="memoirYN('${qid}',this,'no')">لا ✗</button></div>`;
  if(q.type==='rating'){const v=ev||5;return`<div class="slider-row"><input type="range" class="slider" min="1" max="10" value="${v}" id="mq_r_${qid}" oninput="document.getElementById('mq_rv_${qid}').textContent=this.value"><div class="slider-v" id="mq_rv_${qid}">${v}</div></div>`;}
  if(q.type==='short')return`<input class="fi" id="mq_s_${qid}" value="${ev||''}" placeholder="اكتب إجابتك...">`;
  if(q.type==='long')return`<textarea class="ft" id="mq_l_${qid}" rows="2" placeholder="اكتب بتفصيل أكثر...">${ev||''}</textarea>`;
  return'';
}

function memoirYN(qid,btn,val){
  const row=btn.closest('.memoir-yesno-row');row.querySelectorAll('.memoir-yn-btn').forEach(b=>{b.className='memoir-yn-btn';});btn.classList.add(val==='yes'?'sel-yes':'sel-no');
}

function collectMemoirAnswers(){
  const answers={};
  loadMemoirQuestions().filter(q=>q.active).forEach(q=>{
    const qid=q.id;
    if(q.type==='yesno'){const b=document.querySelector(`.memoir-qitem[data-qid="${qid}"] .memoir-yn-btn.sel-yes,.memoir-qitem[data-qid="${qid}"] .memoir-yn-btn.sel-no`);if(b)answers[qid]=b.classList.contains('sel-yes')?'yes':'no';}
    else if(q.type==='rating'){const e=document.getElementById(`mq_r_${qid}`);if(e)answers[qid]=parseInt(e.value);}
    else if(q.type==='short'){const e=document.getElementById(`mq_s_${qid}`);if(e)answers[qid]=e.value.trim();}
    else if(q.type==='long'){const e=document.getElementById(`mq_l_${qid}`);if(e)answers[qid]=e.value.trim();}
  });
  return answers;
}

function renderMemoirAnalysisResult(a){
  const el=document.getElementById('memoir-analysis-result');if(!el||!a)return;
  el.style.display='block';
  const lvlCls={low:'memoir-analysis-low',med:'memoir-analysis-med',high:'memoir-analysis-high',rescue:'memoir-analysis-rescue'}[a.riskLevel]||'memoir-analysis-low';
  const factorsHtml=(a.topRiskFactors&&a.topRiskFactors.length)?`<div style="margin:12px 0"><div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:8px">أبرز عوامل الخطر:</div>${a.topRiskFactors.slice(0,4).map(f=>`<span style="display:inline-block;background:rgba(248,113,113,.10);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:3px 10px;font-size:12px;font-weight:700;color:var(--red);margin:3px">${f}</span>`).join('')}</div>`:'';
  const planHtml=(a.tomorrowPlan&&a.tomorrowPlan.length)?`<div style="margin-top:14px"><div style="font-size:12px;color:var(--blue);font-weight:800;margin-bottom:8px">خطة الغد:</div>${a.tomorrowPlan.map(p=>`<div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--t1);padding:5px 0"><span style="color:var(--blue)">←</span>${p}</div>`).join('')}</div>`:'';
  const followHtml=(a.followUpQuestions&&a.followUpQuestions.length)?`<div style="margin-top:14px;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:12px;padding:14px"><div style="font-size:12px;color:var(--purple);font-weight:800;margin-bottom:10px">أسئلة متابعة للتأمل:</div>${a.followUpQuestions.map((q,i)=>`<div style="font-size:13px;font-weight:700;color:var(--t2);padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05)">${i+1}. ${q}</div>`).join('')}</div>`:'';
  el.innerHTML=`
    <div class="memoir-analysis-card ${lvlCls}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <span style="font-size:32px">${a.riskIco}</span>
        <div>
          <div style="font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:${a.riskColor}">مستوى الخطر: ${a.riskLabel}</div>
          <div style="font-size:24px;font-weight:900;color:${a.riskColor}">${a.riskScore} / 100</div>
        </div>
      </div>
      ${factorsHtml}
      <div style="background:rgba(255,255,255,.05);border-radius:10px;padding:12px 14px;font-size:13px;font-weight:700;color:var(--t1);line-height:1.8;margin:12px 0"><span style="color:var(--gold)">💡</span> ${a.recommendation}</div>
      ${planHtml}${followHtml}
      <div class="divider" style="margin:16px 0"></div>
      <button class="btn btn-ghost btn-full" onclick="copyMemoirForChatGPT()"><i class="fas fa-copy"></i>نسخ المذكرة لتحليلها مع ChatGPT</button>
    </div>`;
}

function copyMemoirForChatGPT(){
  const memoirs=load(K.memoirs)||[];
  const entry=_memoirCurrentId?memoirs.find(m=>m.id===_memoirCurrentId):memoirs[0];
  if(!entry){toast('لا توجد مذكرة محفوظة','var(--gold)');return;}
  const qMap={};loadMemoirQuestions().forEach(q=>{qMap[q.id]=q;});
  const answersText=Object.entries(entry.answers||{}).map(([id,val])=>{const q=qMap[id];if(!q)return'';const vs=typeof val==='number'?`${val}/10`:(val==='yes'?'نعم':val==='no'?'لا':(val||'—'));return`- ${q.text}: ${vs}`;}).filter(Boolean).join('\n');
  const a=entry.localAnalysis||{};
  const aText=a.riskScore!==undefined?`\n📊 التحليل المحلي:\n- مستوى الخطر: ${a.riskLabel} (${a.riskScore}/100)\n- أبرز عوامل الخطر: ${(a.topRiskFactors||[]).join('، ')}\n- التوصية: ${a.recommendation}`:'';
  const dayAssess=(typeof getDailyAssessment==='function')?getDailyAssessment(entry.date):null;
  const assessText=dayAssess?`\n\n📋 تقييم اليوم التقدمي:\n- التقدم: ${dayAssess.scores?.dailyProgressScore||0}%\n- الحالة النفسية: ${dayAssess.scores?.mentalState||'—'}\n- مستوى الخطر: ${{low:'منخفض',med:'متوسط',high:'عالٍ',rescue:'إنقاذ'}[dayAssess.scores?.riskLevel]||'—'}\n- الانتصارات: ${(dayAssess.victories||[]).join('، ')||'—'}\n- عوامل الخطر: ${(dayAssess.riskFactors||[]).join('، ')||'—'}\n- التوصية: ${dayAssess.recommendation||'—'}`:'';
  const text=`حلّل مذكرتي اليومية للتعافي.\n\n📅 التاريخ: ${entry.date}\n📝 العنوان: ${entry.title}\n\n📖 المذكرة:\n${entry.body}\n\n📋 الملخص:\n${entry.summary}\n\n❓ إجابات أسئلة اليوم:\n${answersText}${aText}${assessText}\n\nأريد منك:\n1. تقييم مستوى الخطر.\n2. تحديد أقوى المحفزات.\n3. توليد 5 أسئلة إضافية لفهم حالتي.\n4. اقتراح خطة حماية للـ 24 ساعة القادمة.\n5. اقتراح قاعدة واحدة للغد.\n6. الرد بلغة داعمة بدون جلد ذات.`;
  const fallback=()=>{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('تم نسخ المذكرة — أرسلها إلى ChatGPT للتحليل','var(--purple)');};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>toast('تم نسخ المذكرة — أرسلها إلى ChatGPT للتحليل','var(--purple)')).catch(fallback);
  else fallback();
}

function renderMemoirArchive(){
  const el=document.getElementById('memoir-archive');if(!el)return;
  const memoirs=(load(K.memoirs)||[]).slice(0,10);
  if(!memoirs.length){el.innerHTML='<p class="tm" style="text-align:center;padding:24px;font-size:14px">لم تكتب أي مذكرات بعد.</p>';return;}
  el.innerHTML=memoirs.map(m=>{
    const a=m.localAnalysis||{};
    const pillCls={low:'memoir-risk-low',med:'memoir-risk-med',high:'memoir-risk-high',rescue:'memoir-risk-rescue'}[a.riskLevel]||'';
    const pill=a.riskLabel?`<span class="memoir-risk-pill ${pillCls}">${a.riskIco||''} ${a.riskLabel}</span>`:'';
    return`
      <div class="memoir-archive-card">
        <div class="fb" style="margin-bottom:8px">
          <div><div style="font-size:12px;color:var(--blue);font-weight:700">${m.date}</div><div style="font-size:15px;font-weight:800;margin-top:2px">${m.title||'مذكرة'}</div></div>${pill}
        </div>
        ${m.summary?`<p style="font-size:13px;color:var(--t2);line-height:1.7;margin-bottom:12px">${m.summary}</p>`:''}
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost" style="padding:7px 14px;font-size:13px;flex:1" onclick="viewMemoir('${m.id}')"><i class="fas fa-eye"></i>عرض</button>
          <button class="btn btn-red" style="padding:7px 14px;font-size:13px" onclick="deleteMemoir('${m.id}')"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>`;
  }).join('');
}

function viewMemoir(id){
  const memoirs=load(K.memoirs)||[];const m=memoirs.find(x=>x.id===id);if(!m)return;
  const qMap={};loadMemoirQuestions().forEach(q=>{qMap[q.id]=q;});
  const answersHtml=Object.entries(m.answers||{}).map(([qid,val])=>{const q=qMap[qid];if(!q)return'';const vs=typeof val==='number'?`${val}/10`:(val==='yes'?'نعم ✓':val==='no'?'لا ✗':(val||'—'));return`<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)"><div style="font-size:12px;color:${getQCatColor(q.category)};font-weight:700;margin-bottom:2px">${q.text}</div><div style="font-size:14px;font-weight:700;color:var(--t1)">${vs}</div></div>`;}).filter(Boolean).join('');
  const a=m.localAnalysis||{};
  const analysisHtml=a.riskScore!==undefined?`<div style="margin-top:20px;background:rgba(255,255,255,.04);border-radius:14px;padding:16px"><div style="font-size:13px;font-weight:800;color:var(--t2);margin-bottom:10px"><i class="fas fa-brain" style="color:var(--blue)"></i> التحليل المحلي</div><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:24px">${a.riskIco||'🔵'}</span><div><div style="font-size:11px;color:var(--t3);font-weight:700">مستوى الخطر</div><div style="font-size:17px;font-weight:900;color:${a.riskColor}">${a.riskLabel} — ${a.riskScore}/100</div></div></div>${(a.topRiskFactors||[]).length?`<div style="font-size:13px;color:var(--t2);font-weight:700;margin-bottom:4px">العوامل: ${a.topRiskFactors.join('، ')}</div>`:''}<div style="font-size:13px;font-weight:700;color:var(--t1);background:rgba(255,255,255,.04);border-radius:8px;padding:10px;margin-top:8px">💡 ${a.recommendation||''}</div></div>`:'';
  const followHtml=(a.followUpQuestions||[]).length?`<div style="margin-top:14px;background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.15);border-radius:12px;padding:14px"><div style="font-size:12px;color:var(--purple);font-weight:800;margin-bottom:8px">أسئلة متابعة:</div>${a.followUpQuestions.map((q,i)=>`<div style="font-size:13px;font-weight:700;color:var(--t2);padding:4px 0">${i+1}. ${q}</div>`).join('')}</div>`:'';
  document.getElementById('memoir-view-content').innerHTML=`
    <div style="font-size:12px;color:var(--blue);font-weight:700;margin-bottom:4px">${m.date}</div>
    <h2 style="font-size:20px;font-weight:900;margin-bottom:16px">${m.title||'مذكرة'}</h2>
    ${m.body?`<div style="background:rgba(255,255,255,.04);border-right:3px solid var(--blue);border-radius:0 12px 12px 0;padding:16px;font-size:14px;font-weight:600;color:var(--t1);line-height:1.9;margin-bottom:14px">${m.body.replace(/\n/g,'<br>')}</div>`:''}
    ${m.summary?`<div style="background:rgba(79,142,247,.08);border-radius:10px;padding:12px 14px;font-size:13px;font-weight:700;color:var(--blue);margin-bottom:16px">الملخص: ${m.summary}</div>`:''}
    ${answersHtml?`<div style="margin-top:16px"><div style="font-size:13px;font-weight:800;color:var(--t2);margin-bottom:10px"><i class="fas fa-clipboard-list" style="color:var(--blue)"></i> إجابات الأسئلة</div>${answersHtml}</div>`:''}
    ${analysisHtml}${followHtml}
    <div class="mt16"><button class="btn btn-ghost btn-full" onclick="copyMemoirForChatGPT()"><i class="fas fa-copy"></i>نسخ للتحليل مع ChatGPT</button></div>`;
  _memoirCurrentId=id;
  document.getElementById('memoir-view-overlay').classList.add('open');
}

function closeMemoirView(){document.getElementById('memoir-view-overlay').classList.remove('open');}

function deleteMemoir(id){
  if(!confirm('هل تريد حذف هذه المذكرة؟'))return;
  const memoirs=(load(K.memoirs)||[]).filter(m=>m.id!==id);
  save(K.memoirs,memoirs);if(_memoirCurrentId===id)_memoirCurrentId=null;
  renderMemoirArchive();renderDashboardMemoirCard();renderMemoirStats();
  toast('تم حذف المذكرة','var(--t3)');
}

function toggleQMgr(){
  const panel=document.getElementById('qmgr-panel');const icon=document.getElementById('qmgr-toggle-icon');const text=document.getElementById('qmgr-toggle-text');if(!panel)return;
  const vis=panel.style.display!=='none';panel.style.display=vis?'none':'block';
  if(icon)icon.className=vis?'fas fa-eye':'fas fa-eye-slash';if(text)text.textContent=vis?'عرض':'إخفاء';if(!vis)renderQuestionManager();
}

function renderQuestionManager(){
  const el=document.getElementById('qmgr-list');if(!el)return;
  const qs=loadMemoirQuestions();
  if(!qs.length){el.innerHTML='<p class="tm" style="text-align:center;padding:16px">لا توجد أسئلة.</p>';return;}
  el.innerHTML=qs.map(q=>`
    <div class="memoir-qmgr-item${!q.active?' inactive':''}">
      <div style="flex:1"><div class="memoir-qmgr-text">${q.text}</div><div class="memoir-qmgr-meta">${getQTypeLabel(q.type)} · ${getQCatLabel(q.category)} · ${q.active?'نشط':'معطّل'}</div></div>
      <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="toggleMemoirQuestion('${q.id}')"><i class="fas ${q.active?'fa-toggle-on':'fa-toggle-off'}"></i></button>
      <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="editMemoirQuestion('${q.id}')"><i class="fas fa-pencil-alt"></i></button>
      <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px;color:var(--red)" onclick="deleteMemoirQuestion('${q.id}')"><i class="fas fa-trash-alt"></i></button>
    </div>`).join('');
}

function addMemoirQuestion(){
  const textEl=document.getElementById('nq-text');const text=(textEl?.value||'').trim();if(!text){toast('اكتب نص السؤال أولاً','var(--gold)');return;}
  const type=document.getElementById('nq-type')?.value||'yesno';const category=document.getElementById('nq-category')?.value||'reflection';
  const qs=loadMemoirQuestions();qs.push({id:'mq_c_'+Date.now(),text,type,category,required:false,active:true});
  saveMemoirQuestions(qs);if(textEl)textEl.value='';renderQuestionManager();renderMemoirQuestions();toast('✅ تمت إضافة السؤال','var(--green)');
}

function editMemoirQuestion(id){
  const qs=loadMemoirQuestions();const q=qs.find(x=>x.id===id);if(!q)return;
  const nt=prompt('تعديل نص السؤال:',q.text);if(nt===null)return;q.text=nt.trim()||q.text;saveMemoirQuestions(qs);renderQuestionManager();renderMemoirQuestions();toast('✅ تم تعديل السؤال','var(--green)');
}

function deleteMemoirQuestion(id){
  if(!confirm('حذف السؤال؟ لن يؤثر هذا على الإجابات القديمة.'))return;
  saveMemoirQuestions(loadMemoirQuestions().filter(q=>q.id!==id));renderQuestionManager();renderMemoirQuestions();toast('تم حذف السؤال','var(--t3)');
}

function toggleMemoirQuestion(id){
  const qs=loadMemoirQuestions();const q=qs.find(x=>x.id===id);if(!q)return;q.active=!q.active;saveMemoirQuestions(qs);renderQuestionManager();renderMemoirQuestions();toast(q.active?'✅ تم تفعيل السؤال':'تم تعطيل السؤال',q.active?'var(--green)':'var(--t3)');
}

function renderDashboardMemoirCard(){
  const el=document.getElementById('dash-memoir-wrap');if(!el)return;
  const memoirs=load(K.memoirs)||[];const tm=memoirs.find(m=>m.date===today());
  if(!tm){
    el.innerHTML=`<div style="background:var(--glass);border:1px solid rgba(167,139,250,.2);border-radius:16px;padding:16px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:var(--tr);margin-bottom:24px" onclick="go('memoirs')"><i class="fas fa-feather-alt" style="font-size:22px;color:var(--purple);flex-shrink:0"></i><div style="flex:1"><div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:2px">مذكرة اليوم</div><div style="font-size:13px;font-weight:700;color:var(--t2)">لم تكتب مذكرة اليوم بعد</div></div><button class="btn btn-ghost" style="font-size:12px;padding:7px 12px;flex-shrink:0" onclick="event.stopPropagation();go('memoirs')"><i class="fas fa-feather-alt"></i>كتابة</button></div>`;
    return;
  }
  const a=tm.localAnalysis||{};const pillCls={low:'memoir-risk-low',med:'memoir-risk-med',high:'memoir-risk-high',rescue:'memoir-risk-rescue'}[a.riskLevel]||'';
  const pill=a.riskLabel?`<span class="memoir-risk-pill ${pillCls}" style="margin-right:8px">${a.riskIco||''} ${a.riskLabel}</span>`:'';
  el.innerHTML=`<div style="background:linear-gradient(135deg,rgba(167,139,250,.10),rgba(79,142,247,.07));border:1px solid rgba(167,139,250,.22);border-radius:16px;padding:16px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:var(--tr);margin-bottom:24px" onclick="go('memoirs')"><i class="fas fa-feather-alt" style="font-size:22px;color:var(--purple);flex-shrink:0"></i><div style="flex:1"><div style="font-size:12px;color:var(--t3);font-weight:700;margin-bottom:2px">مذكرة اليوم</div><div style="font-size:14px;font-weight:800;color:var(--t1)">${tm.title}</div>${pill}</div><button class="btn btn-ghost" style="font-size:12px;padding:7px 12px;flex-shrink:0" onclick="event.stopPropagation();go('memoirs')"><i class="fas fa-arrow-left"></i>عرض</button></div>`;
}

function renderMemoirStats(){
  const el=document.getElementById('st-memoir-wrap');if(!el)return;
  const memoirs=load(K.memoirs)||[];if(!memoirs.length){el.innerHTML='';return;}
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().slice(0,10);});
  const written=last7.filter(d=>memoirs.some(m=>m.date===d)).length;
  const a=memoirs[0]?.localAnalysis||{};const lastRisk=a.riskLabel||'—';
  const lrc={منخفض:'var(--green)',متوسط:'var(--gold)','عالٍ':'var(--red)',إنقاذ:'var(--red)'}[lastRisk]||'var(--t1)';
  el.innerHTML=`<div class="card mb24"><div class="sec-t"><i class="fas fa-feather-alt"></i>إحصائيات المذكرات</div><div class="g3"><div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">إجمالي المذكرات</div><div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,var(--blue),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${memoirs.length}</div></div><div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">أيام الكتابة (7 أيام)</div><div style="font-size:28px;font-weight:900;color:var(--green)">${written}</div></div><div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600">آخر مستوى خطر</div><div style="font-size:20px;font-weight:900;color:${lrc}">${lastRisk}</div></div></div><button class="btn btn-ghost btn-full mt16" onclick="go('memoirs')"><i class="fas fa-feather-alt"></i>فتح مذكرات التعافي</button></div>`;
}
