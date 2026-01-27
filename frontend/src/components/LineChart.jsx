import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, dataKey, title, color = '#3b82f6' }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#666"
            tick={{ fill: '#999' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#999' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend 
            wrapperStyle={{ color: '#999' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
