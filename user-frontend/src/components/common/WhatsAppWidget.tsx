import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

interface WhatsAppWidgetProps {
  phoneNumber?: string;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber: initialPhone
}) => {
  const { dict, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [phone, setPhone] = useState(initialPhone || '917435961016');
  const [defaultMessage, setDefaultMessage] = useState('Hello, I would like to know more about your courses.');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/content/settings');
        if (res.success && res.settings) {
          if (res.settings.whatsapp_enabled !== undefined) {
            setEnabled(Boolean(res.settings.whatsapp_enabled));
          }
          if (res.settings.whatsapp_number) {
            setPhone(res.settings.whatsapp_number.replace(/[^0-9]/g, ''));
          }
          if (res.settings.whatsapp_default_message) {
            setDefaultMessage(res.settings.whatsapp_default_message);
          }
        }
      } catch (e) {
        // Fallback to defaults
      }
    }
    fetchSettings();
  }, []);

  if (!enabled) return null;

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
    const text = textToSend || customMsg || defaultMessage || dict.whatsapp.defaultMessage;
    const cleanPhone = phone.replace(/[^0-9]/g, '') || '917435961016';
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">
      {/* Popover Window (Modern Light / Dark Theme) */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 border-2 border-emerald-600 rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  The Safe Trading Support
                </h4>
                <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping inline-block" />
                  <span>Online • +91 7435961016</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/95 text-sm space-y-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs leading-relaxed shadow-2xs">
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'gu' ? 'નમસ્તે ટ્રેડર મિત્ર! 🙏' : 'Hello Trader! 🙏'}
              </p>
              <p>
                {language === 'gu'
                  ? 'કોર્સ, સિલેબસ કે લાઈવ ટ્રેડિંગ માર્ગદર્શન અંગે કોઈ પણ મૂંઝવણ હોય તો સીધો વ્હોટ્સએપ સંપર્ક કરો.'
                  : 'Have questions about course syllabus, algo trading, live mentorship, or enrollment? Chat with our team on WhatsApp.'}
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'gu' ? 'વારંવાર પૂછાતા પ્રશ્નો પસંદ કરો:' : 'Quick Questions:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50/60 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all cursor-pointer font-medium shadow-2xs"
                  >
                    👉 {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'gu' ? 'તમારો સવાલ અહીં લખો...' : 'Type your message...'}
                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer active:scale-95"
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
        aria-label="Contact us on WhatsApp"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
        </span>
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          WhatsApp Support
        </span>
      </button>
    </div>
  );
};
