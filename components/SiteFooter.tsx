import React from 'react';
import { Translation } from '../types';

interface SiteFooterProps {
  t: Translation;
  maxWidthClass?: string;
}

const SiteFooter: React.FC<SiteFooterProps> = ({ t, maxWidthClass = 'max-w-5xl' }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className={`${maxWidthClass} mx-auto px-4 text-center`}>
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} {t.appTitle}. {t.footerRights}
        </p>
        <p className="text-slate-400 text-xs mt-2">
          {t.footerPrivacy}
        </p>
        <p className="text-slate-400 text-xs mt-2">
          <a href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
            {t.privacyLink}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
