"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle } from 'lucide-react';
import Balao from "./Balao"
import BalaoEstrela from './BalaoEstrela'
import {FailGifs}  from './FailGifs'
import {SuccessGifs} from './SuccessGifs'
import {getProblemColor, getPositionColor, getCellColor} from './utils/colors'
import { useTimer } from './timer/hooks/useTimer';
import { formatProblemDisplay } from './utils/formatters'
import Sidebar from './sideBar';
import { renderProblemCell } from './scoreBoard/ProblemCell'
import Scoreboard from './scoreBoard/index'

export default function BrazilianFinals({ initialScoreboard = [],
                                          initialSubmissions = [],
                                          teamsDict = {},
                                          letters = [], 
                                          enableGifs = true, 
                                          START_TIME = "13:00:00", 
                                          multiplo = 1, 
                                          contestName="" }) {
                                            
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


  const isProblemCorrect = (problemData) => {
    return problemData && problemData.tries !== null && problemData.time !== null;
  };

  const isProblemWrong = (problemData) => {
    return problemData && problemData.tries !== null && problemData.time === null;
  };



  const time = useTimer(START_TIME, multiplo);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      
      
      <h1 className="text-blue-400 text-xl mb-4 underline">{contestName}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Sidebar
          time={time}
          submissions={submissions}
          teamsDict={teamsDict}
          getProblemColor={getProblemColor}
        />
        <Scoreboard
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