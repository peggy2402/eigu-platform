'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Scissors, Clapperboard, RefreshCw, TrendingUp, DownloadCloud,
  ArrowRight, Check, Shield, Zap, Play, HelpCircle, Mail, Globe, Wallet,
  User, Link as LinkIcon, Tag, History, BookOpen, ChevronRight, ChevronDown, X, AlertCircle, ShoppingCart, Star, Gift, ShieldAlert, FileText, Lock
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import type { ViewType } from '../components/layout/Sidebar';
import SettingsModal from '../components/user/SettingsModal';
import FeedbackView from '../components/feedback/FeedbackView';
import GuideView from '../components/guide/GuideView';
import ProfileView from '../components/profile/ProfileView';
import PricingModuleTabs from '../components/pricing/PricingModuleTabs';
import PricingGrid from '../components/pricing/PricingGrid';
import EventPopupModal from '../components/event/EventPopupModal';
import DepositModal from '../components/payment/DepositModal';
import TransactionHistoryView from '../components/payment/TransactionHistoryView';
import CheckoutView from '../components/pricing/CheckoutView';
import { pricingApi, themeEventApi, contactApi } from '../lib/api';
import type { PricingModuleDto, PricingTierDto } from '@eigu-platform/shared';
import TypewriterText from '../components/TypewriterText';
import FeatureModulesSection from '../components/modules/FeatureModulesSection';

const TESTIMONIALS_COL1 = [
  { name: 'Quỳnh Mai', handle: '@quynhmai_mmo', avatar: 'https://scontent.fhan2-5.fna.fbcdn.net/v/t1.15752-9/759188241_1776425700453909_6966335744454354739_n.jpg?stp=dst-jpg_tt6&cstp=mx1086x1086&ctp=s1086x1086&_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_ohc=YXc0j8wUbUgQ7kNvwEWGZZQ&_nc_oc=Ado1Pzc1RXZik11wE0uAy5OKmD5HXI7gmueCmDkeT4BfqYy_LuAQaBKeSjdshfP4OJfLNq-DQvr9JhWSo2FwP0Co&_nc_zt=23&_nc_ht=scontent.fhan2-5.fna&_nc_ss=7b2a8&oh=03_Q7cD6AHPtH3npzIp-myWNjM6y7xTS8sREvdbz2ChqX0u-2p5FQ&oe=6A9439E3', text: 'Giao diện dễ dùng, nạp tiền tự động nhanh gọn. Via Facebook ở đây trâu thật sự.' },
  { name: 'Quốc Việt', handle: '@viet.tool', avatar: 'https://scontent.fhan2-3.fna.fbcdn.net/v/t39.30808-1/706814391_10237745649334471_8324975932579465562_n.jpg?stp=c0.0.639.639a_dst-jpg_tt6&cstp=mx639x639&ctp=s480x480&_nc_cat=101&ccb=1-7&_nc_sid=1d2534&_nc_ohc=Ar_LK3ABNY4Q7kNvwF0CCeo&_nc_oc=AdozYX7e3Ng7kkXpkkQ0FxGH4gS74YIJzkMh6Cc-3NNHYkCzFyPifpvcbxNXbAz5o4U46JVdDMqewDskeck4W-fS&_nc_zt=24&_nc_ht=scontent.fhan2-3.fna&_nc_gid=-ECtGDU2pAlawf4s8w8Mjg&_nc_ss=7b2a8&oh=00_AQERy3RqXwh2JhAyl0L0HHwae8zvo9zgtDOOLOq8oByotQ&oe=6A72AE49', text: 'Tool TikTok Beta quét chuẩn, giúp mình tìm được nhiều niche ngon.' },
  { name: 'Hoàng Vũ', handle: '@hoangvu_reup', avatar: 'https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-1/740769964_2262304994526109_3319186987131902836_n.jpg?stp=c0.513.1535.1535a_dst-jpg_tt6&cstp=mx1535x1535&ctp=s480x480&_nc_cat=100&ccb=1-7&_nc_sid=e99d92&_nc_ohc=6dhfIFH_ZmgQ7kNvwHJZsSg&_nc_oc=Adru5kR8bX1MYFoq_Egdo0GDqb7R0TMgU00v0qsVjepA6g3R1ENlF_mmRpugACx9jEGoOZ6OjjlPWtFQ8sX-mvir&_nc_zt=24&_nc_ht=scontent.fhan2-4.fna&_nc_gid=I7bfJxNryXMoEUWHHi4Jxw&_nc_ss=7b2a8&oh=00_AQE6dZ8r3e_TSR0zmcY-jEpL-bIQeguwv8cxsAXwrRm7_w&oe=6A72BA02', text: 'Render GPU FFmpeg quá đỉnh, xuất 100 video ngắn chưa tới 5 phút.' },
];

const TESTIMONIALS_COL2 = [
  { name: 'Quỳnh Nga', handle: '@quynhnga03', avatar: 'https://scontent.fhan2-5.fna.fbcdn.net/v/t39.30808-1/653092117_890491337320585_4460693429795164629_n.jpg?stp=dst-jpg_tt6&cstp=mx960x960&ctp=s480x480&_nc_cat=107&ccb=1-7&_nc_sid=1d2534&_nc_ohc=9h6E79IXGZMQ7kNvwHxDWEa&_nc_oc=Adp8GgDXeWzCDWY5HyaUGHMg4db7Wzz-fons62aQ4acvUHnyLZ4GGMViE1VsjGIoVbOy2isoM76XHdDK-ga2axjB&_nc_zt=24&_nc_ht=scontent.fhan2-5.fna&_nc_gid=4brRv2jxcZrljU27TThGCA&_nc_ss=7b2a8&oh=00_AQHbDhw5leeTh_RQHt6SRaYTgU-VK2XdQhUmxdPu-2wmCA&oe=6A72BB77', text: 'Bên này giá rẻ nhưng chất lượng rất xịn. Proxy nhanh và sạch. Rất hợp để làm scraping.' },
  { name: 'Nguyên Lê', handle: '@nguyenle', avatar: 'https://scontent.fhan2-3.fna.fbcdn.net/v/t39.30808-1/726734263_1802296964288415_3076552080583587881_n.jpg?stp=dst-jpg_tt6&cstp=mx960x960&ctp=s480x480&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=AN7uHjFdrhIQ7kNvwGlogNU&_nc_oc=AdoMz5-0fipt4aaUrbXfP9d0MpiqYPLRIwhg-xR2uzbfBDgarMDluA9kfV_oTS4MU5AZK6dXUYvOwACpXpbdUjuM&_nc_zt=24&_nc_ht=scontent.fhan2-3.fna&_nc_gid=zXhyYi8p4Hk6bnaHyShNQw&_nc_ss=7b2a8&oh=00_AQE3Pl6oIf8qOGfArwzMAa5dDHowa1EYTnWgzOT7o-kv0w&oe=6A72BB47', text: 'Tốc độ cực nhanh, giá hợp lý. Affiliate thì trả hoa hồng sòng phẳng. Thật sự là lựa chọn sáng suốt.' },
  { name: 'Hoàng Sói', handle: '@hoangsoi222', avatar: 'https://scontent.fhan20-1.fna.fbcdn.net/v/t39.30808-6/552696311_4049612688638439_3289156807640768429_n.jpg?stp=dst-jpg_tt6&cstp=mx750x750&ctp=s750x750&_nc_cat=102&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=Mver_AxsQs0Q7kNvwHUjJyJ&_nc_oc=AdpqY9B9HgITeIkJyS-WnB0jV-kbi2pc998leM4V8eD16dc1w-gzi7PTbtrP-td2RfA_g1Opf8jhRNJ5Af4Mq--H&_nc_zt=23&_nc_ht=scontent.fhan20-1.fna&_nc_gid=RNrx0-4LYnW-BBGhOHRA3g&_nc_ss=7b2a8&oh=00_AQHqmRWtzqU936W-IeMOfLmNK5jJURUN1XHTWhBJtCsLwQ&oe=6A72ABC1', text: 'Tích hợp AI lồng tiếng đa ngôn ngữ chuẩn từng câu, kênh YouTube tăng trưởng 3x.' },
];

