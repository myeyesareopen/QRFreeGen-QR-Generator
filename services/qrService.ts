import QRCode from 'qrcode';
import { QRCodeResult, GenerateOptions } from '../types';

const DEFAULT_OPTIONS: GenerateOptions = {
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
  width: 1024, // High resolution for download
  margin: 2,
};

/**
 * Generates both Data URL (PNG) and SVG string for the given text.
 */
export const generateQRCode = async (
  text: string, 
  options: Partial<GenerateOptions> = {}
): Promise<QRCodeResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const [dataUrl, svgString] = await Promise.all([
      QRCode.toDataURL(text, opts),
      QRCode.toString(text, { ...opts, type: 'svg' }),
    ]);

    return { dataUrl, svgString };
  } catch (error) {
    console.error("Error generating QR code", error);
    throw new Error("Failed to generate QR Code");
  }
};