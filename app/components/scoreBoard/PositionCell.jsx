// components/BrazilianFinals/Scoreboard/PositionCell.jsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Célula que exibe a posição do time no ranking
 * Cores especiais para medalhas (ouro, prata, bronze)
 * Animações quando o time sobe ou desce
 */
export default function PositionCell({ 
  position, 
  teamId,
  isGoingUp, 
  isGoingDown 
}) {
  const backgroundColor = getPositionColor(position, isGoingUp, isGoingDown);

  return (
    <motion.td
      className="px-3 py-1 text-center font-bold border-r border-gray-600"
      animate={{ backgroundColor }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        key={`pos-${teamId}-${position}`}
        initial={{ scale: 1.5, color: '#ffff00' }}
        animate={{ scale: 1, color: '#ffffff' }}
        transition={{ duration: 0.5 }}
      >
        {position}
      </motion.div>
    </motion.td>
  );
}

// Função auxiliar: Determina a cor da posição
function getPositionColor(pos, isGoingUp, isGoingDown) {
  if (isGoingUp) return 'rgba(34, 197, 94, 0.8)'; // Verde
  if (isGoingDown) return 'rgba(239, 68, 68, 0.8)'; // Vermelho
  if (pos === 1) return 'rgb(255, 215, 0)'; // Ouro
  if (pos === 2) return 'rgb(192, 192, 192)'; // Prata
  if (pos === 3) return 'rgb(205, 127, 50)'; // Bronze
  return 'rgb(107, 114, 128)'; // Cinza padrão
}