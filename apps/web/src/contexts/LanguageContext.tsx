'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Language = 'vi' | 'en';

const DICTIONARY: Record<Language, Record<string, string>> = {
  vi: {
    // Navigation
    nav_home: 'Trang chủ',
    nav_about: 'Giới thiệu',
    nav_pricing: 'Bảng giá',
    nav_news: 'Tin tức',
    nav_faq: 'FAQ',
    nav_contact: 'Liên hệ',
    nav_login: 'Đăng nhập',
    nav_register: 'Đăng ký',

    // User Dropdown
    user_hello: 'Xin chào',
    user_balance: 'Số dư tài khoản',
    user_deposit: 'Nạp tiền',
    user_history: 'Lịch sử giao dịch',
    user_affiliate: 'Tiếp thị liên kết',
    user_guide: 'Hướng dẫn sử dụng',
    user_logs: 'Nhật ký hoạt động',
    user_settings: 'Cài đặt',
    user_feedback: 'Góp ý / Báo lỗi',
    user_logout: 'Đăng xuất',

    // Sidebar Portal
    side_profile: 'Hồ sơ',
    side_history: 'Lịch sử giao dịch',
    side_affiliate: 'Tiếp thị liên kết',
    side_pricing: 'Bảng giá',
    side_logs: 'Nhật ký hoạt động',
    side_guide: 'Hướng dẫn sử dụng',
    side_help: 'Trợ giúp',

    // Hero Section
    hero_tag: 'Nền Tảng AI Video SaaS Đột Phá',
    hero_title_1: 'Tự Động Hóa AI Video',
    hero_title_2: 'Bứt Phá Dân MMO',
    hero_desc: 'Giải pháp tự động hóa tạo video AI, cắt video ngắn, reup lách bản quyền MD5 & quản lý đa nền tảng tối ưu nhất hiện nay.',
    hero_cta_pricing: 'Xem Bảng Giá Mô-Đun',
    hero_cta_about: 'Tìm Hiểu Kiến Trúc',

    // Landing Features
    feat_title: '6 Mô-Đun Công Cụ Độc Lập Chuyên Sâu',

    // Pricing
    pricing_title: 'Bảng Giá Mô-Đun Sản Phẩm',
    pricing_subtitle: 'Lựa chọn gói công cụ phù hợp với quy mô tự động hóa MMO của bạn',
    pricing_select: 'Chọn gói này',
    pricing_vat: 'Giá đã bao gồm VAT',
    pricing_unlimited: 'Không giới hạn',
    pricing_threads: 'luồng xử lý',
    pricing_machines: 'máy dùng đồng thời',
    pricing_month: 'tháng',
    pricing_days: 'ngày',
    pricing_popular: 'PHỔ BIẾN NHẤT',
    pricing_trial_badge: 'TRẢI NGHIỆM MIỄN PHÍ',

    // Footer
    footer_tagline: 'Nền tảng Tự động hóa AI Video SaaS dành cho cộng đồng MMO TikTok, YouTube Shorts & Reels.',
    footer_products: 'Sản Phẩm',
    footer_support: 'Hỗ Trợ',
    footer_security: 'Bảo Mật',
    footer_module_pricing: 'Bảng giá mô-đun',
    footer_auto_feat: 'Tính năng tự động hóa',
    footer_about_us: 'Về EIGU Platform',
    footer_faq: 'Câu hỏi thường gặp (FAQ)',
    footer_news: 'Tin tức & Cập nhật',
    footer_contact: 'Liên hệ kỹ thuật',
    footer_terms_of_service: 'Quy định & Điều khoản sử dụng',
    footer_privacy_disclaimer: 'Chính sách bảo mật & Miễn trừ trách nhiệm',
    footer_rights: '© 2026 EIGU Platform. All rights reserved. Designed for High Performance MMO.',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_about: 'About Us',
    nav_pricing: 'Pricing',
    nav_news: 'News',
    nav_faq: 'FAQ',
    nav_contact: 'Contact',
    nav_login: 'Log In',
    nav_register: 'Sign Up',

    // User Dropdown
    user_hello: 'Hello',
    user_balance: 'Account Balance',
    user_deposit: 'Deposit',
    user_history: 'Transaction History',
    user_affiliate: 'Affiliate Program',
    user_guide: 'User Guide',
    user_logs: 'Activity Logs',
    user_settings: 'Settings',
    user_feedback: 'Feedback / Report',
    user_logout: 'Log Out',

    // Sidebar Portal
    side_profile: 'Profile',
    side_history: 'Transaction History',
    side_affiliate: 'Affiliate Program',
    side_pricing: 'Pricing',
    side_logs: 'Activity Logs',
    side_guide: 'User Guide',
    side_help: 'Help Center',

    // Hero Section
    hero_tag: 'Breakthrough AI Video SaaS Platform',
    hero_title_1: 'AI Video Automation',
    hero_title_2: 'Power Up MMO Creators',
    hero_desc: 'The ultimate automated AI video creation, auto short clipping, MD5 copyright bypass, and multi-platform channel scaling solution.',
    hero_cta_pricing: 'View Module Pricing',
    hero_cta_about: 'Explore Architecture',

    // Landing Features
    feat_title: '6 Specialized Independent Tool Modules',

    // Pricing
    pricing_title: 'Product Module Pricing',
    pricing_subtitle: 'Select the right tool package tailored for your MMO automation scale',
    pricing_select: 'Select this plan',
    pricing_vat: 'Includes VAT tax',
    pricing_unlimited: 'Unlimited',
    pricing_threads: 'processing threads',
    pricing_machines: 'concurrent machines',
    pricing_month: 'month',
    pricing_days: 'days',
    pricing_popular: 'MOST POPULAR',
    pricing_trial_badge: 'FREE TRIAL',

    // Footer
    footer_tagline: 'AI Video SaaS Automation Platform for TikTok, YouTube Shorts & Reels MMO Creator Community.',
    footer_products: 'Products',
    footer_support: 'Support',
    footer_security: 'Security & Legal',
    footer_module_pricing: 'Module Pricing',
    footer_auto_feat: 'Automation Features',
    footer_about_us: 'About EIGU Platform',
    footer_faq: 'Frequently Asked Questions (FAQ)',
    footer_news: 'News & Updates',
    footer_contact: 'Technical Support',
    footer_terms_of_service: 'Terms of Service & Usage',
    footer_privacy_disclaimer: 'Privacy Policy & Disclaimer',
    footer_rights: '© 2026 EIGU Platform. All rights reserved. Designed for High Performance MMO.',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'vi',
  setLanguage: () => { },
  toggleLanguage: () => { },
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('eigu_language') as Language;
    if (saved === 'vi' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('eigu_language', lang);
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'vi' ? 'en' : 'vi';
      localStorage.setItem('eigu_language', next);
      return next;
    });
  }, []);

  const t = useCallback((key: string): string => {
    const dict = DICTIONARY[language] || DICTIONARY.vi;
    return dict[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
