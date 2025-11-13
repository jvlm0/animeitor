globalThis.startTime = "13:00:00";
globalThis.contestName = "Maratona PPCI";
globalThis.simulate = false;
globalThis.multiplo = 1;


function getContestInfo() {
    return {
        contestName: globalThis.contestName,
        startTime: globalThis.startTime,
        simulate: globalThis.simulate = false,
        multiplo: globalThis.multiplo = 1
    }
}


function setContestInfo(contest) {

    if (contest?.startTime) {
        globalThis.startTime = contest?.startTime;
    }
    if (contest?.contestName) {
        globalThis.contestName = contest?.contestName;
    }
    if (contest?.simulate) {
        globalThis.simulate = contest?.simulate;
    }
    if (contest?.multiplo) {
        globalThis.multiplo = contest?.multiplo;
    }    
    return 'Contest Atualizado';
}


export async function GET() {
    try {
        console.log('\n═══════════════════════════════════');
        console.log('🎯 Nova requisição GET recebida');
        console.log('═══════════════════════════════════\n');

        let data;
        
        data = getContestInfo();

        console.log('\n✅ Requisição concluída com sucesso!\n');
        return Response.json({
            success: true,
            data: data
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

        const body = await request.json();

        const results = setContestInfo(body);

        return Response.json({ success: true, results });
    } catch (error) {
        console.error('\n❌ Erro na requisição:', error.message, '\n');
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

