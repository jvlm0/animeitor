// components/BrazilianFinals/Scoreboard/TeamCell.jsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'

/**
 * Célula que exibe o nome do time
 * Mostra GIFs de sucesso ou falha quando há julgamentos
 */
export default function TeamCell({ 
  teamName, 
  isGoingUp, 
  isGoingDown, 
  successGif, 
  failGif 
}) {
  const backgroundColor = getRowBackgroundColor(isGoingUp, isGoingDown);

  return (
    <motion.td
      className="px-2 py-1 border-r border-gray-600 relative font-bold"
      animate={{ backgroundColor }}
      transition={{ duration: 0.5 }}
    >
      {teamName.substring(0, 80)}

      {/* GIF de Sucesso */}
      {successGif && <SuccessGif gif={successGif} />}

      {/* GIF de Falha */}
      {failGif && <FailGif gif={failGif} />}
    </motion.td>
  );
}

// Componente: GIF de sucesso
function SuccessGif({ gif }) {
  return (
    <motion.div
      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 rounded-lg p-1 border-2 border-green-400 shadow-lg z-10 overflow-hidden"
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0, rotate: 180, opacity: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <img 
        src={gif} 
        alt="Success" 
        className="w-16 h-16 object-cover rounded"
      />
    </motion.div>
  );
}

// Componente: GIF de falha
function FailGif({ gif }) {
  return (
    <motion.div
      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 rounded-lg p-1 border-2 border-red-400 shadow-lg z-10 overflow-hidden"
      initial={{ scale: 0, y: 20, opacity: 0 }}
      animate={{
        scale: [1, 1.2, 1],
        y: 0,
        opacity: 1,
        rotate: [0, -10, 10, -10, 0]
      }}
      exit={{ scale: 0, y: -20, opacity: 0 }}
      transition={{
        scale: { duration: 0.5, repeat: 1 },
        rotate: { duration: 0.5, repeat: 1 },
        default: { duration: 0.4 }
      }}
    >
      <img 
        src={gif} 
        alt="Fail" 
        className="w-16 h-16 object-cover rounded"
      />
    </motion.div>
  );
}

// Função auxiliar: Cor de fundo da linha
function getRowBackgroundColor(isGoingUp, isGoingDown) {
  if (isGoingUp) return 'rgba(34, 197, 94, 0.3)';
  if (isGoingDown) return 'rgba(239, 68, 68, 0.3)';
  return 'transparent';
}