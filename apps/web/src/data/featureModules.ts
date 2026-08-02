import { Scissors, Sparkles, Clapperboard, RefreshCw, TrendingUp, DownloadCloud } from 'lucide-react';
import React from 'react';

export interface FeatureModuleItem {
  id: string;
  iconName: 'Scissors' | 'Sparkles' | 'Clapperboard' | 'RefreshCw' | 'TrendingUp' | 'DownloadCloud';
  accentColor: string;
  accentGlow: string;
  title: {
    vi: string;
    en: string;
  };
  desc: {
    vi: string;
    en: string;
  };
  detailDescription: {
    vi: string;
    en: string;
  };
  videoUrl: string;
  badge?: {
    vi: string;
    en: string;
  };
  highlights?: {
    vi: string[];
    en: string[];
  };
}

export const FEATURE_MODULES: FeatureModuleItem[] = [
  {
    id: 'cut',
    iconName: 'Scissors',
    accentColor: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.25)',
    title: {
      vi: '1. Tự động cắt video',
      en: '1. Auto Video Clipper',
    },
    desc: {
      vi: 'Cắt phân đoạn 1-20 phút, nhận diện khoảng nghỉ Silence Detection, tự động chỉnh tỉ lệ khung hình 9:16.',
      en: 'Clip 1-20 min videos with Silence Detection and automatic 9:16 aspect ratio fitting.',
    },
    detailDescription: {
      vi: 'Mô-đun Tự động cắt video giúp bạn xử lý hàng trăm video dài thành các clip ngắn chuẩn 9:16 dành cho TikTok, YouTube Shorts và Facebook Reels. Tích hợp thuật toán Silence Detection giúp loại bỏ khoảng lặng tự động, cắt đúng đoạn cao trào và tối ưu hóa thời lượng chuẩn viral.',
      en: 'The Auto Video Clipper module helps you process hundreds of long videos into 9:16 short clips for TikTok, YouTube Shorts, and Facebook Reels. Integrated with Silence Detection algorithms to automatically trim silence, highlight peak moments, and optimize video duration for virality.',
    },
    videoUrl: 'https://www.youtube.com/embed/t13MM2XKn1I',
    badge: { vi: 'Hot Multi-clip', en: 'Hot Multi-clip' },
    highlights: {
      vi: [
        'Phân đoạn thông minh từ 1 đến 20 phút',
        'Tự động phát hiện khoảng nghỉ (Silence Detection)',
        'Tự động crop & fit tỉ lệ khung hình 9:16',
        'Render hàng loạt tốc độ cao tối ưu phần cứng GPU',
      ],
      en: [
        'Smart segmentation from 1 to 20 minutes',
        'Automatic Silence Detection',
        'Auto crop & fit to vertical 9:16 aspect ratio',
        'High-speed hardware-accelerated GPU batch rendering',
      ],
    },
  },
  {
    id: 'ai-video',
    iconName: 'Sparkles',
    accentColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.25)',
    title: {
      vi: '2. Tạo video AI',
      en: '2. AI Video Generator',
    },
    desc: {
      vi: 'Sinh video ngắn chất lượng cao từ ý tưởng, hình ảnh hoặc mẫu video có sẵn bằng AI.',
      en: 'Generate high quality short viral videos from prompts, images or templates using AI.',
    },
    detailDescription: {
      vi: 'Công cụ Tạo video AI ứng dụng các mô hình AI tiên tiến nhất để biến văn bản (Prompt), hình ảnh hoặc mẫu kịch bản có sẵn thành video hoàn chỉnh. Hỗ trợ tạo chuyển động mượt mà, hiệu ứng visual bắt mắt và phối cảnh tự động cho nhiều lĩnh vực MMO khác nhau.',
      en: 'The AI Video Generator leverages cutting-edge AI models to convert text prompts, images, or script templates into complete videos. Supports smooth motion generation, eye-catching visual effects, and automated scene composition for various MMO niches.',
    },
    videoUrl: 'https://www.youtube.com/embed/t13MM2XKn1I',
    badge: { vi: 'AI Powered', en: 'AI Powered' },
    highlights: {
      vi: [
        'Sinh video 4K từ Text-to-Video & Image-to-Video',
        'Kho mẫu kịch bản chuẩn viral có sẵn',
        'Tạo chuyển động mượt mà & cinematic style',
        'Xuất video nhanh chóng với độ phân giải cao',
      ],
      en: [
        'Generate 4K videos from Text-to-Video & Image-to-Video',
        'Pre-built viral video template library',
        'Smooth motion & cinematic style creation',
        'Ultra-fast high resolution export',
      ],
    },
  },
  {
    id: 'ai-studio',
    iconName: 'Clapperboard',
    accentColor: '#3b82f6',
    accentGlow: 'rgba(59, 130, 246, 0.25)',
    title: {
      vi: '3. AI Video Studio',
      en: '3. AI Video Studio',
    },
    desc: {
      vi: 'Dựng phim, lồng tiếng AI đa ngôn ngữ, tự tạo phụ đề tự động chuẩn xác.',
      en: 'Full editing studio with multi-language AI dubbing and precise auto subtitles.',
    },
    detailDescription: {
      vi: 'AI Video Studio là studio dựng phim tự động chuyên sâu. Tích hợp công nghệ lồng tiếng AI cảm xúc đa ngôn ngữ (Việt, Anh, Trung, Nhật, Hàn,...), đồng thời tự động nhận diện giọng nói (Speech-to-Text) để tạo phụ đề động chuẩn xác từng miligiây.',
      en: 'AI Video Studio is a full-featured automated editing suite. Includes multi-lingual expressive AI dubbing (English, Vietnamese, Chinese, Japanese, Korean, etc.) and auto Speech-to-Text for subtitle generation synced perfectly to the millisecond.',
    },
    videoUrl: 'https://www.youtube.com/embed/t13MM2XKn1I',
    badge: { vi: 'Multi-language', en: 'Multi-language' },
    highlights: {
      vi: [
        'Lồng tiếng AI giọng đọc tự nhiên, chuẩn cảm xúc',
        'Tự động tạo & khớp phụ đề động (Auto Subtitles)',
        'Hỗ trợ hơn 30+ ngôn ngữ phổ biến toàn cầu',
        'Công cụ chỉnh sửa Timeline & Effect trực quan',
      ],
      en: [
        'Natural & expressive AI voiceover dubbing',
        'Auto generate & sync animated subtitles',
        'Supports 30+ major global languages',
        'Intuitive Timeline & Visual Effects editor',
      ],
    },
  },
  {
    id: 'reup',
    iconName: 'RefreshCw',
    accentColor: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    title: {
      vi: '4. Tạo video reup',
      en: '4. Reup Video Engine',
    },
    desc: {
      vi: 'Bypass thuật toán Content ID TikTok & Reels qua Noise Injection, Lật video & 3D Audio.',
      en: 'Bypass TikTok & Reels Content ID algorithms via Noise Injection, Video Flip & 3D Audio.',
    },
    detailDescription: {
      vi: 'Giải pháp Reup video chuyên nghiệp giúp vượt qua các bộ lọc quét bản quyền nghiêm ngặt của TikTok, Reels và Shorts. Tích hợp bộ công cụ biến đổi dữ liệu đa chiều: chèn nhiễu pixel không thể nhận diện bằng mắt thường (Noise Injection), biến đổi phổ âm thanh 3D Audio, lật khung hình và điều chỉnh tốc độ tự động.',
      en: 'Professional Video Reup solution designed to bypass strict Content ID copyright filters on TikTok, Reels, and Shorts. Features multi-dimensional metadata transformation: invisible Noise Injection, 3D Spatial Audio spectrum modification, video flipping, and dynamic speed shifting.',
    },
    videoUrl: 'https://www.youtube.com/embed/t13MM2XKn1I',
    badge: { vi: 'Anti-Copyright', en: 'Anti-Copyright' },
    highlights: {
      vi: [
        'Thuật toán Noise Injection chống quét Fingerprint',
        'Xử lý âm thanh 3D Audio & Pitch Shift',
        'Lật khung hình, zoom động & chèn filter ngẫu nhiên',
        'Bypass Content ID TikTok, Facebook Reels & Shorts',
      ],
      en: [
        'Noise Injection algorithm against Fingerprint scanning',
        '3D Audio processing & Pitch Shifting',
        'Frame flipping, dynamic zoom & random filter injection',
        'Bypass TikTok, Facebook Reels & Shorts Content ID',
      ],
    },
  },
  {
    id: 'hot-niche',
    iconName: 'TrendingUp',
    accentColor: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    title: {
      vi: '5. Tìm ngách hot',
      en: '5. Hot Niche Finder',
    },
    desc: {
      vi: 'Tự động quét xu hướng thị trường, bóc tách ngách viral và phân tích đối thủ cạnh tranh.',
      en: 'Auto scan viral trends, extract lucrative niches and analyze competitor channels.',
    },
    detailDescription: {
      vi: 'Công cụ Tìm ngách hot giúp nhà sáng tạo và marketer nắm bắt xu hướng tức thì. Hệ thống tự động phân tích dữ liệu thời gian thực từ nhiều nền tảng, phát hiện các ngách nội dung tiềm năng có lượng tương tác cao, bóc tách chiến lược của kênh đối thủ và gợi ý từ khóa lên xu hướng.',
      en: 'The Hot Niche Finder empowers creators and marketers to catch trends immediately. Automatically analyzes real-time data across platforms, discovers high-engagement content niches, dissects competitor channel metrics, and recommends trending keywords.',
    },
    videoUrl: 'https://www.youtube.com/embed/t13MM2XKn1I',
    badge: { vi: 'Trend Analytics', en: 'Trend Analytics' },
    highlights: {
      vi: [
        'Quét & phát hiện ngách xu hướng 24/7',
        'Phân tích chỉ số tăng trưởng kênh đối thủ',
        'Báo cáo từ khóa & hashtag dễ lên xu hướng',
        'Gợi ý ý tưởng nội dung tiềm năng cao',
      ],
      en: [
        '24/7 trend discovery & niche scanning',
        'Competitor channel growth metrics analysis',
        'Trending keywords & hashtags analytics',
        'High-potential content ideas recommendation',
      ],
    },
  },
  {
    id: 'bulk-download',
    iconName: 'DownloadCloud',
    accentColor: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    title: {
      vi: '6. Tải video hàng loạt',
      en: '6. Bulk Downloader',
    },
    desc: {
      vi: 'Tải hàng loạt trọn bộ Kênh TikTok / YouTube không logo watermark tốc độ cực nhanh.',
      en: 'Download entire TikTok/YouTube channels without watermark logos at ultra high speed.',
    },
    detailDescription: {
      vi: 'Mô-đun Tải video hàng loạt cho phép bạn tải về hàng nghìn video từ toàn bộ kênh TikTok, Douyin, YouTube Shorts hoặc Facebook Watch chỉ với 1 cú click. Video được tải ở độ phân giải gốc cao nhất, loại bỏ hoàn toàn logo watermark và hỗ trợ bóc tách danh sách phát tự động.',
      en: 'The Bulk Downloader enables downloading thousands of videos from entire TikTok, Douyin, YouTube Shorts, or Facebook Watch channels with a single click. Videos are downloaded in original max resolution, with logo watermarks completely removed and automated playlist extraction.',
    },
    videoUrl: 'https://www.youtube.com/embed/t13MM2XKn1I',
    badge: { vi: 'No Watermark', en: 'No Watermark' },
    highlights: {
      vi: [
        'Tải 1-click toàn bộ kênh TikTok / YouTube / Douyin',
        'Sạch 100% logo & watermark',
        'Giữ nguyên chất lượng video gốc (Original HD/4K)',
        'Tải đa luồng tốc độ cao không bị giới hạn IP',
      ],
      en: [
        '1-click download of full TikTok / YouTube / Douyin channels',
        '100% clean without logos or watermarks',
        'Preserves original video quality (Original HD/4K)',
        'High-speed multi-threaded downloads without IP throttling',
      ],
    },
  },
];

export const getModuleIcon = (iconName: FeatureModuleItem['iconName'], size = 24) => {
  switch (iconName) {
    case 'Scissors': return React.createElement(Scissors, { size });
    case 'Sparkles': return React.createElement(Sparkles, { size });
    case 'Clapperboard': return React.createElement(Clapperboard, { size });
    case 'RefreshCw': return React.createElement(RefreshCw, { size });
    case 'TrendingUp': return React.createElement(TrendingUp, { size });
    case 'DownloadCloud': return React.createElement(DownloadCloud, { size });
    default: return React.createElement(Sparkles, { size });
  }
};
