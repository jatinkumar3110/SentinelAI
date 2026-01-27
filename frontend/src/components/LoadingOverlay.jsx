import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const LoadingOverlay = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-card border border-dark-border rounded-xl p-8 max-w-md"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary-500 animate-spin" />
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">
              {message || 'Processing...'}
            </h3>
            <p className="text-gray-400 text-sm">
              First prediction may take 5-15 seconds as models load into memory.
              <br />
              Subsequent predictions will be much faster.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              className="w-2 h-2 bg-primary-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              className="w-2 h-2 bg-primary-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              className="w-2 h-2 bg-primary-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;
