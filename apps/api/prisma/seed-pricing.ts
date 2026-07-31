import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'apps/api/.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const url = process.env.DATABASE_URL || '';
const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('🌱 Starting Pricing Database Seed...');

  // Create Badges
  const badgePopular = await prisma.pricingBadge.upsert({
    where: { code: 'POPULAR' },
    update: { name: 'PHỔ BIẾN NHẤT', colorConfig: 'accent' },
    create: { code: 'POPULAR', name: 'PHỔ BIẾN NHẤT', colorConfig: 'accent' },
  });

  const badgeDiscount40 = await prisma.pricingBadge.upsert({
    where: { code: 'DISCOUNT_40' },
    update: { name: 'GIẢM 40%', colorConfig: 'warning' },
    create: { code: 'DISCOUNT_40', name: 'GIẢM 40%', colorConfig: 'warning' },
  });

  const badgeSaver = await prisma.pricingBadge.upsert({
    where: { code: 'SAVER' },
    update: { name: 'TIẾT KIỆM', colorConfig: 'success' },
    create: { code: 'SAVER', name: 'TIẾT KIỆM', colorConfig: 'success' },
  });

  const badgeTrial = await prisma.pricingBadge.upsert({
    where: { code: 'TRIAL_FREE' },
    update: { name: 'DÙNG THỬ 7 NGÀY', colorConfig: 'info' },
    create: { code: 'TRIAL_FREE', name: 'DÙNG THỬ 7 NGÀY', colorConfig: 'info' },
  });

  const modulesData = [
    {
      slug: 'ai-video',
      name: 'Tạo video AI',
      tagline: 'Tạo video chuyên nghiệp từ ý tưởng bằng AI',
      icon: 'Sparkles',
      sortOrder: 1,
      tiers: [
        {
          code: 'trial',
          label: 'Trial',
          tagline: 'Gói trải nghiệm miễn phí 7 ngày',
          price: 0,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 2,
          resolution: '720p',
          billingPeriod: 'trial',
          trialDays: 7,
          badgeId: badgeTrial.id,
          sortOrder: 0,
          features: ['Tải video xem thử', 'Trải nghiệm 7 ngày không giới hạn', 'Tạo tối đa 3 video/ngày'],
        },
        {
          code: 'basic',
          label: 'Basic',
          tagline: 'Dành cho người mới bắt đầu',
          price: 150000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 4,
          resolution: '720p',
          sortOrder: 1,
          features: ['Tạo video không giới hạn', 'Copy video', 'Tạo từ ý tưởng'],
        },
        {
          code: 'pro',
          label: 'Pro',
          tagline: 'Dành cho người chuyên nghiệp',
          price: 450000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 8,
          resolution: '1080p/2K/4K',
          badgeId: badgePopular.id,
          sortOrder: 2,
          features: ['Full tính năng', 'Hỗ trợ ưu tiên 24/7', '+ Tạo từ ảnh', '+ Tạo từ video mẫu'],
        },
        {
          code: 'team',
          label: 'Team',
          tagline: 'Dành cho đội nhóm sáng tạo',
          price: 1800000,
          originalPrice: 3000000,
          discount: 40,
          machines: 5,
          threads: 20,
          resolution: '1080p/2K/4K',
          badgeId: badgeDiscount40.id,
          sortOrder: 3,
          features: ['Full tính năng', 'Hỗ trợ nhanh có nhân viên hỗ trợ', 'Quản lý team workspace'],
        },
        {
          code: 'enterprise',
          label: 'Enterprise',
          tagline: 'Dành cho doanh nghiệp MMO',
          price: 5400000,
          originalPrice: 9000000,
          discount: 40,
          machines: 30,
          threads: 0,
          resolution: '1080p/2K/4K',
          badgeId: badgeSaver.id,
          sortOrder: 4,
          features: ['Full tính năng', 'Hỗ trợ ưu tiên 24/7', 'Không giới hạn video', 'Hệ thống dedicated GPU worker'],
        },
      ],
    },
    {
      slug: 'cut',
      name: 'Tự động cắt video',
      tagline: 'Cắt highlight và dựng clip TikTok/Reels tự động',
      icon: 'Scissors',
      sortOrder: 2,
      tiers: [
        {
          code: 'basic',
          label: 'Basic',
          tagline: 'Cắt video cơ bản',
          price: 99000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 4,
          resolution: '720p',
          sortOrder: 1,
          features: ['Cắt phân đoạn 1-20 phút', 'Tải link YouTube', 'Xuất chuẩn 9:16'],
        },
        {
          code: 'pro',
          label: 'Pro',
          tagline: 'Dành cho Channel Rebuilder',
          price: 299000,
          originalPrice: 500000,
          discount: 40,
          machines: 2,
          threads: 10,
          resolution: '1080p',
          badgeId: badgePopular.id,
          sortOrder: 2,
          features: ['Silence Detection (Nhận diện khoảng nghỉ)', 'Tiêm filter Anti-Detect MD5', 'Hỗ trợ Render GPU Hardware'],
        },
        {
          code: 'team',
          label: 'Team',
          tagline: 'Hệ thống cắt ghép tự động hóa',
          price: 990000,
          originalPrice: 1650000,
          discount: 40,
          machines: 5,
          threads: 25,
          resolution: '1080p/4K',
          badgeId: badgeSaver.id,
          sortOrder: 3,
          features: ['Tạo Part 1/N tự động', 'Tích hợp Voice Subtitles (WhisperX)', 'Tải kênh hàng loạt'],
        },
        {
          code: 'enterprise',
          label: 'Enterprise',
          tagline: 'Hệ thống Render Studio cho Agency',
          price: 2990000,
          originalPrice: 5000000,
          discount: 40,
          machines: 20,
          threads: 0,
          resolution: '4K',
          sortOrder: 4,
          features: ['Render siêu tốc độ 60fps', 'Băng thông không giới hạn', 'Custom Watermark & Brand Preset'],
        },
      ],
    },
    {
      slug: 'ai-studio',
      name: 'AI Video Studio',
      tagline: 'Dựng phim, lồng tiếng & biên tập chuyên sâu',
      icon: 'Clapperboard',
      sortOrder: 3,
      tiers: [
        {
          code: 'basic',
          label: 'Basic',
          tagline: 'Biên tập cơ bản',
          price: 199000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 4,
          resolution: '1080p',
          sortOrder: 1,
          features: ['Ghép Voiceover AI', 'Tự động tạo Phụ đề', 'Kho nhạc nền bản quyền'],
        },
        {
          code: 'pro',
          label: 'Pro',
          tagline: 'Dành cho Editor Chuyên Nghiệp',
          price: 599000,
          originalPrice: 1000000,
          discount: 40,
          machines: 2,
          threads: 12,
          resolution: '1080p/4K',
          badgeId: badgePopular.id,
          sortOrder: 2,
          features: ['Clone giọng nói ElevenLabs', 'Xóa nền Video (Background Removal)', 'Dịch tự động 30+ Ngôn ngữ'],
        },
        {
          code: 'team',
          label: 'Team',
          tagline: 'Studio dựng phim ngắn',
          price: 1990000,
          originalPrice: 3300000,
          discount: 40,
          machines: 8,
          threads: 30,
          resolution: '4K Ultra HD',
          badgeId: badgeSaver.id,
          sortOrder: 3,
          features: ['Đầy đủ giọng đọc cao cấp', 'Xuất file theo cấu trúc dự án', 'Đội ngũ hỗ trợ 24/7'],
        },
      ],
    },
    {
      slug: 'reup',
      name: 'Tạo video reup',
      tagline: 'Biến đổi bố cục, âm thanh & bẻ gãy Perceptual Hash',
      icon: 'RefreshCw',
      sortOrder: 4,
      tiers: [
        {
          code: 'basic',
          label: 'Basic',
          tagline: 'Bypass MD5 cơ bản',
          price: 120000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 4,
          resolution: '720p/1080p',
          sortOrder: 1,
          features: ['Đổi MD5 Hash', 'Lật video & Zoom nhẹ', 'Xóa Metadata GPS/ID3'],
        },
        {
          code: 'pro',
          label: 'Pro',
          tagline: 'Bypass thuật toán TikTok/Douyin',
          price: 390000,
          originalPrice: 650000,
          discount: 40,
          machines: 3,
          threads: 12,
          resolution: '1080p',
          badgeId: badgePopular.id,
          sortOrder: 2,
          features: ['Chèn Nhiễu Hạt Perceptual Noise', 'Bẻ dải âm 3D Spatial Panning', 'Loại bỏ frame trùng (Decimation)'],
        },
        {
          code: 'team',
          label: 'Team',
          tagline: 'Hệ thống Reup nuôi Kênh lớn',
          price: 1490000,
          originalPrice: 2500000,
          discount: 40,
          machines: 10,
          threads: 40,
          resolution: '1080p/4K',
          sortOrder: 3,
          features: ['Xử lý Reup hàng loạt', 'Mã hóa GPU phần cứng', 'Quản lý Profile Browser chống gậy'],
        },
      ],
    },
    {
      slug: 'hot-niche',
      name: 'Tìm ngách hot',
      tagline: 'Tự động quét xu hướng & gợi ý ngách viral',
      icon: 'TrendingUp',
      sortOrder: 5,
      tiers: [
        {
          code: 'basic',
          label: 'Basic',
          tagline: 'Phân tích ngách cơ bản',
          price: 99000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 0,
          resolution: '-',
          sortOrder: 1,
          features: ['Tra cứu Top 50 Ngách Hot', 'Phân tích từ khóa TikTok/Douyin', 'Cập nhật xu hướng hàng tuần'],
        },
        {
          code: 'pro',
          label: 'Pro',
          tagline: 'Công cụ săn Trend MMO',
          price: 299000,
          originalPrice: 500000,
          discount: 40,
          machines: 3,
          threads: 0,
          resolution: '-',
          badgeId: badgePopular.id,
          sortOrder: 2,
          features: ['So sánh kênh đối thủ', 'Cảnh báo Trend mới nổi thời gian thực', 'Bóc tách Kịch bản Viral'],
        },
      ],
    },
    {
      slug: 'bulk-download',
      name: 'Tải video hàng loạt',
      tagline: 'Tải toàn bộ Kênh/Playlist không logo watermark',
      icon: 'DownloadCloud',
      sortOrder: 6,
      tiers: [
        {
          code: 'basic',
          label: 'Basic',
          tagline: 'Tải hàng loạt nhẹ',
          price: 79000,
          originalPrice: 0,
          discount: 0,
          machines: 1,
          threads: 10,
          resolution: '1080p',
          sortOrder: 1,
          features: ['Tải không dính Logo TikTok/Douyin/Shorts', 'Tốc độ tải cao', 'Xuất danh sách file gọn'],
        },
        {
          code: 'pro',
          label: 'Pro',
          tagline: 'Tải trọn bộ Kênh triệu View',
          price: 249000,
          originalPrice: 400000,
          discount: 38,
          machines: 3,
          threads: 30,
          resolution: 'Full HD / 4K',
          badgeId: badgePopular.id,
          sortOrder: 2,
          features: ['Tải trọn Kênh chỉ 1 Click', 'Tải Playlist YouTube 1000+ Video', 'Tự động phân loại thư mục'],
        },
      ],
    },
  ];

  for (const modData of modulesData) {
    const { tiers, ...modFields } = modData;
    const mod = await prisma.pricingModule.upsert({
      where: { slug: modFields.slug },
      update: { ...modFields },
      create: { ...modFields },
    });

    console.log(`📦 Seeded Module: ${mod.name} (${mod.slug})`);

    for (const tierData of tiers) {
      const { features, ...tierFields } = tierData;
      const priceVal = Number(tierFields.price);
      const origVal = Number(tierFields.originalPrice || 0);

      const tier = await prisma.pricingTier.upsert({
        where: {
          moduleId_code: {
            moduleId: mod.id,
            code: tierFields.code,
          },
        },
        update: {
          ...tierFields,
          price: priceVal,
          originalPrice: origVal,
          moduleId: mod.id,
        },
        create: {
          ...tierFields,
          price: priceVal,
          originalPrice: origVal,
          moduleId: mod.id,
        },
      });

      // Clear existing features & insert
      await prisma.pricingTierFeature.deleteMany({ where: { tierId: tier.id } });
      if (features && features.length > 0) {
        await prisma.pricingTierFeature.createMany({
          data: features.map((text, sortOrder) => ({
            tierId: tier.id,
            text,
            sortOrder,
          })),
        });
      }
    }
  }

  console.log('✅ Pricing Database Seed Completed Successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
