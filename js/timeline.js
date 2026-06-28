function renderTL(){
  const cd=cleanDays();
  const el=document.getElementById('tl-container');if(!el)return;
  el.innerHTML=PHASES.map(ph=>{
    const completed=cd>=ph.end;const active=cd>=ph.start&&cd<ph.end;
    const phaseCls=completed?'phase-done':active?'phase-active':'';
    const pct=active?Math.round((cd-ph.start+1)/(ph.end-ph.start+1)*100):(completed?100:0);
    const badge=completed
      ?`<span class="tl-phase-badge done-badge"><i class="fas fa-check"></i> مكتملة</span>`
      :active
        ?`<span class="tl-phase-badge active-badge"><i class="fas fa-circle-dot"></i> نشطة · يوم ${cd}</span>`
        :`<span class="tl-phase-badge not-started">لم تبدأ بعد</span>`;
    const pbHtml=(active||completed)?`<div class="tl-phase-pb-wrap mb16"><div class="tl-phase-pb-fill" style="width:${pct}%"></div></div>`:'';
    const tasksHtml=ph.tasks.map(t=>`
      <div class="tl-phase-task ${completed?'done':active?'active-t':''}">
        <i class="fas ${completed?'fa-check-circle':'fa-circle'}" style="color:${completed?'var(--green)':active?'var(--blue)':'var(--t3)'};font-size:13px;margin-left:10px;flex-shrink:0"></i>
        <span>${t}</span>
      </div>`).join('');
    return`
      <div class="tl-phase-block ${phaseCls}">
        <div class="tl-phase-header">
          <div class="tl-phase-ico">${ph.ico}</div>
          <div style="flex:1">
            <div class="tl-phase-days">الأيام ${ph.start}–${ph.end}</div>
            <div class="tl-phase-title">${ph.t}</div>
            <div class="tl-phase-goal">${ph.goal}</div>
          </div>
          ${badge}
        </div>
        ${pbHtml}
        <div class="tl-phase-tasks">${tasksHtml}</div>
        <div class="tl-phase-msg">"${ph.msg}"</div>
      </div>`;
  }).join('');
}
