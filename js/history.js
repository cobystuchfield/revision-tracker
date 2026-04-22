// ─── History ───────────────────────────────────────────────────

function renderHistory() {
  const logs = Store.getLogs();
  const el = document.getElementById('page-history');

  if (!logs.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">◎</div>No logs yet.<br>Complete your first EOD to see history.</div>`;
    return;
  }

  const totalMins = logs.reduce((a, l) => a + SUBJECTS.reduce((b, s) => b + ((l.subjects[s.id] && l.subjects[s.id].totalTime) || 0), 0), 0);

  el.innerHTML = `
    <div class="stat-grid" style="margin-bottom:28px">
      <div class="stat-card"><div class="stat-val">${logs.length}</div><div class="stat-label">days logged</div></div>
      <div class="stat-card"><div class="stat-val">${Math.round(totalMins/60*10)/10}h</div><div class="stat-label">total revision</div></div>
      <div class="stat-card"><div class="stat-val">${Math.round(totalMins/logs.length)}m</div><div class="stat-label">avg per day</div></div>
    </div>
    <div class="section-header">log entries</div>
    ${logs.map(l => {
      const dayTotal = SUBJECTS.reduce((a, s) => a + ((l.subjects[s.id] && l.subjects[s.id].totalTime) || 0), 0);
      return `
        <div class="log-card">
          <div class="log-date-row">
            <div class="log-date">${formatDate(l.date)}</div>
            <div class="log-total">${timeLabel(dayTotal)} total</div>
          </div>
          <div class="log-subjects-row">
            ${SUBJECTS.map(s => {
              const sd = l.subjects[s.id] || {};
              const col = s.id === 'maths' ? 'var(--accent-m)' : s.id === 'english' ? 'var(--accent-e)' : 'var(--accent-ec)';
              return `
                <div class="log-subject">
                  <div class="log-subject-name" style="color:${col}">${s.label}</div>
                  <div class="log-subject-time">${timeLabel(sd.totalTime || 0)}</div>
                  <div class="log-subject-topics">${(sd.topics || []).slice(0,3).join(', ') || '—'}${(sd.topics||[]).length > 3 ? ` +${(sd.topics||[]).length-3}` : ''}</div>
                </div>
              `;
            }).join('')}
          </div>
          ${l.notes ? `<div class="log-notes">${l.notes}</div>` : ''}
        </div>
      `;
    }).join('')}
  `;
}


// ─── Gaps & Suggestions ────────────────────────────────────────

