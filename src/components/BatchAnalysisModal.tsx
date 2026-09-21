import React from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  PieChart,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { BatchAnalysisResult, EmailMessage } from '../types';

interface BatchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BatchAnalysisResult | null;
  isLoading: boolean;
  onRunAnalysis: () => void;
  onSelectEmailById: (id: string) => void;
  emailsCount: number;
}

export const BatchAnalysisModal: React.FC<BatchAnalysisModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  onRunAnalysis,
  onSelectEmailById,
  emailsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                Pochta Qutisi Umumiy Tahlili
              </h3>
              <p className="text-xs text-zinc-500">
                {emailsCount} ta oxirgi xabarlar bo‘yicha sun'iy intellekt xulosasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h4 className="text-sm font-semibold text-zinc-800">
                Gemini AI barcha xatlarni o‘rganmoqda...
              </h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Shoshilinch xabarlar, kutilayotgan vazifalar va asosiy tendensiyalar umumlashtirilmoqda.
              </p>
            </div>
          ) : !result ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-600 mb-4">
                Pochtadagi xatlarning umumiy tahlilini olish uchun quyidagi tugmani bosing:
              </p>
              <button
                id="btn-run-batch-analysis"
                onClick={onRunAnalysis}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Umumiy Tahlilni Boshlash
              </button>
            </div>
          ) : (
            <>
              {/* Executive Overview */}
              <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Umumiy Holat va Xulosa
                </h4>
                <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-normal">
                  {result.overview}
                </p>
              </div>

              {/* Priority & Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-xl font-bold text-red-700">
                    {result.priorityDistribution?.high || 0}
                  </p>
                  <p className="text-xs font-medium text-red-800 mt-0.5">Shoshilinch</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-xl font-bold text-amber-700">
                    {result.priorityDistribution?.medium || 0}
                  </p>
                  <p className="text-xs font-medium text-amber-800 mt-0.5">O‘rta muhim</p>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                  <p className="text-xl font-bold text-zinc-700">
                    {result.priorityDistribution?.low || 0}
                  </p>
                  <p className="text-xs font-medium text-zinc-600 mt-0.5">Oddiy/Axborot</p>
                </div>
              </div>

              {/* Urgent Emails List */}
              {result.urgentEmails && result.urgentEmails.length > 0 && (
                <div className="bg-white rounded-xl border border-red-200 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
                      Zudlik bilan e'tibor talab qiluvchi xatlar
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {result.urgentEmails.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {item.subject}
                          </p>
                          <p className="text-[11px] text-zinc-500">Kimdan: {item.from}</p>
                          <p className="text-[11px] text-red-700 font-medium mt-0.5">
                            {item.reason}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onSelectEmailById(item.emailId);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors whitespace-nowrap flex items-center gap-1 shrink-0"
                        >
                          <span>Ko‘rish</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Action Items Across All Emails */}
              {result.pendingActions && result.pendingActions.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Barcha kutilayotgan vazifalar ({result.pendingActions.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {result.pendingActions.map((task, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-800">{task.task}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Xat: {task.emailSubject} ({task.from})
                          </p>
                          {task.deadline && (
                            <p className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.deadline}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Recommendations */}
              {result.keyInsights && result.keyInsights.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      AI Tavsiyalari va Maslahatlar
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {result.keyInsights.map((insight, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-zinc-700 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Yopish
          </button>
          <button
            onClick={onRunAnalysis}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Qayta tahlil qilish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
