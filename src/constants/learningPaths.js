export const LEARNING_PATH_OPTIONS = [
  { value: 'lp1-workplace-communication', label: 'LP1 - Workplace Communication' },
  { value: 'lp2-interview-english', label: 'LP2 - Interview English' },
  { value: 'lp3-presentation-skills', label: 'LP3 - Presentation Skills' },
  { value: 'lp4-negotiation-english', label: 'LP4 - Negotiation English' },
  { value: 'lp5-customer-service-english', label: 'LP5 - Customer Service English' },
  {
    value: 'lp6-cross-cultural-communication',
    label: 'LP6 - Cross-Cultural Communication',
  },
];

const categoryLabelMap = LEARNING_PATH_OPTIONS.reduce((accumulator, item) => {
  accumulator[item.value] = item.label;
  return accumulator;
}, {});

export function getLearningPathLabel(category) {
  if (!category) {
    return 'Uncategorized';
  }

  return categoryLabelMap[category] ?? category;
}
