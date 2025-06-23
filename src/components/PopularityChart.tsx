import React from 'react';
import { motion } from 'framer-motion';

interface PopularityChartProps {
  distribution: {
    veryPopular: number; // 80-100
    popular: number;     // 60-79
    moderate: number;    // 40-59
    underground: number; // 0-39
  };
}

const PopularityChart: React.FC<PopularityChartProps> = ({ distribution }) => {
  const categories = [
    {
      key: 'veryPopular',
      label: 'Very Popular',
      range: '80-100',
      value: distribution.veryPopular,
      color: '#10B981',
      description: 'Mainstream hits'
    },
    {
      key: 'popular',
      label: 'Popular',
      range: '60-79',
      value: distribution.popular,
      color: '#F59E0B',
      description: 'Well-known tracks'
    },
    {
      key: 'moderate',
      label: 'Moderate',
      range: '40-59',
      value: distribution.moderate,
      color: '#F97316',
      description: 'Emerging artists'
    },
    {
      key: 'underground',
      label: 'Underground',
      range: '0-39',
      value: distribution.underground,
      color: '#8B5CF6',
      description: 'Hidden gems'
    }
  ];

  const totalTracks = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  if (totalTracks === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No popularity data available
      </div>
    );
  }

  const maxValue = Math.max(...categories.map(cat => cat.value));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="space-y-4">
        {categories.map((category, index) => {
          const percentage = totalTracks > 0 ? Math.round((category.value / totalTracks) * 100) : 0;
          
          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white">
                    {category.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {category.description} ({category.range})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {category.value} tracks
                  </div>
                  <div className="text-xs text-gray-400">
                    {percentage}%
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${maxValue > 0 ? (category.value / maxValue) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ backgroundColor: category.color }}
                  >
                    {percentage > 10 && (
                      <span className="text-xs font-medium text-white">
                        {percentage}%
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pie Chart */}
      <div className="mt-8">
        <svg width="200" height="200" className="mx-auto">
          {(() => {
            const centerX = 100;
            const centerY = 100;
            const radius = 80;
            let currentAngle = 0;

            return categories.map((category, index) => {
              if (category.value === 0) return null;
              
              const percentage = category.value / totalTracks;
              const angle = percentage * 2 * Math.PI;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + Math.cos(startAngle) * radius;
              const y1 = centerY + Math.sin(startAngle) * radius;
              const x2 = centerX + Math.cos(endAngle) * radius;
              const y2 = centerY + Math.sin(endAngle) * radius;
              
              const largeArcFlag = angle > Math.PI ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <motion.path
                  key={category.key}
                  d={pathData}
                  fill={category.color}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            });
          })()}
          
          {/* Center circle */}
          <circle
            cx="100"
            cy="100"
            r="30"
            fill="rgba(0, 0, 0, 0.8)"
            className="backdrop-blur-sm"
          />
          
          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-sm fill-gray-300 font-medium"
          >
            Popularity
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            {totalTracks} tracks
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {categories.map((category) => {
          const percentage = totalTracks > 0 ? Math.round((category.value / totalTracks) * 100) : 0;
          
          return (
            <div key={category.key} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1">
                <div className="text-gray-300 font-medium">
                  {category.label}
                </div>
                <div className="text-gray-400">
                  {category.value} tracks ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Popularity Insights</h4>
        <div className="text-xs text-gray-300 space-y-1">
          {(() => {
            const popularPercentage = Math.round(((distribution.veryPopular + distribution.popular) / totalTracks) * 100);
            const undergroundPercentage = Math.round((distribution.underground / totalTracks) * 100);
            
            if (popularPercentage > 70) {
              return <p>🔥 This playlist focuses heavily on mainstream hits and popular tracks.</p>;
            } else if (undergroundPercentage > 50) {
              return <p>💎 This playlist is great for discovering underground and emerging artists.</p>;
            } else {
              return <p>⚖️ This playlist has a balanced mix of popular and underground tracks.</p>;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default PopularityChart;
