const SUPABASE_URL = 'https://cmrnuikazfmzkrfpqztp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcm51aWthemZtemtyZnBxenRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzgzNDUsImV4cCI6MjA5MjQ1NDM0NX0.pZ7wte2iaSl03YQEJhxQB3_4IsOirbcFZPwn7B8QBTs';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const Store = {
  async getLogs() {
    const { data, error } = await sb.from('logs').select('*').order('date', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  },
  async addLog(entry) {
    await sb.from('logs').upsert({ date: entry.date, notes: entry.notes, subjects: entry.subjects }, { onConflict: 'date' });
  },
  async getMastery() {
    const { data, error } = await sb.from('mastery').select('*');
    if (error) return {};
    const m = {};
    (data || []).forEach(row => {
      if (!m[row.subject_id]) m[row.subject_id] = {};
      m[row.subject_id][row.topic] = row.level;
    });
    return m;
  },
  async setMastery(subjectId, topicName, level) {
    await sb.from('mastery').upsert({ subject_id: subjectId, topic: topicName, level, updated_at: new Date().toISOString() }, { onConflict: 'subject_id,topic' });
  },
  async getTopicMastery(subjectId, topicName) {
    const { data } = await sb.from('mastery').select('level').eq('subject_id', subjectId).eq('topic', topicName).single();
    return data ? data.level : 0;
  },
  async getPapers() {
    const { data, error } = await sb.from('papers').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },
  async addPaper(paper) {
    await sb.from('papers').insert({ id: paper.id, subject: paper.subject, name: paper.name, date: paper.date });
  },
  async removePaper(id) {
    await sb.from('papers').delete().eq('id', id);
  },
  async getSettings() {
    const defaults = { weeklyHours: 20, targetMaths: 60, targetEnglish: 25, targetEconomics: 15 };
    const { data } = await sb.from('settings').select('data').eq('id', 1).single();
    return data ? { ...defaults, ...data.data } : defaults;
  },
  async saveSettings(s) {
    await sb.from('settings').upsert({ id: 1, data: s });
  },
  async getStreak() {
    const logs = await this.getLogs();
    if (!logs.length) return 0;
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0,10);
      if (logs.find(l => l.date === ds)) { streak++; } else if (i > 0) break;
    }
    return streak;
  }
};
