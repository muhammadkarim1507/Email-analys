import React, { useState } from 'react';
import { X, Sparkles, Send, HelpCircle, Bot, User } from 'lucide-react';
import { EmailMessage } from '../types';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: EmailMessage[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AskAiModal: React.FC<AskAiModalProps> = ({ isOpen, onClose, emails }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Assalomu alaykum! Men sizning pochta qutingiz bo‘yicha yordamchingizman. Xatlaringiz haqida istalgan savolingizni bering (masalan: "Qaysi xatlarda to‘lov kutilmoqda?", "Kimga javob berishim shart?", "Hisobot bo‘yicha xat bormi?").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Qaysi xatlarga zudlik bilan javob berishim kerak?',
    'To‘lov yoki hisob-faktura (invoice) haqida xat bormi?',
    'Yaqin kunlarda qanday muddatlar (deadline) belgilangan?',
  ];

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputText).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          emails: emails.slice(0, 15),
        }),
      });

      if (!res.ok) {
        throw new Error('Javob olishda xatolik');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Javob shakllantirilmadi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: 'Kechirasiz, savolga javob berishda texnik xatolik yuz berdi. Qayta urinib ko‘ring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Xatlar bo‘yicha AI maslahatchi</h3>
              <p className="text-xs text-zinc-500">Mavjud {emails.length} ta xat asosida javob beradi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white rounded-tr-xs'
                    : 'bg-zinc-100 text-zinc-800 rounded-tl-xs whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-zinc-400' : 'text-zinc-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 italic p-2 bg-zinc-50 rounded-lg w-fit">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Gemini AI xatlarni ko‘zdan kechirmoqda...</span>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] bg-white border border-zinc-200 text-zinc-600 hover:text-blue-600 hover:border-blue-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Xatlar haqida savol bering..."
              className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
