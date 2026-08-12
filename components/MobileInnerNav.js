"use client";
import { usePathname, useRouter } from "next/navigation";

export default function MobileInnerNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Only show on non-home pages (home has its own mob-app shell)
  if (!pathname || pathname === "/") return null;

  return (
    <div className="mob-inner-nav">
      <button
        className="mob-inner-back"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>
      <button
        className="mob-inner-home"
        onClick={() => router.push("/")}
        aria-label="Go to home"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </button>
    </div>
  );
}
