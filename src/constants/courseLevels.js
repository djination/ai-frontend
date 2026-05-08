export const COURSE_LEVELS = [
  {
    key: 'beginner',
    label: 'Beginner',
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
