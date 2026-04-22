// ─── Store — all persistent state ──────────────────────────────

const Store = {
  // ── Logs ──────────────────────────────────────────────────────
  getLogs() {
    try { return JSON.parse(localStorage.getItem('rt_logs') || '[]'); }
    catch { return []; }
  },
  saveLogs(logs) {
    localStorage.setItem('rt_logs', JSON.stringify(logs));
  },
  addLog(entry) {
    const logs = this.getLogs();
    logs.unshift(entry);
    this.saveLogs(logs);
  },
  getLogForDate(dateStr) {
    return this.getLogs().find(l => l.date === dateStr) || null;
  },

  // ── Topic mastery ─────────────────────────────────────────────
  getMastery() {
    try { return JSON.parse(localStorage.getItem('rt_mastery') || '{}'); }
    catch { return {}; }
  },
  setMastery(subjectId, topicName, level) {
    const m = this.getMastery();
    if (!m[subjectId]) m[subjectId] = {};
    m[subjectId][topicName] = level;
    localStorage.setItem('rt_mastery', JSON.stringify(m));
  },
  getTopicMastery(subjectId, topicName) {
    const m = this.getMastery();
    return (m[subjectId] && m[subjectId][topicName] !== undefined) ? m[subjectId][topicName] : 0;
  },

  // ── Past papers ───────────────────────────────────────────────
  getPapers() {
    try { return JSON.parse(localStorage.getItem('rt_papers') || '[]'); }
    catch { return []; }
  },
  addPaper(paper) {
    const papers = this.getPapers();
    papers.unshift(paper);
    localStorage.setItem('rt_papers', JSON.stringify(papers));
  },
  removePaper(id) {
    const papers = this.getPapers().filter(p => p.id !== id);
    localStorage.setItem('rt_papers', JSON.stringify(papers));
  },

  // ── Settings ──────────────────────────────────────────────────
  getSettings() {
    const defaults = { targetMaths: 60, targetEnglish: 25, targetEconomics: 15, weeklyHours: 20 };
    try {
      const saved = JSON.parse(localStorage.getItem('rt_settings') || '{}');
      return { ...defaults, ...saved };
    } catch { return defaults; }
  },
  saveSettings(s) {
    localStorage.setItem('rt_settings', JSON.stringify(s));
  },

  // ── Streak ────────────────────────────────────────────────────
  getStreak() {
    const logs = this.getLogs();
    if (!logs.length) return 0;
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0,10);
      const found = logs.find(l => l.date === ds);
      if (found) { streak++; } else if (i > 0) break;
    }
    return streak;
  }
};
