import React, { useState, useCallback, useEffect } from 'react';
import { QRCodeResult, LanguageCode, ShareResponse } from './types';
import { generateQRCode } from './services/qrService';
import Button from './components/Button';
import { Toast } from './components/Toaster';
import { languages, translations } from './locales';
import { 
  QrCode, 
  Download, 
  Copy, 
  FileCode, 
  Image as ImageIcon, 
  Zap, 
  Trash2,
  Globe,
  UploadCloud,
  ShieldCheck,
  ListChecks,
  HelpCircle
} from 'lucide-react';

interface ShareDataResponse extends ShareResponse {
  dataUrl: string;
  svgString: string;
  text?: string;
}

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [generatedQR, setGeneratedQR] = useState<QRCodeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Sharing State
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Multi-language State
  // Initialize with saved language if available, otherwise auto-detect
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('qrfreegen_lang');
    if (saved && languages.some(l => l.code === saved)) {
      return saved as LanguageCode;
    }
    const browserLang = navigator.language.split('-')[0];
    if (languages.some(l => l.code === browserLang)) {
      return browserLang as LanguageCode;
    }
    return 'en';
  });

  const t = translations[currentLang];

  // Update document title and HTML lang attribute when language changes
  useEffect(() => {
    document.title = `${t.appTitle} - ${t.heroTitleStart} ${t.heroTitleEnd}`;
    document.documentElement.lang = currentLang;
    const langConfig = languages.find(l => l.code === currentLang);
    document.documentElement.dir = langConfig?.dir || 'ltr';
    localStorage.setItem('qrfreegen_lang', currentLang);
  }, [currentLang, t]);

  // Load shared QR if visiting via /s/:id link
  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/s\/([^/?#]+)/i);
    if (!pathMatch) {
      return;
    }
    const shareParam = pathMatch[1];

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadSharedQr = async () => {
      try {
        const response = await fetch(`/api/share?id=${shareParam}`);
        if (!response.ok) {
          throw new Error('Share not found');
        }
        const data: ShareDataResponse = await response.json();
        if (!data.dataUrl || !data.svgString) {
          throw new Error('Invalid share data');
        }
        if (cancelled) return;
        setGeneratedQR({
          dataUrl: data.dataUrl,
          svgString: data.svgString
        });
        setShareUrl(data.url);
      } catch (err) {
        if (!cancelled) {
          setError(t.shareExpired);
          setGeneratedQR(null);
          setShareUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSharedQr();

    return () => {
      cancelled = true;
    };
  }, [currentLang, t.shareExpired]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleGenerate = useCallback(async () => {
    if (!inputValue.trim()) {
      setError(t.errorEmpty);
      return;
    }
    
    setLoading(true);
    setError(null);
    setShareUrl(null); // Reset share URL on new generation
    
    try {
      // Simulate a tiny delay for better UX feeling of "processing"
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = await generateQRCode(inputValue);
      setGeneratedQR(result);
    } catch (err) {
      setError(t.errorGen);
    } finally {
      setLoading(false);
    }
  }, [inputValue, t]);

  const handleClear = () => {
    setInputValue('');
    setGeneratedQR(null);
    setShareUrl(null);
    setError(null);
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    if (format === 'png') {
      link.href = generatedQR.dataUrl;
      link.download = `qrcode-${Date.now()}.png`;
    } else {
      const blob = new Blob([generatedQR.svgString], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `qrcode-${Date.now()}.svg`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`${format.toUpperCase()} - ${t.toastDown}`);
  };

  const handleCopyBase64 = async () => {
    if (!generatedQR) return;
    try {
      await navigator.clipboard.writeText(generatedQR.dataUrl);
      showToast(t.toastCopyBase64);
    } catch (err) {
      showToast(t.toastFail, "error");
    }
  };

  const handleCopySVG = async () => {
    if (!generatedQR) return;
    try {
      await navigator.clipboard.writeText(generatedQR.svgString);
      showToast(t.toastCopySvg);
    } catch (err) {
      showToast(t.toastFail, "error");
    }
  };

  const handleShare = async () => {
    if (!generatedQR || isSharing) return;
    
    setIsSharing(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue,
          dataUrl: generatedQR.dataUrl,
          svgString: generatedQR.svgString
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data: ShareResponse = await response.json();
      setShareUrl(data.url);
      
      // Auto copy to clipboard
      await navigator.clipboard.writeText(data.url);
      showToast(t.shareSuccess);
    } catch (error) {
      console.error(error);
      showToast(t.shareFail, "error");
    } finally {
      setIsSharing(false);
    }
  };

  const isRtl = languages.find(l => l.code === currentLang)?.dir === 'rtl';

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {t.appTitle}<span className="text-green-600">.com</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Selector */}
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
              {/* Custom Arrow */}
              <div className="absolute right-2 pointer-events-none text-slate-500">
                <svg className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 items-start">
          
          {/* Builder Section */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                {t.heroTitleStart} <br className="hidden sm:block" />
                <span className="text-green-600">{t.heroTitleEnd}</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                {t.heroDesc}
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <div className={`relative group w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden transition-all duration-500 ${generatedQR ? 'p-8' : 'p-12 bg-slate-50'}`}>
                  
                  {/* Empty State */}
                  {!generatedQR && !loading && (
                    <div className="flex flex-col items-center justify-center text-center h-64 text-slate-400">
                      <div className="bg-slate-100 p-4 rounded-full mb-4 border border-slate-200">
                        <QrCode className="w-12 h-12" />
                      </div>
                      <p className="text-sm font-medium">{t.emptyState}</p>
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-green-600 opacity-50" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-green-600 animate-pulse">{t.generating}</p>
                    </div>
                  )}

                  {/* Result State */}
                  {generatedQR && !loading && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner">
                        <img 
                          src={generatedQR.dataUrl} 
                          alt="Generated QR Code" 
                          className="w-full h-auto max-w-[280px] rounded-lg" 
                        />
                      </div>
                      <p className="mt-6 text-xs text-slate-400 font-mono text-center break-all line-clamp-1 px-4 w-full">
                        {inputValue}
                      </p>
                      
                      {/* Share Link Display */}
                      {shareUrl && (
                        <div className="mt-4 w-full bg-green-50 border border-green-100 rounded-lg p-3 animate-in slide-in-from-top-2">
                          <p className="text-[11px] text-green-500 text-center mb-2">{t.shareValidity}</p>
                          <div className="flex items-center gap-2 bg-white border border-green-200 rounded px-2 py-1.5">
                            <input 
                              readOnly 
                              value={shareUrl} 
                              className="text-xs text-slate-600 flex-grow bg-transparent outline-none font-mono"
                              onClick={(e) => e.currentTarget.select()}
                            />
                            <Copy className="w-3 h-3 text-green-600 cursor-pointer" onClick={() => {
                              navigator.clipboard.writeText(shareUrl);
                              showToast(t.shareSuccess);
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {generatedQR && (
                  <div className="w-full max-w-xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="primary" 
                        onClick={() => handleDownload('png')}
                        icon={<ImageIcon className="w-4 h-4" />}
                      >
                        {t.downloadPng}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleDownload('svg')}
                        icon={<Download className="w-4 h-4" />}
                      >
                        {t.downloadSvg}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="ghost" 
                        className="bg-white border border-slate-200"
                        onClick={handleCopyBase64}
                        icon={<Copy className="w-4 h-4" />}
                      >
                        {t.copyBase64}
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="bg-white border border-slate-200"
                        onClick={handleCopySVG}
                        icon={<FileCode className="w-4 h-4" />}
                      >
                        {t.copySvg}
                      </Button>
                    </div>

                    {!shareUrl && (
                      <Button 
                        variant="outline" 
                        className="w-full border-green-200 hover:bg-green-50 text-green-700"
                        onClick={handleShare}
                        isLoading={isSharing}
                        icon={isSharing ? null : <UploadCloud className="w-4 h-4" />}
                      >
                        {isSharing ? t.sharing : t.shareBtn}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="qr-input" className="block text-sm font-semibold text-slate-700">
                    {t.inputLabel}
                  </label>
                  <div className="relative">
                    <textarea
                      id="qr-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      dir="ltr" // Input content usually is LTR (URLs, etc) even in RTL mode, but can be auto.
                      className={`w-full h-32 px-4 py-3 rounded-lg border ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-700 focus:border-green-500 focus:ring-green-500'} bg-slate-800 text-white focus:ring-2 transition-all resize-none font-medium placeholder:text-slate-400`}
                    />
                    {inputValue && (
                      <button 
                        onClick={handleClear}
                        className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors`}
                        title={t.clearTitle}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                </div>

                <Button 
                  onClick={handleGenerate} 
                  isLoading={loading} 
                  className="w-full py-3 text-base shadow-green-200 shadow-lg hover:shadow-green-300"
                  icon={<Zap className="w-4 h-4" />}
                >
                  {t.generateBtn}
                </Button>
              </div>
            </div>
          </div>

          {/* Guidance Section */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/60 p-6">
              <div className="flex gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{t.browserInfoTitle}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{t.browserInfoDesc}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                {t.cloudShareInfo}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/60 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{t.howItWorks}</h3>
                <ListChecks className="w-5 h-5 text-green-600" />
              </div>
              <ol className="mt-4 space-y-3">
                {t.howItWorksSteps.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-600 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">{t.faqTitle}</h3>
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-4">
                {t.faqItems.map((item, index) => (
                  <div key={`${item.question}-${index}`} className="border border-slate-100 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-800">{item.question}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {t.appTitle}. {t.footerRights}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            {t.footerPrivacy}
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;
