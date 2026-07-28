import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { VideoWorkflowRequest, VideoWorkflowStatus } from '@eigu-platform/shared';

// Kích hoạt khiên tàng hình Stealth
puppeteer.use(StealthPlugin());

export async function uploadToTikTok(
  task: VideoWorkflowRequest,
  processedVideoPath: string,
  onProgress: (status: VideoWorkflowStatus) => void
): Promise<void> {
  let browser;
  try {
    onProgress({
      taskId: task.taskId,
      status: 'processing',
      progress: 60,
      message: 'Khởi động Chromium Anti-detect...'
    });

    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,800',
      '--disable-notifications',
      '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
      '--enforce-webrtc-ip-permission-check',
      '--disable-features=WebRtcHideLocalIpsWithMdns'
    ];

    browser = await puppeteer.launch({
      headless: false,
      args,
      ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    
    // Giả mạo Fingerprint chi tiết
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    onProgress({
      taskId: task.taskId,
      status: 'processing',
      progress: 70,
      message: 'Đang truy cập TikTok Studio...'
    });

    await page.goto('https://www.tiktok.com/creator-center/upload', { waitUntil: 'networkidle2' });
    
    // Giả lập di chuột
    await simulateHumanMouse(page);

    onProgress({
      taskId: task.taskId,
      status: 'processing',
      progress: 85,
      message: 'Đang tìm nút Upload và tải file...'
    });

    // Fake hành vi upload (Chưa xử lý click thật trên giao diện TikTok bị login)
    await new Promise(r => setTimeout(r, 5000));

    onProgress({
      taskId: task.taskId,
      status: 'completed',
      progress: 100,
      message: 'Tải lên thành công (Giả lập)!'
    });

  } catch (error: any) {
    console.error('Puppeteer Error:', error);
    onProgress({
      taskId: task.taskId,
      status: 'failed',
      progress: 100,
      message: 'Lỗi upload TikTok: ' + error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function simulateHumanMouse(page: any) {
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const targetX = 200 + Math.random() * 500;
    const targetY = 200 + Math.random() * 400;
    await page.mouse.move(targetX, targetY, { steps: 5 });
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
  }
}
