import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: number | string;
}

export default function Modal({ isOpen, onClose, title, subtitle, children, width = 640 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock background body scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="fade-in"
        style={{
          width,
          maxWidth: '92vw',
          maxHeight: '85vh',
          background: 'var(--popover-bg)',
          border: '1px solid var(--popover-border)',
          borderRadius: 14,
          boxShadow: 'var(--popover-shadow)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          background: 'var(--popover-header-bg)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--popover-bg)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
