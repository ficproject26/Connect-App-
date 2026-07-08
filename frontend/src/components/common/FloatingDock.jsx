import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

// Official WhatsApp SVG Icon path
const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.632 1.97 14.162.946 11.53.946 6.097.946 1.673 5.319 1.67 10.749c0 1.69.444 3.34 1.288 4.81l-.997 3.642 3.687-.967zM17.65 15c-.3-.15-1.79-.88-2.07-.98-.28-.1-.49-.15-.69.15-.2.3-.78.98-.96 1.18-.18.2-.35.23-.65.08-1.02-.51-1.87-1.12-2.61-1.76-.56-.49-.94-1.09-1.05-1.29-.11-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.49-1.18-.67-1.62-.18-.43-.37-.37-.5-.38-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.9s.82 2.2 1.93 2.35c.11.01 2.23 3.41 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.79-.73 2.04-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.21-.58-.36z"/>
  </svg>
);

export default function FloatingDock() {
  const [activeModal, setActiveModal] = useState(null); // 'support' | null
  const [hoveredButton, setHoveredButton] = useState(null); // 'whatsapp' | 'ai' | null

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/916369406416', '_blank', 'noopener,noreferrer');
  };

  const handleAIClick = () => {
    setActiveModal('support');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 md:right-8 z-40 flex flex-col gap-3.5 items-center">
        
        {/* 1. AI Assistant Button (Top) */}
        <div className="relative flex items-center justify-center">
          {/* Pulse Glow Effect Background */}
          <motion.div
            className="absolute inset-0 bg-indigo-500 rounded-full -z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredButton === 'ai' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/95 dark:bg-slate-950/95 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none uppercase tracking-wider"
              >
                AI Support Assistant
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Button */}
          <motion.button
            onClick={handleAIClick}
            onMouseEnter={() => setHoveredButton('ai')}
            onMouseLeave={() => setHoveredButton(null)}
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl relative border border-white/20 select-none focus:outline-none"
            aria-label="Chat with AI Assistant"
          >
            <Sparkles className="w-6 h-6 fill-white/10" />
          </motion.button>
        </div>

        {/* 2. WhatsApp Button (Bottom) */}
        <div className="relative flex items-center justify-center">
          {/* Pulse Glow Effect Background */}
          <motion.div
            className="absolute inset-0 bg-emerald-500 rounded-full -z-10 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredButton === 'whatsapp' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/95 dark:bg-slate-950/95 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none uppercase tracking-wider"
              >
                WhatsApp Chat
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.button
            onClick={handleWhatsAppClick}
            onMouseEnter={() => setHoveredButton('whatsapp')}
            onMouseLeave={() => setHoveredButton(null)}
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl relative border border-white/20 select-none focus:outline-none"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-7 h-7" />
          </motion.button>
        </div>

      </div>

      {/* AI SUPPORT MODAL / OVERLAY */}
      <AnimatePresence>
        {activeModal === 'support' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            {/* Modal Backdrop Click to Close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal(null)} />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0b132b] text-slate-800 dark:text-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-slate-200/50 dark:border-slate-800/60 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-4 border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight mb-2">
                  Connect AI Support
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Have questions? Our team and AI support assistant are here to help you get started with the Connect App ecosystem.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      window.open('https://wa.me/916369406416', '_blank');
                      setActiveModal(null);
                    }}
                    className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    WhatsApp Support
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = 'mailto:support@connectapp.com';
                      setActiveModal(null);
                    }}
                    className="py-3 px-4 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Email Tickets
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
