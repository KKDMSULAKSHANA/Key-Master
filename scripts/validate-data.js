const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const shortcutsPath = path.join(root, 'src', 'data', 'shortcuts.json');
const appsPath = path.join(root, 'src', 'data', 'apps.json');
const allowedKeys = new Set([
  'Ctrl', 'Alt', 'Shift', 'Win', 'Cmd', 'Option', 'Control', 'Super',
  'Tab', 'Enter', 'Esc', 'Space', 'Backspace', 'Delete', 'Home', 'End',
  'PgUp', 'PgDn', 'Left', 'Right', 'Up', 'Down', 'PrintScreen',
  'Plus', 'Minus', 'Equals', 'Period', 'Comma', 'Backtick', 'Slash',
  'Semicolon', 'Quote', 'BracketLeft', 'BracketRight', 'Backslash',
  ...Array.from({ length: 12 }, (_, index) => `F${index + 1}`),
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'0123456789',
]);
const operatingSystems = [
  { field: 'windows', label: 'Windows' },
  { field: 'mac', label: 'Mac' },
  { field: 'linux', label: 'Linux' },
];
const difficulties = new Set(['Beginner', 'Intermediate', 'Advanced']);
const requiredFields = ['id', 'title', 'app', 'category', 'description', 'tip', 'createdAt'];
const networkPattern = /\b(fetch|axios|XMLHttpRequest|WebView)\b|https?:\/\/|data:image\//i;
const { buildQuizQuestions } = require('../src/utils/quizBuilder');
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures.push({ name, detail });
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
}

function readJson(filePath, label) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    check(`valid ${label} JSON`, true);
    return parsed;
  } catch (error) {
    check(`valid ${label} JSON`, false, error.message);
    return null;
  }
}

