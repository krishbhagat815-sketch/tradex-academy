import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Activity,
  ShieldCheck,
  GraduationCap,
  Flame,
  Zap,
  LineChart,
  type LucideIcon
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getMediaUrl } from '../../utils/media';

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  BarChart3,
  LineChart,
  Activity,
  ShieldCheck,
  GraduationCap,
  Flame,
  Zap
};

export interface BrandLogoProps {
  variant?: 'navbar' | 'footer' | 'auth' | 'compact' | 'icon-only';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  iconClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  showText = true,
  showTagline = variant === 'navbar',
  className = '',
  iconClassName = ''
}) => {
  const { logo } = useSiteSettings();
  const [imgError, setImgError] = useState(false);

  const isImageMode = logo.logoType === 'image' && Boolean(logo.logoUrl) && !imgError;
  const SelectedIcon = ICON_MAP[logo.iconName] || TrendingUp;

  // Determine container dimensions based on variant
  const containerSize =
    variant === 'auth'
      ? 'w-12 h-12'
      : variant === 'footer'
      ? 'w-10 h-10'
      : variant === 'compact'
      ? 'w-8 h-8'
      : 'w-10 h-10';

  const iconSize =
    variant === 'auth'
      ? 'w-7 h-7'
      : variant === 'compact'
      ? 'w-5 h-5'
      : 'w-6 h-6';

  const radiusClass = logo.borderRadius || 'rounded-xl';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Graphic (Image or Styled Vector Icon) */}
      {isImageMode ? (
        <div
          className={`${containerSize} flex items-center justify-center flex-shrink-0 overflow-hidden ${radiusClass} shadow-md border border-slate-200/50 dark:border-slate-800 bg-white/5 dark:bg-slate-900/50`}
        >
          <img
            src={getMediaUrl(logo.logoUrl)}
            alt={logo.brandNamePrimary || 'The Safe Trading'}
            className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className={`${containerSize} ${radiusClass} flex items-center justify-center flex-shrink-0 shadow-md border border-slate-800 transition-transform ${iconClassName}`}
          style={{ backgroundColor: logo.bgColor || '#020617' }}
        >
          <SelectedIcon
            className={`${iconSize} stroke-[2.3]`}
            style={{ color: logo.iconColor || '#ef4444' }}
          />
        </div>
      )}

      {/* Brand Name Text & Tagline */}
      {showText && variant !== 'icon-only' && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-extrabold tracking-tight flex items-center gap-1.5 whitespace-nowrap ${
              variant === 'auth'
                ? 'text-2xl text-slate-900 dark:text-white'
                : variant === 'footer'
                ? 'text-xl text-slate-950 dark:text-white'
                : 'text-xl text-slate-950 dark:text-white'
            }`}
          >
            {logo.brandNamePrimary || 'The Safe'}
            <span
              style={{ color: logo.brandSecondaryColor || '#16a34a' }}
              className="font-black"
            >
              {logo.brandNameSecondary || 'Trading'}
            </span>
          </span>

          {showTagline && (
            <span className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 font-medium -mt-1 font-gujarati whitespace-nowrap truncate max-w-[220px]">
              {logo.brandTagline || 'ગુજરાતનું શ્રેષ્ઠ શેર બજાર અને ટ્રેડિંગ શિક્ષણ'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
