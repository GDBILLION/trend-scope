import React, { useState } from 'react';
import { GoogleTrendsTimelinePoint } from '../types/index.js';

interface TrendSparklineProps {
  timeline: GoogleTrendsTimelinePoint[];
  color?: string;
  height?: number;
}

export const TrendSparkline: React.FC<TrendSparklineProps> = ({
  timeline,
  color = '#6366f1',
  height = 54,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    point: GoogleTrendsTimelinePoint;
  } | null>(null);

  if (!timeline || timeline.length < 2) {
    return (
      <div className="h-12 flex items-center justify-center text-xs text-slate-500 font-mono">
        Insufficient timeline data
      </div>
    );
  }

  const width = 280;
  const paddingY = 8;
  const paddingX = 4;
  const effectiveHeight = height - paddingY * 2;
  const effectiveWidth = width - paddingX * 2;

  const minVal = 0; // Relative interest scale is 0 - 100
  const maxVal = Math.max(100, ...timeline.map((p) => p.value));

  const points = timeline.map((p, i) => {
    const x = paddingX + (i / (timeline.length - 1)) * effectiveWidth;
    const y = paddingY + effectiveHeight - ((p.value - minVal) / (maxVal - minVal || 1)) * effectiveHeight;
    return { x, y, point: p };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Fill gradient path closed at the bottom
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="relative group w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-14 overflow-visible"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id={`sparkline-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Baseline guideline */}
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="rgba(148, 163, 184, 0.15)"
          strokeDasharray="2,2"
          strokeWidth="1"
        />

        {/* Area fill */}
        <path d={fillD} fill={`url(#sparkline-grad-${color})`} />

        {/* Stroke line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive hover targets */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="4"
            className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer fill-indigo-400 stroke-slate-900 stroke-2"
            onMouseEnter={() => setHoveredPoint(pt)}
          />
        ))}

        {/* Current hovered point highlight */}
        {hoveredPoint && (
          <circle
            cx={hoveredPoint.x}
            cy={hoveredPoint.y}
            r="4.5"
            fill="#a5b4fc"
            stroke="#0f172a"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Floating tooltip */}
      {hoveredPoint && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded px-2 py-0.5 text-[10px] font-mono text-slate-200 shadow-lg whitespace-nowrap z-20"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
          }}
        >
          <span className="text-indigo-400 font-semibold">{hoveredPoint.point.value}/100</span>
          {hoveredPoint.point.date && (
            <span className="text-slate-400 ml-1.5">· {hoveredPoint.point.date}</span>
          )}
        </div>
      )}
    </div>
  );
};
