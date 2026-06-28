const APP_KEYS = [
  'rj_start','rj_best','rj_tasks','rj_journal','rj_urge','rj_relapses',
  'rj_rules','rj_daily_plan','rj_reasons','rj_weekly_reviews',
  'rj_urge_logs','rj_recovery_lock','rj_recovery_lock_tasks',
  'rj_protection_tasks','rj_trigger_tasks',
  'rj_privacy_settings','rj_smart_reports',
  'rj_memoirs','rj_memoir_questions',
  'rj_daily_questions','rj_daily_assessments',
  'recovery_challenges',
];

const BACKUP_APP_ID = 'Recovery Journey';
const BACKUP_VERSION = 'stable-after-challenges-page';

/* ─── export ─── */
function exportBackup(){
  const data = {};
  APP_KEYS.forEach(k => {
    const val = localStorage.getItem(k);
    if(val !== null){
      try { data[k] = JSON.parse(val); } catch { data[k] = val; }
    }
  });

  const payload = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    keysCount: Object.keys(data).length,
    data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `recovery-journey-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  toast('✅ تم تصدير النسخة الاحتياطية بنجاح','var(--green)');
  renderBackupPage();
}

/* ─── copy to clipboard ─── */
function copyBackupToClipboard(){
  const data = {};
  APP_KEYS.forEach(k => {
    const val = localStorage.getItem(k);
    if(val !== null){
      try { data[k] = JSON.parse(val); } catch { data[k] = val; }
    }
  });
  const payload = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    keysCount: Object.keys(data).length,
    data,
  };
  navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    .then(() => toast('📋 تم نسخ البيانات إلى الحافظة','var(--blue)'))
    .catch(() => toast('❌ تعذّر النسخ — جرّب التصدير كملف','var(--red)'));
}

/* ─── import ─── */
function importBackup(input){
  const file = input.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const payload = JSON.parse(e.target.result);

      // تحقق من صحة الملف
      if(payload.app !== BACKUP_APP_ID){
        toast('❌ هذا الملف لا يخص التطبيق','var(--red)');
        input.value = '';
        return;
      }
      if(!payload.data || typeof payload.data !== 'object'){
        toast('❌ الملف لا يحتوي على بيانات صحيحة','var(--red)');
        input.value = '';
        return;
      }

      // عرض ملخص قبل التأكيد
      const keys = Object.keys(payload.data);
      const msg = [
        '⚠️ تحذير: سيتم استبدال بياناتك الحالية.',
        '',
        `📦 الملف: ${file.name}`,
        `📅 تاريخ التصدير: ${payload.exportedAt ? payload.exportedAt.slice(0,10) : 'غير معروف'}`,
        `🔑 عدد المفاتيح: ${keys.length}`,
        '',
        'هل تريد المتابعة؟',
      ].join('\n');

      if(!confirm(msg)){ input.value = ''; return; }

      restoreAppData(payload.data);
      input.value = '';
      toast('✅ تم استيراد البيانات بنجاح — جاري تحديث الواجهة...','var(--green)');
      setTimeout(() => { renderAll(); renderBackupPage(); }, 400);

    } catch {
      toast('❌ الملف غير صالح أو تالف','var(--red)');
      input.value = '';
    }
  };
  reader.readAsText(file);
}

/* ─── restore (كتابة المفاتيح المعروفة فقط) ─── */
function restoreAppData(data){
  const allowed = new Set(APP_KEYS);
  Object.entries(data).forEach(([k, v]) => {
    if(allowed.has(k)){
      localStorage.setItem(k, JSON.stringify(v));
    }
  });
}

/* ─── reset safe ─── */
function resetAllSafe(){
  if(!confirm('هل أنت متأكد من مسح جميع البيانات؟\nلا يمكن التراجع عن هذا الإجراء.')) return;
  const typed = prompt('اكتب كلمة "مسح" للمتابعة:');
  if(typed !== 'مسح'){ toast('تم الإلغاء','var(--t3)'); return; }
  APP_KEYS.forEach(k => localStorage.removeItem(k));
  toast('تم مسح البيانات. البداية من جديد.','var(--purple)');
  setTimeout(() => init(), 300);
}

/* ─── backup page renderer ─── */
function renderBackupPage(){
  const wrap = document.getElementById('backup-status');
  if(!wrap) return;

  const existing = APP_KEYS.filter(k => localStorage.getItem(k) !== null);
  const total    = APP_KEYS.length;
  const pct      = Math.round(existing.length / total * 100);

  const rows = APP_KEYS.map(k => {
    const val = localStorage.getItem(k);
    const exists = val !== null;
    let size = '—';
    if(exists) size = (new Blob([val]).size / 1024).toFixed(1) + ' KB';
    return `
<div class="bk-key-row">
  <span class="bk-key-name">${k}</span>
  <span class="bk-key-size">${size}</span>
  <span class="bk-key-dot ${exists?'bk-dot-ok':'bk-dot-empty'}"></span>
</div>`;
  }).join('');

  wrap.innerHTML = `
<div class="bk-summary">
  <div class="bk-sum-item">
    <div class="bk-sum-val">${existing.length}</div>
    <div class="bk-sum-lbl">مفاتيح محفوظة</div>
  </div>
  <div class="bk-sum-item">
    <div class="bk-sum-val">${total - existing.length}</div>
    <div class="bk-sum-lbl">مفاتيح فارغة</div>
  </div>
  <div class="bk-sum-item">
    <div class="bk-sum-val">${pct}%</div>
    <div class="bk-sum-lbl">اكتمال البيانات</div>
  </div>
</div>
<div class="pb-wrap mb8" style="height:8px">
  <div class="pb-fill" style="width:${pct}%;background:var(--green)"></div>
</div>
<div style="margin-top:18px">
  <div style="font-size:13px;font-weight:800;color:var(--t2);margin-bottom:10px">حالة المفاتيح:</div>
  <div class="bk-keys-list">${rows}</div>
</div>`;
}
