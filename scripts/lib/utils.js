const fs = require('fs').promises;
const path = require('path');

const QUESTIONS_PER_PAGE = 20;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'question.json');

// German states mapping
const GERMAN_STATES = {
  'NW': 'Nordrhein-Westfalen',
  'BY': 'Bayern', 
  'BW': 'Baden-Württemberg',
  'NI': 'Niedersachsen',
  'HE': 'Hessen',
  'RP': 'Rheinland-Pfalz',
  'SN': 'Sachsen',
  'ST': 'Sachsen-Anhalt',
  'TH': 'Thüringen',
  'BB': 'Brandenburg',
  'MV': 'Mecklenburg-Vorpommern',
  'SL': 'Saarland',
  'HH': 'Hamburg',
  'HB': 'Bremen',
  'BE': 'Berlin',
  'SH': 'Schleswig-Holstein'
};

function createSlug(category) {
  return category
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function filterQuestionForLanguage(question, lang) {
  const filtered = {
    id: question.id,
    num: question.num,
    question: lang === 'de' ? question.question : question.translation[lang]?.question || question.question,
    a: lang === 'de' ? question.a : question.translation[lang]?.a || question.a,
    b: lang === 'de' ? question.b : question.translation[lang]?.b || question.b,
    c: lang === 'de' ? question.c : question.translation[lang]?.c || question.c,
    d: lang === 'de' ? question.d : question.translation[lang]?.d || question.d,
    solution: question.solution,
    category: question.category,
    context: lang === 'de' ? question.context : question.translation[lang]?.context || question.context
  };

  // Include all translations only in German version for inline toggle functionality
  if (lang === 'de') {
    filtered.translation = question.translation;
  }

  if (question.image && question.image !== '-') {
    filtered.image = question.image;
  }

  return filtered;
}

module.exports = {
  QUESTIONS_PER_PAGE,
  OUTPUT_DIR,
  QUESTIONS_FILE,
  GERMAN_STATES,
  createSlug,
  filterQuestionForLanguage
};