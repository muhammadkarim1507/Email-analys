import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  User,
  Star,
  FileText,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { EmailMessage, EmailAnalysis } from '../types';
import { AnalysisCard } from './AnalysisCard';

interface EmailDetailProps {
  email: EmailMessage | null;
  analysis: EmailAnalysis | null;
  onAnalyze: (email: EmailMessage) => void;
  isAnalyzing: boolean;
  onBackMobile?: () => void;
  onRegenerateReply?: (instructions?: string, tone?: string) => void;
  isRegeneratingReply?: boolean;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  analysis,
  onAnalyze,
  isAnalyzing,
  onBackMobile,
  onRegenerateReply,
  isRegeneratingReply,
}) => {
  const [viewTab, setViewTab] = useState<'analysis' | 'original'>('analysis');

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-zinc-50/50 text-center">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-800">Xat tanlanmagan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Chap tarafdagi ro‘yxatdan tahlil qilmoqchi bo‘lgan xabaringizni tanlang.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top action / navigation header */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-200 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100"
              title="Ro'yxatga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">
              {email.subject}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
              <span className="truncate">Kimdan: {email.fromName || email.from}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{email.date}</span>
            </div>
          </div>
        </div>

        {/* View Switch Tabs */}
        <div className="flex items-center gap-1.5 shrink-0">
          {analysis && (
            <div className="bg-zinc-100 p-0.5 rounded-lg flex items-center text-xs font-medium">
              <button
                id="tab-analysis"
                onClick={() => setViewTab('analysis')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewTab === 'analysis'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>AI Tahlil</span>
              </button>
              <button
                id="tab-original"
                onClick={() => setViewTab('original')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewTab === 'original'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Asl xat
              </button>
            </div>
          )}

          {/* Trigger Analyze button if not yet analyzed or re-analyze */}
          <button
            id="btn-analyze-email"
            onClick={() => onAnalyze(email)}
            disabled={isAnalyzing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs ${
              analysis
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Tahlil qilinmoqda...' : analysis ? 'Qayta tahlil' : 'AI bilan tahlil qilish'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50/40">
        {/* If analyzing right now */}
        {isAnalyzing && (
          <div className="p-8 text-center bg-white rounded-2xl border border-blue-100 shadow-xs mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">Gemini AI xatni tahlil qilmoqda</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Xat mazmuni o‘rganilib, muhimlik darajasi, vazifalar va javob loyihasi shakllantirilmoqda...
            </p>
          </div>
        )}

        {/* View Mode: AI Analysis */}
        {viewTab === 'analysis' && analysis ? (
          <AnalysisCard
            analysis={analysis}
            onRegenerateReply={onRegenerateReply}
            isRegeneratingReply={isRegeneratingReply}
          />
        ) : (
          /* View Mode: Original Email */
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-xs space-y-4">
            {/* Sender and recipient info card */}
            <div className="border-b border-zinc-100 pb-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Kimdan: <strong className="text-zinc-800">{email.from}</strong></span>
                {email.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
              </div>
              {email.to && (
                <div className="text-xs text-zinc-500">
                  Kimga: <span className="text-zinc-700">{email.to}</span>
                </div>
              )}
            </div>

            {/* If no analysis yet, prompt the user */}
            {!analysis && !isAnalyzing && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-blue-950">Ushbu xat hali tahlil qilinmagan</h5>
                    <p className="text-xs text-blue-800">
                      Muhim fikrlar, vazifalar va javob variantini olish uchun AI tahlilini ishga tushiring.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-prompt-analyze"
                  onClick={() => onAnalyze(email)}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0"
                >
                  Tahlil qilish
                </button>
              </div>
            )}

            {/* Email Body text */}
            <div className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-sans whitespace-pre-wrap break-words">
              {email.bodyText || email.snippet || 'Xat matni mavjud emas'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
