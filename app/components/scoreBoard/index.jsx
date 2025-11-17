// components/BrazilianFinals/Scoreboard/index.jsx
"use client"
import React from 'react';
import ScoreboardTable from './ScoreboardTable';

/**
 * Container principal do Scoreboard
 * Wrapper com estilos e passa props para a tabela
 */
export default function Scoreboard({
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
    <div className="lg:col-span-4">
      
      <div className="bg-gray-800 border-2 border-white rounded-lg overflow-hidden">
        
        <ScoreboardTable
          scoreboard={scoreboard}
          letters={letters}
          teamsGoingUp={teamsGoingUp}
          teamsGoingDown={teamsGoingDown}
          teamDistances={teamDistances}
          pendingSubmissions={pendingSubmissions}
          submissionResults={submissionResults}
          teamEmotes={teamEmotes}
          teamFailEmotes={teamFailEmotes}
          tableRef={tableRef}
        />
      </div>
    </div>
  );
}