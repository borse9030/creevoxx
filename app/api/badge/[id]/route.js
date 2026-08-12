import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0a140f"/>
      <stop offset="100%" stop-color="#0d1f16"/>
    </linearGradient>
  </defs>
  <rect width="220" height="28" rx="5" fill="url(#bg)"/>
  <rect width="220" height="28" rx="5" fill="none" stroke="#10b981" stroke-width="1" opacity="0.6"/>
  <text x="12" y="18" font-family="system-ui, sans-serif" font-size="12" fill="#10b981" font-weight="700">⛏</text>
  <text x="28" y="18" font-family="system-ui, sans-serif" font-size="11" fill="#ffffff" font-weight="500">Featured on</text>
  <text x="103" y="18" font-family="system-ui, sans-serif" font-size="11" fill="#10b981" font-weight="700">Creevoxx</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
