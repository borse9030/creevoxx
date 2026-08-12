// components/DownloadButtons.js
// External download buttons for CurseForge and Modrinth.
// All links open in a new tab per project requirements.

export default function DownloadButtons({ curseforgeUrl, title }) {
  const hasCurseForge = curseforgeUrl && curseforgeUrl.trim() !== "";

  // Handle block break animation on click
  const handleButtonClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Add breaking class for animation
    button.classList.add("breaking");

    // Create particles
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.className = "block-break-particle";
      
      // Random angle and velocity
      const angle = (i / 8) * Math.PI * 2;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 30;

      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";
      particle.style.setProperty("--tx", tx + "px");
      particle.style.setProperty("--ty", ty + "px");
      
      // Random grass block colors
      const grassColors = [
        "linear-gradient(135deg, #7CB342 0%, #9CCC65 100%)",
        "linear-gradient(135deg, #81C784 0%, #A1DD41 100%)",
        "linear-gradient(135deg, #558B2F 0%, #6EEC12 100%)",
      ];
      particle.style.background = grassColors[Math.floor(Math.random() * grassColors.length)];
      particle.style.width = "12px";
      particle.style.height = "12px";

      document.body.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => particle.remove(), 800);
    }

    // Remove breaking animation class after it finishes
    setTimeout(() => {
      button.classList.remove("breaking");
    }, 600);
  };

  if (!hasCurseForge) {
    return (
      <div className="download-buttons">
        <p className="download-buttons__none">No download links available yet.</p>
      </div>
    );
  }

  return (
    <div className="download-buttons" role="group" aria-label={`Download links for ${title}`}>
      {hasCurseForge && (
        <a
          href={curseforgeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="download-btn download-btn--curseforge"
          id="btn-curseforge"
          aria-label={`Download ${title} from CurseForge (opens in new tab)`}
          onClick={handleButtonClick}
        >
          <span className="download-btn__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.3 2.1L12 0l-2.3 2.1L7 1.5l-.8 2.4-2.5.3.2 2.5-2.1 1.4 1.3 2.2L1.5 12l1.6 1.7-1.3 2.2 2.1 1.4-.2 2.5 2.5.3.8 2.4 2.7-.6 2.3 2.1 2.3-2.1 2.7.6.8-2.4 2.5-.3-.2-2.5 2.1-1.4-1.3-2.2L22.5 12l-1.6-1.7 1.3-2.2-2.1-1.4.2-2.5-2.5-.3-.8-2.4-2.7.6z" />
            </svg>
          </span>
          <span className="download-btn__text">
            <span className="download-btn__label">Download on</span>
            <span className="download-btn__platform">CurseForge</span>
          </span>
          <span className="download-btn__arrow" aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}
