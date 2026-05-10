export const COURSE_LEVELS = [
  {
    key: 'beginner',
    label: 'Beginner',
    cefr: 'A1-A2',
    estimatedHours: 24,
    supportedLanguages: ['en', 'id'],
    focus: 'Vocabulary dasar, simple present, dan daily conversation.',
    outcomes: [
      'Mampu memperkenalkan diri dan menyusun kalimat sederhana.',
      'Paham simple present untuk rutinitas harian.',
      'Memiliki 200+ kosakata dasar komunikasi.',
    ],
  },
  {
    key: 'intermediate',
    label: 'Intermediate',
    cefr: 'B1-B2',
    estimatedHours: 36,
    supportedLanguages: ['en', 'id'],
    focus: 'Tenses lanjutan, reading comprehension, dan speaking confidence.',
    outcomes: [
      'Mampu bercerita pengalaman dengan tenses yang tepat.',
      'Lebih percaya diri saat role-play conversation.',
      'Memahami isi bacaan dan ide utama teks menengah.',
    ],
  },
  {
    key: 'advanced',
    label: 'Advanced',
    cefr: 'C1-C2',
    estimatedHours: 48,
    supportedLanguages: ['en', 'id'],
    focus: 'Academic writing, critical discussion, dan professional English.',
    outcomes: [
      'Mampu berdiskusi dan berargumen dalam konteks akademik/profesional.',
      'Menulis esai atau email formal dengan struktur yang rapi.',
      'Meningkatkan fluency dan precision dalam speaking.',
    ],
  },
];

export function getCourseLevel(levelKey) {
  return COURSE_LEVELS.find((level) => level.key === levelKey) ?? COURSE_LEVELS[0];
}

/** Map backend `ProcessedModule.difficulty` to a course tab key. */
export function normalizeDifficulty(value) {
  const d = String(value || 'beginner').toLowerCase();
  return COURSE_LEVELS.some((level) => level.key === d) ? d : 'beginner';
}

/**
 * Pick initial module id and course tab from published items and optional `?module=`.
 */
export function resolvePublishedModulePick(items, wantedModuleId, preferredLevelKey) {
  const norm = normalizeDifficulty;
  const preferred = norm(preferredLevelKey);
  const hit =
    wantedModuleId && items.some((i) => String(i.id) === String(wantedModuleId))
      ? items.find((i) => String(i.id) === String(wantedModuleId))
      : null;

  let levelKey = preferred;
  let pick = null;

  if (hit) {
    levelKey = norm(hit.difficulty);
    pick = hit.id;
  } else {
    const pool = items.filter((i) => norm(i.difficulty) === preferred);
    if (pool.length) {
      pick = pool[0].id;
    } else if (items.length) {
      pick = items[0].id;
      levelKey = norm(items[0].difficulty);
    }
  }

  return { pick, levelKey };
}
