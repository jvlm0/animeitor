// components/BrazilianFinals/Timer.jsx
"use client"
import React from 'react';

/**
 * Componente Timer
 * Exibe o tempo da competição em formato HH:MM:SS
 * 
 * @param {string} time - Tempo formatado (ex: "1:23:45" ou "-0:15:30")
 */
export default function Timer({ time }) {
    return (
        <div className="bg-black border-2 border-white rounded-lg p-4">
            <div className="text-5xl font-bold text-center tracking-wider">{time}</div>
        </div>
    );
}