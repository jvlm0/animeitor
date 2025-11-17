// components/BrazilianFinals/Scoreboard/ScoreboardRow.jsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import PositionCell from './PositionCell';
import TeamCell from './TeamCell';
import ScoreColumn from './ScoreColumn';
import ProblemCell from './ProblemCell';
import { getProblemColor } from '../utils/colors';

/**
 * Linha completa representando um time no scoreboard
 * Composta por: Posição | Nome | Score | Problemas A-M
 */
export default function ScoreboardRow({
    team,
    letters,
    isGoingUp,
    isGoingDown,
    distance,
    pendingSubmissions,
    submissionResults,
    successGif,
    failGif
}) {
    // Duração da animação baseada na distância percorrida
    const duration = Math.min(0.15 + (distance * 0.15), 1.2);
    return (
        <motion.tr
            key={team.id}
            data-team-id={team.id}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                layout: { duration, ease: "easeInOut" },
                opacity: { duration: 0.3 }
            }}
            className="hover:bg-gray-700 relative"
        >
            {/* Coluna 1: Posição */}
            <PositionCell
                position={team.pos}
                teamId={team.id}
                isGoingUp={isGoingUp}
                isGoingDown={isGoingDown}
            />

            {/* Coluna 2: Nome do Time */}
            <TeamCell
                teamName={team.name}
                isGoingUp={isGoingUp}
                isGoingDown={isGoingDown}
                successGif={successGif}
                failGif={failGif}
            />

            {/* Coluna 3: Score */}
            <ScoreColumn
                teamId={team.id}
                solved={team.solved}
                penalty={team.penalty}
                isGoingUp={isGoingUp}
                isGoingDown={isGoingDown}
            />

            {/* Colunas 4+: Problemas */}
            {letters.map((letter, index) => {
                const problemData = team.problems[letter];
                const submissionKey = `${team.id}-${letter}`;
                const isPending = pendingSubmissions[submissionKey];
                const result = submissionResults[submissionKey];
                const isLast = index === letters.length - 1;
                const problemColor = getProblemColor(letter);

                return (
                    <ProblemCell
                        key={`${team.id}-${letter}`}
                        teamId={team.id}
                        problemLetter={letter}
                        problemData={problemData}
                        isPending={isPending}
                        result={result}
                        isGoingUp={isGoingUp}
                        isGoingDown={isGoingDown}
                        isLast={isLast}
                        problemColor={problemColor}
                    />
                );
            })}
        </motion.tr>
    );
}