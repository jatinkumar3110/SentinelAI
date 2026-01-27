import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  History, 
  AlertTriangle, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Info,
  HelpCircle,
  Terminal,
  Cpu,
  Zap
} from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, onAboutClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileClicked, setProfileClicked] = useState(false);

  const handleProfileClick = () => {
    setProfileClicked(true);
    setTimeout(() => setProfileClicked(false), 600);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'system-info', label: 'System Info', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0, width: collapsed ? 80 : 250 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-dark-card border-r border-dark-border flex flex-col"
    >
      <div className="p-6 border-b border-dark-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-2xl font-bold text-white">SentinelAI</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-dark-hover hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={onAboutClick}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-primary-600/10 hover:bg-primary-600/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-500" />
              <span className="text-white font-medium text-sm">About Project</span>
            </div>
            <ChevronRight className="w-4 h-4 text-primary-500" />
          </button>
        </div>
      )}

      <div className="p-4 border-t border-dark-border">
        <motion.button
          onClick={handleProfileClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full relative overflow-hidden rounded-lg transition-all duration-300 ${
            collapsed ? 'p-2' : 'p-3'
          } ${
            profileClicked 
              ? 'bg-gradient-to-r from-primary-600/30 via-purple-600/30 to-blue-600/30' 
              : 'bg-dark-bg hover:bg-dark-hover'
          }`}
        >
          {/* Animated Background Effect */}
          {profileClicked && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-full blur-xl"
            />
          )}
          
          <div className={`flex items-center gap-3 relative z-10 ${collapsed ? 'justify-center' : ''}`}>
            {/* Animated Logo */}
            <motion.div
              animate={profileClicked ? {
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              } : {}}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center relative overflow-hidden group">
                {/* Animated scan line effect */}
                <motion.div
                  animate={{
                    y: [-40, 40],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                />
                
                {/* Matrix-style grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-3 grid-rows-3 h-full w-full gap-[1px]">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white/20" />
                    ))}
                  </div>
                </div>
                
                {/* Icon layers */}
                <Terminal className="w-4 h-4 text-white absolute opacity-30" />
                <Cpu className="w-5 h-5 text-white relative z-10" />
                <Zap className="w-3 h-3 text-yellow-300 absolute top-1 right-1 opacity-70" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-sm" />
              </div>
              
              {/* Pulsing ring */}
              {!collapsed && (
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-lg border-2 border-blue-500"
                />
              )}
            </motion.div>
            
            {!collapsed && (
              <div className="text-sm">
                <p className="text-white font-semibold flex items-center gap-1">
                  Admin
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-green-400 text-xs"
                  >
                    ●
                  </motion.span>
                </p>
                <p className="text-gray-500 text-xs font-mono">System Monitor</p>
              </div>
            )}
          </div>
          
          {/* Corner accent */}
          {!collapsed && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
