let eodState = {};

function initEodState() {
  eodState = {};
  SUBJECTS.forEach(s => { eodState[s.id] = { time: 0, selectedTopics: {}, mastery: {} }; });
}

async function renderEod() {
  initEodState();
  const el = document.getElementById('page-eod');
  el.innerHTML = `
    <div style="max-width:720px">
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-3);margin-bottom:28px">${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      ${SUBJECTS.map(s => renderSubjectBlock(s)).join('<div class="divider"></div>')}
      <div class="divider"></div>
      <div class="section-header">session notes</div>
      <textarea id="eod-notes" rows="3" placeholder="anything worth noting about today..."></textarea>
      <button class="submit-btn" onclick="submitEod()" style="margin-top:16px">save EOD log</button>
    </div>
  `;
}

function renderSubjectBlock(s) {
  const ac = s.id==='maths'?'m':s.id==='english'?'e':'ec';
  return `
    <div class="eod-subject-block" id="block-${s.id}">
      <div class="subject-title subject-title-${ac}">${s.label.toUpperCase()}</div>
      <div class="time-row">
        <div class="time-label">time today</div>
        <select class="time-select" id="time-${s.id}" onchange="eodState['${s.id}'].time=parseInt(this.value)">
          ${TIME_OPTS.map(t=>`<option value="${t}">${t===0?'none':timeLabel(t)}</option>`).join('')}
        </select>
      </div>
      ${s.groups.map(g=>`
        <div class="topic-group">
          <div class="topic-group-label">${g.label}</div>
          <div class="chip-grid">
            ${g.topics.map(t=>`<button class="chip" data-subject="${s.id}" data-topic="${escQ(t)}" data-sel="false" onclick="toggleTopic(this,'${s.id}','${escQ(t)}','sel-${ac}')">${t}</button>`).join('')}
          </div>
        </div>
      `).join('')}
      <div class="topic-group" id="mastery-panel-${s.id}" style="display:none">
        <div class="topic-group-label">mastery — selected topics</div>
        <div id="mastery-list-${s.id}"></div>
      </div>
    </div>
  `;
}

function escQ(s) { return s.replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

function toggleTopic(btn, subjectId, topic, selClass) {
  const isSel = btn.dataset.sel==='true';
  if (isSel) {
    btn.dataset.sel='false'; btn.className='chip';
    delete eodState[subjectId].selectedTopics[topic];
  } else {
    btn.dataset.sel='true'; btn.className=`chip ${selClass}`;
    eodState[subjectId].selectedTopics[topic]=true;
    if (eodState[subjectId].mastery[topic]===undefined) eodState[subjectId].mastery[topic]=0;
  }
  updateMasteryPanel(subjectId, selClass);
}

function updateMasteryPanel(subjectId, selClass) {
  const topics = Object.keys(eodState[subjectId].selectedTopics);
  const panel = document.getElementById(`mastery-panel-${subjectId}`);
  const list = document.getElementById(`mastery-list-${subjectId}`);
  if (!topics.length) { panel.style.display='none'; return; }
  panel.style.display='block';
  list.innerHTML = topics.map(t => {
    const cur = eodState[subjectId].mastery[t]||0;
    return `
      <div style="margin-bottom:10px">
        <div style="font-size:12px;color:var(--text-2);margin-bottom:6px">${t}</div>
        <div class="mastery-row">
          ${MASTERY.map(m=>`<button class="mastery-btn${cur===m.v?' sel':''}" data-v="${m.v}" onclick="setMastery('${subjectId}','${escQ(t)}',${m.v},'${selClass}')">${m.label}</button>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function setMastery(subjectId, topic, val, selClass) {
  eodState[subjectId].mastery[topic]=val;
  updateMasteryPanel(subjectId, selClass);
}

async function submitEod() {
  const anyTime = SUBJECTS.some(s=>eodState[s.id].time>0);
  if (!anyTime) { alert('Log at least some revision time before saving.'); return; }

  const btn = document.querySelector('.submit-btn');
  btn.textContent='saving...'; btn.disabled=true;

  const entry = { date: todayStr(), notes: document.getElementById('eod-notes').value.trim(), subjects: {} };
  const masteryPromises = [];

  SUBJECTS.forEach(s => {
    const state = eodState[s.id];
    const topics = Object.keys(state.selectedTopics);
    entry.subjects[s.id] = { totalTime: state.time, topics, mastery: { ...state.mastery } };
    topics.forEach(t => {
      if (state.mastery[t]!==undefined) masteryPromises.push(Store.setMastery(s.id, t, state.mastery[t]));
    });
  });

  await Promise.all([Store.addLog(entry), ...masteryPromises]);
  await updateStreak();
  updateNextExam();

  btn.textContent='saved ✓'; btn.style.color='var(--accent-m)'; btn.style.borderColor='var(--accent-m)';
  setTimeout(()=>renderEod(), 1200);
}
