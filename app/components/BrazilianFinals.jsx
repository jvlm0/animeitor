"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle } from 'lucide-react';
import Balao from "./Balao"

export default function BrazilianFinals({ initialScoreboard = [], initialSubmissions = [], teamsDict = {} }) {
  const [time, setTime] = useState('1:00:00');
  const [scoreboard, setScoreboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [problemLetters, setProblemLetters] = useState([]);

  const [teamsGoingUp, setTeamsGoingUp] = useState([]);
  const [teamsGoingDown, setTeamsGoingDown] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState({});
  const [submissionResults, setSubmissionResults] = useState({});
  const [teamEmotes, setTeamEmotes] = useState({});
  const [teamFailEmotes, setTeamFailEmotes] = useState({});

  const successEmotesList = ['🎉', '🔥', '⚡', '💪', '🚀', '⭐', '🏆', '👏', '💯', '✨'];
  const failEmotesList = ['😭', '😢', '😡', '😤', '😠', '💀', '😱', '😨', '🤬', '💔'];

  // coloque isso antes do useEffect do timer
  const START_TIME = "13:00:00"; // hora que será considerada como T=0

  function parseTimeToDate(timeString) {
    const [h, m, s] = timeString.split(":").map(Number);
    const now = new Date();
    now.setHours(h, m, s, 0);
    return now;
  }

  // Inicializa o scoreboard com IDs únicos
  useEffect(() => {
    if (initialScoreboard.length > 0) {
      const formattedScoreboard = initialScoreboard.map((team, index) => {
        const teamName = team.userSite.split('/')[0];
        return {
          id: teamName,
          pos: team.pos,
          name: team.name,
          userSite: team.userSite,
          teamName: teamName,
          solved: team.solved,
          penalty: team.penalty,
          problems: team.problems
        };
      });
      setScoreboard(formattedScoreboard);

      // Extrai as letras dos problemas dinamicamente
      if (formattedScoreboard[0]?.problems) {
        const letters = Object.keys(formattedScoreboard[0].problems).sort();
        setProblemLetters(letters);
      }
    }
  }, [initialScoreboard]);

  // Processa as últimas submissões
  useEffect(() => {
    if (initialSubmissions.length > 0) {
      const recentSubmissions = initialSubmissions.slice(0, 9).map(sub => ({
        time: sub.time,
        team: sub.teamName,
        problem: sub.problem,
        status: sub.answer === 'YES' ? 'green' : 'red',
        answer: sub.answer,
        tries: sub.tries > 0 ? sub.tries : ''
      }));
      setSubmissions(recentSubmissions);
    }
  }, [initialSubmissions]);

  useEffect(() => {
    const start = parseTimeToDate(START_TIME);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = now - start; // diferença em ms

      if (diff < 0) {
        // se ainda não chegou na hora inicial
        const remaining = Math.abs(diff);
        const h = Math.floor(remaining / (1000 * 60 * 60));
        const m = Math.floor((remaining / (1000 * 60)) % 60);
        const s = Math.floor((remaining / 1000) % 60);
        setTime(`-${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getScoreColor = (status) => {
    if (status === 'red') return 'bg-red-600';
    if (status === 'green') return 'bg-green-600';
    if (status === 'black') return 'bg-gray-900';
    return 'bg-gray-600';
  };

  const getPositionColor = (pos, isGoingUp, isGoingDown) => {
    if (isGoingUp) return 'rgba(34, 197, 94, 0.8)';
    if (isGoingDown) return 'rgba(239, 68, 68, 0.8)';
    if (pos === 1) return 'rgb(255, 215, 0)';
    if (pos === 2) return 'rgb(192, 192, 192)';
    if (pos === 3) return 'rgb(205, 127, 50)';
    return 'rgb(107, 114, 128)';
  };

  const getCellColor = (problemData) => {
    return 'bg-gray-800'; // Fundo neutro para todas as células
  };

  const isProblemCorrect = (problemData) => {
    return problemData && problemData.tries !== null && problemData.time !== null;
  };

  const isProblemWrong = (problemData) => {
    return problemData && problemData.tries !== null && problemData.time === null;
  };

  const getProblemColor = (problemLetter) => {
    const colors = {
      'A': '#FFFFFF', // Vermelho
      'B': '#000000', // Turquesa
      'C': '#FF0000', // Azul claro
      'D': '#800100', // Salmão
      'E': '#018000', // Verde água
      'F': '#0000fe', // Amarelo
      'G': '#BB8FCE', // Roxo claro
      'H': '#010180', // Azul céu
      'I': '#fe01ff', // Laranja
      'J': '#800181', // Verde
      'K': '#00fe01', // Terracota
      'L': '#01feff', // Verde azulado
      'M': '#c0c0c1', // Dourado
    };
    return colors[problemLetter] || '#808080';
  };

  const formatProblemDisplay = (problemData) => {
    if (!problemData) return '';

    // Se o problema está correto
    if (isProblemCorrect(problemData)) {
      const triesDisplay = problemData.tries > 1 ? `+${problemData.tries - 1}` : '';
      return { type: 'correct', tries: triesDisplay, time: problemData.time };
    }

    // Se o problema está errado
    if (isProblemWrong(problemData)) {
      return { type: 'wrong', tries: problemData.tries };
    }

    return { type: 'empty' };
  };

  const renderProblemCell = (team, problemLetter, isLast) => {
    const problemData = team.problems[problemLetter];
    const submissionKey = `${team.id}-${problemLetter}`;
    const isPending = pendingSubmissions[submissionKey];
    const result = submissionResults[submissionKey];
    const displayData = formatProblemDisplay(problemData);
    const problemColor = getProblemColor(problemLetter);

    return (
      <motion.td
        key={`${team.id}-${problemLetter}`}
        className={`px-3 py-2 text-center text-xs font-bold w-20 ${isLast ? '' : 'border-r border-gray-600'} ${getCellColor(problemData)} relative border-2 border-gray-700`}
        animate={{
          filter: teamsGoingUp.includes(team.id)
            ? 'brightness(1.3)'
            : teamsGoingDown.includes(team.id)
              ? 'brightness(1.3) saturate(1.5) hue-rotate(-30deg)'
              : 'brightness(1)'
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Problema Correto - Balão com tempo */}
        {displayData.type === 'correct' && (
          <div className="flex flex-col items-center justify-center h-full">


            <Balao color={problemColor} text={displayData.tries} />

            <div className="text-white font-bold text-xs">

              <div>{displayData.time}</div>
            </div>
          </div>
        )}

        {/* Problema Errado - X com tentativas */}
        {displayData.type === 'wrong' && (
          <div className="flex flex-col items-center justify-center h-full">
            <X className="w-8 h-8 text-red-500 stroke-[3] mb-1" />
            <div className="text-red-400 font-bold text-sm">{displayData.tries}</div>
          </div>
        )}

        {/* Problema não tentado */}
        {displayData.type === 'empty' && (
          <div className="h-full"></div>
        )}

        {isPending && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-yellow-500 bg-opacity-80"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <HelpCircle className="w-6 h-6 text-white" />
          </motion.div>
        )}

        {result === 'accepted' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
        )}

        {result === 'rejected' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-90"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <X className="w-8 h-8 text-white stroke-[3]" />
          </motion.div>
        )}
      </motion.td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-blue-400 text-xl mb-4 underline">Brazilian Finals</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <div className="bg-black border-2 border-white rounded-lg p-4">
            <div className="text-5xl font-bold text-center tracking-wider">{time}</div>
          </div>

          <div className="bg-gray-800 border-2 border-white rounded-lg">
            <h2 className="bg-gray-700 px-4 py-2 text-lg font-semibold border-b-2 border-white">
              Últimas Submissões
            </h2>
            <div className="divide-y divide-gray-700">
              {submissions.length > 0 ? (
                submissions.map((sub, idx) => (
                  <div key={idx} className="flex items-center p-2 hover:bg-gray-700">
                    <div className="w-12 text-center font-bold">{sub.time}</div>
                    <div className="flex-1 px-2 text-sm">{teamsDict[sub.team].substring(0, 30)}</div>
                    <div className="w-10 text-center bg-gray-900 rounded px-2 py-1 font-bold">
                      {sub.problem}
                    </div>
                    <div className={`w-10 flex items-center  justify-center rounded ml-2  font-bold text-sm`}>
                      {sub.answer == "YES"
                        ? <Balao color={getProblemColor(sub.problem)} text={sub.tries} />
                        : <div className="flex flex-col items-center justify-center h-full">
                          <X className="w-8 h-8 text-red-500 stroke-[3] mb-1" />
                          <div className="text-red-400 font-bold text-sm">{sub.tries}</div>
                        </div>
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">Sem submissões ainda</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-gray-800 border-2 border-white rounded-lg overflow-hidden">


            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-700 border-b-2 border-white">
                    <th className="px-3 py-2 text-center border-r border-gray-600 w-8">#</th>
                    <th className="px-3 py-2 text-left border-r border-gray-600 w-70">Team</th>
                    <th className="px-2 py-2 text-center border-r border-gray-600 bg-gray-800 w-14">

                      <div className="text-xs text-gray-400">Score</div>
                    </th>
                    {problemLetters.map((letter, index) => (
                      <th
                        key={letter}
                        className={`px-3 py-2 text-center bg-gray-800 w-12 ${index < problemLetters.length - 1 ? 'border-r border-gray-600' : ''}`}
                      >
                        {letter}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <AnimatePresence mode="popLayout">
                    {scoreboard.map((team) => (
                      <motion.tr
                        key={team.id}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          layout: { duration: 0.6, ease: "easeInOut" },
                          opacity: { duration: 0.3 }
                        }}
                        className="hover:bg-gray-700 relative"
                      >
                        <motion.td
                          className="px-3 py-2 text-center font-bold border-r border-gray-600"
                          animate={{
                            backgroundColor: getPositionColor(team.pos, teamsGoingUp.includes(team.id), teamsGoingDown.includes(team.id))
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            key={`pos-${team.id}-${team.pos}`}
                            initial={{ scale: 1.5, color: '#ffff00' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            transition={{ duration: 0.5 }}
                          >
                            {team.pos}
                          </motion.div>
                        </motion.td>

                        <motion.td
                          className="px-2 py-2 border-r border-gray-600 relative font-bold"
                          animate={{
                            backgroundColor: teamsGoingUp.includes(team.id)
                              ? 'rgba(34, 197, 94, 0.3)'
                              : teamsGoingDown.includes(team.id)
                                ? 'rgba(239, 68, 68, 0.3)'
                                : 'transparent'
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {team.name}

                          {teamEmotes[team.id] && (
                            <motion.div
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 rounded p-1 border-2 border-green-400 shadow-lg z-10"
                              initial={{ scale: 0, rotate: -180, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0, rotate: 180, opacity: 0 }}
                              transition={{ type: "spring", duration: 0.6 }}
                            >
                              <div className="text-2xl">
                                {teamEmotes[team.id]}
                              </div>
                            </motion.div>
                          )}

                          {teamFailEmotes[team.id] && (
                            <motion.div
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 rounded p-1 border-2 border-red-400 shadow-lg z-10"
                              initial={{ scale: 0, y: 20, opacity: 0 }}
                              animate={{
                                scale: [1, 1.2, 1],
                                y: 0,
                                opacity: 1,
                                rotate: [0, -10, 10, -10, 0]
                              }}
                              exit={{ scale: 0, y: -20, opacity: 0 }}
                              transition={{
                                scale: { duration: 0.5, repeat: 1 },
                                rotate: { duration: 0.5, repeat: 1 },
                                default: { duration: 0.4 }
                              }}
                            >
                              <div className="text-2xl">
                                {teamFailEmotes[team.id]}
                              </div>
                            </motion.div>
                          )}
                        </motion.td>

                        <motion.td
                          className="px-3 py-2 text-center border-r border-gray-600 bg-gray-800 w-20"
                          animate={{
                            backgroundColor: teamsGoingUp.includes(team.id)
                              ? 'rgba(34, 197, 94, 0.4)'
                              : teamsGoingDown.includes(team.id)
                                ? 'rgba(239, 68, 68, 0.4)'
                                : 'rgb(31, 41, 55)'
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="font-bold text-lg">{team.solved}</div>
                          <motion.div
                            key={`penalty-${team.id}-${team.penalty}`}
                            initial={{ scale: 1.3, color: '#4ade80' }}
                            animate={{ scale: 1, color: '#9ca3af' }}
                            transition={{ duration: 0.5 }}
                            className="text-xs"
                          >
                            {team.penalty}
                          </motion.div>
                        </motion.td>

                        {problemLetters.map((letter, index) =>
                          renderProblemCell(team, letter, index === problemLetters.length - 1)
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}