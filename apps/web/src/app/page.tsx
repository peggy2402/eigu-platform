'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Scissors, Clapperboard, RefreshCw, TrendingUp, DownloadCloud,
  ArrowRight, Check, Shield, Zap, Play, HelpCircle, Mail, Globe, Wallet,
  User, Link as LinkIcon, Tag, History, BookOpen, ChevronRight, X, AlertCircle, ShoppingCart
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
  const [pricingModules, setPricingModules] = useState<PricingModuleDto[]>([]);
  const [activeModuleSlug, setActiveModuleSlug] = useState<string>('ai-video');
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
      if (res && res.success && Array.isArray(res.data)) {
        setPricingModules(res.data);
        if (res.data.length > 0 && !res.data.some((m: PricingModuleDto) => m.slug === activeModuleSlug)) {
          setActiveModuleSlug(res.data[0].slug);
        }
      } else {
        throw new Error('Dữ liệu bảng giá không hợp lệ.');
      }
    } catch (err: any) {
      console.warn('Lỗi tải dữ liệu pricing:', err);
      setPricingError(err.message || 'Không thể kết nối đến máy chủ bảng giá.');
    } finally {
      setPricingLoading(false);
    }
  }, [activeModuleSlug]);

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
          <div>
            {/* Hero Section */}
            <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                <Sparkles size={16} /> {t('hero_tag')}
              </div>

              <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {language === 'en' ? 'AI Video Creation & Anti-Copyright Reup in 1-Click' : 'Cắt ghép, Sinh Video AI & Lách Bản Quyền Hàng Loạt Trong 1 Click'}
              </h1>

              <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 760, margin: '0 auto 36px' }}>
                {t('hero_desc')}
              </p>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleNavigate('/pricing')}
                  style={{ padding: '14px 32px', borderRadius: 'var(--radius)', background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                  {t('hero_cta_pricing')} <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => handleNavigate('/about')}
                  style={{ padding: '14px 28px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  {t('hero_cta_about')}
                </button>
              </div>
            </section>

            {/* Feature Modules Grid */}
            <section style={{ padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{t('feat_title')}</h2>
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
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      {item.icon}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
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

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
