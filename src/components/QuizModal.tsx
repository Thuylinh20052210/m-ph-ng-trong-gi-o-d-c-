import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { HelpCircle, CheckCircle, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';

interface QuizModalProps {
  questions: QuizQuestion[];
  topicTitle: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({ questions, topicTitle }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
        Chưa có câu hỏi cho phần này. Hãy chuyển sang chủ đề khác!
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (hasSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;
    setHasSubmitted(true);
    setAnsweredCount((prev) => prev + 1);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setAnsweredCount(0);
  };

  return (
    <div id="quiz-panel" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Luyện Tập Trắc Nghiệm THPT (Câu {currentIndex + 1}/{questions.length})
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Điểm: {score}/{answeredCount}
          </span>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Làm lại từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question text */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
        {currentQ.question}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {currentQ.options.map((option, idx) => {
          let optionStyle =
            'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

          if (selectedOption === idx) {
            optionStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-medium';
          }

          if (hasSubmitted) {
            if (idx === currentQ.correctIndex) {
              optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
            } else if (selectedOption === idx) {
              optionStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(idx)}
              disabled={hasSubmitted}
              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
            >
              <span>{option}</span>
              {hasSubmitted && idx === currentQ.correctIndex && (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
              )}
              {hasSubmitted && selectedOption === idx && idx !== currentQ.correctIndex && (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Action button */}
      {!hasSubmitted ? (
        <button
          type="button"
          onClick={handleSubmitAnswer}
          disabled={selectedOption === null}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all shadow-sm"
        >
          Xác Nhận Đáp Án
        </button>
      ) : (
        <div className="space-y-3">
          {/* Explanation */}
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800">
            <div className="font-semibold text-emerald-900 mb-1 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Giải thích chi tiết:</span>
            </div>
            <p className="leading-relaxed">{currentQ.explanation}</p>
            {currentQ.tip && (
              <p className="mt-1 text-slate-500 italic">💡 Mẹo hình học: {currentQ.tip}</p>
            )}
          </div>

          {currentIndex < questions.length - 1 && (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>Câu hỏi tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
