import React from 'react';
import { Globe, Github } from 'lucide-react';
import { languages } from '../locales';
import { LanguageCode, Translation } from '../types';

interface SiteHeaderProps {
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  t: Translation;
  maxWidthClass?: string;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  currentLang,
  setCurrentLang,
  t,
  maxWidthClass = 'max-w-6xl',
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            <a
              href="https://qrfreegen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-baseline gap-1 hover:text-green-700 transition-colors"
            >
              {t.appTitle}
              <span className="text-green-600">.com</span>
            </a>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex items-center">
            <Globe className="w-4 h-4 text-slate-500 absolute left-2 pointer-events-none z-10" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md py-1.5 pl-8 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-slate-500">
              <svg className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <a
            href="https://github.com/myeyesareopen/QRFreeGen-QR-Generator"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="QRFreeGen GitHub repository"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
