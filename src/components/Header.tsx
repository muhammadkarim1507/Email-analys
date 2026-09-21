import React from 'react';
import { Mail, Sparkles, LogOut, HelpCircle, BarChart3, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenBatchAnalysis: () => void;
  onOpenAskAi: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalEmailsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenBatchAnalysis,
  onOpenAskAi,
  onRefresh,
  isLoading,
  totalEmailsCount,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Email Analyzer</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">Gmail xabarlarini aqlli tahlil qilish va xulosa chiqarish</p>
            </div>
          </div>

          {/* Action buttons & User profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <>
                <button
                  id="btn-refresh-emails"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Xabarlarni yangilash"
                  className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                </button>

                <button
                  id="btn-batch-analysis"
                  onClick={onOpenBatchAnalysis}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors"
                  title="Oxirgi xatlar bo'yicha umumiy hisobot"
                >
                  <BarChart3 className="w-4 h-4 text-zinc-600" />
                  <span className="hidden md:inline">Inbox Tahlili</span>
                </button>

                <button
                  id="btn-ask-ai"
                  onClick={onOpenAskAi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
                  title="Xatlaringiz haqida AI ga savol bering"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>AI dan so‘rash</span>
                </button>

                {/* User avatar & logout */}
                <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-zinc-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Profil'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full ring-1 ring-zinc-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-zinc-900 truncate max-w-[120px]">
                      {user.displayName || 'Foydalanuvchi'}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>

                  <button
                    id="btn-logout"
                    onClick={onLogout}
                    title="Chiqish"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
