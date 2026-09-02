import React, { useRef, useEffect } from 'react';

interface VisionCanvasFeedProps {
  beltOffset: number;         // px, from telemetry
  isOffline?: boolean;
  confidence?: number;        // 0-1
}

const CANVAS_W = 640;
const CANVAS_H = 360;

export default function VisionCanvasFeed({ beltOffset, isOffline = false, confidence = 0.91 }: VisionCanvasFeedProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const frameRef   = useRef(0);
  const tickRef    = useRef(0);
  const offsetRef  = useRef(beltOffset);

  useEffect(() => { offsetRef.current = beltOffset; }, [beltOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BELT_W     = 320;
    const BELT_Y0    = 80;
    const BELT_Y1    = CANVAS_H - 80;
    const CENTER_X   = CANVAS_W / 2;
    const STRIPE_GAP = 40;
    let stripe = 0;

    function draw() {
      frameRef.current = requestAnimationFrame(draw);
      tickRef.current++;
      stripe = (stripe + 1.5) % STRIPE_GAP;

      // --- Background ---
      ctx!.fillStyle = '#0A0C14';
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

      if (isOffline) {
        // Offline state
        ctx!.fillStyle = 'rgba(107,114,128,0.08)';
        ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx!.strokeStyle = 'rgba(107,114,128,0.15)';
        ctx!.lineWidth = 1;
        for (let x = 0; x < CANVAS_W; x += 24) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, CANVAS_H); ctx!.stroke(); }
        for (let y = 0; y < CANVAS_H; y += 24) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(CANVAS_W, y); ctx!.stroke(); }
        ctx!.fillStyle = 'rgba(107,114,128,0.7)';
        ctx!.font = 'bold 16px Inter, sans-serif';
        ctx!.textAlign = 'center';
        ctx!.fillText('CAMERA STREAM UNAVAILABLE', CANVAS_W / 2, CANVAS_H / 2 - 12);
        ctx!.fillStyle = 'rgba(107,114,128,0.4)';
        ctx!.font = '12px Inter, sans-serif';
        ctx!.fillText('Check camera connection and power', CANVAS_W / 2, CANVAS_H / 2 + 12);
        return;
      }

      // Conveyor frame / housing
      ctx!.fillStyle = '#1A1E2A';
      ctx!.fillRect(0, BELT_Y0 - 20, CANVAS_W, BELT_Y1 - BELT_Y0 + 40);

      // Belt surface - current x position based on offset
      const beltX = CENTER_X - BELT_W / 2 + offsetRef.current * 2;

      // Belt body
      const grad = ctx!.createLinearGradient(beltX, 0, beltX + BELT_W, 0);
      grad.addColorStop(0,   '#1C2030');
      grad.addColorStop(0.4, '#252B3D');
      grad.addColorStop(0.6, '#252B3D');
      grad.addColorStop(1,   '#1C2030');
      ctx!.fillStyle = grad;
      ctx!.fillRect(beltX, BELT_Y0, BELT_W, BELT_Y1 - BELT_Y0);

      // Moving belt stripes
      ctx!.strokeStyle = 'rgba(60,72,100,0.8)';
      ctx!.lineWidth = 1.5;
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(beltX, BELT_Y0, BELT_W, BELT_Y1 - BELT_Y0);
      ctx!.clip();
      for (let yy = BELT_Y0 - STRIPE_GAP + stripe; yy < BELT_Y1 + STRIPE_GAP; yy += STRIPE_GAP) {
        ctx!.beginPath();
        ctx!.moveTo(beltX, yy);
        ctx!.lineTo(beltX + BELT_W, yy + 10);
        ctx!.stroke();
      }
      ctx!.restore();

      // Belt edge shading
      const edgeGrad = ctx!.createLinearGradient(beltX, 0, beltX + 12, 0);
      edgeGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
      edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = edgeGrad;
      ctx!.fillRect(beltX, BELT_Y0, 12, BELT_Y1 - BELT_Y0);
      const edgeGradR = ctx!.createLinearGradient(beltX + BELT_W - 12, 0, beltX + BELT_W, 0);
      edgeGradR.addColorStop(0, 'rgba(0,0,0,0)');
      edgeGradR.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx!.fillStyle = edgeGradR;
      ctx!.fillRect(beltX + BELT_W - 12, BELT_Y0, 12, BELT_Y1 - BELT_Y0);

      // --- ROI bounding box ---
      const roiPad = 30;
      const roiX   = beltX - 4;
      const roiY   = BELT_Y0 - 4;
      const roiW   = BELT_W + 8;
      const roiH   = BELT_Y1 - BELT_Y0 + 8;
      ctx!.strokeStyle = 'rgba(6,182,212,0.5)';
      ctx!.lineWidth   = 1.5;
      ctx!.setLineDash([6, 4]);
      ctx!.strokeRect(roiX, roiY, roiW, roiH);
      ctx!.setLineDash([]);

      // ROI corner markers
      const corners = [[roiX, roiY], [roiX + roiW, roiY], [roiX, roiY + roiH], [roiX + roiW, roiY + roiH]];
      ctx!.strokeStyle = '#06B6D4';
      ctx!.lineWidth = 2;
      corners.forEach(([cx2, cy2]) => {
        ctx!.beginPath(); ctx!.moveTo(cx2, cy2 + 10); ctx!.lineTo(cx2, cy2); ctx!.lineTo(cx2 + 10, cy2); ctx!.stroke();
      });

      // Expected centerline (green dashed)
      ctx!.strokeStyle = 'rgba(16,185,129,0.7)';
      ctx!.lineWidth = 1.5;
      ctx!.setLineDash([8, 6]);
      ctx!.beginPath();
      ctx!.moveTo(CENTER_X, BELT_Y0 - 15);
      ctx!.lineTo(CENTER_X, BELT_Y1 + 15);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Expected center label
      ctx!.fillStyle = 'rgba(16,185,129,0.8)';
      ctx!.font = '9px JetBrains Mono, monospace';
      ctx!.textAlign = 'left';
      ctx!.fillText('EXPECTED CENTER', CENTER_X + 6, BELT_Y0 - 2);

      // Detected belt edge (actual)
      const detectedEdge = beltX + BELT_W / 2;  // midpoint of actual belt
      const edgeColor = Math.abs(offsetRef.current) > 8
        ? 'rgba(239,68,68,0.9)'
        : Math.abs(offsetRef.current) > 5
          ? 'rgba(245,158,11,0.9)'
          : 'rgba(16,185,129,0.9)';
      ctx!.strokeStyle = edgeColor;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(detectedEdge, BELT_Y0 - 15);
      ctx!.lineTo(detectedEdge, BELT_Y1 + 15);
      ctx!.stroke();

      // Offset arrow
      if (Math.abs(offsetRef.current) > 1) {
        ctx!.strokeStyle = edgeColor;
        ctx!.lineWidth = 1.5;
        const arrowY = BELT_Y0 + (BELT_Y1 - BELT_Y0) / 2;
        ctx!.beginPath();
        ctx!.moveTo(CENTER_X, arrowY);
        ctx!.lineTo(detectedEdge, arrowY);
        ctx!.stroke();
        // Arrowhead
        const dir = detectedEdge > CENTER_X ? 1 : -1;
        ctx!.beginPath();
        ctx!.moveTo(detectedEdge, arrowY);
        ctx!.lineTo(detectedEdge - dir * 8, arrowY - 5);
        ctx!.moveTo(detectedEdge, arrowY);
        ctx!.lineTo(detectedEdge - dir * 8, arrowY + 5);
        ctx!.stroke();

        // Offset measurement label
        ctx!.fillStyle = edgeColor;
        ctx!.font = 'bold 11px JetBrains Mono, monospace';
        ctx!.textAlign = 'center';
        const labelX = (CENTER_X + detectedEdge) / 2;
        ctx!.fillText(
          `${offsetRef.current > 0 ? '+' : ''}${offsetRef.current.toFixed(0)} px`,
          labelX,
          arrowY - 10,
        );
      }

      // --- Overlay HUD ---
      // Top-left: LIVE indicator
      ctx!.fillStyle = 'rgba(0,0,0,0.55)';
      ctx!.beginPath();
      ctx!.roundRect(10, 10, 80, 22, 4);
      ctx!.fill();
      ctx!.fillStyle = '#EF4444';
      ctx!.beginPath();
      ctx!.arc(22, 21, 4, 0, 2 * Math.PI);
      ctx!.fill();
      ctx!.fillStyle = '#E8ECF4';
      ctx!.font = 'bold 10px Inter, sans-serif';
      ctx!.textAlign = 'left';
      ctx!.fillText('LIVE', 30, 25);

      // FPS
      ctx!.fillStyle = 'rgba(0,0,0,0.55)';
      ctx!.beginPath();
      ctx!.roundRect(CANVAS_W - 58, 10, 48, 22, 4);
      ctx!.fill();
      ctx!.fillStyle = 'rgba(148,163,184,0.9)';
      ctx!.font = '10px JetBrains Mono, monospace';
      ctx!.textAlign = 'right';
      ctx!.fillText('24 FPS', CANVAS_W - 10, 25);

      // Bottom overlay: BELT OFFSET status
      const alignColor = Math.abs(offsetRef.current) > 8 ? '#EF4444' : Math.abs(offsetRef.current) > 5 ? '#F59E0B' : '#10B981';
      const alignLabel = Math.abs(offsetRef.current) > 8 ? 'CRITICAL' : Math.abs(offsetRef.current) > 5 ? 'WARNING' : 'ALIGNED';
      ctx!.fillStyle = 'rgba(9,10,15,0.8)';
      ctx!.fillRect(0, CANVAS_H - 48, CANVAS_W, 48);
      ctx!.fillStyle = alignColor;
      ctx!.font = 'bold 11px JetBrains Mono, monospace';
      ctx!.textAlign = 'left';
      ctx!.fillText(`BELT OFFSET: ${offsetRef.current > 0 ? '+' : ''}${offsetRef.current.toFixed(0)} PX`, 16, CANVAS_H - 28);
      ctx!.fillText(`ALIGNMENT: ${alignLabel}`, 16, CANVAS_H - 12);
      ctx!.fillStyle = 'rgba(148,163,184,0.7)';
      ctx!.font = '10px JetBrains Mono, monospace';
      ctx!.textAlign = 'right';
      ctx!.fillText(`VISION CONFIDENCE: ${(confidence * 100).toFixed(0)}%`, CANVAS_W - 16, CANVAS_H - 28);
      ctx!.fillText('DEMO MODE — SIMULATED FEED', CANVAS_W - 16, CANVAS_H - 12);

      // Scan line effect (subtle)
      const scanY = (tickRef.current * 2) % CANVAS_H;
      ctx!.strokeStyle = 'rgba(6,182,212,0.04)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, scanY);
      ctx!.lineTo(CANVAS_W, scanY);
      ctx!.stroke();
    }

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [isOffline, confidence]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        width: '100%',
        maxWidth: CANVAS_W,
        height: 'auto',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        display: 'block',
      }}
      aria-label="Conveyor belt machine vision feed"
    />
  );
}
