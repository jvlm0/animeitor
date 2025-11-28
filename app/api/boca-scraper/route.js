// app/api/boca-scraper/route.js
import {loga, 
        scrap, 
        scrapRuns, 
        getTeamsDict,
        computeRankingAtTimeWithPending, 
        scrapLetters} from '../../lib/lib'
import { getCache, setCache, startScraperJob, stopJob } from '../../lib/scrapJob';
import {releaseOneProblemFreeze} from '../../lib/realeseProblem';



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
            const filtro = searchParams.get('sede');
            if (filtro !== null) {
                data = getCache(filtro);
            } else {
                data = getCache();
            }
        } else if (mode === 'letters') {
            data = await scrapLetters();
            if (data === 'Session expired') {
                await loga();
                data = await scrapLetters();
            }
        } else if (mode === 'releaseOneProblem') {
            
            const ranking = getCache().ranking;
            const runs = getCache().runs;

            const result =  releaseOneProblemFreeze(ranking, runs);
            setCache(result.ranking, result.runs);
            
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