const TESTIMONIALS_COL3 = [
  { name: 'Hải Trần', handle: '@haitran.ai', avatar: 'https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-1/463770555_2345073559159719_6310891871607092124_n.jpg?stp=dst-jpg_tt6&cstp=mx1020x1020&ctp=s480x480&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_ohc=WSCyiABYqc8Q7kNvwFXsR3t&_nc_oc=Adp8oCq2vUCsiWCLQxwzN7SvAbd2cET7RUAcBBMO8zQQJIbSRKCXf7axX7ug866epV127J6BBAZqFsrKGbDcMdBz&_nc_zt=24&_nc_ht=scontent.fhan2-4.fna&_nc_gid=S7lRqbqnd3FWPMZnULnuTQ&_nc_ss=7b2a8&oh=00_AQGF3YhBA8xQBrIawM-ZRpdRMdW4FRG832_GdAE02p1hig&oe=6A72BC1E', text: 'Rất đáng để gắn bó lâu dài. Support nhiệt tình, tool update liên tục.' },
  { name: 'Thẩm Dương', handle: '@duongtham.mkt', avatar: 'https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/480461459_1214463133571649_3987242856595454700_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=245IaVTkbIMQ7kNvwH5zMPj&_nc_oc=Adq448Y1gm0iwaXtdMQsVTlg_6MZSRBC3UzneDzA5h4YYLOSy_GUEXekCLefBIkJIVFiQO4k7PSJBK84ATDUx5vW&_nc_zt=23&_nc_ht=scontent.fhan2-4.fna&_nc_gid=yjYXzvnMuK4CuZy-6BUEqA&_nc_ss=7b2a8&oh=00_AQHoxL1eF0CPV9wljZbziLo2ri_Cp5hlGnng4mYoAgfzTw&oe=6A72A607', text: 'Mình thích nhất tính năng lọc Proxy theo quốc gia, rất tiện cho việc nuôi nick.' },
  { name: 'Việt Đặng', handle: '@dangviet_crypto', avatar: 'https://scontent.fhan2-5.fna.fbcdn.net/v/t39.30808-1/726447410_2104030556846041_8499043667228629126_n.jpg?stp=dst-jpg_tt6&cstp=mx750x750&ctp=s480x480&_nc_cat=104&ccb=1-7&_nc_sid=e99d92&_nc_ohc=r9Zd7kYtMWwQ7kNvwFkgP52&_nc_oc=AdobwzVd4JKhDIfqdD0eTDGLGoOWb-uBY6X5Qj_sGDkvMDp0F4lboVNYIhdCbutg7bUaoUEpB482NFSjozYnfvjh&_nc_zt=24&_nc_ht=scontent.fhan2-5.fna&_nc_gid=pnktWfxNknuya0DvijIKYQ&_nc_ss=7b2a8&oh=00_AQG0Fendsf9xzEoRUYSvI8ImYBEjPe2zbtZxhx3Xn_7AyQ&oe=6A72A92C', text: 'Bypass Content ID TikTok mượt mà, không lo dính gậy bản quyền nữa!' },
];

const FALLBACK_PRICING_MODULES: PricingModuleDto[] = [
  {
    id: 'fb-cut',
    slug: 'cut',
    name: 'Tự động cắt video',
    tagline: 'Tự động phân đoạn video 1-20 phút và tối ưu 9:16',
    icon: 'Scissors',
    isActive: true,
    sortOrder: 0,
    tiers: [
      {
        id: 'fb-cut-trial',
        code: 'trial',
        label: 'Trial',
        tagline: 'Gói trải nghiệm miễn phí 7 ngày',
        price: 0,
        originalPrice: 0,
        discount: 0,
        formattedPrice: 'Miễn phí',
        formattedOriginalPrice: null,
        billingPeriod: 'trial',
        trialDays: 7,
        machines: 1,
        threads: 2,
        resolution: '720p',
        badge: 'TRẢI NGHIỆM MIỄN PHÍ',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Cắt video 1-20 phút', 'Silence Detection', 'Tự chỉnh tỉ lệ khung hình 9:16', 'Xuất video cơ bản'],
      },
      {
        id: 'fb-cut-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho Creator & Reuper chuyên nghiệp',
        price: 350000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '350.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Tối ưu GPU Hardware Render', 'Xuất chuẩn 1080p/2K/4K', 'Tạo phụ đề tự động', 'Hỗ trợ kỹ thuật ưu tiên 24/7'],
      },
    ],
  },
  {
    id: 'fb-ai-video',
    slug: 'ai-video',
    name: 'Tạo video AI',
    tagline: 'Tạo video ngắn viral chất lượng cao bằng AI',
    icon: 'Sparkles',
    isActive: true,
    sortOrder: 1,
    tiers: [
      {
        id: 'fb-ai-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho người tạo nội dung chuyên nghiệp',
        price: 450000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '450.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Sinh video AI từ ý tưởng/hình ảnh', 'Mẫu video viral có sẵn', 'Xuất độ phân giải cao', 'Hỗ trợ 24/7'],
      },
    ],
  },
  {
    id: 'fb-ai-studio',
    slug: 'ai-studio',
    name: 'AI Video Studio',
    tagline: 'Dựng phim, lồng tiếng AI & tạo phụ đề chuẩn xác',
    icon: 'Clapperboard',
    isActive: true,
    sortOrder: 2,
    tiers: [
      {
        id: 'fb-studio-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Gói Studio cao cấp cho Creator',
        price: 500000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '500.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Lồng tiếng AI đa ngôn ngữ', 'Auto Subtitles chuẩn xác', 'Dựng phim chuyên sâu', 'Hỗ trợ 24/7'],
      },
    ],
  },
  {
    id: 'fb-reup',
    slug: 'reup',
    name: 'Tạo video reup',
    tagline: 'Bypass thuật toán Content ID TikTok & Reels',
    icon: 'RefreshCw',
    isActive: true,
    sortOrder: 3,
    tiers: [
      {
        id: 'fb-reup-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Lách bản quyền tự động tốc độ cao',
        price: 400000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '400.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Noise Injection & Video Flip', '3D Audio Spatial Panning', 'Anti-Detect Fingerprint Engine', 'Hỗ trợ 24/7'],
      },
    ],
  },
  {
    id: 'fb-hot-niche',
    slug: 'hot-niche',
    name: 'Tìm ngách hot',
    tagline: 'Quét xu hướng thị trường và bóc tách đối thủ',
    icon: 'TrendingUp',
    isActive: true,
    sortOrder: 4,
    tiers: [
      {
        id: 'fb-niche-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Phân tích ngách viral tự động',
        price: 300000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '300.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 4,
        resolution: '-',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Quét ngách xu hướng 24/7', 'Phân tích kênh đối thủ', 'Báo cáo từ khóa viral', 'Hỗ trợ 24/7'],
      },
    ],
  },
  {
    id: 'fb-bulk',
    slug: 'bulk-download',
    name: 'Tải video hàng loạt',
    tagline: 'Tải trọn bộ Kênh TikTok/YouTube không watermark',
    icon: 'DownloadCloud',
    isActive: true,
    sortOrder: 5,
    tiers: [
      {
        id: 'fb-bulk-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Tải hàng loạt tốc độ siêu nhanh',
        price: 250000,
        originalPrice: 0,
        discount: 0,
        formattedPrice: '250.000đ',
        formattedOriginalPrice: null,
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 10,
        resolution: 'Original',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Tải không watermark logo', 'Tải trọn bộ kênh 1-click', 'Tốc độ đa luồng tối đa', 'Hỗ trợ 24/7'],
      },
    ],
  },
];

