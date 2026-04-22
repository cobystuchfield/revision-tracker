// ─── Dashboard ─────────────────────────────────────────────────

function renderDashboard() {
  const logs = Store.getLogs();
  const settings = Store.getSettings();
  const today = todayStr();

  // Stats
  const totalMins = logs.reduce((a, l) => {
    return a + SUBJECTS.reduce((b, s) => b + ((l.subjects[s.id] && l.subjects[s.id].totalTime) || 0), 0);
  }, 0);
  const days = logs.length;
  const avgPerDay = days ? Math.round(totalMins / days) : 0;

  // This week
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); weekStart.setHours(0,0,0,0);
  const weekLogs = logs.filter(l => new Date(l.date) >= weekStart);
  const weekMins = weekLogs.reduce((a, l) => a + SUBJECTS.reduce((b, s) => b + ((l.subjects[s.id] && l.subjects[s.id].totalTime) || 0), 0), 0);
  const weekTarget = settings.weeklyHours * 60;

  // Subject breakdown this week
  const weekBySubject = {};
  SUBJECTS.forEach(s => { weekBySubject[s.id] = 0; });
  weekLogs.forEach(l => {
    SUBJECTS.forEach(s => {
      weekBySubject[s.id] += (l.subjects[s.id] && l.subjects[s.id].totalTime) || 0;
    });
  });

  // 7-day calendar
  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    const ds = d.toISOString().slice(0,10);
    const log = logs.find(l => l.date === ds);
    const mins = log ? SUBJECTS.reduce((b, s) => b + ((log.subjects[s.id] && log.subjects[s.id].totalTime) || 0), 0) : 0;
    days7.push({ ds, mins, name: d.toLocaleDateString('en-GB', { weekday: 'short' }), isToday: ds === today });
  }

  const el = document.getElementById('page-dashboard');
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-val">${Math.round(totalMins / 60 * 10) / 10}h</div>
        <div class="stat-label">total revision</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${days}</div>
        <div class="stat-label">days logged</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${avgPerDay}m</div>
        <div class="stat-label">avg / day</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${Math.round(weekMins / 60 * 10) / 10}h</div>
        <div class="stat-label">this week (target ${settings.weeklyHours}h)</div>
      </div>
    </div>

    <div class="section-header">this week</div>
    <div class="week-grid" style="margin-bottom:28px">
      ${days7.map(d => `
        <div class="week-day${d.isToday ? ' today' : ''}${d.mins > 0 ? ' has-data' : ''}">
          <div class="week-day-name">${d.name}</div>
          <div class="week-day-mins" style="color:${d.mins > 0 ? 'var(--text)' : 'var(--text-3)'}">${d.mins > 0 ? timeLabel(d.mins) : '—'}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-header">subject split this week</div>
    <div class="card" style="margin-bottom:28px">
      ${SUBJECTS.map(s => {
        const pct = weekMins ? Math.round(weekBySubject[s.id] / weekMins * 100) : 0;
        const fill = s.id === 'maths' ? 'bar-fill-m' : s.id === 'english' ? 'bar-fill-e' : 'bar-fill-ec';
        return `
          <div class="bar-row">
            <div class="bar-label">${s.label}</div>
            <div class="bar-track"><div class="bar-fill ${fill}" style="width:${pct}%"></div></div>
            <div class="bar-count">${pct}%</div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="section-header">exam schedule</div>
    <div class="exam-list">
      ${EXAMS.map(e => {
        const days = daysUntil(e.date);
        const isPast = days < 0;
        const isNext = !isPast && EXAMS.filter(x => daysUntil(x.date) >= 0).sort((a,b) => daysUntil(a.date) - daysUntil(b.date))[0]?.id === e.id;
        const dClass = isPast ? 'done' : days <= 7 ? 'urgent' : days <= 21 ? 'soon' : 'ok';
        const dLabel = isPast ? 'done' : days === 0 ? 'today' : `${days}d`;
        const dotClass = e.subject === 'maths' ? 'dot-maths' : e.subject === 'english' ? 'dot-english' : 'dot-economics';
        return `
          <div class="exam-item${isPast ? ' past' : ''}${isNext ? ' next' : ''}">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="exam-subject-dot ${dotClass}"></div>
              <div class="exam-name">${e.name}</div>
            </div>
            <div style="display:flex;align-items:center;gap:16px">
              <div class="exam-date">${formatDate(e.date)}</div>
              <div class="exam-days ${dClass}">${dLabel}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
