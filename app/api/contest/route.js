// /api/contest

import { getContestInfo, setContestInfo } from "../../contest/contestInfo";



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

