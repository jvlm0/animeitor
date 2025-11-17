// components/BrazilianFinals/Scoreboard/ScoreboardTable.jsx
"use client"
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ScoreboardRow from './ScoreboardRow';

/**
 * Tabela completa do scoreboard
 * Header + Body com todas as linhas dos times
 */
export default function ScoreboardTable({
  scoreboard,
  letters,
  teamsGoingUp,
  teamsGoingDown,
  teamDistances,
  pendingSubmissions,
  submissionResults,
  teamEmotes,
  teamFailEmotes,
  tableRef
}) {
  return (
    <div 
      className="overflow-x-auto overflow-y-auto max-h-[calc(120vh-8rem)] scrollbar-hide" 
      ref={tableRef}
    >
      <table className="w-full text-sm border-collapse table-fixed">
        {/* Header da Tabela */}
        <TableHeader letters={letters} />

        {/* Body da Tabela */}
        <tbody className="divide-y divide-gray-700">
          <AnimatePresence mode="popLayout">
            {scoreboard.map((team) => {
              const isGoingUp = teamsGoingUp.includes(team.id);
              const isGoingDown = teamsGoingDown.includes(team.id);
              const distance = teamDistances[team.id] || 1;
              const successGif = teamEmotes[team.id];
              const failGif = teamFailEmotes[team.id];

              return (
                <ScoreboardRow
                  key={team.id}
                  team={team}
                  letters={letters}
                  isGoingUp={isGoingUp}
                  isGoingDown={isGoingDown}
                  distance={distance}
                  pendingSubmissions={pendingSubmissions}
                  submissionResults={submissionResults}
                  successGif={successGif}
                  failGif={failGif}
                />
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Header da tabela (colunas fixas)
 */
function TableHeader({ letters }) {
  return (
    <thead>
      <tr className="bg-gray-700 border-b-2 border-white">
        {/* Coluna: Posição */}
        <th className="px-3 py-1 text-center border-r border-gray-600 w-[5%]">
          #
        </th>

        {/* Coluna: Time */}
        <th className="px-3 py-1 text-left border-r border-gray-600 w-[40%]">
          Team
        </th>

        {/* Coluna: Score */}
        <th className="px-2 py-1 text-center border-r border-gray-600 bg-gray-800 w-[7%]">
          <div className="inline-block text-xs text-gray-400 leading-none">
            Score
          </div>
        </th>

        {/* Colunas: Problemas */}
        {letters.map((letter, index) => (
          <th
            key={letter}
            className={`px-2 py-1 text-center bg-gray-800 w-[7%] ${
              index < letters.length - 1 ? 'border-r border-gray-600' : ''
            }`}
          >
            {letter}
          </th>
        ))}
      </tr>
    </thead>
  );
}