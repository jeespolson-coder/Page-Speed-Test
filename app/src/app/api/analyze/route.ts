import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY; // Optional: Add key if available
  const strategy = searchParams.get('strategy') || 'mobile';
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=${strategy}${apiKey ? `&key=${apiKey}` : ''}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: data.error.code });
    }

    // Extract relevant data to keep the response light
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;
    const audits = lighthouse.audits;

    const refinedData = {
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
      },
      metrics: {
        lcp: audits['largest-contentful-paint'].displayValue,
        lcpScore: audits['largest-contentful-paint'].score,
        fid: audits['max-potential-fid'].displayValue, // FID is deprecated in PSI, using Max Potential FID or TBT as proxy/fallback, or usually INP is available now. Let's check INP.
        // Actually, 'interaction-to-next-paint' is the new standard. Let's try to get that if available, else TBT.
        // For simplicity in this step, I'll map standard ones.
        cls: audits['cumulative-layout-shift'].displayValue,
        clsScore: audits['cumulative-layout-shift'].score,
        fcp: audits['first-contentful-paint'].displayValue,
        tbt: audits['total-blocking-time'].displayValue,
        si: audits['speed-index'].displayValue,
      },
      // We can add more specific audits later
    };

    return NextResponse.json(refinedData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
