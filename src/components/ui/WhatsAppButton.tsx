'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '5567996617549';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppButton() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3, type: 'spring', stiffness: 200 }}
    >
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-16 h-16 hover:scale-110 transition-all duration-300"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <Image
          src="/images/icons/whatsapp.png"
          alt="WhatsApp"
          width={64}
          height={64}
          className="drop-shadow-lg"
        />
      </Link>

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </motion.div>
  );
}
