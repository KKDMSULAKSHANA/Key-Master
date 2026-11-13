function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

export function matchesShortcut(shortcut, searchText, system) {
  const query = normalize(searchText);
  if (!query) return true;

  const systemField = system === 'macOS' ? 'mac' : system === 'Linux' ? 'linux' : 'windows';
  const searchableText = [
    shortcut.title,
    shortcut.description,
    shortcut.tip,
    shortcut.app,
    shortcut.category,
    ...(shortcut.tags ?? []),
    ...(shortcut[systemField] ?? []),
  ].join(' ').toLocaleLowerCase();
  return searchableText.includes(query);
}

export function filterShortcuts(shortcuts, { searchText = '', system = 'Windows', app = 'All', category = 'All', difficulty = 'Any', learnedOnly = false, learned = [], sort = 'A-Z' } = {}) {
  const result = shortcuts.filter((shortcut) => {
    const systemField = system === 'macOS' ? 'mac' : system === 'Linux' ? 'linux' : 'windows';
    return Array.isArray(shortcut[systemField])
      && matchesShortcut(shortcut, searchText, system)
      && (app === 'All' || shortcut.app === app)
      && (category === 'All' || shortcut.category === category)
      && (difficulty === 'Any' || shortcut.difficulty === difficulty)
      && (!learnedOnly || learned.includes(shortcut.id));
  });

  if (sort === 'Newest') {
    result.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } else if (sort === 'Difficulty') {
    const rank = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    result.sort((left, right) => rank[left.difficulty] - rank[right.difficulty] || left.title.localeCompare(right.title));
  } else {
    result.sort((left, right) => left.title.localeCompare(right.title));
  }
  return result;
}
