import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = (searchParams.get('platform') || searchParams.get('os') || 'win').toLowerCase();

  try {
    const res = await fetch('https://api.github.com/repos/peggy2402/eigu-platform/releases/latest', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'EIGU-Platform-Web',
      },
      next: { revalidate: 300 }, // Cache release info on server for 5 minutes
    });

    if (!res.ok) {
      console.error('[Download Proxy Error] GitHub API returned status:', res.status);
      return NextResponse.json({ error: 'Release info not found' }, { status: 404 });
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.assets)) {
      return NextResponse.json({ error: 'Assets not found' }, { status: 404 });
    }

    let asset;
    if (platform === 'mac' || platform === 'macos' || platform === 'pkg') {
      asset = data.assets.find((a: any) => a.name.endsWith('.pkg')) || data.assets.find((a: any) => a.name.endsWith('.dmg'));
    } else {
      asset = data.assets.find((a: any) => a.name.endsWith('.exe'));
    }

    if (asset && asset.browser_download_url) {
      return NextResponse.redirect(asset.browser_download_url, 307);
    }

    return NextResponse.redirect(data.html_url || 'https://peggy-mc.site', 307);
  } catch (error) {
    console.error('[Download Proxy Error] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
