import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

class GuidePage extends StatelessWidget {
  const GuidePage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppTheme.textPrimary : AppTheme.lightTextPrimary;
    final mutedColor = isDark ? AppTheme.textSecondary : AppTheme.lightTextSecondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hướng dẫn sử dụng'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _section(context, '1. Dashboard', [
            'Trang tổng quan hiển thị số liệu video đã xử lý, đã upload TikTok, đang chờ và số tài khoản TikTok đang quản lý.',
          ], textColor, mutedColor),
          _section(context, '2. Tự động hóa video', [
            'Đầu vào: Kéo thả file .mp4 hoặc dán link YouTube để tải video về tự động.',
            'Chế độ cắt: Chọn độ dài mỗi video (1-20 phút) hoặc tùy chỉnh thời gian cụ thể.',
            'Tỉ lệ khung hình: 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram) hoặc giữ nguyên.',
            'Anti-Detect: Xóa metadata, thêm nhiễu hạt, xóa khung hình tĩnh, đảo âm thanh 3D để tránh phát hiện nội dung không nguyên bản.',
          ], textColor, mutedColor),
          _section(context, '3. Workflow', [
            'Thiết kế luồng xử lý tự động bằng cách kéo thả các node. Các node: Lấy URL > Tải xuống > AI Xử lý > FFmpeg > Nạp Hồ sơ > Tải lên TikTok.',
          ], textColor, mutedColor),
          _section(context, '4. Quản lý hồ sơ', [
            'Xem thông tin tài khoản: Email, vai trò, trạng thái xác thực. Mỗi tài khoản có Browser Profile, Cookies và Proxy riêng.',
          ], textColor, mutedColor),
          _section(context, '5. Proxy & Mạng', [
            'Cấu hình SOCKS5/Residential Proxy. Khóa WebRTC ngăn rò rỉ IP qua UDP/STUN.',
          ], textColor, mutedColor),
        ],
      ),
    );
  }

  Widget _section(BuildContext context, String title, List<String> lines, Color textColor, Color mutedColor) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: textColor)),
          const SizedBox(height: 10),
          ...lines.map((line) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Text(line, style: TextStyle(fontSize: 14, color: mutedColor, height: 1.6)),
          )),
        ],
      ),
    );
  }
}