const shortcuts = readJson(shortcutsPath, 'shortcuts');
const apps = readJson(appsPath, 'apps');
if (!shortcuts || !apps) {
  process.exitCode = 1;
} else {
  check('shortcuts JSON is an array', Array.isArray(shortcuts));
  check('apps JSON is an array', Array.isArray(apps));
  if (!Array.isArray(shortcuts) || !Array.isArray(apps)) {
    process.exitCode = 1;
  } else {
    const appNames = new Set(apps.map((app) => app.name));
    const ids = new Set();
    const titleKeys = new Set();
    const appCounts = new Map(apps.map((app) => [app.name, 0]));
    const osCounts = Object.fromEntries(operatingSystems.map(({ field }) => [field, 0]));
    let requiredValuesValid = true;
    let osFieldsValid = true;
    let keysValid = true;
    let difficultiesValid = true;
    let tagsValid = true;
    let datesValid = true;
    let networkFree = !networkPattern.test(JSON.stringify(apps));
    if (!networkFree) {
      failures.push({ name: 'data contains no network-looking text', detail: 'apps.json' });
    }

    for (const [index, shortcut] of shortcuts.entries()) {
      const location = `record ${index + 1} (${shortcut.id ?? 'missing id'})`;
      for (const field of requiredFields) {
        if (typeof shortcut[field] !== 'string' || shortcut[field].trim() === '') {
          requiredValuesValid = false;
          failures.push({ name: 'required fields are non-empty', detail: `${location}: ${field}` });
        }
      }

      if (typeof shortcut.id === 'string') {
        if (ids.has(shortcut.id)) {
          failures.push({ name: 'shortcut IDs are unique', detail: shortcut.id });
        }
        ids.add(shortcut.id);
      }

      if (typeof shortcut.app === 'string' && typeof shortcut.title === 'string') {
        const titleKey = `${shortcut.app.toLowerCase()}::${shortcut.title.trim().toLowerCase()}`;
        if (titleKeys.has(titleKey)) {
          failures.push({ name: 'titles are unique per app', detail: `${shortcut.app}: ${shortcut.title}` });
        }
        titleKeys.add(titleKey);
        appCounts.set(shortcut.app, (appCounts.get(shortcut.app) ?? 0) + 1);
        if (!appNames.has(shortcut.app)) {
          failures.push({ name: 'shortcut app exists in catalog', detail: `${location}: ${shortcut.app}` });
        }
      }

      let hasAvailableSystem = false;
      for (const { field } of operatingSystems) {
        const combination = shortcut[field];
        if (combination !== null && (!Array.isArray(combination) || combination.length === 0)) {
          osFieldsValid = false;
          failures.push({ name: 'OS keys are arrays or null', detail: `${location}: ${field}` });
          continue;
        }
        if (Array.isArray(combination)) {
          hasAvailableSystem = true;
          osCounts[field] += 1;
          for (const key of combination) {
            if (!allowedKeys.has(key)) {
              keysValid = false;
              failures.push({ name: 'key names are allowed', detail: `${location}: ${key}` });
            }
          }
        }
      }
      if (!hasAvailableSystem) {
        osFieldsValid = false;
        failures.push({ name: 'at least one system combination exists', detail: location });
      }

      if (!difficulties.has(shortcut.difficulty)) {
        difficultiesValid = false;
        failures.push({ name: 'difficulty is valid', detail: `${location}: ${shortcut.difficulty}` });
      }
      if (
        !Array.isArray(shortcut.tags)
        || shortcut.tags.length < 3
        || shortcut.tags.length > 5
        || shortcut.tags.some((tag) => typeof tag !== 'string' || !tag.trim() || tag !== tag.toLowerCase())
      ) {
        tagsValid = false;
        failures.push({ name: 'tags are 3-5 non-empty lowercase values', detail: location });
      }

      const created = new Date(shortcut.createdAt);
      if (
        Number.isNaN(created.getTime())
        || created < new Date('2026-09-01T00:00:00.000Z')
        || created > new Date('2026-11-10T23:59:59.999Z')
      ) {
        datesValid = false;
        failures.push({ name: 'createdAt is within the required date range', detail: `${location}: ${shortcut.createdAt}` });
      }
      if (networkPattern.test(JSON.stringify(shortcut))) {
        networkFree = false;
        failures.push({ name: 'data contains no network-looking text', detail: location });
      }
    }

    check('shortcut IDs are unique', failures.every(({ name }) => name !== 'shortcut IDs are unique'));
    check('titles are unique per app', failures.every(({ name }) => name !== 'titles are unique per app'));
    check('required fields are non-empty', requiredValuesValid);
    check('OS fields are valid and at least one system is available', osFieldsValid);
    check('key names are allowed', keysValid);
    check('difficulty values are valid', difficultiesValid);
    check('tags contain 3-5 lowercase values', tagsValid);
    check('createdAt dates are in range', datesValid);
    check('shortcut data contains no network-looking text', networkFree);
    check('all shortcut apps are in apps.json', failures.every(({ name }) => name !== 'shortcut app exists in catalog'));
    check('shortcut count is approximately 150', shortcuts.length >= 140 && shortcuts.length <= 160, `${shortcuts.length} records`);

    const appsHaveCoverage = apps.length >= 8
      && apps.every((app) => (appCounts.get(app.name) ?? 0) >= 10);
    check('each catalog app has at least 10 shortcuts', appsHaveCoverage,
      [...appCounts].map(([app, count]) => `${app}: ${count}`).join('; '));

    const systemsHaveQuizCoverage = operatingSystems.every(({ field }) => osCounts[field] >= 10);
    check('each operating system has at least 10 quiz candidates', systemsHaveQuizCoverage,
      operatingSystems.map(({ field, label }) => `${label}: ${osCounts[field]}`).join('; '));

    const systemNames = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };
    const quizFailures = [];
    for (const { field, label } of operatingSystems) {
      for (const mode of ['guessShortcut', 'guessAction']) {
        const questions = buildQuizQuestions({
          shortcuts,
          system: systemNames[field],
          mode,
          count: 10,
        });
        const valid = questions.length === 10 && questions.every((question) => (
          Array.isArray(question.options)
          && question.options.length === 4
          && new Set(question.options).size === 4
          && question.options.filter((option) => option === question.correctAnswer).length === 1
        ));
        if (!valid) quizFailures.push(`${label}/${mode}: ${questions.length} valid questions`);
      }
    }
    check('quizBuilder builds 10 valid questions per OS and mode', quizFailures.length === 0, quizFailures.join('; '));

    console.log('\nANSWER REVIEW');
    console.log('ID | Action | Windows | Mac | Linux');
    for (const shortcut of shortcuts) {
      const keyText = (field) => shortcut[field]?.join(' + ') ?? 'Not available';
      console.log(`${shortcut.id} | ${shortcut.title} | ${keyText('windows')} | ${keyText('mac')} | ${keyText('linux')}`);
    }
    console.log(`\n${failures.length ? `${failures.length} validation failure(s).` : 'All dataset checks passed.'}`);
    if (failures.length) {
      for (const failure of failures) {
        if (failure.detail) {
          console.error(`  ${failure.name}: ${failure.detail}`);
        }
      }
      process.exitCode = 1;
    }
  }
}