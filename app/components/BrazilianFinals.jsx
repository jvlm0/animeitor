"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle } from 'lucide-react';
import Balao from "./Balao"
import BalaoEstrela from './BalaoEstrela'
import {FailGifs}  from './FailGifs'
import {SuccessGifs} from './SuccessGifs'

export default function BrazilianFinals({ initialScoreboard = [],
                                          initialSubmissions = [],
                                          teamsDict = {},
                                          letters = [], 
                                          enableGifs = true, 
                                          START_TIME = "13:00:00", 
                                          multiplo = 1, 
                                          contestName="" }) {
                                            
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
  const [previousSubmissionsState, setPreviousSubmissionsState] = useState({});
  const [previousPositions, setPreviousPositions] = useState({});
  const [teamDistances, setTeamDistances] = useState({});
  const tableRef = React.useRef(null);
  const scrollTimeoutRef = React.useRef(null);

  const successEmotesList = ['🎉', '🔥', '⚡', '💪', '🚀', '⭐', '🏆', '👏', '💯', '✨'];
  const failEmotesList = ['😭', '😢', '😡', '😤', '😠', '💀', '😱', '😨', '🤬', '💔'];

  // coloque isso antes do useEffect do timer
  //const START_TIME = "13:00:00"; // hora que será considerada como T=0

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
        
        // Calcula apenas tentativas de problemas NÃO resolvidos
        let wrongTries = 0;
        
        if (team.problems) {
          Object.values(team.problems).forEach(problem => {
            if (problem && problem.tries !== null && problem.time === null) {
              // Problema tem tentativas mas não foi resolvido (tempo é null)
              wrongTries += problem.tries;
            }
          });
        }
        
        return {
          id: teamName,
          pos: team.pos,
          name: team.name,
          userSite: team.userSite,
          teamName: teamName,
          solved: team.solved,
          penalty: team.penalty,
          problems: team.problems,
          pendingCount: 0, // Será atualizado pelo useEffect de submissões
          wrongTries: wrongTries // Apenas tentativas erradas
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

  // Processa as últimas submissões e detecta pendentes
  useEffect(() => {
    if (initialSubmissions.length > 0) {
      const recentSubmissions = initialSubmissions.reverse().slice(0, 20).map(sub => ({
        time: sub.time,
        team: sub.teamName,
        problem: sub.problem,
        status: sub.answer === 'YES' ? 'green' : sub.answer === 'NO' ? 'red' : 'pending',
        answer: sub.answer,
        firstToSolve: sub.firstToSolve,
        tries: sub.tries > 0 ? sub.tries : '',
        isPending: !sub.answer || sub.answer === '?' || sub.answer === 'PENDING'
      }));
      setSubmissions(recentSubmissions);

      // Detecta submissões pendentes e mudanças de estado
      const newPendingSubmissions = {};
      const newSubmissionResults = {};
      const teamPendingCounts = {};

      initialSubmissions.forEach(sub => {
        const key = `${sub.teamName}-${sub.problem}`;
        const previousState = previousSubmissionsState[key];
        
        // Determina o estado atual
        const isPending = !sub.answer || sub.answer === '?' || sub.answer === 'PENDING';
        const currentAnswer = sub.answer;
        
        if (isPending) {
          // Submissão está pendente
          newPendingSubmissions[key] = true;
          
          // Conta pendentes por time
          teamPendingCounts[sub.teamName] = (teamPendingCounts[sub.teamName] || 0) + 1;
        } else {
          // Submissão foi julgada
          // Só mostra o resultado animado se o estado mudou de pendente para julgado
          if (previousState && previousState.isPending && !isPending) {
            newSubmissionResults[key] = currentAnswer === 'YES' ? 'accepted' : 'rejected';
            
            // Adiciona GIF de sucesso ou falha (se habilitado)
            if (enableGifs) {
              if (currentAnswer === 'YES') {
                const randomGif = SuccessGifs[Math.floor(Math.random() * SuccessGifs.length)];
                setTeamEmotes(prev => ({ ...prev, [sub.teamName]: randomGif }));
                
                setTimeout(() => {
                  setTeamEmotes(prev => {
                    const updated = { ...prev };
                    delete updated[sub.teamName];
                    return updated;
                  });
                }, 3000);
              } else {
                const randomGif = FailGifs[Math.floor(Math.random() * FailGifs.length)];
                setTeamFailEmotes(prev => ({ ...prev, [sub.teamName]: randomGif }));
                
                setTimeout(() => {
                  setTeamFailEmotes(prev => {
                    const updated = { ...prev };
                    delete updated[sub.teamName];
                    return updated;
                  });
                }, 3000);
              }
            }
            
            // Remove o resultado após 2 segundos
            setTimeout(() => {
              setSubmissionResults(prev => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
              });
            }, 2000);
          }
        }
      });

      // Atualiza estados
      setPendingSubmissions(newPendingSubmissions);
      setSubmissionResults(prev => ({ ...prev, ...newSubmissionResults }));

      // Atualiza contagem de pendentes no scoreboard e reordena
      setScoreboard(prevScoreboard => {
        const updatedScoreboard = prevScoreboard.map(team => {
          // Recalcula tentativas erradas (problemas não resolvidos)
          let wrongTries = 0;
          if (team.problems) {
            Object.values(team.problems).forEach(problem => {
              if (problem && problem.tries !== null && problem.time === null) {
                wrongTries += problem.tries;
              }
            });
          }
          
          return {
            ...team,
            pendingCount: teamPendingCounts[team.teamName] || 0,
            wrongTries: wrongTries
          };
        });

        // Reordena o scoreboard
        // 1º: Mais problemas resolvidos (maior)
        // 2º: Menor penalidade (tempo total dos resolvidos)
        // 3º: Mais submissões pendentes (maior)
        // 4º: Menos tentativas erradas (menor) - apenas problemas NÃO resolvidos
        const sorted = [...updatedScoreboard].sort((a, b) => {
          if (b.solved !== a.solved) return b.solved - a.solved;
          if (a.penalty !== b.penalty) return a.penalty - b.penalty;
          if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
          return a.wrongTries - b.wrongTries;
        });

        // Atualiza as posições
        sorted.forEach((team, index) => {
          team.pos = index + 1;
        });

        return sorted;
      });

      // Salva o estado atual para comparação futura
      const newState = {};
      initialSubmissions.forEach(sub => {
        const key = `${sub.teamName}-${sub.problem}`;
        newState[key] = {
          isPending: !sub.answer || sub.answer === '?' || sub.answer === 'PENDING',
          answer: sub.answer
        };
      });
      setPreviousSubmissionsState(newState);
    }
  }, [initialSubmissions]);

  // Scroll automático para acompanhar submissões
  useEffect(() => {
    if (scoreboard.length === 0 || !tableRef.current) return;

    // Cancela scroll anterior se houver
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Aguarda animações de mudança de posição terminarem (1.5s de margem)
    scrollTimeoutRef.current = setTimeout(() => {
      // Encontra o time com menor posição que tem submissão pendente
      let teamToScroll = null;
      let minPosition = Infinity;

      scoreboard.forEach(team => {
        const hasPending = team.pendingCount > 0;
        if (hasPending && team.pos < minPosition) {
          minPosition = team.pos;
          teamToScroll = team;
        }
      });

      // Se não há submissões pendentes, volta para o topo
      if (!teamToScroll) {
        tableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Rola até o time com submissão pendente
      const teamRow = tableRef.current.querySelector(`tr[data-team-id="${teamToScroll.id}"]`);
      if (teamRow) {
        const tableRect = tableRef.current.getBoundingClientRect();
        const rowRect = teamRow.getBoundingClientRect();
        const rowTop = rowRect.top - tableRect.top + tableRef.current.scrollTop;
        const rowBottom = rowTop + rowRect.height;
        const visibleTop = tableRef.current.scrollTop;
        const visibleBottom = visibleTop + tableRef.current.clientHeight;

        // Só rola se o time não estiver visível
        if (rowTop < visibleTop || rowBottom > visibleBottom) {
          // Centraliza o time na tela
          const scrollTo = rowTop - (tableRef.current.clientHeight / 2) + (rowRect.height / 2);
          tableRef.current.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
        }
      }
    }, 1500); // Aguarda 1.5s após mudanças no scoreboard

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scoreboard, pendingSubmissions]);

  // Detecta mudanças de posição no ranking
  useEffect(() => {
    if (scoreboard.length > 0) {
      const goingUp = [];
      const goingDown = [];
      const distances = {};

      scoreboard.forEach(team => {
        const previousPos = previousPositions[team.id];
        
        if (previousPos !== undefined && previousPos !== team.pos) {
          const distance = Math.abs(team.pos - previousPos);
          distances[team.id] = distance;
          
          if (team.pos < previousPos) {
            // Posição diminuiu = subiu no ranking
            goingUp.push(team.id);
          } else {
            // Posição aumentou = desceu no ranking
            goingDown.push(team.id);
          }
        }
      });

      if (goingUp.length > 0 || goingDown.length > 0) {
        setTeamsGoingUp(goingUp);
        setTeamsGoingDown(goingDown);
        setTeamDistances(distances);

        // Remove as animações após 2 segundos
        setTimeout(() => {
          setTeamsGoingUp([]);
          setTeamsGoingDown([]);
          setTeamDistances({});
        }, 2000);
      }

      // Atualiza as posições anteriores
      const newPositions = {};
      scoreboard.forEach(team => {
        newPositions[team.id] = team.pos;
      });
      setPreviousPositions(newPositions);
    }
  }, [scoreboard]);

  useEffect(() => {
    const start = parseTimeToDate(START_TIME);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = (now - start)*multiplo; // diferença em ms

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
        className={`px-2 py-1 text-center text-xs font-bold w-20 ${isLast ? '' : 'border-r border-gray-600'} ${getCellColor(problemData)} relative border-2 border-gray-700`}
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
        {displayData.type === 'correct' && !isPending && (
          <div className="flex flex-col items-center justify-center h-full">


            {problemData.firstToSolve ?
              <BalaoEstrela color={problemColor} text={displayData.tries} />
              : <Balao color={problemColor} text={displayData.tries} />}

            <div className="text-white font-bold text-xs">

              <div>{displayData.time}</div>
            </div>
          </div>
        )}

        {/* Problema Errado - X com tentativas */}
        {displayData.type === 'wrong' && !isPending && (
          <div className="flex flex-col items-center justify-center h-full">
            <X className="w-8 h-8 text-red-500 stroke-[3] mb-1" />
            <div className="text-red-400 font-bold text-sm">{displayData.tries}</div>
          </div>
        )}

        {/* Problema não tentado */}
        {displayData.type === 'empty' && !isPending && (
          <div className="h-full"></div>
        )}

        {isPending && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-yellow-500"
            animate={{ opacity: [1, 0.5, 1] }}
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
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <h1 className="text-blue-400 text-xl mb-4 underline">{contestName}</h1>

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
                    <div className={`w-10 flex items-center justify-center rounded ml-2 font-bold text-sm relative`}>
                      {sub.isPending ? (
                        <motion.div
                          className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        >
                          <HelpCircle className="w-6 h-6 text-white" />
                        </motion.div>
                      ) : sub.answer === "YES" ? (
                        <Balao color={getProblemColor(sub.problem)} text={sub.tries} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <X className="w-8 h-8 text-red-500 stroke-[3] mb-1" />
                          <div className="text-red-400 font-bold text-sm">{sub.tries}</div>
                        </div>
                      )}
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


            <div className="overflow-x-auto overflow-y-auto max-h-[calc(120vh-8rem)] scrollbar-hide" ref={tableRef}>
              <table className="w-full text-sm border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-700 border-b-2 border-white">
                    <th className="px-3 py-1 text-center border-r border-gray-600 w-[5%]">#</th>
                    <th className="px-3 py-1 text-left border-r border-gray-600 w-[40%]">Team</th>
                    <th className="px-2 py-1 text-center border-r border-gray-600 bg-gray-800 w-[7%]">

                      <div className="inline-block text-xs text-gray-400 leading-none">Score</div>
                    </th>
                    {letters.map((letter, index) => (
                      <th
                        key={letter}
                        className={`px-2 py-1 text-center bg-gray-800 w-[7%] ${index < problemLetters.length - 1 ? 'border-r border-gray-600' : ''}`}
                      >
                        {letter}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <AnimatePresence mode="popLayout">
                    {scoreboard.map((team) => {
                      const distance = teamDistances[team.id] || 1;
                      const duration = Math.min(0.15 + (distance * 0.15), 1.2); // Velocidade constante, máximo 1.2s
                      
                      return (
                      <motion.tr
                        key={team.id}
                        data-team-id={team.id}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          layout: { duration: duration, ease: "easeInOut" },
                          opacity: { duration: 0.3 }
                        }}
                        className="hover:bg-gray-700 relative"
                      >
                        <motion.td
                          className="px-3 py-1 text-center font-bold border-r border-gray-600"
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
                          className="px-2 py-1 border-r border-gray-600 relative font-bold"
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
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 rounded-lg p-1 border-2 border-green-400 shadow-lg z-10 overflow-hidden"
                              initial={{ scale: 0, rotate: -180, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0, rotate: 180, opacity: 0 }}
                              transition={{ type: "spring", duration: 0.6 }}
                            >
                              <img 
                                src={teamEmotes[team.id]} 
                                alt="Success" 
                                className="w-16 h-16 object-cover rounded"
                              />
                            </motion.div>
                          )}

                          {teamFailEmotes[team.id] && (
                            <motion.div
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 rounded-lg p-1 border-2 border-red-400 shadow-lg z-10 overflow-hidden"
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
                              <img 
                                src={teamFailEmotes[team.id]} 
                                alt="Fail" 
                                className="w-16 h-16 object-cover rounded"
                              />
                            </motion.div>
                          )}
                        </motion.td>

                        <motion.td
                          className="px-3 py-1 text-center border-r border-gray-600 bg-gray-800 w-20"
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

                        {letters.map((letter, index) =>
                          renderProblemCell(team, letter, index === letters.length - 1)
                        )}
                      </motion.tr>
                    );
                    })}
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