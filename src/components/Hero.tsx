import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  settings?: Record<string, string>;
}

export default function Hero({ settings }: HeroProps) {
  const bannerTitle = settings?.['banner_title'] || 'Gia Phả Gia Đình';
  const bannerSubtitle = settings?.['banner_subtitle'] || 'Cụ Nghiêm Cung';
  const bannerImage = settings?.['banner_image'] || 'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop';

  return (
    <div id="hero-section" className="relative bg-[#3e2a16] h-[220px] md:h-[300px] flex items-center justify-center overflow-hidden w-full">
      {/* Decorative background overlay */}
      <div 
        className="absolute inset-0 opacity-25 bg-center bg-cover" 
        style={{ backgroundImage: `url('${bannerImage}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a1d0f] to-transparent"></div>
      
      <div className="relative z-10 text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center space-x-4 mb-3"
        >
          <div className="h-[2px] w-12 md:w-24 bg-[#d6b583]"></div>
          <div className="text-[#d6b583] text-xl md:text-2xl">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div className="h-[2px] w-12 md:w-24 bg-[#d6b583]"></div>
        </motion.div>
        
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-5xl font-bold text-[#fdfbf7] uppercase tracking-widest font-playfair drop-shadow-lg mb-3"
        >
          {bannerTitle}
        </motion.h1>
        
        <motion.h2 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl md:text-3.5xl lg:text-4xl font-bold text-[#d6b583] uppercase tracking-widest font-playfair drop-shadow-md"
        >
          {bannerSubtitle}
        </motion.h2>
      </div>
    </div>
  );
}
