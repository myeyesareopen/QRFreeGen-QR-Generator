import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
      type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};