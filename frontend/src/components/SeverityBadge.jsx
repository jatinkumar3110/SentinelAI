import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getStyles = () => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-500 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/40';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/40';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStyles()}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
