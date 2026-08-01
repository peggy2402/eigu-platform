'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Scissors, Clapperboard, RefreshCw, TrendingUp, DownloadCloud,
  ArrowRight, Check, Shield, Zap, Play, HelpCircle, Mail, Globe, Wallet,
  User, Link as LinkIcon, Tag, History, BookOpen, ChevronRight, X, AlertCircle, ShoppingCart, Star, Gift
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
import { pricingApi } from '../lib/api';
import type { PricingModuleDto, PricingTierDto } from '@eigu-platform/shared';

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

export default function Home() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  // Navigation State
  const [activePath, setActivePath] = useState<string>('/');
  const [activeUserView, setActiveUserView] = useState<ViewType>('ho-so');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Pricing State
  const [pricingModules, setPricingModules] = useState<PricingModuleDto[]>(FALLBACK_PRICING_MODULES);
  const [activeModuleSlug, setActiveModuleSlug] = useState<string>('cut');
  const [pricingLoading, setPricingLoading] = useState<boolean>(true);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Selected Checkout State
  const [selectedCheckout, setSelectedCheckout] = useState<{ tier: PricingTierDto; moduleSlug: string } | null>(null);

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

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Navigate Handler
  const handleNavigate = (path: string) => {
    if (path.startsWith('/auth/')) {
      router.push(path);
      return;
    }
    setActivePath(path);
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
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Đang tải EIGU Platform...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Global Header */}
      <Header
        activePath={activePath}
        onNavigate={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      {/* Settings Modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

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

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1 }}>
        {/* ==================== 1. LANDING PAGE HOME (/) ==================== */}
        {activePath === '/' && (
          <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: 60 }}>
            {/* Background pattern & Ambient Glows (Blue & Sky Blue) */}
            <div className="bg-pattern" />
            <div className="glow-circle" style={{ width: 600, height: 600, background: 'rgba(59, 130, 246, 0.2)', top: -200, left: -200 }} />
            <div className="glow-circle" style={{ width: 500, height: 500, background: 'rgba(14, 165, 233, 0.15)', bottom: -100, right: -100 }} />

            {/* Hero Section */}
            <section style={{ padding: '60px 24px 40px', maxWidth: 1240, margin: '0 auto' }}>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 48 }}>
                {/* Left Column (Text & Downloads) */}
                <div style={{ flex: '1 1 500px', maxWidth: 620 }}>
                  {/* Version Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', backdropFilter: 'blur(10px)', marginBottom: 28 }}>
                    <span style={{ position: 'relative', display: 'flex', width: 10, height: 10 }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#f59e0b', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                      <span style={{ position: 'relative', borderRadius: '50%', width: 10, height: 10, background: '#f59e0b' }} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      {language === 'en' ? 'Version 3.0 Live Engine Available' : 'Phiên bản mới 3.0 đã ra mắt'}
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
                    {language === 'en' ? '& Professional AI Support' : '& Hỗ trợ AI chuyên nghiệp'}
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

            {/* Feature Modules Grid with Airplanes Illustration */}
            <section style={{ padding: '40px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                {/* Airplanes Illustration */}
                <div style={{ marginBottom: 16 }}>
                  <img
                    src="https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp"
                    alt="Airplanes Illustration"
                    style={{ maxWidth: 100, width: '100%', height: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'drop-shadow(0 10px 20px rgba(245, 158, 11, 0.25))' }}
                  />
                </div>
                <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>{t('feat_title')}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{language === 'en' ? 'Tailored for every stage of high-scale MMO content creation' : 'Được thiết kế chuyên biệt cho từng giai đoạn sáng tạo nội dung MMO'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {[
                  { icon: <Scissors size={24} />, title: language === 'en' ? '1. Auto Video Clipper' : '1. Tự động cắt video', desc: language === 'en' ? 'Clip 1-20 min videos with Silence Detection and automatic 9:16 aspect ratio fitting.' : 'Cắt phân đoạn 1-20 phút, nhận diện khoảng nghỉ Silence Detection, tự động chỉnh tỉ lệ khung hình 9:16.' },
                  { icon: <Sparkles size={24} />, title: language === 'en' ? '2. AI Video Generator' : '2. Tạo video AI', desc: language === 'en' ? 'Generate high quality short viral videos from prompts, images or templates using AI.' : 'Sinh video ngắn chất lượng cao từ ý tưởng, hình ảnh hoặc mẫu video có sẵn bằng AI.' },
                  { icon: <Clapperboard size={24} />, title: language === 'en' ? '3. AI Video Studio' : '3. AI Video Studio', desc: language === 'en' ? 'Full editing studio with multi-language AI dubbing and precise auto subtitles.' : 'Dựng phim, lồng tiếng AI đa ngôn ngữ, tự tạo phụ đề tự động chuẩn xác.' },
                  { icon: <RefreshCw size={24} />, title: language === 'en' ? '4. Reup Video Engine' : '4. Tạo video reup', desc: language === 'en' ? 'Bypass TikTok & Reels Content ID algorithms via Noise Injection, Video Flip & 3D Audio.' : 'Bypass thuật toán Content ID TikTok & Reels qua Noise Injection, Lật video & 3D Audio.' },
                  { icon: <TrendingUp size={24} />, title: language === 'en' ? '5. Hot Niche Finder' : '5. Tìm ngách hot', desc: language === 'en' ? 'Auto scan viral trends, extract lucrative niches and analyze competitor channels.' : 'Tự động quét xu hướng thị trường, bóc tách ngách viral và phân tích đối thủ cạnh tranh.' },
                  { icon: <DownloadCloud size={24} />, title: language === 'en' ? '6. Bulk Downloader' : '6. Tải video hàng loạt', desc: language === 'en' ? 'Download entire TikTok/YouTube channels without watermark logos at ultra high speed.' : 'Tải hàng loạt trọn bộ Kênh TikTok / YouTube không logo watermark tốc độ cực nhanh.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 28, transition: 'all 0.2s' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      {item.icon}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonial Section - 3 Compact Marquee Columns with Top & Bottom Fade Mask */}
            <section style={{ padding: '30px 24px 70px', maxWidth: 1240, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'min(2.25rem, 6vw)', fontWeight: 800, textAlign: 'center', marginBottom: 36, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Hundreds of thousands of creators trust ' : 'Hàng trăm nghìn người dùng tin tưởng lựa chọn '}
                <span style={{ color: '#f59e0b', fontWeight: 900 }}>EIGU Platform</span>
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
          <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
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

        {/* ==================== 3. ABOUT PAGE (/about) ==================== */}
        {activePath === '/about' && (
          <section style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>
              {language === 'en' ? 'About EIGU Platform' : 'Giới Thiệu Về EIGU Platform'}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
              {language === 'en'
                ? 'EIGU Platform is an all-in-one SaaS automation engine purpose-built for MMO creators, video reuploaders, and short-form content publishers in Europe, US, and Asia.'
                : 'EIGU Platform là giải pháp SaaS toàn diện được thiết kế chuyên biệt cho cộng đồng làm MMO, Reup và Sáng tạo nội dung video ngắn tại thị trường Châu Âu, Mỹ và Châu Á.'}
            </p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 32 }}>
              <h3 style={{ fontSize: 20, marginBottom: 16 }}>
                {language === 'en' ? 'Core Architecture Breakthroughs' : 'Kiến trúc Đột phá'}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15 }}>
                <li style={{ display: 'flex', gap: 12 }}>
                  <Zap style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <strong>Desktop Heavy Worker Engine:</strong> {language === 'en' ? 'High-efficiency hardware FFmpeg GPU rendering right on your workstation.' : 'Xử lý render FFmpeg GPU phần碎 cứng mượt mà ngay trên máy trạm của bạn.'}
                </li>
                <li style={{ display: 'flex', gap: 12 }}>
                  <Shield style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <strong>Puppeteer Anti-Detect Stealth:</strong> {language === 'en' ? 'Browser fingerprint spoofing, SOCKS5 proxy rotation, and Content ID bypass.' : 'Giả lập vân tay trình duyệt, proxy SOCKS5 chống gậy bản quyền.'}
                </li>
                <li style={{ display: 'flex', gap: 12 }}>
                  <Globe style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <strong>Supabase & NestJS Cloud Gateway:</strong> {language === 'en' ? 'Real-time state sync, telemetry tracking, and dynamic pricing management.' : 'Quản lý thời gian thực, đồng bộ telemetry và dữ liệu bảng giá linh hoạt.'}
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* ==================== 4. NEWS PAGE (/news) ==================== */}
        {activePath === '/news' && (
          <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
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
          <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>
              {language === 'en' ? 'Frequently Asked Questions (FAQ)' : 'Câu Hỏi Thường Gặp (FAQ)'}
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  q: language === 'en' ? '1. Can I purchase individual modules separately?' : '1. Tôi có thể mua lẻ từng mô-đun công cụ không?',
                  a: language === 'en' ? 'Yes! EIGU Platform offers independent module subscriptions. Purchase only what you need.' : 'Có! EIGU Platform bán độc lập từng mô-đun. Bạn chỉ cần mua đúng mô-đun mình cần sử dụng.'
                },
                {
                  q: language === 'en' ? '2. Does the 7-day Trial cost anything?' : '2. Gói Trial 7 ngày có mất phí không?',
                  a: language === 'en' ? 'Completely FREE! Access all features of the Trial plan without any credit card required.' : 'Hoàn toàn không! Bạn có thể trải nghiệm miễn phí 7 ngày đầy đủ tính năng của gói Trial.'
                },
                {
                  q: language === 'en' ? '3. Do pricing tiers include VAT tax?' : '3. Giá các gói đã bao gồm thuế VAT chưa?',
                  a: language === 'en' ? 'All prices displayed on the website are inclusive of VAT tax.' : 'Tất cả mức giá hiển thị trên website đều đã bao gồm thuế VAT.'
                },
                {
                  q: language === 'en' ? '4. Can I upgrade from Pro to Team plan?' : '4. Tôi có thể nâng cấp từ gói Pro lên Team không?',
                  a: language === 'en' ? 'Yes! Upgrade anytime seamlessly through your User Portal.' : 'Có! Bạn có thể chọn nâng cấp bất cứ lúc nào trong User Portal.'
                },
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: 20 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{item.q}</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 6. CONTACT PAGE (/contact) ==================== */}
        {activePath === '/contact' && (
          <section style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, textAlign: 'center' }}>
              {language === 'en' ? 'Contact Support Team' : 'Liên Hệ Với Chúng Tôi'}
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32 }}>
              {language === 'en' ? 'EIGU Platform support team is available 24/7 to assist you' : 'Đội ngũ EIGU Platform luôn sẵn sàng hỗ trợ bạn 24/7'}
            </p>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
              <form onSubmit={e => { e.preventDefault(); alert(language === 'en' ? 'Thank you for reaching out! We will reply shortly.' : 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.'); }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    {language === 'en' ? 'Full Name' : 'Họ và tên'}
                  </label>
                  <input type="text" placeholder={language === 'en' ? 'John Doe' : 'Nguyễn Văn A'} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    {language === 'en' ? 'Email Address' : 'Email liên hệ'}
                  </label>
                  <input type="email" placeholder="example@gmail.com" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} required />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    {language === 'en' ? 'Support Inquiry' : 'Nội dung cần hỗ trợ'}
                  </label>
                  <textarea rows={4} placeholder={language === 'en' ? 'Describe your question or issue...' : 'Nhập câu hỏi hoặc yêu cầu hỗ trợ...'} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'vertical' }} required />
                </div>
                <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {language === 'en' ? 'Send Message' : 'Gửi Tin Nhắn'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ==================== 7. CHECKOUT HOOK PAGE (/checkout) ==================== */}
        {activePath === '/checkout' && (
          <section style={{ padding: '60px 24px', maxWidth: 640, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <ShoppingCart style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'Confirm Plan Subscription' : 'Xác Nhận Đăng Ký Gói Dịch Vụ'}
            </h1>

            {selectedCheckout ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
                <div style={{ padding: 16, background: 'rgba(99, 102, 241, 0.12)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>
                    {language === 'en' ? 'Selected Module:' : 'Mô-đun đã chọn:'} {selectedCheckout.moduleSlug.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {language === 'en' ? 'Plan' : 'Gói'} {selectedCheckout.tier.label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{selectedCheckout.tier.tagline}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                  <span>{language === 'en' ? 'Price:' : 'Giá bán:'}</span>
                  <strong style={{ color: 'var(--accent)', fontSize: 18 }}>{selectedCheckout.tier.formattedPrice}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                  <span>{language === 'en' ? 'Concurrent Machines:' : 'Số máy dùng đồng thời:'}</span>
                  <strong>{selectedCheckout.tier.machines === 0 ? (language === 'en' ? 'Unlimited' : 'Không giới hạn') : `${selectedCheckout.tier.machines} ${language === 'en' ? 'machines' : 'máy'}`}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                  <span>{language === 'en' ? 'Processing Threads:' : 'Số luồng xử lý:'}</span>
                  <strong>{selectedCheckout.tier.threads === 0 ? (language === 'en' ? 'Unlimited' : 'Không giới hạn') : `${selectedCheckout.tier.threads} ${language === 'en' ? 'threads' : 'luồng'}`}</strong>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={() => alert(language === 'en' ? 'Payment gateway connecting! Contact Admin to activate.' : 'Cổng thanh toán đang kết nối! Vui lòng liên hệ Admin để kích hoạt gói.')}
                    style={{ width: '100%', padding: 14, borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)' }}
                  >
                    {language === 'en' ? `Pay Now (${selectedCheckout.tier.formattedPrice})` : `Thanh Toán Ngay (${selectedCheckout.tier.formattedPrice})`}
                  </button>
                  <button
                    onClick={() => handleNavigate('/pricing')}
                    style={{ width: '100%', padding: 12, borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: 14, cursor: 'pointer', marginTop: 8 }}
                  >
                    {language === 'en' ? 'Back to pricing plans' : 'Quay lại chọn gói khác'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 48, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? 'No plan selected yet.' : 'Chưa có gói dịch vụ nào được chọn.'}
                </p>
                <button onClick={() => handleNavigate('/pricing')} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>
                  {language === 'en' ? 'Go to Pricing Page' : 'Đến Trang Bảng Giá'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ==================== 8. USER DASHBOARD PORTAL (/dashboard) ==================== */}
        {activePath === '/dashboard' && token && (
          <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <Sidebar
              activeView={activeUserView}
              onViewChange={view => setActiveUserView(view)}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div style={{ flex: 1, padding: 32, maxWidth: 1200 }}>
              {activeUserView === 'ho-so' && user && <ProfileView user={user} />}

              {activeUserView === 'lich-su' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Wallet size={20} style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'Transaction & Deposit History' : 'Lịch Sử Giao Dịch & Nạp Tiền'}
                  </h3>
                  <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 20 }}>
                    {language === 'en' ? 'Current Balance:' : 'Số dư hiện tại:'} <strong style={{ color: 'var(--accent)', fontSize: 18 }}>{(user?.balance || 0).toLocaleString('vi-VN')}đ</strong>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    {language === 'en' ? 'No recent transactions found.' : 'Chưa có lịch sử biến động số dư nào gần đây.'}
                  </p>
                </div>
              )}

              {activeUserView === 'affiliate' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LinkIcon size={20} style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'Affiliate Partner Program' : 'Chương Trình Tiếp Thị Liên Kết (Affiliate)'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                    {language === 'en' ? 'Refer new creators and earn 20% commission on every successful subscription.' : 'Giới thiệu người dùng mới và nhận 20% hoa hồng trên mỗi giao dịch thành công.'}
                  </p>
                </div>
              )}

              {activeUserView === 'nhat-ky' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <History size={20} style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'User Activity Log' : 'Nhật Ký Hoạt Động Cá Nhân'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    {language === 'en' ? 'Logs login history and execution commands on EIGU Platform.' : 'Ghi nhận lịch sử đăng nhập và thao tác trên hệ thống EIGU Platform.'}
                  </p>
                </div>
              )}

              {activeUserView === 'huong-dan' && <GuideView />}

              {activeUserView === 'tro-giup' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={20} style={{ color: 'var(--accent)' }} /> {language === 'en' ? 'Help Center & Technical Support' : 'Trung Tâm Trợ Giúp & Hỗ Trợ Kỹ Thuật'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {language === 'en' ? 'Please submit Feedback / Bug Report or connect via Discord/Telegram to chat with Engineers.' : 'Vui lòng sử dụng tính năng Góp ý / Báo lỗi hoặc liên hệ qua kênh Discord/Telegram để gặp Kỹ thuật viên.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================== EVENT PROMO POPUP MODAL ==================== */}
      {eventPopupOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={handleCloseEventPopup}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 440,
              background: 'linear-gradient(180deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)',
              border: '2px solid #f59e0b',
              borderRadius: 24,
              padding: '32px 24px 24px',
              boxShadow: '0 0 60px rgba(245, 158, 11, 0.55), 0 20px 60px rgba(0,0,0,0.85)',
              textAlign: 'center',
              color: '#ffffff',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button 'X' */}
            <button
              onClick={handleCloseEventPopup}
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#ffffff',
                color: '#000000',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <X size={20} style={{ strokeWidth: 3 }} />
            </button>

            {/* Red Envelope Icon Badge */}
            <div style={{ margin: '0 auto 12px', width: 56, height: 56, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(245, 158, 11, 0.85)' }}>
              <Gift size={30} style={{ color: '#7f1d1d' }} />
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
              🍂 ƯU ĐÃI MÙA THU
            </h2>
            <p style={{ fontSize: 13, color: '#fcd34d', fontWeight: 600, marginBottom: 20 }}>
              Nhận ngay ưu đãi độc quyền 2026
            </p>

            {/* Offer Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { title: 'Gói BASIC Beta', note: 'Full tính năng', disc: '-80%', oldPrice: '100k', price: '20k' },
                { title: 'Gói PRO Beta', note: 'Full tính năng', disc: '-50%', oldPrice: '158k', price: '79k' },
                { title: 'Gói PREMIUM Beta', note: 'Full tính năng', disc: '-40%', oldPrice: '250k', price: '150k' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#1c1917',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1c1917' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#78716c', fontWeight: 500 }}>{item.note}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ position: 'absolute', top: 4, right: 16, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>{item.disc}</span>
                    <div style={{ fontSize: 11, textDecoration: 'line-through', color: '#a8a29e', marginTop: 8 }}>{item.oldPrice}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626' }}>{item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={() => { handleCloseEventPopup(); handleNavigate('/pricing'); }}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#450a0a',
                fontSize: 16,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.6)',
                letterSpacing: '0.5px',
                marginBottom: 14,
              }}
            >
              NHẬN NGAY
            </button>

            {/* Checkbox Don't Show Again */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#fef08a', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                style={{ accentColor: '#f59e0b' }}
              />
              Đã hiểu, không hiển thị lại
            </label>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
