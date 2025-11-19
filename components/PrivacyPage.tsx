import React, { useEffect } from 'react';
import { LanguageCode, Translation } from '../types';
import Button from './Button';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { ShieldCheck, UploadCloud, HelpCircle, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  t: Translation;
  isRtl: boolean;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ currentLang, setCurrentLang, t, isRtl }) => {
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let previousContent: string | null = null;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    } else {
      previousContent = robotsMeta.getAttribute('content');
    }

    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (!robotsMeta) return;
      if (previousContent) {
        robotsMeta.setAttribute('content', previousContent);
      } else {
        robotsMeta.remove();
      }
    };
  }, []);

  const highlights = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
      title: t.browserInfoTitle,
      body: t.browserInfoDesc,
    },
    {
      icon: <UploadCloud className="w-5 h-5 text-green-600" />,
      title: t.shareBtn,
      body: t.cloudShareInfo,
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-green-600" />,
      title: t.faqTitle,
      body: t.footerPrivacy,
    },
  ];

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <SiteHeader
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        t={t}
        maxWidthClass="max-w-4xl"
      />

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8">
            <p className="text-sm uppercase tracking-wide text-green-600 font-semibold">{t.privacyLink}</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t.appTitle} {t.privacyLink}</h2>
            <p className="text-slate-600 leading-relaxed mt-4">{t.footerPrivacy}</p>
            <p className="text-slate-500 text-sm mt-2">{t.cloudShareInfo}</p>

            <div className="grid gap-4 mt-8">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/70">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-green-100">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-white">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <h3 className="text-base font-semibold text-slate-900">{t.howItWorks}</h3>
              </div>
              <ul className="px-6 py-5 space-y-3">
                {t.howItWorksSteps.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-6">
              <h3 className="text-base font-semibold text-green-800 flex items-center gap-2">
                <UploadCloud className="w-5 h-5" />
                {t.shareTitle}
              </h3>
              <p className="text-sm text-green-800 mt-2 leading-relaxed">{t.cloudShareInfo}</p>
              <p className="text-xs text-green-700 mt-2">{t.shareValidity}</p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button 
                variant="primary"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => { window.location.href = '/'; }}
              >
                {t.generateBtn}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter t={t} maxWidthClass="max-w-4xl" />
    </div>
  );
};

export default PrivacyPage;
