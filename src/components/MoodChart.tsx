import React from 'react';
import { motion } from 'framer-motion';

interface MoodChartProps {
  analysis: {
    moods: {
      happiness: number;
      danceability: number;
      energy: number;
      acousticness: number;
      instrumentalness: number;
      liveness: number;
      speechiness: number;
    };
  };
}

const MoodChart: React.FC<MoodChartProps> = ({ analysis }) => {
  const { moods } = analysis;

  const features = [
    { key: 'happiness', label: 'Happiness', value: moods.happiness, color: '#F59E0B' },
    { key: 'energy', label: 'Energy', value: moods.energy, color: '#EF4444' },
    { key: 'danceability', label: 'Danceability', value: moods.danceability, color: '#8B5CF6' },
    { key: 'acousticness', label: 'Acousticness', value: moods.acousticness, color: '#10B981' },
    { key: 'instrumentalness', label: 'Instrumentalness', value: moods.instrumentalness, color: '#3B82F6' },
    { key: 'liveness', label: 'Liveness', value: moods.liveness, color: '#F97316' },
    { key: 'speechiness', label: 'Speechiness', value: moods.speechiness, color: '#EC4899' },
  ];

  // Create radar chart points
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / features.length;

  const points = features.map((feature, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const value = feature.value;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    return { x, y, angle, ...feature };
  });

  // Create grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridCircles = gridLevels.map(level => ({
    radius: radius * level,
    opacity: level === 1.0 ? 0.3 : 0.1
  }));

  // Create axis lines
  const axisLines = features.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const endX = centerX + Math.cos(angle) * radius;
    const endY = centerY + Math.sin(angle) * radius;
    return { endX, endY };
  });

  // Create polygon path
  const polygonPath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <div className="relative">
      <svg width="300" height="300" className="mx-auto">
        {/* Grid circles */}
        {gridCircles.map((circle, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={circle.radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            opacity={circle.opacity}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, index) => (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={line.endX}
            y2={line.endY}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon */}
        <motion.path
          d={polygonPath}
          fill="rgba(29, 185, 84, 0.2)"
          stroke="#1DB954"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <motion.circle
            key={point.key}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={point.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
          />
        ))}

        {/* Labels */}
        {features.map((feature, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelRadius = radius + 20;
          const labelX = centerX + Math.cos(angle) * labelRadius;
          const labelY = centerY + Math.sin(angle) * labelRadius;
          
          return (
            <text
              key={feature.key}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-300 font-medium"
            >
              {feature.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {features.map((feature) => (
          <div key={feature.key} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: feature.color }}
            />
            <span className="text-gray-300">
              {feature.label}: {Math.round(feature.value * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodChart;
