"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  color: string;
  phase: number;
  twinkleSpeed: number;
}

const COLORS = ["251, 191, 36", "255, 255, 255", "245, 158, 11", "147, 197, 253", "167, 139, 250"];

const panels = [
  { title: "Rektor UNG", label: "Rektor" },
  { title: "Kepala Sekolah", label: "Kepsek" },
  { title: "Kanwil", label: "kanwil" },
  { title: "Kepala LPMPP", label: "LMPP" },
  { title: "Kepala Dinas Provinsi", label: "kadisP" },
  { title: "Kepala Dinas Bone Bolango", label: "KadisB" },
];

export default function Home() {
  const panelCount = panels.length;
  const [placed, setPlaced] = useState(Array(panelCount).fill(false));
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const placedRef = useRef(Array(panelCount).fill(false));

  const allPlaced = placed.length > 0 && placed.every(Boolean);

  useEffect(() => {
    if (placed.length !== panelCount) {
      placedRef.current = Array(panelCount).fill(false);
      setPlaced(Array(panelCount).fill(false));
    }
  }, [panelCount, placed.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const count = Math.min(90, Math.floor(window.innerWidth / 12));

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 4 + 1;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.25 + 0.03),
        size: size > 4.2 ? 6 : size,
        baseOpacity: Math.random() * 0.5 + 0.1,
        color,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const twinkle = Math.sin(Date.now() * p.twinkleSpeed + p.phase) * 0.3 + 0.7;
        const opacity = p.baseOpacity * twinkle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
        ctx.fill();

        if (p.size > 3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${opacity * 0.15})`;
          ctx.fill();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (allPlaced) {
      setIsScanning(true);

      const scanTimer = setTimeout(() => {
        setScanComplete(true);
      }, 4500);
      const navTimer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        window.location.href = "https://edotelsmkn2gorontalo.com/";
      }, 5800);
      return () => {
        clearTimeout(scanTimer);
        clearTimeout(navTimer);
      };
    }
  }, [allPlaced]);

  const handleTap = useCallback(
    (index: number) => {
      if (!placedRef.current[index] && !isScanning) {
        placedRef.current[index] = true;
        const allPlacedNow = placedRef.current.every(Boolean);
        if (allPlacedNow) {
          audioRef.current?.play().catch(() => {});
        }
        setPlaced([...placedRef.current]);
      }
    },
    [isScanning],
  );

  const resetAll = useCallback(() => {
    placedRef.current = Array(panelCount).fill(false);
    setPlaced(Array(panelCount).fill(false));
    setIsScanning(false);
    setScanComplete(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [panelCount]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none bg-black" style={{ touchAction: "none", WebkitTouchCallout: "none" }}>
      <audio ref={audioRef} src="/fixsound.mp3" loop preload="auto" />

      {/* Hotel background */}
      <div className="absolute inset-0 bg-black">
        <Image src="/hotel.jpeg" alt="Hotel Grand Bay" width={1920} height={1275} className="w-full h-full object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Scanning overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm select-none" style={{ touchAction: "none", WebkitTouchCallout: "none" }} onContextMenu={(e) => e.preventDefault()}>
          {!scanComplete ? (
            <>
              <div className="absolute inset-x-0 h-px bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-scan-line" />
              <div className="relative w-72 h-1 bg-white/10 rounded-full overflow-hidden mb-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 animate-scan-progress rounded-full" />
              </div>
              <div className="text-amber-400 font-mono text-lg tracking-[0.3em] animate-pulse">MERESMIKAN PELUNCURAN...</div>
              <div className="mt-6 flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center animate-fade-in-up select-none" style={{ touchAction: "none", WebkitTouchCallout: "none" }} onContextMenu={(e) => e.preventDefault()}>
              <div className="w-16 h-16 border-2 border-amber-400 rounded-full flex items-center justify-center mb-6 animate-success-pulse">
                <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-amber-400 font-mono text-base tracking-widest">PELUNCURAN BERHASIL</div>
              <div className="text-white/40 font-mono text-xs mt-3 tracking-wider">MENGALIHKAN KE HALAMAN UTAMA...</div>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 px-4 ${isScanning ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}>
        {/* Badge */}
        <div className="mb-2">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-px h-4 bg-amber-400/40" />
            <span className="text-[10px] tracking-[0.4em] text-amber-400/70 font-mono uppercase">PENDIDIKAN TEKNOLOGI INFORMASI UNG MENGAJAR BATCH 9</span>
            <div className="w-px h-4 bg-amber-400/40" />
          </div>
        </div>

        <h1 className="text-center text-4xl sm:text-5xl lg:text-7xl font-light text-white mb-2 tracking-tight">Grand Launching</h1>
        <p className="text-center text-lg md:text-xl mb-5 text-amber-400/80 font-light tracking-wide">Website resmi edOTEL SMKN 2 GORONTALO</p>

        {/* Hand panels */}
        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 justify-center">
          {panels.map((panel, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase mb-0.5">{panel.title}</p>
              </div>
              <button onPointerDown={() => handleTap(i)} onContextMenu={(e) => e.preventDefault()} disabled={isScanning} className="group relative w-28 h-36 sm:w-36 sm:h-44 md:w-40 md:h-48 active:scale-95 active:duration-75">
                <div className={`absolute inset-0 border rounded-2xl transition-all duration-500 backdrop-blur-sm ${placed[i] ? "border-amber-400/70 bg-amber-400/10 animate-ripple" : "border-white/20 hover:border-white/40 bg-white/5"}`}>
                  <svg viewBox="0 0 746.278 746.277" className="w-full h-full p-2 md:p-2.5" fill="none">
                    <path
                      d="M567.52,142.808c-18.1-2.46-27.659,12.74-28.846,29.688l-13.495,134.416c-0.252,6.244-5.518,11.114-11.769,10.862c-6.244-0.245-11.106-5.51-10.861-11.768l8.186-240.043c0.598-16.984-12.675-31.234-29.657-31.838c-16.984-0.604-31.234,12.675-31.847,29.651l-7.999,238.13c0,5.036-4.085,9.114-9.114,9.114c-5.034,0-9.112-4.079-9.112-9.114l-0.008-271.147C422.998,13.776,409.222,0,392.231,0s-30.767,13.775-30.767,30.759l-0.224,266.091c0,5.719-4.633,10.322-10.357,10.351c-8.366,0.043-10.014-7.826-10.014-7.826c-0.201-0.816-10.258-236.442-10.258-236.442c-0.885-16.969-15.363-30.004-32.325-29.112c-16.971,0.877-30.012,15.365-29.119,32.327l15.919,336.895c1.61,10.121-5.294,19.623-15.415,21.234c-10.129,1.611-19.631-5.279-21.242-15.408l-29.356-119.524c-4.036-16.516-20.688-26.615-37.19-22.587c-16.509,4.042-26.615,20.695-22.58,37.197l48.714,199.186c0.899,3.652,70.445,127.939,95.802,133.902v69.174c0,22.127,17.935,40.061,40.054,40.061h136.235c22.126,0,40.061-17.934,40.061-40.061v-75.789c35.88-45.924,49.54-132.113,50.116-206.328l17.407-248.525C588.87,158.612,584.122,145.066,567.52,142.808z"
                      className={`transition-all duration-500 ${placed[i] ? "stroke-amber-400 fill-amber-400/20" : "stroke-white/40 group-hover:stroke-white/60"}`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-5 left-0 right-0 text-center">
                  <span className={`text-[9px] tracking-[0.2em] font-mono transition-colors duration-500 ${placed[i] ? "text-amber-400" : "text-white/40"}`}>{placed[i] ? "✓ TERVERIFIKASI" : "KETUK"}</span>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </div>
          <p className="text-[10px] text-white/30 font-mono tracking-wider">Ketuk {panelCount} panel untuk meresmikan peluncuran</p>
        </div>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-3 right-4 z-30 text-[9px] text-white/20 font-mono tracking-[0.15em] select-none">PTI_UNG_MENGAJAR_BATCH_9</div>

      {/* Reset */}
      {allPlaced && !isScanning && (
        <button onClick={resetAll} className="fixed bottom-6 right-6 z-30 text-[10px] text-white/30 font-mono tracking-wider hover:text-white/50 transition-colors">
          RESET
        </button>
      )}
    </div>
  );
}