export default function Home({ initialPath }: { initialPath?: string } = {}) {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  // Navigation State
  const [activePath, setActivePath] = useState<string>(initialPath || '/');
  const [activeUserView, setActiveUserView] = useState<ViewType>('ho-so');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  // Pricing State
  const [pricingModules, setPricingModules] = useState<PricingModuleDto[]>(FALLBACK_PRICING_MODULES);
  const [activeModuleSlug, setActiveModuleSlug] = useState<string>('cut');
  const [pricingLoading, setPricingLoading] = useState<boolean>(true);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Selected Checkout State
  const [selectedCheckout, setSelectedCheckout] = useState<{ tier: PricingTierDto; moduleSlug: string } | null>(null);

  // FAQ Accordion & SubTab State
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [faqSubTab, setFaqSubTab] = useState<'faq' | 'terms'>('faq');

  // Contact Form Real Submission State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  // Fetch Pricing Data
  const fetchPricing = useCallback(async () => {
    setPricingLoading(true);
    setPricingError(null);
    try {
      const res = await pricingApi.getPricing();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPricingModules(res.data);
        if (!res.data.some((m: PricingModuleDto) => m.slug === activeModuleSlug)) {
          setActiveModuleSlug(res.data[0].slug);
        }
      } else {
        setPricingModules(FALLBACK_PRICING_MODULES);
      }
    } catch (err: any) {
      console.warn('Lỗi tải dữ liệu pricing, sử dụng dữ liệu dự phòng:', err);
      setPricingModules(FALLBACK_PRICING_MODULES);
    } finally {
      setPricingLoading(false);
    }
  }, [activeModuleSlug]);

  // Event Popup State
  const [eventPopupOpen, setEventPopupOpen] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    const isHidden = typeof window !== 'undefined' ? localStorage.getItem('eigu_hide_event_popup') : null;
    if (!isHidden) {
      const timer = setTimeout(() => setEventPopupOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseEventPopup = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('eigu_hide_event_popup', 'true');
    }
    setEventPopupOpen(false);
  };

  // Theme & Background Config State
  const [themeConfig, setThemeConfig] = useState<any>(null);

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await themeEventApi.getConfig();
        if (res && res.success && res.data) {
          const cfg = res.data;
          setThemeConfig(cfg);
          if (cfg.season) {
            document.documentElement.setAttribute('data-season', cfg.season);
            localStorage.setItem('eigu_season', cfg.season);
          }
          if (cfg.bgStyle) {
            document.documentElement.setAttribute('data-bg-style', cfg.bgStyle);
          }
          if (cfg.primaryColor) {
            document.documentElement.style.setProperty('--accent', cfg.primaryColor);
            document.documentElement.style.setProperty('--accent-glow', `${cfg.primaryColor}44`);
            document.documentElement.style.setProperty('--accent-glow-subtle', `${cfg.primaryColor}1a`);
            localStorage.setItem('eigu_accent', cfg.primaryColor);
            localStorage.setItem('eigu_accent_glow', `${cfg.primaryColor}44`);
            localStorage.setItem('eigu_accent_glow_subtle', `${cfg.primaryColor}1a`);
            // Derive hover color (slightly darker)
            const accentHover = cfg.accentHover || cfg.primaryColor;
            document.documentElement.style.setProperty('--accent-hover', accentHover);
            localStorage.setItem('eigu_accent_hover', accentHover);
          }
        }
      } catch (e) {
        console.warn('Lỗi nạp Theme Config:', e);
      }
    }
    loadTheme();
  }, []);

  const resolveBgImage = (url?: string): string => {
    const fallback = 'https://genzshop.vn/assets/images/background.png';
    if (!url) return fallback;
    const clean = url.trim();
    if (clean.includes('motionelements.com') || clean.includes('stock-image') || (!clean.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) && !clean.includes('genzshop') && !clean.includes('unsplash') && !clean.includes('cdn') && !clean.includes('static'))) {
      return fallback;
    }
    return clean;
  };

  useEffect(() => {
    fetchPricing();
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/about') {
        setActivePath('/');
      } else if (['/pricing', '/news', '/faq', '/contact', '/'].includes(currentPath)) {
        setActivePath(currentPath);
      }
    }
  }, [fetchPricing]);

  // Navigate Handler
  const handleNavigate = (path: string) => {
    if (path.startsWith('/auth/')) {
      router.push(path);
      return;
    }
    if (path === '/about') {
      setActivePath('/');
    } else if (path === '/dashboard/transactions') {
      setActivePath('/dashboard');
      setActiveUserView('lich-su');
    } else {
      setActivePath(path);
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path === '/about' ? '/' : path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTier = (tier: PricingTierDto, moduleSlug: string) => {
    setSelectedCheckout({ tier, moduleSlug });
    setActivePath('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeModuleData = pricingModules.find(m => m.slug === activeModuleSlug) || null;

  if (authLoading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: 0,
      }}>
        {/* Ambient glow blobs */}
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', right: '25%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
          opacity: 0.5,
        }} />

        {/* Logo + spinner ring */}
        <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 32 }}>
          {/* Outer spinning ring */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--accent)',
            borderRightColor: 'var(--accent)',
            animation: 'eigu-spin 1s linear infinite',
          }} />
          {/* Inner soft ring */}
          <div style={{
            position: 'absolute', inset: 6,
            borderRadius: '50%',
            border: '2px solid var(--border-color)',
          }} />
          {/* Logo centered */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src="/logo.png"
              alt="EIGU"
              style={{
                width: 52, height: 52, objectFit: 'contain',
                filter: 'drop-shadow(0 0 16px var(--accent))',
                animation: 'eigu-pulse 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Brand name */}
        <div style={{
          fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px',
          color: 'var(--text-primary)', marginBottom: 8,
        }}>
          EIGU <span style={{ color: 'var(--accent)' }}>Platform</span>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 13, color: 'var(--text-muted)', marginBottom: 36, fontWeight: 400,
        }}>
          AI Automation Engine
        </div>

        {/* Pulsing dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent)',
              animation: `eigu-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>

        {/* Inline keyframes */}
        <style>{`
          @keyframes eigu-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes eigu-pulse {
            0%, 100% { filter: drop-shadow(0 0 16px var(--accent)); }
            50%       { filter: drop-shadow(0 0 28px var(--accent)) brightness(1.2); }
          }
          @keyframes eigu-bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%           { transform: scale(1.1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const currentBgStyle = themeConfig?.bgStyle || 'particles';

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Strict 4-Mode Seasonal Background Engine */}
      {currentBgStyle === 'custom-image' ? (
        <div
          className="custom-bg-image-layer"
          style={{ backgroundImage: `url("${resolveBgImage(themeConfig?.bgImageUrl)}")` }}
        />
      ) : currentBgStyle === 'tech-grid' ? (
        <>
          <div className="season-backdrop" />
          <div className="tech-grid-pattern" style={{ opacity: 0.35 }} />
        </>
      ) : currentBgStyle === 'aurora-glow' ? (
        <div className="season-backdrop" />
      ) : (
        /* Default Mode: 'particles' (Hạt Động Bốn Mùa) */
        <>
          <div className="season-backdrop" />
          <div className="tech-grid-pattern" style={{ opacity: 0.12 }} />
          <div className="season-particles-container">
            <div className="seasonal-particle" style={{ left: '8%', animationDelay: '0s', animationDuration: '18s' }} />
            <div className="seasonal-particle" style={{ left: '22%', animationDelay: '4s', animationDuration: '22s' }} />
            <div className="seasonal-particle" style={{ left: '42%', animationDelay: '2s', animationDuration: '16s' }} />
            <div className="seasonal-particle" style={{ left: '62%', animationDelay: '7s', animationDuration: '20s' }} />
            <div className="seasonal-particle" style={{ left: '82%', animationDelay: '3s', animationDuration: '24s' }} />
          </div>
        </>
      )}

      {/* Event Popup Dialog */}
      <EventPopupModal onNavigatePricing={() => handleNavigate('/pricing')} />

      {/* Global Header */}
      <Header
        activePath={activePath}
        onNavigate={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onOpenDeposit={() => setDepositOpen(true)}
      />
      {/* Scroll Edge Dissolve Mask (Soft gradient dissolve behind navbar) */}
      <div className="nav-scroll-dissolve-mask" aria-hidden="true" />

      {/* Settings Modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {/* Deposit Modal */}
      {depositOpen && <DepositModal onClose={() => setDepositOpen(false)} />}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setFeedbackOpen(false)}>
          <div style={{ width: '100%', maxWidth: 520, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Góp ý / Báo lỗi</h3>
              <button onClick={() => setFeedbackOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <FeedbackView />
          </div>
        </div>
      )}

      {/* SINGLE GLOBAL MAIN CONTENT WRAPPER WITH --nav-clearance */}
      <main className="site-main-container">
        {/* ==================== 1. LANDING PAGE HOME (/) ==================== */}
        {activePath === '/' && (
          <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: 60 }}>
            {/* Hero Section */}
            <section style={{ padding: '0 24px 40px', maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 48 }}>
                {/* Left Column (Text & Downloads) */}
                <div style={{ flex: '1 1 500px', maxWidth: 620 }}>
                  {/* Version Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 20, background: 'var(--accent-glow)', border: '1px solid var(--accent)', backdropFilter: 'blur(10px)', marginBottom: 28 }}>
                    <span style={{ position: 'relative', display: 'flex', width: 10, height: 10 }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                      <span style={{ position: 'relative', borderRadius: '50%', width: 10, height: 10, background: 'var(--accent)' }} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      {themeConfig?.badgeText || (language === 'en' ? 'Version 3.0 Live Engine Available' : 'Phiên bản mới 3.0 đã ra mắt')}
                    </span>
                  </div>

                  {/* Main Headlines */}
                  <h1 style={{ fontSize: 'min(4rem, 9vw)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16, color: 'var(--text-primary)' }}>
                    {language === 'en' ? 'Software Solution,' : 'Giải pháp phần mềm,'} <br />
                    <span style={{ background: 'linear-gradient(135deg, var(--text-primary) 0%, #fcd34d 40%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {language === 'en' ? 'Automation' : 'Tự động hóa'}
                    </span>
                  </h1>
                  <h2 style={{ fontSize: 'min(2.5rem, 6vw)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.2 }}>
                    {language === 'en' ? '& ' : '& '}
                    <TypewriterText
                      phrases={
                        language === 'en'
                          ? ['Professional AI Support', 'Complete AI Solution', 'AI for Every Task', 'Unlock AI Power', 'Priority 24/7 Support']
                          : ['Hỗ trợ AI chuyên nghiệp', 'Giải pháp AI toàn diện', 'AI cho mọi tác vụ', 'Khai phá sức mạnh AI', 'Ưu tiên hỗ trợ 24/7']
                      }
                      style={{
                        background: 'linear-gradient(135deg, var(--text-secondary) 0%, var(--accent) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    />
                  </h2>

                  {/* Subtitle */}
                  <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, fontWeight: 300 }}>
                    {language === 'en'
                      ? 'Optimize your MMO workflow. Save hours every day with high-scale AI content creation & anti-copyright automation.'
                      : 'Tối ưu hóa quy trình làm việc của bạn. Tiết kiệm hàng giờ đồng hồ mỗi ngày với công cụ tự động hóa thông minh dành cho doanh nghiệp.'}
                  </p>

                  {/* Download Action Buttons */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
                    <a
                      href="/downloads/eigu-installer-win.exe"
                      onClick={e => { e.preventDefault(); alert(language === 'en' ? 'Downloading EIGU Desktop Engine for Windows (.exe)' : 'Đang tải EIGU Desktop Engine cho Windows (.exe)'); }}
                      className="btn-primary-download"
                      style={{ padding: '14px 28px', borderRadius: 9999, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8" /></svg>
                      {language === 'en' ? 'Download for Windows' : 'Tải cho Windows'}
                      <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>(.exe)</span>
                    </a>

                    <a
                      href="/downloads/eigu-installer-mac.pkg"
                      onClick={e => { e.preventDefault(); alert(language === 'en' ? 'Downloading EIGU Desktop Engine for macOS (.pkg)' : 'Đang tải EIGU Desktop Engine cho macOS (.pkg)'); }}
                      className="btn-secondary-download"
                      style={{ padding: '14px 28px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.7-.13 1.84-.01 2.96 1.07.08 2.16-.56 2.82-1.36z" /></svg>
                      {language === 'en' ? 'Download for macOS' : 'Tải cho macOS'}
                      <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 400 }}>(.pkg)</span>
                    </a>
                  </div>

                  {/* Trust Indicators */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={18} style={{ color: 'var(--text-secondary)' }} />
                      {language === 'en' ? '100% Safe & Verified' : 'An toàn 100%'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={18} style={{ color: 'var(--text-secondary)' }} />
                      {language === 'en' ? 'Instant 1-Click Install' : 'Cài đặt nhanh'}
                    </div>
                  </div>
                </div>

                {/* Right Column (3D Interactive Tilt Card Window Mockup) */}
                <div className="perspective-container" style={{ flex: '1 1 440px', maxWidth: 540 }}>
                  <div
                    className="tilt-card"
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 3',
                      borderRadius: 20,
                      background: '#171717',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top Bar macOS Style */}
                    <div style={{ height: 44, background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, position: 'relative', zIndex: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>
                        EIGU DASHBOARD
                      </div>
                    </div>

                    {/* Window Inner Content Mockup */}
                    <div style={{ padding: 20, height: 'calc(100% - 44px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: 120, height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
                        <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                      </div>

                      <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                        {/* Fake Sidebar */}
                        <div style={{ width: '28%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ height: 28, background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: 6 }} />
                          <div style={{ height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
                          <div style={{ height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
                          <div style={{ height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
                        </div>

                        {/* Fake Dashboard Body */}
                        <div style={{ width: '72%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Fake Chart */}
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 12, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <div style={{ width: '16%', height: '45%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} />
                            <div style={{ width: '16%', height: '65%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} />
                            <div style={{ width: '16%', height: '90%', background: 'rgba(59, 130, 246, 0.95)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                              <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#000', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>Đỉnh</div>
                            </div>
                            <div style={{ width: '16%', height: '70%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} />
                            <div style={{ width: '16%', height: '55%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} />
                            <div style={{ width: '16%', height: '80%', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '4px 4px 0 0' }} />
                          </div>

                          {/* Fake List */}
                          <div style={{ height: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} />
                              <div style={{ height: 8, width: '70%', background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa' }} />
                              <div style={{ height: 8, width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Card 1: Task Completed */}
                    <div className="animate-float" style={{ position: 'absolute', right: -20, top: 70, background: 'rgba(23, 23, 23, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Auto Task #402</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>Hoàn tất 100%</div>
                      </div>
                    </div>

                    {/* Floating Card 2: AI Status Active */}
                    <div className="animate-float-delayed" style={{ position: 'absolute', left: -16, bottom: 40, background: 'rgba(23, 23, 23, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <Sparkles size={18} />
                        </div>
                        <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #171717' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>AI Assistant</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>Đang hoạt động</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Modules Grid with Hover Glow & Detail Modal */}
            <FeatureModulesSection />

            {/* About & Architecture Section (Merged from Giới Thiệu) */}
            <section style={{ padding: '40px 24px 60px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10 }}>
              {/* Section Header */}
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
                  <Sparkles size={16} />
                  <span>{language === 'en' ? 'About EIGU Platform' : 'Về Chúng Tôi'}</span>
                </div>
                <h2 style={{ fontSize: 'min(2.75rem, 7vw)', fontWeight: 900, marginBottom: 18, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {language === 'en' ? 'About EIGU Platform' : 'Giới Thiệu Về EIGU Platform'}
                </h2>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 840, margin: '0 auto', fontWeight: 500 }}>
                  {language === 'en'
                    ? 'EIGU Platform is a comprehensive SaaS solution purpose-built for MMO creators, video reuploaders, and short-form content publishers in Europe, US, and Asia. EIGU has evolved into a 6-module synchronized platform — from clipping and AI generation to anti-detect copyright shield and niche discovery.'
                    : 'EIGU Platform là giải pháp toàn diện, được xây dựng dành riêng cho cộng đồng làm MMO, Reup và Sáng tạo nội dung video ngắn tại thị trường Châu Âu, Mỹ và Châu Á. Từ một công cụ tự động hoá đơn lẻ, EIGU đã phát triển thành nền tảng 6 mô-đun hoạt động đồng bộ — từ cắt dựng, tạo video AI, đến chống gậy bản quyền và khai thác ngách thị trường — giúp người sáng tạo tiết kiệm hàng giờ mỗi ngày.'}
                </p>
              </div>

              {/* Mission Card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--accent)' }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={20} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'Our Mission' : 'Sứ Mệnh'}</span>
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                  {language === 'en'
                    ? 'Automating repetitive, time-consuming tasks in content production so users can focus on what matters most: creativity and channel scaling.'
                    : 'Tự động hoá những công việc lặp lại, tốn thời gian nhất trong quy trình sản xuất nội dung, để người dùng tập trung vào điều quan trọng hơn: sáng tạo và mở rộng quy mô kênh.'}
                </p>
              </div>

              {/* Architecture Breakthroughs */}
              <div style={{ marginBottom: 44 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, textAlign: 'center' }}>
                  {language === 'en' ? 'Breakthrough Architecture' : 'Kiến Trúc Đột Phá'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                  {/* Engine Card 1 */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 26, transition: 'all 0.25s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <Zap size={22} />
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                      Desktop Heavy Worker Engine
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                      {language === 'en'
                        ? 'Hardware-accelerated FFmpeg GPU rendering right on your workstation — zero server dependence, zero queue limits.'
                        : 'Xử lý render FFmpeg GPU tận dụng phần cứng, mượt mà ngay trên máy trạm của bạn — không phụ thuộc server, không giới hạn hàng chờ.'}
                    </p>
                  </div>

                  {/* Engine Card 2 */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 26, transition: 'all 0.25s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <Shield size={22} />
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                      Puppeteer Anti-Detect Stealth
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                      {language === 'en'
                        ? 'Browser fingerprint spoofing, SOCKS5 proxy rotation to bypass detection and mitigate copyright risks across multi-account ops.'
                        : 'Giả lập vân tay trình duyệt, xoay vòng Proxy SOCKS5, giúp né tránh phát hiện và hạn chế rủi ro bản quyền khi vận hành đa tài khoản.'}
                    </p>
                  </div>

                  {/* Engine Card 3 */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 26, transition: 'all 0.25s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <Globe size={22} />
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                      Supabase & NestJS Cloud Gateway
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                      {language === 'en'
                        ? 'Real-time data sync, telemetry tracking, and dynamic pricing management — Desktop App and Website stay in sync instantly.'
                        : 'Đồng bộ dữ liệu thời gian thực, quản lý telemetry và bảng giá linh hoạt — Desktop App và Website luôn khớp dữ liệu tức thì.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics Numbers */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px 24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>
                  {language === 'en' ? 'Impressive Metrics' : 'Con Số Ấn Tượng'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)', marginBottom: 6 }}>
                      {language === 'en' ? '6 Modules' : '6 Mô-đun'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {language === 'en' ? 'Specialized tools operating independently' : 'Công cụ chuyên sâu hoạt động độc lập'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)', marginBottom: 6 }}>100,000+</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {language === 'en' ? 'Users who trust & choose us' : 'Người dùng tin tưởng lựa chọn'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)', marginBottom: 6 }}>24/7</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {language === 'en' ? 'Support for Team & Enterprise plans' : 'Hỗ trợ dành cho gói Team & Enterprise'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonial Section - 3 Compact Marquee Columns with Top & Bottom Fade Mask */}
            <section style={{ padding: '30px 24px 70px', maxWidth: 1240, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'min(2.25rem, 6vw)', fontWeight: 800, textAlign: 'center', marginBottom: 36, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Hundreds of thousands of creators trust ' : 'Hàng trăm nghìn người dùng tin tưởng lựa chọn '}
                <span style={{ color: 'var(--accent)', fontWeight: 900 }}>EIGU Platform</span>
              </h2>

              <div className="marquee-mask-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, height: 420, overflow: 'hidden', position: 'relative' }}>
                {/* Column 1 (Scrolls Down - 3 Cards Seamless Loop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="marquee-col-down">
                  {[...TESTIMONIALS_COL1, ...TESTIMONIALS_COL1].map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{item.text}"</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={item.avatar} alt={item.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.handle}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2 (Scrolls Up - 3 Cards Seamless Loop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="marquee-col-up">
                  {[...TESTIMONIALS_COL2, ...TESTIMONIALS_COL2].map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{item.text}"</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={item.avatar} alt={item.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.handle}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3 (Scrolls Down - 3 Cards Seamless Loop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="marquee-col-down">
                  {[...TESTIMONIALS_COL3, ...TESTIMONIALS_COL3].map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{item.text}"</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={item.avatar} alt={item.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.handle}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 2. PUBLIC PRICING PAGE (/pricing) ==================== */}
        {(activePath === '/pricing' || (token && activeUserView === 'bang-gia' && activePath === '/dashboard')) && (
          <section style={{ padding: '0 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                <Tag size={14} /> {t('pricing_title')}
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                {t('pricing_title')}
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
                {t('pricing_subtitle')}
              </p>
            </div>

            {/* Dynamic Module Selector Tabs */}
            {pricingModules.length > 0 && (
              <PricingModuleTabs
                modules={pricingModules}
                activeSlug={activeModuleSlug}
                onSelectModule={slug => setActiveModuleSlug(slug)}
              />
            )}

            {/* Dynamic Pricing Grid */}
            <PricingGrid
              moduleData={activeModuleData}
              loading={pricingLoading}
              error={pricingError}
              onRetry={fetchPricing}
              onSelectTier={handleSelectTier}
            />
          </section>
        )}



        {/* ==================== 4. NEWS PAGE (/news) ==================== */}
        {activePath === '/news' && (
          <section style={{ padding: '0 24px 80px', maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>
              {language === 'en' ? 'Product News & System Updates' : 'Tin Tức & Cập Nhật Sản Phẩm'}
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                {
                  date: '30/07/2026',
                  title: language === 'en' ? 'Dynamic Pricing Engine v2.5 Launch' : 'Cập nhật Hệ thống Bảng giá Động (Dynamic Pricing Engine) v2.5',
                  desc: language === 'en' ? 'Real-time module pricing management from Admin Desktop App and updated telemetry infrastructure.' : 'Ra mắt tính năng quản lý bảng giá thời gian thực từ Admin Desktop App và hạ tầng dữ liệu mới.'
                },
                {
                  date: '22/07/2026',
                  title: language === 'en' ? '24/7 AI Support Assistant Integration' : 'Tích hợp Trợ lý AI Support & Live Chat 24/7',
                  desc: language === 'en' ? 'Users can chat with AI Assistant and technical support directly across all portal pages.' : 'Người dùng có thể trao đổi trực tiếp với Trợ lý AI và đội ngũ hỗ trợ kỹ thuật trên toàn bộ giao diện.'
                },
                {
                  date: '20/07/2026',
                  title: language === 'en' ? 'FFmpeg Anti-Detect v3.0 Content ID Bypass' : 'Nâng cấp Engine Anti-Detect FFmpeg v3.0 Bypass Content ID',
                  desc: language === 'en' ? 'Added Noise Injection, 3D Audio Spatial Panning, and precise Frame Decimation.' : 'Bổ sung Noise Injection, 3D Audio Spatial Panning và Frame Decimation chuẩn xác.'
                },
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>{item.date}</div>
                  <h3 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 5. FAQ PAGE (/faq) ==================== */}
        {activePath === '/faq' && (
          <section style={{ padding: '0 24px 80px', maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: 'min(2.5rem, 7vw)', fontWeight: 900, marginBottom: 12, textAlign: 'center', color: 'var(--text-primary)' }}>
              {language === 'en' ? 'Frequently Asked Questions & Terms' : 'Câu Hỏi Thường Gặp & Điều Khoản Sử Dụng'}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28, fontWeight: 500 }}>
              {language === 'en'
                ? 'Find answers to common questions about EIGU Platform plans, payments, usage limits, and official Terms of Service.'
                : 'Giải đáp các thắc mắc phổ biến về gói dịch vụ, thanh toán, hạn mức sử dụng và Quy định Điều khoản sử dụng chính thức.'}
            </p>

            {/* Sub-Tab Navigation Switcher */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFaqSubTab('faq')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 24,
                  border: faqSubTab === 'faq' ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  background: faqSubTab === 'faq' ? 'var(--accent-glow)' : 'var(--bg-card)',
                  color: faqSubTab === 'faq' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.25s',
                  boxShadow: faqSubTab === 'faq' ? '0 4px 16px var(--accent-glow)' : 'none',
                }}
              >
                <HelpCircle size={16} />
                <span>{language === 'en' ? 'Frequently Asked Questions' : 'Câu Hỏi Thường Gặp (FAQ)'}</span>
              </button>
              <button
                onClick={() => setFaqSubTab('terms')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 24,
                  border: faqSubTab === 'terms' ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  background: faqSubTab === 'terms' ? 'var(--accent-glow)' : 'var(--bg-card)',
                  color: faqSubTab === 'terms' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.25s',
                  boxShadow: faqSubTab === 'terms' ? '0 4px 16px var(--accent-glow)' : 'none',
                }}
              >
                <ShieldAlert size={16} />
                <span>{language === 'en' ? 'Terms & Conditions of Service' : 'Quy Định & Điều Khoản Sử Dụng'}</span>
              </button>
            </div>

            {/* TAB 1: FAQ Accordions */}
            {faqSubTab === 'faq' && (
              <>
                {[
                  {
                    category: language === 'en' ? 'Packages & Services' : 'Về Gói Dịch Vụ',
                    items: [
                      {
                        id: 1,
                        q: language === 'en' ? '1. Can I purchase individual modules separately?' : '1. Tôi có thể mua lẻ từng mô-đun công cụ không?',
                        a: language === 'en'
                          ? 'Yes! EIGU Platform offers independent module subscriptions (AI Video Generator, Auto Clipper, Reup Engine, Niche Finder...). You only need to buy the specific module you need without purchasing a full bundle.'
                          : 'Có! EIGU Platform bán độc lập từng mô-đun (Tạo video AI, Tự động cắt video, Reup, Tìm ngách hot...). Bạn chỉ cần mua đúng mô-đun mình cần sử dụng, không bắt buộc mua trọn gói.'
                      },
                      {
                        id: 2,
                        q: language === 'en' ? '2. Does the 7-day Trial plan cost anything?' : '2. Gói Trial 7 ngày có mất phí không?',
                        a: language === 'en'
                          ? 'Completely FREE! You can experience all features for 7 days without entering any credit card details.'
                          : 'Hoàn toàn không! Bạn có thể trải nghiệm miễn phí 7 ngày, không cần nhập thẻ thanh toán.'
                      },
                      {
                        id: 3,
                        q: language === 'en' ? '3. Can I upgrade from Basic/Pro to Team or Enterprise plans?' : '3. Tôi có thể nâng cấp từ gói Basic/Pro lên Team hoặc Enterprise không?',
                        a: language === 'en'
                          ? 'Yes! You can upgrade anytime right inside your User Portal, and the system will automatically calculate the prorated difference for your remaining subscription.'
                          : 'Có! Bạn có thể nâng cấp bất cứ lúc nào ngay trong User Portal, hệ thống sẽ tự tính phần chênh lệch còn lại của gói hiện tại.'
                      },
                      {
                        id: 4,
                        q: language === 'en' ? '4. Are displayed plan prices inclusive of VAT tax?' : '4. Giá các gói đã bao gồm thuế VAT chưa?',
                        a: language === 'en'
                          ? 'All prices displayed on the website are inclusive of VAT tax, with no hidden fees or extra surcharges at checkout.'
                          : 'Tất cả mức giá hiển thị trên website đều đã bao gồm thuế VAT, không phát sinh thêm phụ phí khi thanh toán.'
                      }
                    ]
                  },
                  {
                    category: language === 'en' ? 'Payment & Refund Policy' : 'Về Thanh Toán & Hoàn Tiền',
                    items: [
                      {
                        id: 5,
                        q: language === 'en' ? '5. Can I get a refund if I change my mind after purchasing?' : '5. Tôi có được hoàn tiền nếu đổi ý sau khi mua không?',
                        a: language === 'en'
                          ? 'Under Article 4 of EIGU Platform Terms of Service, we do NOT issue refunds under any circumstances once a payment transaction is completed, including cases of accidental selection or no longer needing the service. Please try out our 7-day Trial plan before subscribing.'
                          : 'Theo Điều 4 trong Quy định Điều khoản sử dụng của EIGU Platform, chúng tôi KHÔNG hoàn tiền trong bất kỳ trường hợp nào sau khi giao dịch thanh toán thành công, kể cả do nhầm lẫn chủ quan hoặc không còn nhu cầu. Hãy dùng thử gói Trial 7 ngày miễn phí trước khi quyết định nâng cấp.'
                      },
                      {
                        id: 6,
                        q: language === 'en' ? '6. Which payment methods are supported by the system?' : '6. Hệ thống hỗ trợ những phương thức thanh toán nào?',
                        a: language === 'en'
                          ? 'EIGU supports various domestic payment gateways (SePay, VNPay, Momo...) and international gateways (Stripe, PayOS...), enabling fast and secure checkout.'
                          : 'EIGU hỗ trợ đa dạng cổng thanh toán trong nước (SePay, VNPay, Momo...) và quốc tế (Stripe, PayOS...), giúp bạn thanh toán nhanh chóng và an toàn.'
                      }
                    ]
                  },
                  {
                    category: language === 'en' ? 'Anti-Abuse Rules & Device Limits' : 'Chống Lạm Dụng & Hạn Mức Thiết Bị',
                    items: [
                      {
                        id: 7,
                        q: language === 'en' ? '7. How many devices can each subscription plan use?' : '7. Mỗi gói được phép dùng trên bao nhiêu máy?',
                        a: language === 'en'
                          ? 'Each subscription plan authorizes login on a specified maximum number of devices (see details on the Pricing page). Shared account usage beyond allowed limits is strictly prohibited.'
                          : 'Mỗi gói cước quy định số lượng máy được phép đăng ký sử dụng tối đa riêng (xem tại trang Bảng giá). Tuyệt đối không được chia sẻ tài khoản dùng chung vượt quá số máy quy định.'
                      },
                      {
                        id: 8,
                        q: language === 'en' ? '8. How can I transfer my license when replacing or repairing a computer?' : '8. Tôi muốn chuyển đổi sang máy tính mới hoặc sửa máy thì làm thế nào?',
                        a: language === 'en'
                          ? 'Device transfers are allowed when your old computer is damaged or replaced. However, you must notify EIGU Technical Support and obtain written confirmation before performing the device migration.'
                          : 'Bạn được phép chuyển đổi máy khi máy đăng ký hư hỏng không thể sử dụng. Tuy nhiên, việc chuyển đổi buộc phải thông báo trước cho bộ phận Hỗ trợ kỹ thuật EIGU để được xác nhận chấp thuận.'
                      },
                      {
                        id: 9,
                        q: language === 'en' ? '9. What happens if an account violates anti-reverse engineering or abuse rules?' : '9. Tài khoản sẽ bị xử lý thế nào nếu vi phạm bẻ khóa, rải account hoặc lạm dụng tool?',
                        a: language === 'en'
                          ? 'Under Article 3, severe violations (reverse engineering, cracking, server intrusion, unauthorized account resale) will result in immediate permanent account termination, forfeiture of all paid fees, and potential legal prosecution under applicable laws.'
                          : 'Theo Điều 3, các hành vi vi phạm nghiêm trọng (dịch ngược mã nguồn, crack, xâm nhập hệ thống, bán lại tài khoản) sẽ bị khóa vĩnh viễn ngay lập tức, hủy toàn bộ quyền lợi mà KHÔNG HOÀN TIỀN, đồng thời bị lập vi bằng truy cứu trách nhiệm pháp lý.'
                      }
                    ]
                  },
                  {
                    category: language === 'en' ? 'Support & Security' : 'Về Hỗ Trợ & Bảo Mật',
                    items: [
                      {
                        id: 10,
                        q: language === 'en' ? '10. Where can I contact for technical support?' : '10. Tôi cần hỗ trợ kỹ thuật thì liên hệ ở đâu?',
                        a: language === 'en'
                          ? 'You can use the in-app Feedback / Bug Report feature, or reach out via Discord/Telegram/Email — the EIGU team provides 24/7 support for Team and Enterprise plans, and business-hours support for Basic/Pro plans.'
                          : 'Bạn có thể dùng tính năng Góp ý / Báo lỗi ngay trong ứng dụng, hoặc liên hệ qua Discord/Telegram/Email — đội ngũ EIGU hỗ trợ 24/7 cho các gói Team và Enterprise, hỗ trợ trong giờ hành chính cho gói Basic/Pro.'
                      },
                      {
                        id: 11,
                        q: language === 'en' ? '11. Are my data and videos kept secure and confidential?' : '11. Dữ liệu và video của tôi có được bảo mật không?',
                        a: language === 'en'
                          ? 'Yes. All processed videos and images are stored locally on your machine and are never uploaded to EIGU servers unless explicitly shared. The system uses Puppeteer Anti-Detect and enterprise-grade Supabase security infrastructure to protect your account.'
                          : 'Có. Video/ảnh xử lý được lưu cục bộ trên máy của bạn, không upload lên server EIGU trừ khi bạn chủ động chia sẻ. Hệ thống dùng Puppeteer Anti-Detect và hạ tầng Supabase đạt chuẩn bảo mật để bảo vệ tài khoản của bạn.'
                      }
                    ]
                  }
                ].map((group, groupIdx) => (
                  <div key={groupIdx} style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                      <span>{group.category}</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {group.items.map(item => {
                        const isOpen = openFaqId === item.id;
                        return (
                          <div
                            key={item.id}
                            style={{
                              background: 'var(--bg-card)',
                              border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-lg)',
                              overflow: 'hidden',
                              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                              boxShadow: isOpen ? '0 4px 20px var(--accent-glow)' : '0 2px 6px rgba(0,0,0,0.1)',
                            }}
                          >
                            <button
                              onClick={() => setOpenFaqId(prev => (prev === item.id ? null : item.id))}
                              style={{
                                width: '100%',
                                padding: '16px 20px',
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: 15,
                              }}
                            >
                              <span>{item.q}</span>
                              <ChevronDown
                                size={18}
                                style={{
                                  flexShrink: 0,
                                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  color: isOpen ? 'var(--accent)' : 'var(--text-muted)',
                                }}
                              />
                            </button>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateRows: isOpen ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              }}
                            >
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '0 20px 18px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, fontWeight: 500 }}>
                                  {item.a}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* TAB 2: Official Terms & Conditions of Service Document */}
            {faqSubTab === 'terms' && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '36px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    <ShieldAlert size={16} />
                    <span>{language === 'en' ? 'Legal & System Anti-Abuse Rules' : 'Quy Định Pháp Lý & Chống Lạm Dụng Phần Mềm'}</span>
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {language === 'en' ? 'Terms & Conditions of Service' : 'Quy Định và Điều Khoản Sử Dụng'}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {language === 'en' ? 'Last updated: May 19, 2026' : 'Cập nhật lần cuối: 19 tháng 5 năm 2026'}
                  </p>
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent)' }}>
                  {language === 'en'
                    ? 'Welcome to EIGU Platform ("Software"). By registering an account or using our Software, you confirm that you have read, understood, and agreed to be bound by all terms specified in this document.'
                    : 'Chào mừng bạn đến với EIGU Platform ("Phần mềm"). Bằng cách đăng ký tài khoản hoặc sử dụng Phần mềm của chúng tôi, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi tất cả các điều khoản được quy định trong tài liệu này.'}
                </p>

                {/* Article 1 */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} style={{ color: 'var(--accent)' }} />
                    <span>{language === 'en' ? 'Article 1: Acceptance of Terms' : 'Điều 1: Chấp nhận Điều khoản'}</span>
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 26 }}>
                    {language === 'en'
                      ? 'Creating an account and/or accessing and using our Software constitutes your complete and unconditional agreement to these terms and conditions. If you do not agree to any part of these terms, you must immediately cease using the Software.'
                      : 'Hành động tạo tài khoản và/hoặc truy cập, sử dụng Phần mềm của chúng tôi được coi là sự chấp thuận hoàn toàn và vô điều kiện của bạn đối với các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn phải ngay lập tức ngừng sử dụng Phần mềm.'}
                  </p>
                </div>

                {/* Article 2 */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={18} />
                    <span>{language === 'en' ? 'Article 2: Prohibited Actions (Anti-Abuse Rules)' : 'Điều 2: Các hành vi bị nghiêm cấm'}</span>
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, paddingLeft: 26 }}>
                    {language === 'en' ? 'Users are strictly prohibited from performing the following actions under any circumstances:' : 'Người dùng tuyệt đối không được thực hiện các hành vi sau đây dưới bất kỳ hình thức nào:'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 26 }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Interference & Reverse Engineering: ' : 'Can thiệp và Phá hoại: '}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                        {language === 'en'
                          ? 'Attempting to reverse engineer, crack, decompile, or tamper with the source code, structure, or operation of the Software.'
                          : 'Cố gắng dịch ngược, bẻ khóa (crack), giải mã, hoặc can thiệp vào mã nguồn, cấu trúc, và hoạt động của Phần mềm.'}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Security Violations: ' : 'Xâm phạm An ninh: '}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                        {language === 'en'
                          ? 'Utilizing any tools or methods to breach, launch attacks, or gain unauthorized access to servers, databases, or system components.'
                          : 'Sử dụng bất kỳ công cụ, phương pháp nào để xâm nhập, truy cập trái phép vào hệ thống máy chủ, cơ sở dữ liệu hoặc các thành phần khác của Phần mềm.'}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Intellectual Property Theft: ' : 'Đánh cắp tài sản trí tuệ: '}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                        {language === 'en'
                          ? 'Copying, distributing, reselling, leasing, or transferring the Software or any portion thereof to third parties without our explicit written consent.'
                          : 'Sao chép, phân phối, bán lại, cho thuê hoặc chuyển giao Phần mềm hoặc bất kỳ phần nào của nó cho bên thứ ba mà không có sự đồng ý bằng văn bản của chúng tôi.'}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Other Harmful Behavior: ' : 'Hành vi gây hại khác: '}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                        {language === 'en'
                          ? 'Engaging in actions that damage reputation, disrupt business operations, cause server overload, or interrupt system functionality.'
                          : 'Thực hiện bất kỳ hành động nào gây tổn hại đến danh tiếng, hoạt động kinh doanh hoặc gây quá tải, làm gián đoạn hệ thống của Phần mềm.'}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{language === 'en' ? 'Misuse of Device Limits: ' : 'Sử dụng sai quy định: '}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                        {language === 'en'
                          ? 'The Software is authorized for login on up to the maximum number of devices specified by your subscribed plan. Users may transfer devices when registered hardware is damaged and unusable, but sharing beyond allowed device limits is strictly prohibited. Any device transfer requires prior notification and written approval from our support team. We reserve the right to suspend or terminate your account upon detecting intentional violations.'
                          : 'Phần mềm được phép đăng nhập sử dụng tối đa với số máy đã quy định, có thể đăng nhập sử dụng, chuyển đổi máy khi máy đăng ký hư hỏng không thể sử dụng, không được sử dụng chung quá tối đa số máy quy định của các gói tương ứng. Nếu muốn chuyển đổi buộc phải thông báo với chúng tôi và có sự đồng ý từ chúng tôi trước khi thực hiện. Chúng tôi có quyền ngừng kích hoạt/tạm dừng tài khoản của bạn nếu phát hiện hoặc cố tình vi phạm.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Article 3 */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={18} style={{ color: 'var(--warning)' }} />
                    <span>{language === 'en' ? 'Article 3: Enforcement & Penalties' : 'Điều 3: Xử lý vi phạm'}</span>
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, paddingLeft: 26 }}>
                    {language === 'en'
                      ? 'We hold full authority to determine whether an act constitutes a policy violation. Upon detecting any violation, we will apply enforcement actions without prior notice. Remedial actions include:'
                      : 'Chúng tôi có toàn quyền xác định một hành vi có vi phạm các điều khoản này hay không. Trong trường hợp phát hiện bất kỳ vi phạm nào, chúng tôi sẽ áp dụng các biện pháp xử lý mà không cần thông báo trước. Các biện pháp xử lý bao gồm:'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, paddingLeft: 26 }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 4, fontSize: 13.5 }}>{language === 'en' ? 'Support Suspension' : 'Ngừng hỗ trợ'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{language === 'en' ? 'Technical support will be suspended for infractions classified as Minor.' : 'Chúng tôi sẽ ngừng hỗ trợ với tài khoản vi phạm đối với hành vi được xác định là Chưa nghiêm trọng.'}</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4, fontSize: 13.5 }}>{language === 'en' ? 'Account Termination' : 'Chấm dứt tài khoản'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{language === 'en' ? 'Violating accounts will be permanently banned and access revoked immediately.' : 'Tài khoản của người dùng vi phạm sẽ bị khóa vĩnh viễn và chấm dứt quyền truy cập ngay lập tức.'}</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4, fontSize: 13.5 }}>{language === 'en' ? 'Non-Refundable' : 'Không hoàn tiền'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{language === 'en' ? 'All payments, subscription fees, or account balances will not be refunded.' : 'Mọi khoản phí, gói đăng ký hoặc chi phí khác đã thanh toán sẽ không được hoàn trả dưới bất kỳ hình thức nào.'}</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4, fontSize: 13.5 }}>{language === 'en' ? 'Legal Prosecution' : 'Truy cứu trách nhiệm pháp lý'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{language === 'en' ? 'We reserve the right to secure legal evidence and prosecute severe infringements under applicable laws.' : 'Chúng tôi bảo lưu quyền Lập vi bằng, yêu cầu truy cứu trách nhiệm pháp lý theo quy định của Pháp luật.'}</div>
                    </div>
                  </div>
                </div>

                {/* Article 4 */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                    <span>{language === 'en' ? 'Article 4: Non-Refund Policy' : 'Điều 4: Quy định không hoàn tiền'}</span>
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 26, background: 'rgba(239, 68, 68, 0.05)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {language === 'en'
                      ? 'Our system requires users to carefully review and confirm all transaction details before clicking deposit or completing payments. We do NOT issue refunds under any circumstances once a payment transaction is completed. Errors arising from user mistake (e.g. depositing to wrong account, selecting incorrect package, no longer needing service) are strictly non-refundable.'
                      : 'Hệ thống yêu cầu người dùng phải chắc chắn và chủ động xác nhận lại thông tin trước khi bấm nút nạp tiền hoặc thực hiện thanh toán. Chúng tôi KHÔNG hoàn tiền trong bất kỳ trường hợp nào sau khi giao dịch thanh toán thành công. Mọi lỗi phát sinh từ sự nhầm lẫn chủ quan của người dùng (như nạp nhầm tài khoản, chọn sai gói dịch vụ, không còn nhu cầu sử dụng...) đều không được hỗ trợ giải quyết hoàn tiền.'}
                  </p>
                </div>

                {/* Article 5 */}
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RefreshCw size={18} style={{ color: 'var(--accent)' }} />
                    <span>{language === 'en' ? 'Article 5: Terms Amendments' : 'Điều 5: Thay đổi Điều khoản'}</span>
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 26 }}>
                    {language === 'en'
                      ? 'We reserve the right to modify these Terms of Service at any time. Continued use of the Software following published modifications constitutes your explicit acceptance of the revised terms.'
                      : 'Chúng tôi có thể sửa đổi các Điều khoản Sử dụng này vào bất kỳ lúc nào. Việc bạn tiếp tục sử dụng Phần mềm sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn chấp nhận các điều khoản đã được sửa đổi.'}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ==================== 6. CONTACT PAGE (/contact) ==================== */}
        {activePath === '/contact' && (
          <section style={{ padding: '0 24px 80px', maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                <Mail size={16} />
                <span>{language === 'en' ? 'Support & Inquiries' : 'Hỗ Trợ & Liên Hệ'}</span>
              </div>
              <h1 style={{ fontSize: 'min(2.75rem, 7vw)', fontWeight: 900, marginBottom: 12, textAlign: 'center', color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Contact Support Team' : 'Liên Hệ Với Chúng Tôi'}
              </h1>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, maxWidth: 640, margin: '0 auto' }}>
                {language === 'en'
                  ? 'EIGU Platform support team is available 24/7 to assist with your technical questions and plan custom requests.'
                  : 'Đội ngũ EIGU Platform luôn sẵn sàng đồng hành và hỗ trợ giải đáp mọi thắc mắc của bạn 24/7.'}
              </p>
            </div>

            {/* 2-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>
              {/* Left Column: Direct Support Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Channel 1: Email */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {language === 'en' ? 'Email Support' : 'Email Hỗ Trợ Kỹ Thuật'}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                      support@eigu.vn
                    </p>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {language === 'en' ? 'Response within 1-2 business hours' : 'Phản hồi trong vòng 1-2 giờ làm việc'}
                    </span>
                  </div>
                </div>

                {/* Channel 2: Live Community & Telegram */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {language === 'en' ? 'Community Telegram & Discord' : 'Cộng Đồng Telegram & Discord'}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                      t.me/eigu_platform
                    </p>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {language === 'en' ? 'Join 100k+ MMO creators for tips & updates' : 'Trao đổi cùng 100,000+ nhà sáng tạo nội dung'}
                    </span>
                  </div>
                </div>

                {/* Channel 3: Working Hours */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {language === 'en' ? 'Support Schedule' : 'Thời Gian Phục Vụ'}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                      • <strong>Team & Enterprise:</strong> Support 24/7/365 <br />
                      • <strong>Basic & Pro:</strong> 8h30 - 18h00 (T2 - T7)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Inquiry Form */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HelpCircle size={20} style={{ color: 'var(--accent)' }} />
                  <span>{language === 'en' ? 'Send a Support Ticket' : 'Gửi Yêu Cầu Hỗ Trợ Direct'}</span>
                </h2>

                {contactSuccess && (
                  <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={18} style={{ flexShrink: 0 }} />
                    <span>{contactSuccess}</span>
                  </div>
                )}

                {contactError && (
                  <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{contactError}</span>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setContactLoading(true);
                  setContactSuccess(null);
                  setContactError(null);
                  try {
                    const res = await contactApi.submitContact({
                      name: contactName,
                      email: contactEmail,
                      message: contactMessage,
                    });
                    if (res && (res.success || res.message)) {
                      setContactSuccess(res.message || (language === 'en' ? 'Thank you! Your ticket has been submitted successfully.' : 'Cảm ơn bạn! Yêu cầu hỗ trợ đã được lưu vào hệ thống.'));
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                    } else {
                      setContactError(res?.message || (language === 'en' ? 'Failed to send. Please try again.' : 'Không thể gửi tin nhắn. Vui lòng thử lại.'));
                    }
                  } catch (err: any) {
                    setContactError(err?.message || (language === 'en' ? 'An error occurred while sending.' : 'Đã xảy ra lỗi trong quá trình gửi tin nhắn.'));
                  } finally {
                    setContactLoading(false);
                  }
                }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {language === 'en' ? 'Full Name' : 'Họ và tên'}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder={language === 'en' ? 'John Doe' : 'Nguyễn Văn A'}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {language === 'en' ? 'Email Address' : 'Email liên hệ'}
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {language === 'en' ? 'Support Inquiry' : 'Nội dung cần hỗ trợ'}
                    </label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder={language === 'en' ? 'Describe your question, feature request or issue...' : 'Nhập chi tiết câu hỏi hoặc yêu cầu hỗ trợ...'}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', outline: 'none' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: contactLoading ? 'not-allowed' : 'pointer', opacity: contactLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  >
                    <span>
                      {contactLoading
                        ? (language === 'en' ? 'Sending Request...' : 'Đang Gửi Yêu Cầu...')
                        : (language === 'en' ? 'Send Message' : 'Gửi Tin Nhắn')}
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ==================== 7. CHECKOUT HOOK PAGE (/checkout) ==================== */}
        {activePath === '/checkout' && (
          selectedCheckout ? (
            <CheckoutView
              selectedCheckout={selectedCheckout}
              onBack={() => handleNavigate('/pricing')}
              onSuccess={() => handleNavigate('/dashboard')}
            />
          ) : (
            <section style={{ padding: '60px 24px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ padding: 48, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 16 }}>
                  {language === 'en' ? 'No plan selected yet.' : 'Chưa có gói dịch vụ nào được chọn.'}
                </p>
                <button onClick={() => handleNavigate('/pricing')} style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  {language === 'en' ? 'Go to Pricing Page' : 'Khám phá Bảng Giá'}
                </button>
              </div>
            </section>
          )
        )}

        {/* ==================== 8. STANDALONE ROUTE VIEWS (/transactions, /affiliate, /guide, /audit-log) ==================== */}
        {(activePath === '/transactions' || activePath === '/dashboard/transactions' || activePath === '/dashboard') && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 64px 24px', width: '100%' }}>
            <TransactionHistoryView />
          </div>
        )}

        {activePath === '/affiliate' && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 64px 24px', width: '100%' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
                <LinkIcon size={24} style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'Affiliate Partner Program' : 'Chương Trình Tiếp Thị Liên Kết (Affiliate)'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                {language === 'en' ? 'Refer new creators and earn 20% commission on every successful subscription.' : 'Giới thiệu người dùng mới và nhận 20% hoa hồng trên mỗi giao dịch nạp tiền thành công.'}
              </p>
            </div>
          </div>
        )}

        {activePath === '/guide' && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 64px 24px', width: '100%' }}>
            <GuideView />
          </div>
        )}

        {activePath === '/audit-log' && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 64px 24px', width: '100%' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
                <History size={24} style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'User Activity Log' : 'Nhật Ký Hoạt Động Cá Nhân'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                {language === 'en' ? 'Logs login history and execution commands on EIGU Platform.' : 'Ghi nhận lịch sử đăng nhập và các thao tác bảo mật trên hệ thống EIGU Platform.'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
