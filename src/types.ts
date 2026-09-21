export interface EmailHeader {
  name: string;
  value: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  fromName?: string;
  fromEmail?: string;
  to: string;
  date: string;
  timestamp: number;
  unread: boolean;
  starred: boolean;
  labels: string[];
  bodyText: string;
  bodyHtml?: string;
}

export type UrgencyLevel = 'yuqori' | 'o‘rta' | 'past';
export type SentimentType = 'rasmiy' | 'shoshilinch' | 'do‘stona' | 'shikoyat' | 'taklif' | 'neytral';
export type CategoryType = 'ish' | 'moliya' | 'shaxsiy' | 'reklama' | 'bildirishnoma' | 'boshqa';

export interface ActionItem {
  task: string;
  deadline?: string;
  priority?: 'yuqori' | 'o‘rta' | 'past';
}

export interface EmailAnalysis {
  emailId: string;
  summary: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  sentiment: SentimentType;
  category: CategoryType;
  actionItems: ActionItem[];
  keyPoints: string[];
  suggestedReply: {
    tone: string;
    text: string;
  };
  isSuspicious?: boolean;
  suspiciousReason?: string;
}

export interface BatchAnalysisResult {
  totalAnalyzed: number;
  overview: string;
  urgentEmails: Array<{
    emailId: string;
    subject: string;
    from: string;
    reason: string;
  }>;
  pendingActions: Array<{
    task: string;
    emailSubject: string;
    from: string;
    deadline?: string;
  }>;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  categoriesCount: Record<string, number>;
  keyInsights: string[];
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
