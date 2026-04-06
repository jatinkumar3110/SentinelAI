import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const DonutChart = ({ data, title }) => {
  // Ensure data is valid and has required structure
  const validData = data && Array.isArray(data) && data.length > 0 
    ? data
        .filter(item => item && typeof item.value === 'number' && Number.isFinite(item.value))
        .map(item => ({ ...item, value: Math.max(0, Math.min(item.value, 100)) }))
    : [];

  const totalValue = validData.reduce((sum, item) => sum + item.value, 0);

  if (validData.length === 0 || totalValue <= 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h3 className="text-white text-lg font-semibold mb-6 text-center">{title}</h3>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-6 text-center">{title}</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="85%"
              paddingAngle={5}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => `${(Number(value) || 0).toFixed(2)}%`}
            />
            <Legend 
              wrapperStyle={{ color: '#999' }}
              verticalAlign="bottom"
              formatter={(value, entry) => (
                <span style={{ color: '#fff' }}>
                  {entry?.payload?.label || value}: {(Number(entry?.payload?.value) || 0).toFixed(2)}%
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutChart;
