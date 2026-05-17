import { useEffect, useRef } from 'react';
import './RiskGauge.css';

export default function RiskGauge({ score = 0, profile = 'Low', size = 200 }) {
  const canvasRef = useRef(null);

  const getColor = (s) => {
    if (s <= 25) return '#10b981';
    if (s <= 50) return '#f59e0b';
    if (s <= 75) return '#f97316';
    return '#f43f5e';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) - 20;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const lineWidth = 12;

    // Animate the arc
    let currentScore = 0;
    const targetScore = Math.min(score, 100);
    const fps = 60;
    const duration = 1200;
    const totalFrames = (fps * duration) / 1000;
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      currentScore = eased * targetScore;

      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Score arc
      const scoreAngle = startAngle + (currentScore / 100) * (endAngle - startAngle);
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      const color = getColor(currentScore);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '88');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.max(startAngle, scoreAngle - 0.1), scoreAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth / 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [score, size]);

  return (
    <div className="risk-gauge" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="risk-gauge__canvas" style={{ width: size, height: size }} />
      <div className="risk-gauge__center">
        <span className="risk-gauge__score" style={{ color: getColor(score) }}>
          {score}
        </span>
        <span className="risk-gauge__label">{profile}</span>
      </div>
    </div>
  );
}
