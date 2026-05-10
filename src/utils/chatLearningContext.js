import { getCourseLevel } from '../constants/courseLevels';

export function truncateForChatContext(text, max = 2800) {
  const t = (text || '').trim();
  if (!t) return '';
  if (t.length <= max) return t;
  return `${t.slice(0, max)}\n… [truncated]`;
}

export function buildQuizSummary(quiz) {
  if (!Array.isArray(quiz) || quiz.length === 0) return '';
  return quiz
    .map((q, i) => {
      const opts = Array.isArray(q.options)
        ? q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join('; ')
        : '';
      return `Q${i + 1}: ${q.question || ''}${opts ? `\nOptions: ${opts}` : ''}`;
    })
    .join('\n\n');
}

export function formatChatModuleContext({
  processedModuleId,
  moduleTitle,
  lessonExcerpt,
  quizSummary,
  courseLevelLabel,
  cefr,
}) {
  const parts = [];
  if (processedModuleId != null && processedModuleId !== '') {
    parts.push(`Processed module id: ${processedModuleId}`, '');
  }
  parts.push(
    `Published module title: ${moduleTitle || 'Unknown'}`,
    `Learner path focus: ${courseLevelLabel || 'General'} (${cefr || 'n/a'})`,
    '',
    'Lesson excerpt:',
    lessonExcerpt || '(none)',
  );
  if (quizSummary) {
    parts.push('', 'Quiz from this module:', quizSummary);
  }
  const full = parts.join('\n');
  return full.length > 3800 ? `${full.slice(0, 3797)}…` : full;
}

/** Payload for React Router `location.state.chatLearningContext` and sessionStorage. */
export function buildChatLearningPayload(module, levelKey) {
  const level = getCourseLevel(levelKey);
  const title = module?.title || 'Current module';
  const excerpt = truncateForChatContext(module?.lessonContent || '', 2400);
  const quizSummary = buildQuizSummary(module?.quiz);
  const moduleContext = formatChatModuleContext({
    processedModuleId: module?.id,
    moduleTitle: title,
    lessonExcerpt: excerpt,
    quizSummary,
    courseLevelLabel: level.label,
    cefr: level.cefr,
  });
  return {
    level: levelKey,
    moduleTitle: title,
    moduleContext,
  };
}

export function buildLevelPathChatPayload(levelKey) {
  const detail = getCourseLevel(levelKey);
  const outcomes = (detail.outcomes || []).map((o) => `- ${o}`).join('\n');
  const moduleContext = formatChatModuleContext({
    moduleTitle: `${detail.label} learning track`,
    lessonExcerpt: `Level outcomes:\n${outcomes}`,
    quizSummary: '',
    courseLevelLabel: detail.label,
    cefr: detail.cefr,
  });
  return {
    level: levelKey,
    moduleTitle: `${detail.label} track`,
    moduleContext,
  };
}
