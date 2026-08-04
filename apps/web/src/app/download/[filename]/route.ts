import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename: rawFilename } = await context.params;
  const filename = (rawFilename || '').toLowerCase();
  const isMac = filename.includes('mac') || filename.endsWith('.pkg') || filename.endsWith('.dmg');

  try {
    const res = await fetch('https://api.github.com/repos/peggy2402/eigu-platform/releases/latest', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'EIGU-Platform-Web',
      },
      next: { revalidate: 300 }, // Cache on server for 5 minutes
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
    if (isMac) {
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
