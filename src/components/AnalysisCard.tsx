import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CheckSquare,
  Square,
  Copy,
  Check,
  Tag,
  Smile,
  ShieldAlert,
  Send,
  RefreshCw,
} from 'lucide-react';
import { EmailAnalysis } from '../types';

interface AnalysisCardProps {
  analysis: EmailAnalysis;
  onRegenerateReply?: (instructions?: string, tone?: string) => void;
  isRegeneratingReply?: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onRegenerateReply,
  isRegeneratingReply = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(analysis.suggestedReply?.text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Nusxalashda xatolik:', err);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'yuqori':
        return {
          label: 'Shoshilinch / Yuqori',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          indicator: 'bg-red-500',
        };
      case 'o‘rta':
        return {
          label: 'O‘rta muhimlik',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          indicator: 'bg-amber-500',
        };
      default:
        return {
          label: 'Past / Ma\'lumot uchun',
          bg: 'bg-zinc-50',
          text: 'text-zinc-700',
          border: 'border-zinc-200',
          indicator: 'bg-zinc-400',
        };
    }
  };

  const urgencyStyle = getUrgencyConfig(analysis.urgency);

  return (
    <div className="space-y-4">
      {/* Phishing / Suspicious Warning */}
      {analysis.isSuspicious && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Ehtiyot bo‘ling! Shubhali xabar</h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {analysis.suspiciousReason || 'Xatda shubhali havolalar yoki firibgarlik belgilari aniqlangan bo‘lishi mumkin.'}
            </p>
          </div>
        </div>
      )}

      {/* Overview & Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Urgency */}
        <div className={`p-3 rounded-xl border ${urgencyStyle.bg} ${urgencyStyle.border}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 rounded-full ${urgencyStyle.indicator}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Muhimlik</span>
          </div>
          <p className={`text-xs font-bold ${urgencyStyle.text}`}>{urgencyStyle.label}</p>
          <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-2">{analysis.urgencyReason}</p>
        </div>

        {/* Category */}
        <div className="p-3 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-1.5 mb-1 text-zinc-500">
            <Tag className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Toifasi</span>
          </div>
          <p className="text-xs font-bold text-zinc-900 capitalize">{analysis.category}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Avtomatik tasniflandi</p>
        </div>

        {/* Sentiment */}
        <div className="p-3 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-1.5 mb-1 text-zinc-500">
            <Smile className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ohang</span>
          </div>
          <p className="text-xs font-bold text-zinc-900 capitalize">{analysis.sentiment}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Muloqot uslubi</p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Qisqacha mazmun (AI xulosa)</h4>
        </div>
        <p className="text-xs text-zinc-800 leading-relaxed font-normal">{analysis.summary}</p>
      </div>

      {/* Key Takeaways */}
      {analysis.keyPoints && analysis.keyPoints.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-zinc-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
            Asosiy fikrlar
          </h4>
          <ul className="space-y-1.5">
            {analysis.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items / Tasks Checklist */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
            Bajarilishi kerak bo‘lgan vazifalar
          </h4>
          <span className="text-[11px] text-zinc-400">
            {analysis.actionItems?.length || 0} ta vazifa
          </span>
        </div>

        {analysis.actionItems && analysis.actionItems.length > 0 ? (
          <div className="space-y-2">
            {analysis.actionItems.map((item, idx) => {
              const isDone = !!completedTasks[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isDone
                      ? 'bg-zinc-50 border-zinc-200 opacity-60'
                      : 'bg-white border-zinc-200 hover:border-blue-200 hover:bg-blue-50/20'
                  }`}
                >
                  <button className="mt-0.5 text-zinc-500 hover:text-blue-600 shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs ${
                        isDone ? 'line-through text-zinc-400' : 'font-medium text-zinc-800'
                      }`}
                    >
                      {item.task}
                    </p>
                    {item.deadline && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-700 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Muddat: {item.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">
            Ushbu xatda aniq vazifa yoki topshiriq talab qilinmagan.
          </p>
        )}
      </div>

      {/* Suggested Smart Reply */}
      {analysis.suggestedReply && (
        <div className="bg-white rounded-xl p-4 border border-zinc-200">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Tavsiya etilgan javob loyihasi
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-copy-reply"
                onClick={handleCopyReply}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
            {analysis.suggestedReply.text}
          </div>

          {/* Customize reply accordion */}
          {onRegenerateReply && (
            <div className="mt-3 pt-3 border-t border-zinc-100">
              {!showCustomPrompt ? (
                <button
                  onClick={() => setShowCustomPrompt(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Javobni o‘zgartirish yoki qayta yozish
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Qanday javob yozish kerak? (masalan: ertaga soat 15:00 da uchrashuvga rozi ekanimni ayt)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowCustomPrompt(false)}
                      className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-700"
                    >
                      Bekor qilish
                    </button>
                    <button
                      disabled={isRegeneratingReply}
                      onClick={() => {
                        onRegenerateReply(customPrompt);
                        setShowCustomPrompt(false);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {isRegeneratingReply && <RefreshCw className="w-3 h-3 animate-spin" />}
                      Qayta yaratish
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
