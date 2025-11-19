export interface QRCodeResult {
  dataUrl: string; // For PNG display and download
  svgString: string; // For SVG download and copy
}

export interface GenerateOptions {
  color: {
    dark: string;
    light: string;
  };
  width: number;
  margin: number;
}

export type DownloadFormat = 'png' | 'svg';

export type LanguageCode = 'en' | 'zh' | 'es' | 'hi' | 'ar' | 'pt' | 'bn' | 'ru' | 'ja' | 'fr';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Translation {
  appTitle: string;
  privacyLink: string;
  howItWorks: string;
  heroTitleStart: string;
  heroTitleEnd: string;
  heroDesc: string;
  browserInfoTitle: string;
  browserInfoDesc: string;
  cloudShareInfo: string;
  howItWorksSteps: string[];
  faqTitle: string;
  faqItems: FAQItem[];
  inputLabel: string;
  inputPlaceholder: string;
  generateBtn: string;
  generating: string;
  emptyState: string;
  downloadPng: string;
  downloadSvg: string;
  copyBase64: string;
  copySvg: string;
  footerRights: string;
  footerPrivacy: string;
  errorEmpty: string;
  errorGen: string;
  toastDown: string;
  toastCopyBase64: string;
  toastCopySvg: string;
  toastFail: string;
  clearTitle: string;
  shareBtn: string;
  shareTitle: string;
  shareSuccess: string;
  shareFail: string;
  sharing: string;
  shareValidity: string;
  shareExpired: string;
}

export interface ShareResponse {
  id: string;
  url: string;
  expiresIn?: number;
  expiresAt?: number;
}
