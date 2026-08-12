"use client";
import { useEffect, useRef } from "react";

export default function MinecraftRunner({ onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const isMobile = window.innerWidth <= 768;
    const W = isMobile ? 360 : 800;
    const H = isMobile ? 480 : 320;
    const GY = isMobile ? 380 : 230;

    canvas.width = W;
    canvas.height = H;

    let state = "idle";
    let score = 0;
    let hi = 0;
    let spd = 5;
    let frame = 0;
    let obstacles = [];
    let clouds = [];
    let particles = [];
    let stars = [];
    let steve = { x: 80, y: GY, vy: 0, jumping: false, frame: 0 };
    const GRAVITY = 0.7;
    const JUMP = -14;
    let animationFrameId;

    // Load Highscore from localStorage if available
    try {
      const savedHi = localStorage.getItem("mc_runner_hi");
      if (savedHi) {
        hi = parseInt(savedHi, 10) || 0;
      }
    } catch (e) {
      console.error(e);
    }

    const hiScoreEl = document.getElementById("mc-hiscore");
    if (hiScoreEl) hiScoreEl.textContent = `BEST: ${hi}`;

    // Generate stars
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * 120 + 10,
        r: Math.random() > 0.7 ? 2 : 1,
        t: Math.random() * Math.PI * 2,
      });
    }

    // Block drawing
    function drawBlock(x, y, type) {
      const s = 20;
      if (type === "grass") {
        ctx.fillStyle = "#3A5A28";
        ctx.fillRect(x, y, s, s / 3);
        ctx.fillStyle = "#5A3A0F";
        ctx.fillRect(x, y + s / 3, s, s * 2 / 3);
        ctx.fillStyle = "#2A4A1A";
        ctx.fillRect(x, y, 2, s / 3);
        ctx.fillStyle = "#4A2E0A";
        ctx.fillRect(x, y + s / 3, 2, s * 2 / 3);
        ctx.fillStyle = "#4A7030";
        ctx.fillRect(x + 2, y, s - 4, 3);
      } else if (type === "dirt") {
        ctx.fillStyle = "#5A3A0F";
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = "#4A2E0A";
        ctx.fillRect(x, y, 2, s);
        ctx.fillRect(x, y, s, 2);
        ctx.fillStyle = "#6A4A1A";
        ctx.fillRect(x + 4, y + 4, 6, 4);
        ctx.fillRect(x + 12, y + 12, 5, 3);
      } else if (type === "cactus") {
        ctx.fillStyle = "#2A5010";
        ctx.fillRect(x + 6, y, 8, s);
        ctx.fillStyle = "#1A3A08";
        ctx.fillRect(x + 6, y, 2, s);
        ctx.fillStyle = "#386A18";
        ctx.fillRect(x + 8, y + 4, 6, s - 4);
      } else if (type === "log") {
        ctx.fillStyle = "#5A3A0F";
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = "#4A2E0A";
        ctx.fillRect(x + 4, y, 4, s);
        ctx.fillRect(x + 12, y, 4, s);
        ctx.fillStyle = "#6A4A1A";
        ctx.fillRect(x, y + 4, s, 4);
        ctx.fillRect(x, y + 12, s, 4);
        ctx.fillStyle = "#3A5A28";
        ctx.fillRect(x, y, s, 4);
      }
    }

    // Steve (facing right)
    function drawSteve(x, y, f, dead) {
      if (dead) ctx.globalAlpha = 0.5;
      const dy =
        !dead && !steve.jumping ? (Math.floor(f / 8) % 2 === 0 ? 0 : -2) : 0;
      y += dy;

      // Legs
      const legSwing = steve.jumping ? 0 : Math.sin(f / 5) * 5;
      ctx.fillStyle = "#1A56B0";
      ctx.fillRect(x + 6, y + 26, 6, 12);
      ctx.fillRect(x + 12, y + 26, 6, 12);
      ctx.fillStyle = "#0D3A80";
      ctx.fillRect(x + 6, y + 26 + Math.max(0, legSwing | 0), 6, 6);
      ctx.fillRect(x + 12, y + 26 - Math.max(0, legSwing | 0), 6, 6);
      ctx.fillStyle = "#333";
      ctx.fillRect(x + 6, y + 36, 6, 2);
      ctx.fillRect(x + 12, y + 36, 6, 2);

      // Body
      ctx.fillStyle = "#5E35B1";
      ctx.fillRect(x + 4, y + 14, 14, 12);
      ctx.fillStyle = "#3A1E8A";
      ctx.fillRect(x + 4, y + 14, 2, 12);
      ctx.fillStyle = "#7B4FC0";
      ctx.fillRect(x + 6, y + 14, 12, 3);

      // Back arm
      const armBack = steve.jumping ? -4 : Math.sin(f / 5 + Math.PI) * 4;
      ctx.fillStyle = "#7A5C4A";
      ctx.fillRect(x + 16, y + 14, 4, 10 + armBack);

      // Head (facing right)
      ctx.fillStyle = "#8D6E63";
      ctx.fillRect(x + 6, y + 2, 14, 12);
      ctx.fillStyle = "#6A4E43";
      ctx.fillRect(x + 6, y + 2, 2, 12);
      ctx.fillStyle = "#3A2010";
      ctx.fillRect(x + 6, y + 2, 14, 3); // hair
      ctx.fillStyle = "#FFF";
      ctx.fillRect(x + 17, y + 6, 3, 3); // eye white
      ctx.fillStyle = "#1A1A1A";
      ctx.fillRect(x + 18, y + 7, 2, 2); // pupil
      ctx.fillStyle = "#B07860";
      ctx.fillRect(x + 19, y + 9, 2, 1); // nose
      ctx.fillStyle = "#5A3020";
      ctx.fillRect(x + 17, y + 11, 3, 1); // mouth

      // Front arm (swinging)
      const armFront = steve.jumping ? 4 : Math.sin(f / 5) * 4;
      ctx.fillStyle = "#7A5C4A";
      ctx.fillRect(x + 2, y + 14, 4, 10 + armFront);
      ctx.fillStyle = "#6A4C3A";
      ctx.fillRect(x + 2, y + 14, 2, 10 + armFront);

      ctx.globalAlpha = 1;
    }

    // Mobs
    function drawCreeper(x, y) {
      ctx.fillStyle = "#2A5010";
      ctx.fillRect(x + 4, y, 12, 12);
      ctx.fillStyle = "#1A3A08";
      ctx.fillRect(x + 4, y, 2, 12);
      ctx.fillRect(x + 14, y, 2, 12);
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(x + 6, y + 3, 2, 2);
      ctx.fillRect(x + 12, y + 3, 2, 2);
      ctx.fillRect(x + 8, y + 7, 4, 2);
      ctx.fillRect(x + 6, y + 9, 2, 2);
      ctx.fillRect(x + 12, y + 9, 2, 2);
      ctx.fillStyle = "#1E3D0A";
      ctx.fillRect(x + 2, y + 12, 16, 14);
      ctx.fillStyle = "#0E2A04";
      ctx.fillRect(x + 2, y + 12, 2, 14);
      ctx.fillRect(x + 16, y + 12, 2, 14);
      ctx.fillStyle = "#2A5010";
      ctx.fillRect(x + 2, y + 26, 6, 8);
      ctx.fillRect(x + 12, y + 26, 6, 8);
      ctx.fillStyle = "#1A3A08";
      ctx.fillRect(x + 2, y + 26, 2, 8);
      ctx.fillRect(x + 12, y + 26, 2, 8);
    }

    function drawZombie(x, y) {
      ctx.fillStyle = "#2A7030";
      ctx.fillRect(x + 4, y, 12, 12);
      ctx.fillStyle = "#1A5020";
      ctx.fillRect(x + 4, y, 2, 12);
      ctx.fillRect(x + 14, y, 2, 12);
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(x + 6, y + 3, 2, 2);
      ctx.fillRect(x + 12, y + 3, 2, 2);
      ctx.fillRect(x + 7, y + 8, 6, 2);
      ctx.fillStyle = "#103080";
      ctx.fillRect(x + 2, y + 12, 16, 12);
      ctx.fillStyle = "#082060";
      ctx.fillRect(x + 2, y + 12, 2, 12);
      ctx.fillRect(x + 16, y + 12, 2, 12);
      ctx.fillStyle = "#2A7030";
      ctx.fillRect(x, y + 12, 4, 14);
      ctx.fillRect(x + 16, y + 12, 4, 14);
      ctx.fillStyle = "#1A5020";
      ctx.fillRect(x, y + 12, 2, 14);
      ctx.fillRect(x + 16, y + 12, 2, 14);
      ctx.fillStyle = "#333";
      ctx.fillRect(x + 4, y + 24, 6, 10);
      ctx.fillRect(x + 10, y + 24, 6, 10);
    }

    function drawSkeleton(x, y) {
      ctx.fillStyle = "#C0C0B8";
      ctx.fillRect(x + 4, y, 12, 12);
      ctx.fillStyle = "#808078";
      ctx.fillRect(x + 4, y, 2, 12);
      ctx.fillRect(x + 14, y, 2, 12);
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(x + 6, y + 3, 2, 2);
      ctx.fillRect(x + 12, y + 3, 2, 2);
      ctx.fillRect(x + 7, y + 8, 6, 2);
      ctx.fillStyle = "#D0D0C8";
      ctx.fillRect(x + 4, y + 12, 12, 14);
      ctx.fillStyle = "#808078";
      ctx.fillRect(x + 5, y + 14, 2, 10);
      ctx.fillRect(x + 13, y + 14, 2, 10);
      ctx.fillStyle = "#C0C0B8";
      ctx.fillRect(x, y + 14, 4, 14);
      ctx.fillRect(x + 16, y + 14, 4, 14);
      ctx.fillStyle = "#808078";
      ctx.fillRect(x + 2, y + 16, 2, 12);
      ctx.fillRect(x + 16, y + 16, 2, 12);
      ctx.fillStyle = "#D0D0C8";
      ctx.fillRect(x + 4, y + 26, 6, 8);
      ctx.fillRect(x + 10, y + 26, 6, 8);
      ctx.fillStyle = "#808078";
      ctx.fillRect(x + 5, y + 28, 2, 6);
      ctx.fillRect(x + 13, y + 28, 2, 6);
    }

    // Enderman
    function drawEnderman(x, y) {
      ctx.fillStyle = "#1A0A2A";
      ctx.fillRect(x + 7, y, 6, 8);
      ctx.fillStyle = "#F020A0";
      ctx.fillRect(x + 8, y + 2, 2, 2);
      ctx.fillRect(x + 12, y + 2, 2, 2);
      ctx.fillStyle = "#100820";
      ctx.fillRect(x + 5, y + 8, 10, 16);
      ctx.fillStyle = "#1A0A2A";
      ctx.fillRect(x + 1, y + 10, 4, 12);
      ctx.fillRect(x + 15, y + 10, 4, 12);
      ctx.fillStyle = "#100820";
      ctx.fillRect(x + 5, y + 24, 4, 10);
      ctx.fillRect(x + 11, y + 24, 4, 10);
    }

    // Clouds
    function drawCloud(x, y) {
      ctx.fillStyle = "rgba(30,30,60,0.7)";
      ctx.fillRect(x + 10, y, 30, 10);
      ctx.fillRect(x, y + 10, 50, 10);
      ctx.fillRect(x + 15, y - 8, 20, 10);
    }

    // Moon
    function drawMoon(f) {
      const mx = W - 80 + Math.sin(f * 0.001) * 20;
      const my = 50 + Math.cos(f * 0.0007) * 15;
      ctx.fillStyle = "#E8E090";
      ctx.fillRect(mx, my, 28, 28);
      ctx.fillStyle = "#D0C878";
      ctx.fillRect(mx + 2, my, 24, 2);
      ctx.fillRect(mx, my + 2, 2, 24);
      ctx.fillRect(mx + 26, my + 2, 2, 24);
      ctx.fillRect(mx + 2, my + 26, 24, 2);
      ctx.fillStyle = "#C0B860";
      ctx.fillRect(mx + 8, my + 6, 6, 4);
      ctx.fillRect(mx + 18, my + 16, 4, 4);
      ctx.fillStyle = "rgba(200,180,80,0.12)";
      ctx.fillRect(mx - 6, my - 6, 40, 40);
    }

    // Obstacle drawing
    function drawObstacle(ob) {
      const baseY = GY - 20 + 5;
      if (ob.type === "cactus") {
        drawBlock(ob.x, GY, "cactus");
        drawBlock(ob.x, GY - 20, "cactus");
      } else if (ob.type === "log") {
        drawBlock(ob.x, GY, "log");
        drawBlock(ob.x, GY - 20, "log");
      } else if (ob.type === "creeper") drawCreeper(ob.x, baseY - 10);
      else if (ob.type === "zombie") drawZombie(ob.x, baseY - 12);
      else if (ob.type === "skeleton") drawSkeleton(ob.x, baseY - 12);
      else if (ob.type === "enderman") drawEnderman(ob.x, baseY - 20);
    }

    // Ground
    function drawGround() {
      const offset = ((frame * spd) | 0) % 20;
      for (let i = -1; i < 42; i++) {
        const bx = i * 20 - offset;
        drawBlock(bx, GY + 5, "grass");
        // Draw multiple rows of dirt to fill the screen vertically
        for (let dy = 25; dy < H - GY; dy += 20) {
          drawBlock(bx, GY + dy, "dirt");
        }
      }
    }

    // Background
    function drawBg() {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#050A1A");
      sky.addColorStop(0.6, "#0A1030");
      sky.addColorStop(1, "#1A2040");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      stars.forEach((s) => {
        s.t += 0.02;
        const a = 0.5 + 0.5 * Math.sin(s.t);
        ctx.fillStyle = `rgba(255,255,220,${a})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });

      drawMoon(frame);

      const hgrd = ctx.createLinearGradient(0, H - 80, 0, H);
      hgrd.addColorStop(0, "rgba(10,20,50,0)");
      hgrd.addColorStop(1, "rgba(5,10,25,0.8)");
      ctx.fillStyle = hgrd;
      ctx.fillRect(0, H - 80, W, 80);
    }

    // Particles
    function addParticle(x, y) {
      for (let i = 0; i < 10; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 5,
          life: 35,
          c: ["#5D8A3C", "#8B6914", "#E0C060", "#F020A0"][i % 4],
        });
      }
    }

    // Collision
    function collides(ob) {
      const sw = 14,
        sh = 34,
        sx = steve.x + 3,
        sy = steve.y - sh + 5;
      let ox = ob.x,
        ow = 14,
        oh = 34,
        oy = GY - 30;
      if (ob.type === "cactus" || ob.type === "log") {
        ow = 16;
        oh = 40;
        oy = GY - 35;
      }
      if (ob.type === "enderman") {
        oh = 44;
        oy = GY - 44;
      }
      return sx < ox + ow && sx + sw > ox && sy < oy + oh && sy + sh > oy;
    }

    // Spawners
    function spawnCloud() {
      clouds.push({
        x: W + 50,
        y: 20 + Math.random() * 50,
        spd: 0.3 + Math.random() * 0.3,
      });
    }
    function spawnObstacle() {
      const types = ["creeper", "zombie", "skeleton", "enderman", "cactus", "log"];
      const type = types[Math.floor(Math.random() * types.length)];
      obstacles.push({ x: W + 20, type, w: 22 });
    }

    // Main draw
    function draw(dead) {
      drawBg();
      clouds.forEach((c) => drawCloud(c.x, c.y));
      drawGround();
      obstacles.forEach((o) => drawObstacle(o));
      drawSteve(steve.x, steve.y - 38, steve.frame, dead);
      particles.forEach((p) => {
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, 4, 4);
      });

      // Torch glow around Steve
      const grd = ctx.createRadialGradient(
        steve.x + 12,
        steve.y - 10,
        2,
        steve.x + 12,
        steve.y - 10,
        60
      );
      grd.addColorStop(0, "rgba(255,160,30,0.18)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(steve.x - 48, steve.y - 70, 120, 90);
    }

    // Game loop
    let lastObTime = 0,
      lastCloudTime = 0;
    function gameLoop(ts) {
      if (state !== "running") return;
      frame++;
      spd = 5 + score / 800;

      if (ts - lastCloudTime > 4000) {
        spawnCloud();
        lastCloudTime = ts;
      }
      const obInterval = Math.max(900, 1800 - score * 2);
      if (ts - lastObTime > obInterval) {
        spawnObstacle();
        lastObTime = ts;
      }

      steve.vy += GRAVITY;
      steve.y += steve.vy;
      if (steve.y >= GY) {
        steve.y = GY;
        steve.vy = 0;
        steve.jumping = false;
      }
      steve.frame++;

      clouds = clouds.filter((c) => c.x > -60);
      clouds.forEach((c) => (c.x -= c.spd));
      obstacles = obstacles.filter((o) => o.x > -40);

      let dead = false;
      obstacles.forEach((o) => {
        o.x -= spd;
        if (collides(o)) dead = true;
      });
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life--;
      });
      particles = particles.filter((p) => p.life > 0);

      if (dead) {
        addParticle(steve.x + 12, steve.y - 20);
        state = "dead";
        if (score > hi) {
          hi = score;
          try {
            localStorage.setItem("mc_runner_hi", hi.toString());
          } catch (e) {}
        }
        const hiScoreEl = document.getElementById("mc-hiscore");
        if (hiScoreEl) hiScoreEl.textContent = `BEST: ${hi}`;

        const msgEl = document.getElementById("mc-msg");
        if (msgEl) {
          msgEl.innerHTML = `<h2>YOU DIED!</h2><p>Score: ${score} &nbsp;|&nbsp; SPACE / CLICK to respawn</p>`;
          msgEl.style.display = "block";
        }
        draw(true);
        return;
      }

      score++;
      const scoreEl = document.getElementById("mc-score");
      if (scoreEl) scoreEl.textContent = `SCORE: ${score}`;
      draw(false);
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Input / start
    function jump() {
      if (state === "idle" || state === "dead") {
        state = "running";
        score = 0;
        obstacles = [];
        particles = [];
        clouds = [];
        steve.y = GY;
        steve.vy = 0;
        steve.jumping = false;
        frame = 0;
        lastObTime = 0;
        lastCloudTime = 0;
        const msgEl = document.getElementById("mc-msg");
        if (msgEl) msgEl.style.display = "none";
        const scoreEl = document.getElementById("mc-score");
        if (scoreEl) scoreEl.textContent = "SCORE: 0";
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      if (!steve.jumping) {
        steve.vy = JUMP;
        steve.jumping = true;
      }
    }

    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", jump);

    // Initial render
    draw(false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="mc-runner-game-card">
      <button className="mc-runner-close-btn" onClick={onClose}>
        ✕ Close Game
      </button>
      <div id="mc-ui" style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <canvas id="gc" ref={canvasRef} width="800" height="320" style={{ display: "block", width: "100%", imageRendering: "pixelated", cursor: "pointer" }} />
        <div id="mc-score" style={{ position: "absolute", top: "10px", right: "10px", fontSize: "18px", fontWeight: "700", color: "#E0C060", textShadow: "0 0 8px #E0C06088" }}>SCORE: 0</div>
        <div id="mc-hiscore" style={{ position: "absolute", top: "10px", left: "10px", fontSize: "13px", color: "#888" }}>BEST: 0</div>
        <div id="mc-msg" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", background: "rgba(0,0,0,0.8)", padding: "18px 32px", borderRadius: "6px", border: "2px solid #555" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#E0C060", letterSpacing: "2px", marginBottom: "6px" }}>MINECRAFT RUNNER</h2>
          <p style={{ fontSize: "13px", color: "#aaa" }}>PRESS SPACE / CLICK TO START</p>
        </div>
        <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", fontSize: "11px", color: "#666" }}>SPACE / ↑ / CLICK to jump</div>
      </div>
    </div>
  );
}
