import React from 'react';
import { Search, Inbox, AlertCircle, Sparkles, Star } from 'lucide-react';
import { EmailMessage, EmailAnalysis } from '../types';

interface EmailListProps {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  onSelectEmail: (email: EmailMessage) => void;
  analyses: Record<string, EmailAnalysis>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'all' | 'unread' | 'starred' | 'analyzed';
  onFilterChange: (filter: 'all' | 'unread' | 'starred' | 'analyzed') => void;
  isLoading: boolean;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  analyses,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  isLoading,
}) => {
  // Format date cleanly
  const formatDate = (dateStr: string, timestamp: number) => {
    if (!timestamp) return dateStr || '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getUrgencyBadge = (urgency?: string) => {
    if (!urgency) return null;
    if (urgency === 'yuqori') {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-100 text-red-700 border border-red-200">
          Shoshilinch
        </span>
      );
    }
    if (urgency === 'o‘rta') {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700 border border-amber-200">
          O‘rta
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
        Past
      </span>
    );
  };

  // Filter emails based on query and filter tab
  const filteredEmails = emails.filter((item) => {
    // Tab filter
    if (activeFilter === 'unread' && !item.unread) return false;
    if (activeFilter === 'starred' && !item.starred) return false;
    if (activeFilter === 'analyzed' && !analyses[item.id]) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = item.subject.toLowerCase().includes(q);
      const matchFrom = item.from.toLowerCase().includes(q);
      const matchSnippet = item.snippet.toLowerCase().includes(q);
      if (!matchSubject && !matchFrom && !matchSnippet) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      {/* Search Bar */}
      <div className="p-3 border-b border-zinc-100">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-emails"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Xatlardan qidirish (mavzu, yuboruvchi)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white placeholder:text-zinc-400 text-zinc-900 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
          <button
            id="filter-tab-all"
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
            }`}
          >
            Barchasi ({emails.length})
          </button>
          <button
            id="filter-tab-unread"
            onClick={() => onFilterChange('unread')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'unread'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
            }`}
          >
            O‘qilmagan ({emails.filter((e) => e.unread).length})
          </button>
          <button
            id="filter-tab-starred"
            onClick={() => onFilterChange('starred')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'starred'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
            }`}
          >
            Yulduzchali ({emails.filter((e) => e.starred).length})
          </button>
          <button
            id="filter-tab-analyzed"
            onClick={() => onFilterChange('analyzed')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'analyzed'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Tahlil qilingan ({Object.keys(analyses).length})
          </button>
        </div>
      </div>

      {/* Email List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {isLoading && emails.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-medium">Xatlar yuklanmoqda...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-700">Xatlar topilmadi</p>
            <p className="text-xs text-zinc-400 mt-1">
              {searchQuery ? 'Qidiruv so‘zini o‘zgartirib ko‘ring' : 'Bu toifada xatlar mavjud emas'}
            </p>
          </div>
        ) : (
          filteredEmails.map((item) => {
            const isSelected = item.id === selectedEmailId;
            const analysis = analyses[item.id];

            return (
              <button
                key={item.id}
                id={`email-item-${item.id}`}
                onClick={() => onSelectEmail(item)}
                className={`w-full text-left p-3.5 transition-colors cursor-pointer relative block ${
                  isSelected
                    ? 'bg-blue-50/70 hover:bg-blue-50'
                    : item.unread
                    ? 'bg-white hover:bg-zinc-50 font-semibold'
                    : 'bg-zinc-50/30 hover:bg-zinc-100/60'
                }`}
              >
                {/* Active selection bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                )}

                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                    {item.starred && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-zinc-900 truncate">
                      {item.fromName || item.from}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0 whitespace-nowrap">
                    {formatDate(item.date, item.timestamp)}
                  </span>
                </div>

                <p className="text-xs font-medium text-zinc-800 truncate mb-1">
                  {item.subject}
                </p>

                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {item.snippet || item.bodyText || ''}
                </p>

                {/* Badges / AI indicator */}
                <div className="flex items-center gap-1.5 mt-2">
                  {analysis ? (
                    <>
                      {getUrgencyBadge(analysis.urgency)}
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
                        <Sparkles className="w-2.5 h-2.5" />
                        Tahlil qilingan
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-normal">
                      Tahlil qilinmagan
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
