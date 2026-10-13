import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'tradex_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const { language } = useLanguage();
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Preference state
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: true,
    timestamp: ''
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }

    // Listener to re-open preferences modal from footer or settings
    const handleOpenPreferences = () => {
      setShowModal(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const finalPrefs: CookiePreferences = {
      ...prefs,
      essential: true,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPrefs));
    } catch (e) {
      console.warn('Could not save cookie preferences to localStorage', e);
    }
    setPreferences(finalPrefs);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: ''
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: ''
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  return (
    <>
      {/* Main Cookie Banner at Bottom */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label={language === 'gu' ? 'કૂકી સંમતિ' : 'Cookie Consent'}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="max-w-6xl mx-auto bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-500">
                <Cookie className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{language === 'gu' ? 'કૂકી અને ગોપનીયતા પસંદગીઓ' : 'Your Privacy & Cookie Preferences'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    GDPR & SEBI Compliant
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {language === 'gu'
                    ? 'અમે તમારા અનુભવને બહેતર બનાવવા, સુરક્ષિત લોગિન સુનિશ્ચિત કરવા અને ટ્રેડિંગ કોર્સનું વિશ્લેષણ કરવા માટે કૂકીઝનો ઉપયોગ કરીએ છીએ. તમે તમામ સ્વીકારી શકો છો અથવા તમારી પસંદગી અનુસાર કસ્ટમાઇઝ કરી શકો છો.'
                    : 'We use cookies to ensure secure student sessions, remember your language & video playback preferences, and provide personalized trading course recommendations. You can accept all, decline non-essential cookies, or customize your settings.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>{language === 'gu' ? 'પસંદગી કસ્ટમાઇઝ કરો' : 'Customize'}</span>
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all border border-slate-800 cursor-pointer"
              >
                {language === 'gu' ? 'માત્ર જરૂરી સ્વીકારો' : 'Reject Non-Essential'}
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/30 active:scale-95 cursor-pointer"
              >
                {language === 'gu' ? 'બધા સ્વીકારો' : 'Accept All'}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Detailed Customization Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="text-base sm:text-lg font-bold text-white">
                    {language === 'gu' ? 'કૂકી અને ડેટા ગોપનીયતા વ્યવસ્થાપન' : 'Manage Cookie Preferences'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'gu' ? 'તમારા ડેટા પર તમારું નિયંત્રણ છે' : 'You choose what information you share with us'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Categories */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {/* Category 1: Essential (Strictly Necessary) */}
              <div className="pt-2 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {language === 'gu' ? 'જરૂરી કૂકીઝ (આવશ્યક)' : 'Strictly Necessary Cookies'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Always Active
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    aria-label={language === 'gu' ? 'જરૂરી કૂકીઝ (હંમેશા સક્રિય)' : 'Strictly Necessary Cookies (Always Active)'}
                    className="w-5 h-5 accent-red-600 cursor-not-allowed opacity-75"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'gu'
                    ? 'આ કૂકીઝ વેબસાઇટ સુરક્ષા, વિદ્યાર્થી ઓથેન્ટિકેશન (JWT ટોકન્સ), પેમેન્ટ ગેટવે ચકાસણી અને શોપિંગ કાર્ટ માટે ફરજિયાત છે. તેને નિષ્ક્રિય કરી શકાતી નથી.'
                    : 'Required for core security, student user authentication, secure payment sessions, and enrollment verification. The platform cannot function properly without them.'}
                </p>
              </div>

              {/* Category 2: Functional & Language */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'gu' ? 'કાર્યાત્મક અને ભાષા પસંદગીઓ' : 'Functional & Language Preferences'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'gu'
                    ? 'તમારી પસંદગીની ભાષા (ગુજરાતી / English), વિડિયો પ્લેબેક સ્પીડ, વોલ્યુમ સેટિંગ્સ અને ડાર્ક/લાઇટ મોડ યાદ રાખે છે.'
                    : 'Remembers your chosen language (Gujarati / English), video lesson speed, audio volume, and player state so you never have to reselect them.'}
                </p>
              </div>

              {/* Category 3: Analytics & Performance */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'gu' ? 'વિશ્લેષણ અને પ્રદર્શન (Analytics)' : 'Analytics & Performance'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'gu'
                    ? 'અમને એ સમજવામાં મદદ કરે છે કે કયા વિષયો અને પાઠ સૌથી વધુ લોકપ્રિય છે જેથી અમે ટ્રેડિંગ શિક્ષણની ગુણવત્તા સતત સુધારી શકીએ.'
                    : 'Collects anonymous telemetry on lesson engagement and page load speeds to help our educators identify and improve the curriculum.'}
                </p>
              </div>

              {/* Category 4: Marketing & Communications */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'gu' ? 'માર્કેટિંગ અને ઑફર્સ' : 'Marketing & Live Session Offers'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'gu'
                    ? 'નવા લાઈવ વેબિનાર, સ્પેશિયલ ડિસ્કાઉન્ટ કૂપન્સ અને ૧-ઓન-૧ કાઉન્સેલિંગ સેશન વિશે સમયસર નોટિફિકેશન આપે છે.'
                    : 'Allows us to show relevant course discount popups, live webinar alerts, and tailored counseling recommendations.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {language === 'gu' ? 'માત્ર જરૂરી રાખો' : 'Reject Non-Essential'}
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  {language === 'gu' ? 'બધા પસંદ કરો' : 'Accept All'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
                >
                  {language === 'gu' ? 'પસંદગી સાચવો' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
