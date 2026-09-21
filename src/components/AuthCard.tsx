import React from 'react';
import { Mail, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthCardProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSignIn, isLoading, error }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8">
        {/* App Icon & Badge */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Email Analyzer</h2>
          <p className="text-sm text-zinc-600 mt-1">
            Gmail xabarlaringizni sun'iy intellekt (Gemini) yordamida tezkor tahlil qiling
          </p>
        </div>

        {/* Value propositions */}
        <div className="space-y-3 mb-8 bg-zinc-50/80 rounded-xl p-4 border border-zinc-100">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-700 leading-relaxed">
              <strong>Muhimlik va shoshilinchlik</strong> darajasini bir zumda aniqlang
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-700 leading-relaxed">
              <strong>Asosiy vazifalar (Action items)</strong> va muddatlarni avtomatik ajratib oling
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-700 leading-relaxed">
              <strong>Aqlli javob loyihasi</strong> (Smart draft reply) bilan vaqtingizni tejang
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-700 leading-relaxed">
              <strong>Shubhali xatlar va phishing</strong> xavflarini oldindan aniqlang
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Official Google Sign In Button */}
        <div className="flex justify-center">
          <button
            id="btn-google-signin"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg shadow-xs transition duration-150 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm text-zinc-700 hover:text-zinc-900"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Ulanmoqda...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>Google orqali kirish</span>
              </>
            )}
          </button>
        </div>

        {/* Security / Privacy notice */}
        <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-center gap-2 text-zinc-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Xavfsiz va shaxsiy: faqat o‘qish ruxsati (read-only)</span>
        </div>
      </div>
    </div>
  );
};
