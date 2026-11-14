const systemFields = { Windows: 'windows', macOS: 'mac', Linux: 'linux' };

function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function optionFor(shortcut, field, mode) {
  if (mode === 'guessAction') return shortcut.title;
  return Array.isArray(shortcut[field]) ? shortcut[field].join(' + ') : '';
}

function buildQuestion(shortcut, pool, field, system, mode, random) {
  const correctAnswer = optionFor(shortcut, field, mode);
  if (!correctAnswer) return null;

  const candidates = pool.filter((item) => item.id !== shortcut.id);
  const sameAppCategory = candidates.filter((item) => item.app === shortcut.app && item.category === shortcut.category);
  const sameApp = candidates.filter((item) => item.app === shortcut.app);
  let distractors = [...new Set(sameAppCategory.map((item) => optionFor(item, field, mode)).filter((option) => option && option !== correctAnswer))];

  if (distractors.length < 3) {
    distractors = [...new Set(sameApp.map((item) => optionFor(item, field, mode)).filter((option) => option && option !== correctAnswer))];
  }
  if (distractors.length < 3) return null;

  const answers = shuffle([correctAnswer, ...shuffle(distractors, random).slice(0, 3)], random);
  const keyText = Array.isArray(shortcut[field]) ? shortcut[field].join(' + ') : '';
  const prompt = mode === 'guessAction'
    ? `What does ${keyText} do in ${shortcut.app}?`
    : `Which keys perform this action: ${shortcut.title} in ${shortcut.app} (${system})?`;

  return {
    id: `${shortcut.id}-${mode}`,
    shortcutId: shortcut.id,
    prompt,
    options: answers,
    correctAnswer,
    explanation: shortcut.description,
    title: shortcut.title,
    app: shortcut.app,
  };
}

function buildQuizQuestions({
  shortcuts,
  system = 'Windows',
  app = 'All',
  difficulty = 'Any',
  mode = 'guessShortcut',
  count = 10,
  random = Math.random,
} = {}) {
  const field = systemFields[system];
  if (!field || !Array.isArray(shortcuts)) return [];
  const pool = shortcuts.filter((shortcut) => Array.isArray(shortcut[field])
    && (app === 'All' || shortcut.app === app)
    && (difficulty === 'Any' || shortcut.difficulty === difficulty));
  const questions = [];
  const seenShortcuts = new Set();

  for (const candidate of shuffle(pool, random)) {
    if (questions.length >= count) break;
    if (seenShortcuts.has(candidate.id)) continue;
    const question = buildQuestion(candidate, pool, field, system, mode, random);
    if (question) {
      questions.push(question);
      seenShortcuts.add(candidate.id);
    }
  }
  return questions;
}

module.exports = { buildQuizQuestions };
