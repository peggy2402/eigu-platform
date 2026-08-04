'use client';

import { Sparkles, Mail, Shield, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 10,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        padding: '48px 24px 24px',
        color: 'var(--text-secondary)',
        fontSize: 14,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 40 }}>
        {/* Brand Column */}
        <div>
          <div className="footer-brand-logo" onClick={() => onNavigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
            <img src="/logo.png" alt="EIGU Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>EIGU Platform</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.6 }}>
            {t('footer_tagline')}
          </p>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{t('footer_products')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li className="footer-link" onClick={() => onNavigate('/pricing')}>{t('footer_module_pricing')}</li>
            <li className="footer-link" onClick={() => onNavigate('/')}>{t('footer_auto_feat')}</li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{t('footer_support')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li className="footer-link" onClick={() => onNavigate('/faq')}>{t('footer_faq')}</li>
            <li className="footer-link" onClick={() => onNavigate('/news')}>{t('footer_news')}</li>
            <li className="footer-link" onClick={() => onNavigate('/contact')}>{t('footer_contact')}</li>
          </ul>
        </div>

        {/* Security / Legal */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{t('footer_security')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li className="footer-link" onClick={() => onNavigate('/terms-of-service')}>
              {t('footer_terms_of_service')}
            </li>
            <li className="footer-link" onClick={() => onNavigate('/privacy-disclaimer')}>
              {t('footer_privacy_disclaimer')}
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
        {t('footer_rights')}
      </div>
    </footer>
  );
}
