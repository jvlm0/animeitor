// app/api/boca-scraper/route.js
import {
    loga,
    scrap,
    scrapRuns,
    getTeamsDict,
    computeRankingAtTimeWithPending,
    scrapLetters
} from '../../lib/lib'
import { getCache, setCache, startScraperJob, stopJob } from '../../lib/scrapJob';
import { releaseOneProblemFreeze, releaseSpecificProblem } from '../../lib/realeseProblem';
import { time } from 'console';




// ✅ Nova função helper para filtrar por sede
function filterBySede(cacheData, sede) {
    if (!cacheData) return cacheData;

    // Se for "Todos", retorna tudo sem filtrar
    if (sede === 'Todos') {
        return cacheData;
    }

    // Determina o prefixo baseado na sede
    const prefixMap = {
        'Toledo': 'teamp',
        'Curitiba': 'teamct',
        'Remoto': 'teamr'
    };

    const prefix = prefixMap[sede];
    if (!prefix) return cacheData;

    // Filtra ranking
    const filteredRanking = cacheData.ranking
        .filter(team => team.userSite.startsWith(prefix))
        .map((team, index) => ({ ...team, pos: index + 1 })); // ✅ Recalcula posições

    // Filtra runs
    const filteredRuns = cacheData.runs
        .filter(run => run.teamName.startsWith(prefix));

    return {
        time: cacheData.time,
        ranking: filteredRanking,
        runs: filteredRuns
    };
}


startScraperJob();

// ===== ROUTE HANDLERS =====

export async function GET(request) {
    try {
        console.log('\n═══════════════════════════════════');
        console.log('🎯 Nova requisição GET recebida');
        console.log('═══════════════════════════════════\n');

        const { searchParams } = new URL(request.url);

        const mode = searchParams.get("mode");

        //await loga();

        let data;
        if (mode === "score") {
            data = await scrap();
            if (data === 'Session expired') {
                await loga();
                data = await scrap();
            }

        } else if (mode === "runs") {
            data = await scrapRuns();
            if (data === 'Session expired') {
                await loga();
                data = await scrapRuns();
            }
        } else if (mode === "loga") {
            await loga()
        } else if (mode === "teamsDict") {
            data = await getTeamsDict()
            if (data === 'Session expired') {
                await loga();
                data = await getTeamsDict();
            }
        } else if (mode === 'initGlobals') {
            data = await initGlobals();
            if (data === 'Session expired') {
                await loga();
                data = await initGlobals();
            }
        } else if (mode === 'getStateByTime') {
            const time = Number(searchParams.get('time'));
            const sede = searchParams.get('sede') || 'Todos'; // ✅ Novo parâmetro

            const fullData = getCache();

            // ✅ Filtra ranking e runs com base na sede
            const filteredData = filterBySede(fullData, sede);

            data = filteredData;
        } else if (mode === 'letters') {
            //data = await scrapLetters();
            //if (data === 'Session expired') {
            //    await loga();
            data = globalThis.letters;
            //} 

        } else if (mode === 'releaseOneProblem') {
            const sede = searchParams.get('sede') || 'Todos';

            // ✅ Sempre pega o cache COMPLETO
            const fullData = getCache();

            // ✅ Filtra apenas para identificar qual time liberar
            const filteredData = filterBySede(fullData, sede);
            const filteredRanking = filteredData.ranking;

            // ✅ Encontra o último time com freeze na lista FILTRADA
            const sortedTeams = [...filteredRanking].sort((a, b) => b.pos - a.pos);

            let targetTeam = null;
            let targetProblem = null;

            for (const team of sortedTeams) {
                const problemsWithFreeze = Object.entries(team.problems || {})
                    .filter(([_, p]) => (p.freezeTries || 0) > 0);

                if (problemsWithFreeze.length > 0) {
                    problemsWithFreeze.sort((a, b) => {
                        const fa = a[1].freezeTries || 0;
                        const fb = b[1].freezeTries || 0;
                        if (fb !== fa) return fb - fa;
                        return a[0].localeCompare(b[0]);
                    });

                    targetTeam = team.userSite;
                    targetProblem = problemsWithFreeze[0][0];
                    break;
                }
            }

            // ✅ Se não encontrou nada, retorna sem alterar
            if (!targetTeam || !targetProblem) {
                data = { message: 'Nenhum problema pendente encontrado para esta sede' };
            } else {
                // ✅ Libera APENAS o problema específico encontrado no ranking completo
                const result = releaseSpecificProblem(
                    fullData.ranking,
                    fullData.runs,
                    targetTeam,
                    targetProblem
                );

                // ✅ Atualiza o cache COMPLETO
                setCache(result.ranking, result.runs);

                data = {
                    message: 'Problema liberado com sucesso',
                    released: result.released
                };
            }
        } else if (mode === 'start') {
            data = 'scrap iniciado';
            await startScraperJob();
        } else if (mode === 'stop') {
            data = 'scrap parado';
            stopJob();
        }


        console.log('\n✅ Requisição concluída com sucesso!\n');

        return Response.json({
            success: true,
            data: data,
            cookies: globalThis.globalCookies // Para debug
        });
    } catch (error) {
        console.error('\n❌ Erro na requisição:', error.message, '\n');
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        console.log('\n═══════════════════════════════════');
        console.log('🎯 Nova requisição POST recebida (múltiplos scrapes)');
        console.log('═══════════════════════════════════\n');

        await loga();

        const results = [];
        for (let i = 0; i < 3; i++) {
            console.log(`\n--- Scrape ${i + 1}/3 ---`);
            const data = await scrap();
            results.push({ timestamp: new Date().toISOString(), data });

            if (i < 2) {
                console.log('⏳ Aguardando 5 segundos...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log('\n✅ Todos os scrapes concluídos!\n');

        return Response.json({ success: true, results });
    } catch (error) {
        console.error('\n❌ Erro na requisição:', error.message, '\n');
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}