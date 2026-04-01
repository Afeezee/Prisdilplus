'use client';

import { motion } from 'framer-motion';

interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  color?: string;
}

export default function RadarChart({
  data,
  size = 250,
  color = '#4ECDC4',
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const angleStep = (Math.PI * 2) / data.length;

  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Grid polygons
  const gridPolygons = levels.map((level) => {
    const points = data
      .map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius * level;
        const y = cy + Math.sin(angle) * radius * level;
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const val = Math.max(0, Math.min(1, d.value));
    const x = cx + Math.cos(angle) * radius * val;
    const y = cy + Math.sin(angle) * radius * val;
    return { x, y };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Labels
  const labels = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(angle) * (radius + 20);
    const y = cy + Math.sin(angle) * (radius + 20);
    return { ...d, x, y };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {/* Grid */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x2 = cx + Math.cos(angle) * radius;
        const y2 = cy + Math.sin(angle) * radius;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data area */}
      <motion.polygon
        points={dataPolygon}
        fill={`${color}33`}
        stroke={color}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * i, duration: 0.3 }}
        />
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-400 text-[9px] font-medium"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
