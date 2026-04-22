const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  eod: renderEod,
  history: renderHistory,
  gaps: renderGaps,
  papers: renderPapers,
  settings: renderSettings
};

const PAGE_TITLES = {
  dashboard: 'dashboard',
  eod: 'eod log',
  history: 'history',
  gaps: 'gaps & suggestions',
  papers: 'past papers',
  settings: 'settings'
};

function navigate(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[page];
  PAGE_RENDERERS[page]();
}

async function updateStreak() {
  const streak = await Store.getStreak();
  document.getElementById('streak-count').textContent = streak;
}

function updateNextExam() {
  const upcoming = EXAMS.filter(e=>daysUntil(e.date)>=0).sort((a,b)=>daysUntil(a.date)-daysUntil(b.date));
  if (!upcoming.length) {
    document.getElementById('next-exam-name').textContent='All done';
    document.getElementById('next-exam-days').textContent='';
    return;
  }
  const next = upcoming[0];
  const days = daysUntil(next.date);
  document.getElementById('next-exam-name').textContent = next.name;
  document.getElementById('next-exam-days').textContent = days===0?'today':`${days}d`;
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>navigate(btn.dataset.page));
  });
  updateNextExam();
  await updateStreak();
  await renderDashboard();
});
