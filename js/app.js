// ─── App — navigation & init ───────────────────────────────────

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

let currentPage = 'dashboard';

function navigate(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Show target
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[page];

  currentPage = page;
  PAGE_RENDERERS[page]();
}

function updateStreak() {
  document.getElementById('streak-count').textContent = Store.getStreak();
}

function updateNextExam() {
  const upcoming = EXAMS.filter(e => daysUntil(e.date) >= 0).sort((a,b) => daysUntil(a.date) - daysUntil(b.date));
  const badge = document.getElementById('next-exam-badge');
  if (!upcoming.length) {
    document.getElementById('next-exam-name').textContent = 'All done';
    document.getElementById('next-exam-days').textContent = '';
    return;
  }
  const next = upcoming[0];
  const days = daysUntil(next.date);
  document.getElementById('next-exam-name').textContent = next.name;
  document.getElementById('next-exam-days').textContent = days === 0 ? 'today' : `${days}d`;
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // Init topbar
  updateStreak();
  updateNextExam();

  // Render first page
  renderDashboard();
});