function renderGaps() {
  const logs = Store.getLogs();
  const mastery = Store.getMastery();
  const el = document.getElementById('page-gaps');

  if (!logs.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">◐</div>No data yet.<br>Log some revision to see gap analysis.</div>`;
    return;
  }

  // Topic hit count from logs
  const hitCount = {};
  SUBJECTS.forEach(s => { hitCount[s.id] = {}; });
  logs.forEach(l => {
    SUBJECTS.forEach(s => {
      (l.subjects[s.id]?.topics || []).forEach(t => {
        hitCount[s.id][t] = (hitCount[s.id][t] || 0) + 1;
      });
    });
  });

  // Find upcoming exams for prioritisation
  const upcomingExams = EXAMS.filter(e => daysUntil(e.date) >= 0).sort((a,b) => daysUntil(a.date) - daysUntil(b.date));
  const nextExam = upcomingExams[0];

  // Build suggestions
  const suggestions = [];
  SUBJECTS.forEach(s => {
    const allTopics = s.groups.flatMap(g => g.topics);
    const untouched = allTopics.filter(t => !hitCount[s.id][t]);
    const lowMastery = allTopics.filter(t => {
      const m = (mastery[s.id] && mastery[s.id][t]) || 0;
      return m <= 1 && hitCount[s.id][t];
    });
    if (untouched.length) suggestions.push({ subject: s, type: 'untouched', topics: untouched });
    if (lowMastery.length) suggestions.push({ subject: s, type: 'lowMastery', topics: lowMastery });
  });

  el.innerHTML = `
    <div class="two-col">
      <div>
        <div class="section-header">topic coverage</div>
        ${SUBJECTS.map(s => {
          const allTopics = s.groups.flatMap(g => g.topics);
          const maxHits = Math.max(...allTopics.map(t => hitCount[s.id][t] || 0), 1);
          const col = s.id === 'maths' ? 'bar-fill-m' : s.id === 'english' ? 'bar-fill-e' : 'bar-fill-ec';
          return `
            <div style="margin-bottom:24px">
              <div class="section-header" style="margin-top:0">${s.label}</div>
              ${s.groups.map(g => `
                <div style="margin-bottom:12px">
                  <div style="font-size:10px;color:var(--text-3);margin-bottom:6px;letter-spacing:0.04em">${g.label}</div>
                  ${g.topics.map(t => {
                    const hits = hitCount[s.id][t] || 0;
                    const pct = Math.round(hits / maxHits * 100);
                    const m = (mastery[s.id] && mastery[s.id][t]) !== undefined ? (mastery[s.id][t]) : -1;
                    return `
                      <div class="bar-row">
                        <div class="bar-label" title="${t}">${t}</div>
                        <div class="bar-track"><div class="bar-fill ${hits ? col : ''}" style="width:${pct}%;${!hits?'background:var(--bg-3)':''}"></div></div>
                        <div class="bar-count">${hits}x</div>
                        ${m >= 0 ? `<span class="mastery-badge m-${m}" style="margin-left:6px;flex-shrink:0">${MASTERY_LABELS[m]}</span>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>

      <div>
        <div class="section-header">suggested focus</div>
        ${nextExam ? `
          <div class="suggest-card" style="margin-bottom:16px;border-color:var(--border-light)">
            <div class="suggest-subject" style="color:var(--accent-m)">next exam pressure</div>
            <div class="suggest-text">${nextExam.name} is in ${daysUntil(nextExam.date)} days. Prioritise ${nextExam.subject} topics you haven't touched or marked needs work.</div>
          </div>
        ` : ''}
        ${suggestions.length ? suggestions.map(sg => {
          const col = sg.subject.id === 'maths' ? 'var(--accent-m)' : sg.subject.id === 'english' ? 'var(--accent-e)' : 'var(--accent-ec)';
          const typeLabel = sg.type === 'untouched' ? 'not yet covered' : 'needs work';
          return `
            <div class="suggest-card">
              <div class="suggest-subject" style="color:${col}">${sg.subject.label} — ${typeLabel}</div>
              <div class="suggest-text">${sg.topics.slice(0,4).join(', ')}${sg.topics.length > 4 ? ` and ${sg.topics.length-4} more` : ''}</div>
            </div>
          `;
        }).join('') : `<div class="suggest-card"><div class="suggest-text" style="color:var(--accent-m)">Great coverage — keep going.</div></div>`}

        <div class="section-header" style="margin-top:28px">mastery overview</div>
        ${SUBJECTS.map(s => {
          const allTopics = s.groups.flatMap(g => g.topics);
          const counts = [0,0,0,0,0];
          allTopics.forEach(t => {
            const m = (mastery[s.id] && mastery[s.id][t]) !== undefined ? mastery[s.id][t] : 0;
            counts[m]++;
          });
          return `
            <div style="margin-bottom:14px">
              <div style="font-size:11px;font-weight:500;margin-bottom:8px;color:${s.id==='maths'?'var(--accent-m)':s.id==='english'?'var(--accent-e)':'var(--accent-ec)'}">${s.label}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${MASTERY.map((m,i) => `<span class="mastery-badge m-${m.v}">${counts[m.v]} ${m.label}</span>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}


// ─── Past Papers ──────────────────────────────────────────────

function renderPapers() {
  const papers = Store.getPapers();
  const el = document.getElementById('page-papers');

  el.innerHTML = `
    <div style="max-width:600px">
      <div class="section-header">log a past paper</div>
      <div class="paper-input-row">
        <input type="text" id="paper-subject" placeholder="subject (e.g. Maths)" style="width:140px;flex:none">
        <input type="text" id="paper-name" placeholder="e.g. 2023 November Pure Paper 1">
        <button class="paper-add-btn" onclick="addPaper()">+ add</button>
      </div>

      <div class="section-header">completed papers</div>
      ${!papers.length ? `<div class="empty" style="padding:30px 0;text-align:left">No papers logged yet.</div>` : ''}

      ${['maths','english','economics'].map(sid => {
        const subPapers = papers.filter(p => p.subject.toLowerCase().includes(sid) || sid.includes(p.subject.toLowerCase()));
        if (!subPapers.length) return '';
        const s = SUBJECTS.find(x => x.id === sid);
        const col = sid === 'maths' ? 'var(--accent-m)' : sid === 'english' ? 'var(--accent-e)' : 'var(--accent-ec)';
        return `
          <div style="margin-bottom:20px">
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${col};margin-bottom:8px">${s.label}</div>
            ${subPapers.map(p => `
              <div class="paper-item">
                <div class="paper-name">${p.name}</div>
                <div style="display:flex;align-items:center;gap:12px">
                  <div class="paper-date">${formatDate(p.date)}</div>
                  <div class="paper-del" onclick="deletePaper('${p.id}')">remove</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}

      ${papers.filter(p => !['maths','english','economics'].some(sid => p.subject.toLowerCase().includes(sid) || sid.includes(p.subject.toLowerCase()))).map(p => `
        <div class="paper-item">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:11px;color:var(--text-3)">${p.subject}</div>
            <div class="paper-name">${p.name}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="paper-date">${formatDate(p.date)}</div>
            <div class="paper-del" onclick="deletePaper('${p.id}')">remove</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addPaper() {
  const subject = document.getElementById('paper-subject').value.trim();
  const name = document.getElementById('paper-name').value.trim();
  if (!name) return;
  Store.addPaper({ id: Date.now().toString(), subject: subject || 'General', name, date: todayStr() });
  renderPapers();
}

function deletePaper(id) {
  Store.removePaper(id);
  renderPapers();
}


// ─── Settings ─────────────────────────────────────────────────

function renderSettings() {
  const s = Store.getSettings();
  const el = document.getElementById('page-settings');

  el.innerHTML = `
    <div style="max-width:500px">
      <div class="section-header">revision targets</div>
      <div class="card">
        <div class="setting-row">
          <div>
            <div class="setting-label">Weekly revision hours</div>
            <div class="setting-sub">target total hours per week</div>
          </div>
          <input type="number" class="setting-input" id="s-weekly" value="${s.weeklyHours}" min="1" max="80">
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-label">Maths split</div>
            <div class="setting-sub">% of weekly time (current: ${s.targetMaths}%)</div>
          </div>
          <input type="number" class="setting-input" id="s-maths" value="${s.targetMaths}" min="0" max="100">
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-label">English split</div>
            <div class="setting-sub">% of weekly time (current: ${s.targetEnglish}%)</div>
          </div>
          <input type="number" class="setting-input" id="s-english" value="${s.targetEnglish}" min="0" max="100">
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-label">Economics split</div>
            <div class="setting-sub">% of weekly time (current: ${s.targetEconomics}%)</div>
          </div>
          <input type="number" class="setting-input" id="s-economics" value="${s.targetEconomics}" min="0" max="100">
        </div>
      </div>
      <button class="submit-btn" onclick="saveSettings()" style="margin-top:16px">save settings</button>

      <div class="section-header" style="margin-top:32px">data</div>
      <div class="card">
        <div class="setting-row">
          <div>
            <div class="setting-label">Export logs</div>
            <div class="setting-sub">download all data as JSON</div>
          </div>
          <button onclick="exportData()" style="padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius);font-size:12px;color:var(--text-2);cursor:pointer;background:none">export</button>
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-label">Clear all data</div>
            <div class="setting-sub">permanently delete all logs and mastery</div>
          </div>
          <button onclick="clearData()" style="padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius);font-size:12px;color:var(--accent-red);cursor:pointer;background:none">clear</button>
        </div>
      </div>
    </div>
  `;
}

function saveSettings() {
  const weekly = parseInt(document.getElementById('s-weekly').value) || 20;
  const maths = parseInt(document.getElementById('s-maths').value) || 60;
  const english = parseInt(document.getElementById('s-english').value) || 25;
  const economics = parseInt(document.getElementById('s-economics').value) || 15;
  Store.saveSettings({ weeklyHours: weekly, targetMaths: maths, targetEnglish: english, targetEconomics: economics });
  const btn = document.querySelector('.submit-btn');
  btn.textContent = 'saved ✓';
  btn.style.color = 'var(--accent-m)';
  setTimeout(() => renderSettings(), 1000);
}

function exportData() {
  const data = { logs: Store.getLogs(), mastery: Store.getMastery(), papers: Store.getPapers() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `revision-data-${todayStr()}.json`; a.click();
}

function clearData() {
  if (confirm('This will delete all your logs, mastery data, and past papers. Are you sure?')) {
    localStorage.removeItem('rt_logs');
    localStorage.removeItem('rt_mastery');
    localStorage.removeItem('rt_papers');
    renderSettings();
    updateStreak();
  }
}
