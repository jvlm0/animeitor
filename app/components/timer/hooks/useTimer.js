// components/BrazilianFinals/hooks/useTimer.js
import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar o timer da competição
 * 
 * @param {string} startTime - Hora de início no formato "HH:MM:SS"
 * @param {number} multiplo - Multiplicador de velocidade do tempo (padrão: 1)
 * @returns {string} Tempo formatado (ex: "1:23:45" ou "-0:15:30")
 */
export function useTimer(startTime = "13:00:00", multiplo = 1) {
  const [time, setTime] = useState('0:00:00');

  useEffect(() => {
    const parseTimeToDate = (timeString) => {
      const [h, m, s] = timeString.split(":").map(Number);
      const now = new Date();
      now.setHours(h, m, s, 0);
      return now;
    };

    const start = parseTimeToDate(startTime);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = (now - start) * multiplo; // diferença em ms

      if (diff < 0) {
        // Se ainda não chegou na hora inicial (contagem regressiva)
        const remaining = Math.abs(diff);
        const h = Math.floor(remaining / (1000 * 60 * 60));
        const m = Math.floor((remaining / (1000 * 60)) % 60);
        const s = Math.floor((remaining / 1000) % 60);
        setTime(`-${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      } else {
        // Contagem normal após o início
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, multiplo]);

  return time;
}