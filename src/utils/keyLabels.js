const spokenLabels = {
  Ctrl: 'Control',
  Cmd: 'Command',
  Option: 'Option',
  Control: 'Control',
  Super: 'Super',
  Win: 'Windows',
  Esc: 'Escape',
  PgUp: 'Page up',
  PgDn: 'Page down',
  Left: 'Left arrow',
  Right: 'Right arrow',
  Up: 'Up arrow',
  Down: 'Down arrow',
  PrintScreen: 'Print Screen',
  Backtick: 'Backtick',
  Semicolon: 'Semicolon',
  Period: 'Period',
  Comma: 'Comma',
  Slash: 'Slash',
  Plus: 'Plus',
  Minus: 'Minus',
  Equals: 'Equals',
};

const macLabels = {
  Cmd: '\u2318 Cmd',
  Option: '\u2325 Option',
  Shift: '\u21e7 Shift',
  Control: '\u2303 Control',
};

export function getSpokenKeyLabel(key) {
  return spokenLabels[key] ?? key;
}

export function getShortcutAccessibilityLabel(keys = []) {
  return keys.map(getSpokenKeyLabel).join(' plus ');
}

export function getVisibleKeyLabel(key, system) {
  return system === 'macOS' ? macLabels[key] ?? key : key;
}

export function getShortcutText(keys = []) {
  return keys.join(' + ');
}
