// components/BrazilianFinals/Sidebar/SubmissionsList.jsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import Balao from '../Balao';

/**
 * Componente SubmissionItem
 * Exibe uma linha individual de submissão
 */
function SubmissionItem({ submission, teamName, getProblemColor }) {
  const { time, problem, isPending, answer, tries, freezeSub, freezeTrie } = submission;
  const isFrozen = freezeSub === true;
  const freezeTriesDisplay = freezeTrie > 1 ? freezeTrie - 1 : '';

  return (
    <div className="flex items-center p-2 hover:bg-gray-700">
      {/* Tempo */}
      <div className="w-12 text-center font-bold">{time}</div>
      
      {/* Nome do time (truncado) */}
      <div className="flex-1 px-2 text-sm" title={teamName}>
        {teamName.substring(0, 30)}
      </div>
      
      {/* Letra do problema */}
      <div className="w-10 text-center bg-gray-900 rounded px-2 py-1 font-bold">
        {problem}
      </div>
      
      {/* Status da submissão */}
      <div className="w-10 flex items-center justify-center rounded ml-2 font-bold text-sm relative">
        {isFrozen ? (
          <FrozenSubmission freezeTries={freezeTriesDisplay} />
        ) : isPending ? (
          <PendingIndicator />
        ) : answer === "YES" ? (
          <AcceptedSubmission color={getProblemColor(problem)} tries={tries} />
        ) : (
          <RejectedSubmission tries={tries} />
        )}
      </div>
    </div>
  );
}

/**
 * Submissão congelada (? + tentativas)
 */
function FrozenSubmission({ freezeTries }) {
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

/**
 * Indicador de submissão pendente (pulsando)
 */
function PendingIndicator() {
  return (
    <motion.div
      className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center"
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    >
      <HelpCircle className="w-6 h-6 text-white" />
    </motion.div>
  );
}

/**
 * Submissão aceita (balão verde)
 */
function AcceptedSubmission({ color, tries }) {
  return <Balao color={color} text={tries} />;
}

/**
 * Submissão rejeitada (X vermelho)
 */
function RejectedSubmission({ tries }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <X className="w-8 h-8 text-red-500 stroke-[3] mb-1" />
      <div className="text-red-400 font-bold text-sm">{tries}</div>
    </div>
  );
}

/**
 * Lista de últimas submissões
 * 
 * @param {Array} submissions - Array de objetos de submissão
 * @param {Object} teamsDict - Dicionário com nomes dos times
 * @param {Function} getProblemColor - Função para obter cor do problema
 */
export default function SubmissionsList({ submissions = [], teamsDict = {}, getProblemColor }) {
  if (submissions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        Sem submissões ainda
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-700">
      {submissions.map((submission, index) => {
        const teamName = teamsDict[submission.team] || submission.team;
        
        return (
          <SubmissionItem
            key={index}
            submission={submission}
            teamName={teamName}
            getProblemColor={getProblemColor}
          />
        );
      })}
    </div>
  );
}