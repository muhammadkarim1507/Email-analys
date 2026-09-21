import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebase';
import { fetchGmailMessages } from './services/gmail';
import { EmailMessage, EmailAnalysis, BatchAnalysisResult, UserProfile } from './types';
import { Header } from './components/Header';
import { AuthCard } from './components/AuthCard';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { BatchAnalysisModal } from './components/BatchAnalysisModal';
import { AskAiModal } from './components/AskAiModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email data states
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred' | 'analyzed'>('all');

  // AI Analyses cache by email ID
  const [analyses, setAnalyses] = useState<Record<string, EmailAnalysis>>({});
  const [analyzingEmailIds, setAnalyzingEmailIds] = useState<Record<string, boolean>>({});

  // Batch analysis state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchAnalysisResult | null>(null);
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);

  // Ask AI state
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  // Reply regeneration state
  const [isRegeneratingReply, setIsRegeneratingReply] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser: User, accessToken: string) => {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });
        setToken(accessToken);
        setNeedsAuth(false);
        setAuthError(null);
      },
      () => {
        setNeedsAuth(true);
        setUser(null);
        setToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Fetch emails when user and token become available
  const loadEmails = async (currentToken?: string) => {
    const accToken = currentToken || token;
    if (!accToken) return;

    setIsLoadingEmails(true);
    try {
      const data = await fetchGmailMessages(accToken, { maxResults: 20 });
      setEmails(data.messages);
      if (data.messages.length > 0 && !selectedEmail) {
        setSelectedEmail(data.messages[0]);
      }
    } catch (err: any) {
      console.error('Error loading emails:', err);
      if (err.message === 'AUTH_EXPIRED') {
        setNeedsAuth(true);
        setAuthError('Gmail sessiyasi muddati tugadi. Iltimos, qayta kiring.');
      } else {
        setAuthError(err.message || 'Xabarlarni yuklab bo‘lmadi.');
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadEmails(token);
    }
  }, [token]);

  // Sign In handler
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
        setToken(result.accessToken);
        setNeedsAuth(false);
        await loadEmails(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setAuthError(err?.message || 'Google orqali kirishda xatolik yuz berdi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setEmails([]);
    setSelectedEmail(null);
    setAnalyses({});
    setBatchResult(null);
    setNeedsAuth(true);
  };

  // Analyze single email using server-side Gemini
  const handleAnalyzeEmail = async (emailToAnalyze: EmailMessage) => {
    if (analyzingEmailIds[emailToAnalyze.id]) return;

    setAnalyzingEmailIds((prev) => ({ ...prev, [emailToAnalyze.id]: true }));

    try {
      const res = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToAnalyze }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Tahlil qilishda xatolik yuz berdi');
      }

      const analysisData: EmailAnalysis = await res.json();
      setAnalyses((prev) => ({
        ...prev,
        [emailToAnalyze.id]: analysisData,
      }));
    } catch (err: any) {
      console.error('Email analysis error:', err);
      alert(err.message || 'Xatni tahlil qilishda xatolik yuz berdi.');
    } finally {
      setAnalyzingEmailIds((prev) => ({ ...prev, [emailToAnalyze.id]: false }));
    }
  };

  // Regenerate reply with custom user instructions
  const handleRegenerateReply = async (instructions?: string, customTone?: string) => {
    if (!selectedEmail) return;

    setIsRegeneratingReply(true);
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          customTone: customTone || 'professional va samimiy',
          userInstructions: instructions,
        }),
      });

      if (!res.ok) {
        throw new Error('Javob yaratishda xatolik yuz berdi');
      }

      const data = await res.json();
      if (analyses[selectedEmail.id]) {
        setAnalyses((prev) => ({
          ...prev,
          [selectedEmail.id]: {
            ...prev[selectedEmail.id],
            suggestedReply: {
              tone: customTone || 'custom',
              text: data.replyText,
            },
          },
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Javobni yangilab bo‘lmadi.');
    } finally {
      setIsRegeneratingReply(false);
    }
  };

  // Run Batch Inbox Analysis
  const handleRunBatchAnalysis = async () => {
    if (emails.length === 0 || isAnalyzingBatch) return;

    setIsAnalyzingBatch(true);
    try {
      const res = await fetch('/api/analyze-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emails.slice(0, 15) }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Guruhli tahlilda xatolik yuz berdi');
      }

      const data: BatchAnalysisResult = await res.json();
      setBatchResult(data);
    } catch (err: any) {
      console.error('Batch analysis error:', err);
      alert(err.message || 'Pochta qutisini umumiy tahlil qilishda xatolik yuz berdi.');
    } finally {
      setIsAnalyzingBatch(false);
    }
  };

  // Select email by ID from modal
  const handleSelectEmailById = (id: string) => {
    const found = emails.find((e) => e.id === id);
    if (found) {
      setSelectedEmail(found);
    }
  };

  if (needsAuth || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
        <Header
          user={null}
          onLogout={handleLogout}
          onOpenBatchAnalysis={() => {}}
          onOpenAskAi={() => {}}
          onRefresh={() => {}}
          isLoading={false}
          totalEmailsCount={0}
        />
        <AuthCard onSignIn={handleSignIn} isLoading={isLoggingIn} error={authError} />
      </div>
    );
  }

  const currentAnalysis = selectedEmail ? analyses[selectedEmail.id] : null;
  const isCurrentlyAnalyzing = selectedEmail ? !!analyzingEmailIds[selectedEmail.id] : false;

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans h-screen overflow-hidden">
      {/* App Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenBatchAnalysis={() => {
          setIsBatchModalOpen(true);
          if (!batchResult && emails.length > 0) {
            handleRunBatchAnalysis();
          }
        }}
        onOpenAskAi={() => setIsAskAiOpen(true)}
        onRefresh={() => loadEmails()}
        isLoading={isLoadingEmails}
        totalEmailsCount={emails.length}
      />

      {/* Main Container - Split View */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-2 sm:p-4 gap-4">
        {/* Left Column: Email List (hidden on mobile if an email is actively selected and viewed) */}
        <div
          className={`w-full md:w-5/12 lg:w-4/12 bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col ${
            selectedEmail ? 'hidden md:flex' : 'flex'
          }`}
        >
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.id || null}
            onSelectEmail={(em) => setSelectedEmail(em)}
            analyses={analyses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            isLoading={isLoadingEmails}
          />
        </div>

        {/* Right Column: Email Detail & AI Analysis */}
        <div
          className={`w-full md:w-7/12 lg:w-8/12 bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col ${
            !selectedEmail ? 'hidden md:flex' : 'flex'
          }`}
        >
          <EmailDetail
            email={selectedEmail}
            analysis={currentAnalysis}
            onAnalyze={handleAnalyzeEmail}
            isAnalyzing={isCurrentlyAnalyzing}
            onBackMobile={() => setSelectedEmail(null)}
            onRegenerateReply={handleRegenerateReply}
            isRegeneratingReply={isRegeneratingReply}
          />
        </div>
      </div>

      {/* Batch Analysis Modal */}
      <BatchAnalysisModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        result={batchResult}
        isLoading={isAnalyzingBatch}
        onRunAnalysis={handleRunBatchAnalysis}
        onSelectEmailById={handleSelectEmailById}
        emailsCount={emails.length}
      />

      {/* Ask AI About Emails Modal */}
      <AskAiModal
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        emails={emails}
      />
    </div>
  );
}
