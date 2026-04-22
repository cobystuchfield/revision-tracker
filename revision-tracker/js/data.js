// ─── Exam Dates ────────────────────────────────────────────────
const EXAMS = [
  { id: 'econ-p1',    name: 'Economics Paper 1',           subject: 'economics', date: '2026-05-11', time: '09:00' },
  { id: 'eng-p1',     name: 'English Literature Paper 1',  subject: 'english',   date: '2026-05-13', time: '09:00' },
  { id: 'econ-p2',    name: 'Economics Paper 2',           subject: 'economics', date: '2026-05-18', time: '13:30' },
  { id: 'eng-p2',     name: 'English Literature Paper 2',  subject: 'english',   date: '2026-06-01', time: '13:30' },
  { id: 'maths-p1',   name: 'Maths Pure Paper 1',          subject: 'maths',     date: '2026-06-03', time: '13:30' },
  { id: 'econ-p3',    name: 'Economics Paper 3',           subject: 'economics', date: '2026-06-04', time: '09:00' },
  { id: 'eng-p3',     name: 'English Literature Paper 3',  subject: 'english',   date: '2026-06-10', time: '09:00' },
  { id: 'maths-p2',   name: 'Maths Pure Paper 2',          subject: 'maths',     date: '2026-06-11', time: '13:30' },
  { id: 'maths-p3',   name: 'Maths Applied Paper 3',       subject: 'maths',     date: '2026-06-18', time: '09:00' },
];

// ─── Subjects & Topics ──────────────────────────────────────────
const SUBJECTS = [
  {
    id: 'maths',
    label: 'Maths',
    accent: 'accent-m',
    groups: [
      {
        label: 'Pure Year 1',
        topics: [
          'Algebraic expressions', 'Quadratics', 'Equations & inequalities',
          'Graphs & transformations', 'Straight line graphs', 'Circles',
          'Algebraic methods', 'Binomial expansion', 'Trigonometric ratios',
          'Trigonometric identities & equations', 'Vectors',
          'Differentiation', 'Integration', 'Exponentials & logarithms'
        ]
      },
      {
        label: 'Pure Year 2',
        topics: [
          'Algebraic methods', 'Functions & graphs', 'Sequences & series',
          'Binomial expansion', 'Radians', 'Trigonometric functions',
          'Trigonometric modelling', 'Parametric equations', 'Differentiation',
          'Numerical methods', 'Integration', 'Vectors'
        ]
      },
      {
        label: 'Applied Year 1 — Statistics',
        topics: [
          'Data collection', 'Measures of location & spread',
          'Representations of data', 'Correlation', 'Probability',
          'Statistical distributions', 'Hypothesis testing'
        ]
      },
      {
        label: 'Applied Year 1 — Mechanics',
        topics: [
          'Modelling', 'Constant acceleration', 'Forces & motion', 'Variable acceleration'
        ]
      },
      {
        label: 'Applied Year 2 — Statistics',
        topics: [
          'Regression & correlation', 'Conditional probability', 'Normal distribution'
        ]
      },
      {
        label: 'Applied Year 2 — Mechanics',
        topics: [
          'Moments', 'Forces & friction', 'Projectiles',
          'Application of forces', 'Further kinematics'
        ]
      }
    ]
  },
  {
    id: 'english',
    label: 'English',
    accent: 'accent-e',
    groups: [
      {
        label: 'Paper 1 — Drama',
        topics: ['Othello', 'A Streetcar Named Desire']
      },
      {
        label: 'Paper 2 — Prose',
        topics: ['Frankenstein', "The Handmaid's Tale"]
      },
      {
        label: 'Paper 3 — Poetry',
        topics: ['Poems of the Decade', 'English Romantics']
      },
      {
        label: 'Skills',
        topics: [
          'AO1 — Points', 'AO2 — Analysis', 'AO3 — Context',
          'AO4 — Comparison', 'AO5 — Critical theory', 'Structure & form', 'Essay'
        ]
      }
    ]
  },
  {
    id: 'economics',
    label: 'Economics',
    accent: 'accent-ec',
    groups: [
      {
        label: 'Theme 1 — Markets, consumers & firms',
        topics: [
          '1.1 Scarcity, choice & business objectives',
          '1.2 Enterprise, business & the economy',
          '1.3 Introducing the market',
          '1.4 Role of credit in the economy',
          '1.5 Market failure & government intervention',
          '1.6 Revenue, costs, profits & cash'
        ]
      },
      {
        label: 'Theme 2 — The wider economic environment',
        topics: [
          '2.1 Business growth & competitive advantage',
          '2.2 Firms, consumers & elasticities',
          '2.3 Productive efficiency',
          '2.4 Life in a global economy',
          '2.5 The economic cycle',
          '2.6 Introduction to macroeconomic policy'
        ]
      },
      {
        label: 'Theme 3 — The global economy',
        topics: [
          '3.1 Globalisation',
          '3.2 Economic factors in business expansion',
          '3.3 Impact on global companies',
          '3.4 Impact on local & national economies',
          '3.5 Global labour markets',
          '3.6 Inequality & redistribution'
        ]
      },
      {
        label: 'Theme 4 — Making markets work',
        topics: [
          '4.1 Competition & market power',
          '4.2 Market power & market failure',
          '4.3 Market failure across the economy',
          '4.4 Macroeconomic policies',
          '4.5 Risk & the financial sector'
        ]
      },
      {
        label: 'Essay practice',
        topics: [
          'Paper 1 essay (Themes 1 & 4)',
          'Paper 2 essay (Themes 2 & 3)',
          'Paper 3 essay (all themes)'
        ]
      }
    ]
  }
];

// ─── Mastery levels ─────────────────────────────────────────────
const MASTERY = [
  { v: 0, label: 'not touched' },
  { v: 1, label: 'needs work' },
  { v: 2, label: 'developing' },
  { v: 3, label: 'confident' },
  { v: 4, label: 'exam ready' }
];

const MASTERY_LABELS = ['Not touched', 'Needs work', 'Developing', 'Confident', 'Exam ready'];

// ─── Time options ────────────────────────────────────────────────
const TIME_OPTS = [0,15,30,45,60,75,90,105,120,150,180,210,240];
function timeLabel(m) {
  if (m === 0) return '—';
  if (m < 60) return m + 'min';
  const h = Math.floor(m/60), r = m%60;
  return h + 'h' + (r ? r + 'm' : '');
}

// ─── Helpers ─────────────────────────────────────────────────────
function daysUntil(dateStr) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function todayStr() {
  return new Date().toISOString().slice(0,10);
}

function subjectAccentClass(subjectId) {
  if (subjectId === 'maths') return 'accent-m';
  if (subjectId === 'english') return 'accent-e';
  return 'accent-ec';
}
