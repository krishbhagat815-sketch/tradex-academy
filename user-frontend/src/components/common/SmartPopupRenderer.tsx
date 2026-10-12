import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ArrowRight, Sparkles, Tag, Gift } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ActivePopup {
  id: string;
  title: string;
  description: string;
  type: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
  badge_text: string;
  bg_color: string;
  text_color: string;
  layout: string;
  animation: string;
  trigger_type: string;
  trigger_value: number;
  target_page: string;
  target_audience: string;
  frequency: string;
  priority: number;
}

export const SmartPopupRenderer: React.FC = () => {
  const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Reset on route change
    triggeredRef.current = false;
    setVisible(false);
    setActivePopup(null);

    // Don't show promotional popups on checkout or learning player to avoid distractions
    if (
      location.pathname.startsWith('/checkout') ||
      location.pathname.startsWith('/learn') ||
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register')
    ) {
      return;
    }

    let isMounted = true;
    let timerId: any = null;

    async function evaluatePopups() {
      try {
        const res = await api.get('/popups/active');
        if (!isMounted || !res.success || !res.popups || res.popups.length === 0) return;

        const popups: ActivePopup[] = res.popups;

        // Find highest priority popup that matches page, audience, and frequency
        for (const p of popups) {
          // 1. Page match
          if (p.target_page === 'home' && location.pathname !== '/' && location.pathname !== '/home') {
            continue;
          }
          if (p.target_page === 'courses' && !location.pathname.startsWith('/courses') && !location.pathname.startsWith('/course')) {
            continue;
          }

          // 2. Audience match
          if (p.target_audience === 'guests' && user) continue;
          if (p.target_audience === 'logged_in' && !user) continue;

          // 3. Frequency limit check
          if (p.frequency === 'once_per_session') {
            if (sessionStorage.getItem(`seen_popup_${p.id}`)) continue;
          } else if (p.frequency === 'once_per_day') {
            const today = new Date().toISOString().slice(0, 10);
            if (localStorage.getItem(`seen_popup_${p.id}`) === today) continue;
          }

          // Matched popup candidate!
          setupTrigger(p);
          break; // Only 1 popup at a time
        }
      } catch (err) {
        console.error('Error loading smart popups:', err);
      }
    }

    function setupTrigger(p: ActivePopup) {
      const show = () => {
        if (triggeredRef.current || !isMounted) return;
        triggeredRef.current = true;
        setActivePopup(p);
        setVisible(true);

        // Record impression
        api.post(`/popups/${p.id}/impression`, {}).catch(() => {});
      };

      if (p.trigger_type === 'immediate') {
        timerId = setTimeout(show, 600);
      } else if (p.trigger_type === 'delay') {
        const seconds = Math.max(1, p.trigger_value || 3);
        timerId = setTimeout(show, seconds * 1000);
      } else if (p.trigger_type === 'scroll') {
        const targetPercent = Math.min(95, Math.max(10, p.trigger_value || 40));
        const handleScroll = () => {
          const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
          if (scrollTotal <= 0) return;
          const currentPercent = (window.scrollY / scrollTotal) * 100;
          if (currentPercent >= targetPercent) {
            window.removeEventListener('scroll', handleScroll);
            show();
          }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
      } else if (p.trigger_type === 'exit_intent') {
        const handleMouseLeave = (e: MouseEvent) => {
          if (e.clientY <= 5) {
            document.removeEventListener('mouseleave', handleMouseLeave);
            show();
          }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
      } else {
        timerId = setTimeout(show, 2000);
      }
    }

    evaluatePopups();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [location.pathname, user]);

  const handleClose = () => {
    if (!activePopup) return;

    // Save frequency record
    if (activePopup.frequency === 'once_per_session') {
      sessionStorage.setItem(`seen_popup_${activePopup.id}`, 'true');
    } else if (activePopup.frequency === 'once_per_day') {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`seen_popup_${activePopup.id}`, today);
    }

    setVisible(false);
  };

  const handleCtaClick = () => {
    if (!activePopup) return;

    // Track click
    api.post(`/popups/${activePopup.id}/click`, {}).catch(() => {});

    handleClose();

    const dest = activePopup.cta_url || '/courses';
    if (dest.startsWith('http')) {
      window.open(dest, '_blank', 'noopener,noreferrer');
    } else {
      navigate(dest);
    }
  };

  if (!visible || !activePopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: activePopup.bg_color || '#ffffff',
          color: activePopup.text_color || '#0f172a'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-900/20 hover:bg-slate-900/40 text-slate-700 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Promotional Banner Top */}
        {activePopup.image_url && (
          <div className="w-full h-44 sm:h-52 bg-slate-100 overflow-hidden relative">
            <img
              src={activePopup.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
            {activePopup.badge_text && (
              <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{activePopup.badge_text}</span>
              </span>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-4 text-center">
          <div>
            {!activePopup.image_url && activePopup.badge_text && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
                <Tag className="w-3 h-3" />
                <span>{activePopup.badge_text}</span>
              </span>
            )}
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              {activePopup.title}
            </h3>
            {activePopup.description && (
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {activePopup.description}
              </p>
            )}
          </div>

          {/* CTA Action */}
          <div className="pt-2">
            <button
              onClick={handleCtaClick}
              className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{activePopup.cta_text || 'Claim Offer Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleClose}
              className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer transition-colors"
            >
              Maybe later, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
