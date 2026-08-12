"use client";
import { useState, useEffect } from "react";

export default function MinecraftLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0; // Loop loading animation
        return prev + 1;
      });
    }, 40); // ~4 seconds for full generation loop
    return () => clearInterval(interval);
  }, []);

  const gridSize = 11;
  const center = 5;
  const cells = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Chebyshev distance (maximum absolute difference) from center
      const dist = Math.max(Math.abs(r - center), Math.abs(c - center));
      cells.push({ r, c, dist });
    }
  }

  return (
    <div className="mc-loader-container">
      <div className="mc-loader-percentage">{progress}%</div>
      <div className="mc-loader-grid-box">
        <div className="mc-loader-grid">
          {cells.map((cell, idx) => {
            let cellClass = "mc-cell-empty";

            if (cell.dist === 0) {
              if (progress >= 5) cellClass = "mc-cell-white";
            } else if (cell.dist === 1) {
              if (progress >= 15) cellClass = "mc-cell-green";
              else if (progress >= 10) cellClass = "mc-cell-blue";
            } else if (cell.dist === 2) {
              if (progress >= 35) cellClass = "mc-cell-green";
              else if (progress >= 25) cellClass = "mc-cell-blue";
            } else if (cell.dist === 3) {
              if (progress >= 55) cellClass = "mc-cell-gray";
              else if (progress >= 45) cellClass = "mc-cell-brown";
            } else if (cell.dist === 4) {
              if (progress >= 75) cellClass = "mc-cell-gray";
            } else {
              // dist 5 (outer edges)
              if (progress >= 92) cellClass = "mc-cell-gray";
            }

            return (
              <div
                key={idx}
                className={`mc-loader-cell ${cellClass}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
