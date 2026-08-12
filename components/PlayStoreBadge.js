"use client";

import React from "react";

export function PlayStoreIcon({ width = 22, height = 22 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.609 1.814C3.256 2.188 3.05 2.766 3.05 3.518v16.964c0 .752.206 1.33.559 1.704l.09.084 9.502-9.502v-.224L3.699 1.73l-.09.084z" fill="#00D2FF"/>
      <path d="M16.368 15.711l-3.167-3.167v-.224l3.167-3.167.071.04 3.754 2.134c1.072.609 1.072 1.606 0 2.217l-3.754 2.134-.071.033z" fill="#FFD500"/>
      <path d="M13.272 12.32l-3.071-3.071L3.609 1.814c.356-.376.953-.594 1.666-.188l11.093 6.302-3.096 4.392z" fill="#00F076"/>
      <path d="M13.272 11.68l3.096 4.392-11.093 6.302c-.713.406-1.31.188-1.666-.188l6.592-7.435 3.071-3.071z" fill="#FF3A44"/>
    </svg>
  );
}

export default function PlayStoreBadge({ compact = false }) {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=com.creevoxx.creevoxx"
      target="_blank"
      rel="noopener noreferrer"
      className={`playstore-badge${compact ? " playstore-badge--compact" : ""}`}
      aria-label="Get Creevoxx Android App on Google Play"
    >
      <div className="playstore-badge__icon">
        <PlayStoreIcon width={compact ? 18 : 22} height={compact ? 18 : 22} />
      </div>
      <div className="playstore-badge__text">
        <span className="playstore-badge__label">GET IT ON</span>
        <span className="playstore-badge__title">Google Play</span>
      </div>
    </a>
  );
}
