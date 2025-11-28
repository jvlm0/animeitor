"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle } from 'lucide-react';
import Balao from "./Balao"
import BalaoEstrela from './BalaoEstrela'
import { FailGifs } from './FailGifs'
import { SuccessGifs } from './SuccessGifs'
import { getProblemColor, getPositionColor, getCellColor } from './utils/colors'
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
    contestName = "",
    timeLastUpdate = 0 }) {

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

    // Ref para rastrear submissões já processadas (evita re-animações)
    const processedSubmissionsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);
    const [scrollFlag, setScrollFlag] = useState(true);


    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "r") {
                setScrollFlag(f => !f);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);



    // Inicializa o scoreboard com IDs únicos
    useEffect(() => {
        if (initialScoreboard.length > 0) {
            const formattedScoreboard = initialScoreboard.map((team, index) => {
                const teamName = team.userSite.split('/')[0];

                // Calcula apenas tentativas de problemas NÃO resolvidos (excluindo freeze)
                let wrongTries = 0;

                if (team.problems) {
                    Object.values(team.problems).forEach(problem => {
                        if (problem && problem.tries !== null && problem.time === null && !problem.freezeTries) {
                            // Problema tem tentativas mas não foi resolvido (tempo é null) e não está no freeze
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
                    wrongTries: wrongTries // Apenas tentativas erradas (sem freeze)
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
            // Na primeira carga, marca todas as submissões existentes como já processadas
            if (isFirstLoadRef.current) {
                initialSubmissions.forEach(sub => {
                    const isPending = !sub.answer || sub.answer === '?' || sub.answer === 'PENDING';
                    const isFrozen = sub.freezeSub === true;
                    // Só marca como processada se NÃO estiver pendente e NÃO estiver congelada
                    if (!isPending && !isFrozen) {
                        const key = `${sub.teamName}-${sub.problem}`;
                        const submissionId = `${key}-${sub.time}-${sub.answer}`;
                        processedSubmissionsRef.current.add(submissionId);
                    }
                });
                isFirstLoadRef.current = false;
            }

            const recentSubmissions = initialSubmissions.reverse().slice(0, 20).map(sub => ({
                time: sub.time,
                team: sub.teamName,
                problem: sub.problem,
                status: sub.answer === 'YES' ? 'green' : sub.answer === 'NO' ? 'red' : 'pending',
                answer: sub.answer,
                firstToSolve: sub.firstToSolve,
                tries: sub.tries > 0 ? sub.tries : '',
                isPending: !sub.answer || sub.answer === '?' || sub.answer === 'PENDING',
                freezeSub: sub.freezeSub,
                freezeTrie: sub.freezeTrie || 0
            }));
            setSubmissions(recentSubmissions);

            // Detecta submissões pendentes e mudanças de estado
            const newPendingSubmissions = {};
            const newSubmissionResults = {};
            const teamPendingCounts = {};

            // NOVA LÓGICA: Agrupa submissões por time e problema para pegar apenas a última
            const submissionsByKey = {};

            initialSubmissions.forEach(sub => {
                const key = `${sub.teamName}-${sub.problem}`;

                // Guarda todas as submissões deste problema para este time
                if (!submissionsByKey[key]) {
                    submissionsByKey[key] = [];
                }
                submissionsByKey[key].push(sub);
            });

            // Processa apenas a ÚLTIMA submissão de cada problema de cada time
            Object.entries(submissionsByKey).forEach(([key, submissions]) => {
                // Ordena por tempo para garantir que pegamos a última
                const sortedSubmissions = submissions.sort((a, b) => {
                    // Converte tempo "MM" para número para comparação
                    const timeA = parseInt(a.time);
                    const timeB = parseInt(b.time);
                    return timeB - timeA; // Ordem decrescente (mais recente primeiro)
                });

                const lastSubmission = sortedSubmissions[0]; // A mais recente
                const previousState = previousSubmissionsState[key];

                // Determina o estado atual
                const isPending = !lastSubmission.answer || lastSubmission.answer === '?' || lastSubmission.answer === 'PENDING';
                const isFrozen = lastSubmission.freezeSub === true;
                const currentAnswer = lastSubmission.answer;

                // Cria um identificador único para esta submissão específica
                const submissionId = `${key}-${lastSubmission.time}-${currentAnswer}`;

                if (isPending) {
                    // Submissão está pendente
                    newPendingSubmissions[key] = true;

                    // Conta pendentes por time
                    teamPendingCounts[lastSubmission.teamName] = (teamPendingCounts[lastSubmission.teamName] || 0) + 1;
                } else if (!isFrozen) {
                    // Submissão foi julgada e NÃO está congelada

                    // Determina se deve animar:
                    // 1. Mudou de pendente para julgado OU
                    // 2. É uma nova submissão julgada que nunca vimos antes OU
                    // 3. Mudou de congelada para julgada
                    const changedFromPending = previousState && previousState.isPending && !isPending;
                    const changedFromFrozen = previousState && previousState.isFrozen && !isFrozen;
                    const isNewJudgedSubmission = !processedSubmissionsRef.current.has(submissionId);

                    const shouldAnimate = changedFromPending || isNewJudgedSubmission || changedFromFrozen;

                    if (shouldAnimate) {
                        // Marca como processada
                        processedSubmissionsRef.current.add(submissionId);

                        // USA O RESULTADO DA ÚLTIMA SUBMISSÃO (NÃO CONGELADA)
                        newSubmissionResults[key] = currentAnswer === 'YES' ? 'accepted' : 'rejected';

                        // Adiciona GIF de sucesso ou falha (se habilitado) baseado na ÚLTIMA submissão
                        if (enableGifs) {
                            const teamKey = lastSubmission.teamName;
                            if (currentAnswer === 'YES') {
                                const randomGif = SuccessGifs[Math.floor(Math.random() * SuccessGifs.length)];
                                setTeamEmotes(prev => ({ ...prev, [teamKey]: randomGif }));

                                setTimeout(() => {
                                    setTeamEmotes(prev => {
                                        const updated = { ...prev };
                                        if (updated[teamKey] === randomGif) {
                                            delete updated[teamKey];
                                        }
                                        return updated;
                                    });
                                }, 3000);
                            } else {
                                const randomGif = FailGifs[Math.floor(Math.random() * FailGifs.length)];
                                setTeamFailEmotes(prev => ({ ...prev, [teamKey]: randomGif }));

                                setTimeout(() => {
                                    setTeamFailEmotes(prev => {
                                        const updated = { ...prev };
                                        if (updated[teamKey] === randomGif) {
                                            delete updated[teamKey];
                                        }
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
                    // Recalcula tentativas erradas (problemas não resolvidos, excluindo freeze)
                    let wrongTries = 0;
                    if (team.problems) {
                        Object.values(team.problems).forEach(problem => {
                            if (problem && problem.tries !== null && problem.time === null && !problem.freezeTries) {
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
            Object.entries(submissionsByKey).forEach(([key, submissions]) => {
                const lastSubmission = submissions.sort((a, b) => parseInt(b.time) - parseInt(a.time))[0];
                newState[key] = {
                    isPending: !lastSubmission.answer || lastSubmission.answer === '?' || lastSubmission.answer === 'PENDING',
                    isFrozen: lastSubmission.freezeSub === true,
                    answer: lastSubmission.answer
                };
            });
            setPreviousSubmissionsState(newState);
        }
    }, [initialSubmissions, enableGifs]);

    // Scroll automático para acompanhar submissões
    useEffect(() => {
        if (scoreboard.length === 0 || !tableRef.current || !scrollFlag) return;

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

            <div className="mt-6 text-center text-gray-400 text-sm">
                <p>
                    <span className="inline-block bg-gray-800 px-2 py-1 rounded mr-2">R</span>
                    Ativar/Desativar rolamento automático
                    <span className="mx-4">|</span>
                    <span className="inline-block bg-gray-800 px-2 py-1 rounded mr-2">Espaço</span>
                    Liberar submissão pendente
                </p>
            </div>
        </div>
    );
}