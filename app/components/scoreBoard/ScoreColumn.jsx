// components/BrazilianFinals/Scoreboard/ScoreColumn.jsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Coluna que exibe o score do time
 * Mostra: número de problemas resolvidos + penalidade total
 */
export default function ScoreColumn({ 
  teamId,
  solved, 
  penalty, 
  isGoingUp, 
  isGoingDown 
}) {
  const backgroundColor = getScoreBackgroundColor(isGoingUp, isGoingDown);

  return (
    <motion.td
      className="px-3 py-1 text-center border-r border-gray-600 bg-gray-800 w-20"
      animate={{ backgroundColor }}
      transition={{ duration: 0.5 }}
    >
      {/* Número de problemas resolvidos */}
      <div className="font-bold text-lg">{solved}</div>
      
      {/* Penalidade (tempo total) */}
      <motion.div
        key={`penalty-${teamId}-${penalty}`}
        initial={{ scale: 1.3, color: '#4ade80' }}
        animate={{ scale: 1, color: '#9ca3af' }}
        transition={{ duration: 0.5 }}
        className="text-xs"
      >
        {penalty}
      </motion.div>
    </motion.td>
  );
}

// Função auxiliar: Cor de fundo da coluna de score
function getScoreBackgroundColor(isGoingUp, isGoingDown) {
  if (isGoingUp) return 'rgba(34, 197, 94, 0.4)';
  if (isGoingDown) return 'rgba(239, 68, 68, 0.4)';
  return 'rgb(31, 41, 55)'; // gray-800
}