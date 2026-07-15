import './global.css';

export const metadata = {
  title: 'EIGU Platform - MMO Automation Engine',
  description: 'AI-driven TikTok Automation via Anti-detect Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
