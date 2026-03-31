/**
 * agents.js
 * Factory helpers for creating agent objects.
 * makeAgent() is the single source of truth for agent shape —
 * every field an agent can have is defined here with its default.
 */
import { NAMES, DEFAULT_SKILLS } from './constants.js';

const _usedNames = new Set();

export function pickName() {
  const pool = NAMES.filter(n => !_usedNames.has(n));
  const name = (pool.length > 0 ? pool : NAMES)[Math.floor(Math.random() * (pool.length || NAMES.length))];
  _usedNames.add(name);
  return name;
}

export function makeAgent(type, overrides = {}) {
  const dir = Math.random() > 0.5 ? 1 : -1;
  const name = overrides.name || pickName();
  if (overrides.name) _usedNames.add(overrides.name);

  return {
    id: Math.random().toString(36).slice(2),
    name,
    type,
    skills: [...(DEFAULT_SKILLS[type] || DEFAULT_SKILLS.architect)],
    x: Math.random() * 60 + 20,
    direction: dir,
    originalDirection: dir,
    state: 'spawning',
    cooldown: 0,
    resumeTime: Date.now() + 800,
    status: 'idle',
    currentTask: null,
    taskHistory: [],
    logs: [{ time: Date.now(), msg: 'Agent initialized' }],
    tools: [],
    mcps: [],
    projectDir: '',
    profession: '',
    description: '',
    persona: '',
    tone: '',
    ...overrides,
  };
}
