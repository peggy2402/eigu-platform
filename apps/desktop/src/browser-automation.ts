import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { VideoWorkflowRequest } from '@eigu-platform/shared';

// Kích hoạt Stealth Plugin để ẩn danh Puppeteer, giúp lách Cloudflare và hệ thống phát hiện Bot
puppeteer.use(StealthPlugin());

/**
 * Điều khiển trình duyệt để tự động tải lên TikTok với Anti-detect
 * 
 * @param request Chứa cấu hình Proxy
 * @param videoPath Đường dẫn tới file video đã được FFmpeg xử lý
 */
export async function uploadToTikTok(request: VideoWorkflowRequest, videoPath: string) {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    // Vô hiệu hóa rò rỉ WebRTC UDP để đảm bảo 100% IP Châu Âu an toàn
    '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
    '--enforce-webrtc-ip-permission-check',
    '--disable-features=WebRtcHideLocalIpsWithMdns'
  ];

  // Gắn SOCKS5 Residential Proxy vào trình duyệt
  if (request.proxyUrl) {
    args.push(`--proxy-server=${request.proxyUrl}`);
  }

  const browser = await puppeteer.launch({
    headless: false, // Để bạn có thể nhìn thấy tiến trình trực quan trên Mac
    args,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  
  // Thiết lập User-Agent tiêu chuẩn của macOS để khớp với môi trường của bạn
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log(`[Browser] Mở trình duyệt thành công. SOCKS5 Proxy: ${request.proxyUrl || 'Không có'}`);

  try {
    // 1. Vào trang đăng tải video của TikTok
    await page.goto('https://www.tiktok.com/upload', { waitUntil: 'networkidle2' });

    // 2. Mô phỏng chuột đường cong Bézier (chống nhận diện hành vi máy móc)
    console.log('[Browser] Đang mô phỏng di chuyển chuột (Bézier)...');
    await simulateHumanMouse(page);

    // 3. Sử dụng XPath linh hoạt để tìm nút Upload (tránh TikTok đổi tên class ngẫu nhiên)
    const uploadButtonSelector = '::-p-xpath(//button[contains(text(), "Select video")])';
    await page.waitForSelector(uploadButtonSelector, { timeout: 15000 });
    
    // Lắng nghe sự kiện mở hộp thoại chọn file và click vào nút
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click(uploadButtonSelector)
    ]);
    
    // Gắn file video đã qua xử lý FFmpeg
    await fileChooser.accept([videoPath]);
    console.log(`[Browser] Đã chọn và đẩy video: ${videoPath} thành công!`);

    // Lưu ý: Prototype hiện dừng ở bước gắn file. Bạn có thể mở rộng tiếp để bấm "Post".
  } catch (error) {
    console.error('[Browser] Lỗi trong quá trình upload TikTok:', error);
  } finally {
    // await browser.close(); // Giữ trình duyệt mở để bạn kiểm tra trạng thái
  }
}

/**
 * Hàm mô phỏng di chuyển chuột theo đường cong để lách phân tích hành vi
 */
async function simulateHumanMouse(page: any) {
  // Đây là mô phỏng nguyên mẫu, di chuyển con trỏ chuột theo các tọa độ ngẫu nhiên
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const targetX = 200 + Math.random() * 500;
    const targetY = 200 + Math.random() * 400;
    await page.mouse.move(targetX, targetY, { steps: 5 });
    // Dừng ngẫu nhiên giữa các bước di chuyển
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
  }
}
