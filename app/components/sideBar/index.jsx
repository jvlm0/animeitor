// components/BrazilianFinals/Sidebar/index.jsx
"use client"
import React from 'react';
import Timer from '../timer/Timer';
import SubmissionsList from './SubmissionsList';

/**
 * Sidebar completa com Timer e Lista de Submissões
 * 
 * @param {string} time - Tempo formatado do timer
 * @param {Array} submissions - Array de submissões
 * @param {Object} teamsDict - Dicionário de nomes dos times
 * @param {Function} getProblemColor - Função para obter cor do problema
 */
export default function Sidebar({ time, submissions, teamsDict, getProblemColor }) {
  return (
    <div className="space-y-2">
      {/* Timer */}
      <Timer time={time} />

      {/* Lista de Submissões */}
      <div className="bg-gray-800 border-2 border-white rounded-lg">
        <h2 className="bg-gray-700 px-4 py-2 text-lg font-semibold border-b-2 border-white">
          Últimas Submissões
        </h2>
        <SubmissionsList
          submissions={submissions}
          teamsDict={teamsDict}
          getProblemColor={getProblemColor}
        />
      </div>
    </div>
  );
}