import React from 'react';
import { motion } from 'framer-motion';

interface GenreChartProps {
  genres: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

const GenreChart: React.FC<GenreChartProps> = ({ genres }) => {
  const colors = [
    '#1DB954', '#1ED760', '#1FDF64', '#FF6B35', '#F7931E',
    '#FFD23F', '#06FFA5', '#4ECDC4', '#45B7D1', '#96CEB4'
  ];

  const maxCount = Math.max(...genres.map(g => g.count));

  if (genres.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No genre data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="space-y-3">
        {genres.slice(0, 8).map((genre, index) => (
          <motion.div
            key={genre.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-20 text-sm text-gray-300 truncate" title={genre.name}>
              {genre.name}
            </div>
            <div className="flex-1 relative">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(genre.count / maxCount) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
              </div>
            </div>
            <div className="w-12 text-sm text-white text-right">
              {genre.percentage}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Donut Chart */}
      <div className="mt-8">
        <svg width="200" height="200" className="mx-auto">
          {(() => {
            const centerX = 100;
            const centerY = 100;
            const radius = 70;
            const innerRadius = 40;
            let currentAngle = 0;

            return genres.slice(0, 6).map((genre, index) => {
              const percentage = genre.percentage / 100;
              const angle = percentage * 2 * Math.PI;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + Math.cos(startAngle) * radius;
              const y1 = centerY + Math.sin(startAngle) * radius;
              const x2 = centerX + Math.cos(endAngle) * radius;
              const y2 = centerY + Math.sin(endAngle) * radius;
              
              const x3 = centerX + Math.cos(endAngle) * innerRadius;
              const y3 = centerY + Math.sin(endAngle) * innerRadius;
              const x4 = centerX + Math.cos(startAngle) * innerRadius;
              const y4 = centerY + Math.sin(startAngle) * innerRadius;
              
              const largeArcFlag = angle > Math.PI ? 1 : 0;
              
              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <motion.path
                  key={genre.name}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            });
          })()}
          
          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-sm fill-gray-300 font-medium"
          >
            Genres
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            Top {Math.min(6, genres.length)}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs mt-4">
        {genres.slice(0, 6).map((genre, index) => (
          <div key={genre.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-gray-300 truncate" title={genre.name}>
              {genre.name} ({genre.percentage}%)
            </span>
          </div>
        ))}
      </div>

      {/* Show more genres if available */}
      {genres.length > 8 && (
        <div className="text-center mt-4">
          <span className="text-gray-400 text-sm">
            +{genres.length - 8} more genres
          </span>
        </div>
      )}
    </div>
  );
};

export default GenreChart;
