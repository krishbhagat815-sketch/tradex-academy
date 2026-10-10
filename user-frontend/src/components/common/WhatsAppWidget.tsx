import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WhatsAppWidgetProps {
  phoneNumber?: string;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber = '919876543210' // Can be configured with actual WhatsApp business number
}) => {
  const { dict, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = language === 'gu' ? [
    'મને Free Stock Market Course કરવો છે.',
    'Options Trading Course ની fees કેટલી છે?',
    'Beginner માટે કયો Trading Course best છે?',
    'મને Demat Account setup કરવામાં help જોઈએ છે.'
  ] : [
    'I want to join the Free Stock Market Course.',
    'What are the fees for Options Trading Course?',
    'Which course is best for complete beginners?',
    'I need help setting up a Demat account.'
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || customMsg || dict.whatsapp.defaultMessage;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-700 rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  {dict.whatsapp.chatTitle}
                </h4>
                <p className="text-xs text-emerald-100/90 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                  {dict.whatsapp.onlineNow}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-950/90 text-sm space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed">
              <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'gu' ? 'નમસ્તે ટ્રેડર મિત્ર! 🙏' : 'Hello Trader! 🙏'}
              </p>
              <p>
                {language === 'gu'
                  ? 'કોર્સ, સિલેબસ કે લાઈવ ટ્રેડિંગ માર્ગદર્શન અંગે કોઈ પણ મૂંઝવણ હોય તો સીધો સંપર્ક કરો.'
                  : 'Have questions about course syllabus, live trading guidance or enrollment? Chat with our mentor directly.'}
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {language === 'gu' ? 'વારંવાર પૂછાતા પ્રશ્નો પસંદ કરો:' : 'Quick Questions:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all"
                  >
                    👉 {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'gu' ? 'તમારો સવાલ અહીં લખો...' : 'Type your question here...'}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title={dict.whatsapp.startChat}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
        </span>
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          {dict.whatsapp.tooltip}
        </span>
      </button>
    </div>
  );
};
