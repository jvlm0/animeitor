// components/BrazilianFinals/Scoreboard/ProblemCell.jsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, X, CheckCircle } from 'lucide-react';
import Balao from '../Balao';
import BalaoEstrela from '../BalaoEstrela';
import { formatProblemDisplay } from '../utils/formatters';

/**
 * Célula que representa um problema específico de um time
 * Mostra: balão (aceito), X (errado), vazio (não tentado), pendente ou freeze
 */
export default function ProblemCell({
    teamId,
    problemLetter,
    problemData,
    isPending,
    result,
    isGoingUp,
    isGoingDown,
    isLast,
    problemColor
}) {
    const display = formatProblemDisplay(problemData);
    const hasFreeze = problemData?.freezeTries > 0;
    const freezeTriesDisplay = problemData?.freezeTries > 1 ? problemData.freezeTries - 1 : '';

    return (
        <motion.td
            className={`px-2 py-1 text-center text-xs font-bold w-20 ${isLast ? '' : 'border-r border-gray-600'
                } bg-gray-800 relative border-2 border-gray-700`}
            animate={{
                filter: isGoingUp
                    ? 'brightness(1.3)'
                    : isGoingDown
                        ? 'brightness(1.3) saturate(1.5) hue-rotate(-30deg)'
                        : 'brightness(1)'
            }}
            transition={{ duration: 0.5 }}
        >
            {/* Problema Correto */}
            {display.type === 'correct' && !isPending && !hasFreeze && (
                <CorrectProblemDisplay
                    problemData={problemData}
                    display={display}
                    problemColor={problemColor}
                />
            )}

            {/* Problema Errado */}
            {display.type === 'wrong' && !isPending && !hasFreeze && (
                <WrongProblemDisplay tries={display.tries} />
            )}

            {/* Problema Não Tentado */}
            {display.type === 'empty' && !isPending && !hasFreeze && (
                <div className="h-full" />
            )}

            {/* Estado de Freeze */}
            {hasFreeze && !isPending && (
                <FreezeDisplay freezeTries={freezeTriesDisplay} />
            )}

            {/* Overlay: Pendente */}
            {isPending && <PendingOverlay />}

            {/* Overlay: Aceito */}
            {result === 'accepted' && <AcceptedOverlay />}

            {/* Overlay: Rejeitado */}
            {result === 'rejected' && <RejectedOverlay />}
        </motion.td>
    );
}

// Componente: Problema correto (balão + tempo)
function CorrectProblemDisplay({ problemData, display, problemColor }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            {problemData.firstToSolve ? (
                <BalaoEstrela color={problemColor} text={display.tries} />
            ) : (
                <Balao color={problemColor} text={display.tries} />
            )}
            <div className="text-white font-bold text-xs">
                <div>{display.time}</div>
            </div>
        </div>
    );
}

// Componente: Problema errado (X + tentativas)
function WrongProblemDisplay({ tries }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <X className="w-8 h-8 text-red-500 stroke-[3] mb-1" />
            <div className="text-red-400 font-bold text-sm">{tries}</div>
        </div>
    );
}

// Componente: Estado de Freeze (? + tentativas congeladas)
function FreezeDisplay({ freezeTries }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <HelpCircle className="w-8 h-8 text-blue-400 stroke-[3]" />
            {freezeTries && (
                <div className="text-blue-400 font-bold text-sm mt-1">
                    {freezeTries}
                </div>
            )}
        </div>
    );
}

// Overlay: Submissão pendente (ícone pulsante)
function PendingOverlay() {
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center bg-yellow-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
        >
            <HelpCircle className="w-6 h-6 text-white" />
        </motion.div>
    );
}

// Overlay: Resultado aceito (check animado)
function AcceptedOverlay() {
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
        >
            <CheckCircle className="w-8 h-8 text-white" />
        </motion.div>
    );
}

// Overlay: Resultado rejeitado (X animado)
function RejectedOverlay() {
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-90"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
        >
            <X className="w-8 h-8 text-white stroke-[3]" />
        </motion.div>
    );
}