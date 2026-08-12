"use client";

import React, { useRef } from "react";

export default function HeroSectionClient({ children }) {
  const heroRef = useRef(null);

  return (
    <section className="hero" ref={heroRef} aria-labelledby="hero-title">
      {children}
    </section>
  );
}
