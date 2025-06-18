import React from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}
