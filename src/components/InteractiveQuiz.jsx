import { useMemo, useState } from 'react';

/**
 * Interactive quiz (ported from legacy `frontend` EnglishModuleViewer).
 * Learners pick an option and see correct/incorrect feedback with explanation.
 */
export function InteractiveQuiz({ quiz = [] }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const hasQuiz = useMemo(() => Array.isArray(quiz) && quiz.length > 0, [quiz]);

  const handleAnswerClick = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  if (!hasQuiz) {
    return (
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Belum ada quiz untuk modul ini.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {quiz.map((question, questionIndex) => {
        const selectedIndex = selectedAnswers[questionIndex];
        const isAnswered = selectedIndex !== undefined;
        const isCorrect = selectedIndex === question.correctOptionIndex;

        return (
          <div
            key={`${question.question}-${questionIndex}`}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60 md:p-5"
          >
            <p className="mb-3 font-medium text-slate-900 dark:text-slate-100">
              {questionIndex + 1}. {question.question}
            </p>

            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => {
                const isSelected = selectedIndex === optionIndex;
                return (
                  <button
                    type="button"
                    key={`${option}-${optionIndex}`}
                    onClick={() => handleAnswerClick(questionIndex, optionIndex)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 font-medium text-brand-900 dark:border-brand-500 dark:bg-brand-950/50 dark:text-brand-100'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {isAnswered ? (
              <div
                className={`mt-3 rounded-lg border p-3 text-sm ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <p className="font-semibold">{isCorrect ? 'Benar' : 'Belum tepat'}</p>
                <p className="mt-1">{question.explanation || 'Tidak ada penjelasan tambahan.'}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
