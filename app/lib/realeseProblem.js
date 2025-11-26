/**
 * Libera **apenas um** problema de um time por chamada.
 * - ranking: array com os times (cada time tem userSite, problems, solved, penalty, pos, ...)
 * - runs: array com todas as runs (cada run tem teamName, problem, freezeSub, freezeTrie, ...)
 *
 * Retorna: { ranking: updatedRanking, runs: updatedRuns, released: { team: userSite, problem, count } | null }
 */
export function releaseOneProblemFreeze(ranking, runs) {
    // cópia rasa (modificamos objetos internos no lugar)
    const teams = [...ranking];

    // ordenar do último para o primeiro por pos (caso pos esteja consistente)
    teams.sort((a, b) => b.pos - a.pos);

    // encontra o primeiro time (do fim) que tenha algum problema com freezeTries > 0
    let targetTeam = null;
    let targetProblem = null;
    let targetCount = 0;

    for (const team of teams) {
        // se esse time tem pelo menos um problema com freezeTries > 0, escolhemos o problema com maior freezeTries nele
        const problemsWithFreeze = Object.entries(team.problems || {})
            .filter(([_, p]) => (p.freezeTries || 0) > 0);

        if (problemsWithFreeze.length > 0) {
            // escolher problema com maior freezeTries; em empate, por nome do problema (alfabético)
            problemsWithFreeze.sort((a, b) => {
                const fa = a[1].freezeTries || 0;
                const fb = b[1].freezeTries || 0;
                if (fb !== fa) return fb - fa; // decrescente por freezeTries
                return a[0].localeCompare(b[0]); // tie-breaker
            });

            targetTeam = team;
            targetProblem = problemsWithFreeze[0][0];
            targetCount = problemsWithFreeze[0][1].freezeTries || 0;
            break; // achamos o último time com freeze; parar
        }
    }

    // se não encontrou nada a liberar
    if (!targetTeam) {
        return {
            ranking,
            runs,
            released: null
        };
    }

    // --- 1) Atualiza o tries do problema somando freezeTries e zera freezeTries ---
    const teamKey = targetTeam.userSite; // identifica team no runs pelo teamName
    const probKey = targetProblem;
    const N = targetCount;

    // segurança: garante que o objeto do problema exista
    if (!targetTeam.problems[probKey]) {
        targetTeam.problems[probKey] = {
            tries: 0,
            time: null,
            solved: false,
            firstToSolve: false,
            freezeTries: 0
        };
    }

    const probData = targetTeam.problems[probKey];
    probData.tries = (probData.tries || 0) + N;
    probData.freezeTries = 0; // ✅ Agora está liberado

    // --- 2) Atualiza as N runs congeladas correspondentes (freezeSub -> false, freezeTrie -> 0/null) ---
    let changed = 0;
    for (const r of runs) {
        if (changed >= N) break;
        if (r.teamName === teamKey && r.problem === probKey && r.freezeSub) {
            r.freezeSub = false;
            r.freezeTrie = 0; // mantenha null se preferir
            changed++;
        }
    }

    // --- 3) Recalcula solved e penalty de TODOS os times (não só o afetado) ---
    // ✅ CORREÇÃO: Agora recalcula TODOS os times considerando apenas problemas com freezeTries === 0
    const updatedRanking = ranking.map(team => {
        let visibleSolved = 0;
        let visiblePenalty = 0;

        for (const [pname, pdata] of Object.entries(team.problems || {})) {
            // ✅ Só conta se: (1) está solved E (2) não tem freezeTries (já foi liberado)
            if (pdata.solved && (pdata.freezeTries || 0) === 0) {
                visibleSolved++;
                const problemTime = typeof pdata.time === 'number' ? pdata.time : 0;
                const problemTries = pdata.tries || 0;
                visiblePenalty += problemTime + 20 * Math.max(0, problemTries - 1);
            }
        }

        return {
            ...team,
            solved: visibleSolved,
            penalty: visiblePenalty
        };
    });

    // --- 4) Reordena o ranking ---
    updatedRanking.sort((a, b) => {
        if ((b.solved || 0) !== (a.solved || 0)) return (b.solved || 0) - (a.solved || 0);
        if ((a.penalty || 0) !== (b.penalty || 0)) return (a.penalty || 0) - (b.penalty || 0);
        return (a.userSite || '').localeCompare(b.userSite || '');
    });

    // atualiza pos
    for (let i = 0; i < updatedRanking.length; i++) {
        updatedRanking[i].pos = i + 1;
    }

    return {
        ranking: updatedRanking,
        runs,
        released: {
            team: teamKey,
            problem: probKey,
            countRequested: N,
            countRunsUpdated: changed
        }
    };
}