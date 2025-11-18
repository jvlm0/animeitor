import crypto from 'crypto';
import * as cheerio from "cheerio";

const BASE_URL = 'http://maratona.td.utfpr.edu.br/boca';



globalThis.globalCookies = '';
globalThis.teamsDict = {};
globalThis.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];


function jsMyHash(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

async function fetchWithCookies(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    console.log(`🌐 Requisição para: ${fullUrl}`);
    console.log(`🍪 Cookies enviados: ${globalThis.globalCookies || '(nenhum)'}`);

    const response = await fetch(fullUrl, {
        ...options,
        headers: {
            ...options.headers,
            'Cookie': globalThis.globalCookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive'
        },
        redirect: 'manual' // Não seguir redirects automaticamente
    });

    // Captura e armazena cookies
    const setCookieHeaders = response.headers.getSetCookie?.() ||
        (response.headers.get('set-cookie')?.split(',') || []);

    if (setCookieHeaders.length > 0) {
        console.log(`🍪 Novos cookies recebidos:`, setCookieHeaders);

        // Parse e atualiza cookies globais
        const newCookies = setCookieHeaders.map(cookie => {
            const [nameValue] = cookie.split(';');
            return nameValue.trim();
        });

        // Merge cookies (sobrescreve se já existir)
        const cookieMap = new Map();

        // Cookies existentes
        if (globalThis.globalCookies) {
            globalThis.globalCookies.split('; ').forEach(c => {
                const [name, value] = c.split('=');
                cookieMap.set(name, value);
            });
        }

        // Novos cookies
        newCookies.forEach(c => {
            const [name, value] = c.split('=');
            if (name && value) cookieMap.set(name, value);
        });

        globalThis.globalCookies = Array.from(cookieMap.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');

        console.log(`🍪 Cookies atualizados: ${globalThis.globalCookies}`);
    }

    return response;
}

let isLoggedIn = false;
let lastLoginTime = 0;

export async function loga() {
    const now = Date.now();
    // Refaz login se passou mais de 20 minutos
    if (isLoggedIn && (now - lastLoginTime) < 20 * 60 * 1000) {
        console.log('✅ Usando sessão existente');
        return;
    }

    try {
        console.log('🔄 Iniciando processo de login...');

        // PASSO 1: GET na página inicial para pegar cookies de sessão
        console.log('📄 PASSO 1: Carregando página de login...');
        const loginPage = await fetchWithCookies('/index.php');
        const loginHtml = await loginPage.text();

        console.log(`📄 Status: ${loginPage.status}`);
        console.log(`📄 Primeiros 300 chars:`, loginHtml.substring(0, 300));

        // PASSO 2: Extrair o salt
        console.log('🔑 PASSO 2: Extraindo salt...');
        const match = loginHtml.match(/\+'([a-z0-9]+)'\)/);
        if (!match) {
            console.error('❌ Salt não encontrado no HTML');
            console.error('HTML completo:', loginHtml);
            throw new Error('Salt não encontrado!');
        }

        const salt = match[1];
        console.log(`🔑 Salt encontrado: ${salt}`);

        // PASSO 3: Calcular hash da senha
        console.log('🔐 PASSO 3: Calculando hash...');
        const usuario = 'juiz1';
        const senha = '147juiz741';
        const hash1 = jsMyHash(senha);
        const passwordHash = jsMyHash(hash1 + salt);

        console.log(`🔐 Hash1 (senha): ${hash1}`);
        console.log(`🔐 Hash2 (final): ${passwordHash}`);

        // PASSO 4: Fazer login
        console.log('🚀 PASSO 4: Enviando credenciais...');
        const loginUrl = `/index.php?name=${encodeURIComponent(usuario)}&password=${passwordHash}`;
        const loginResponse = await fetchWithCookies(loginUrl);
        const loginResult = await loginResponse.text();

        console.log(`🚀 Status do login: ${loginResponse.status}`);
        console.log(`🚀 Location header: ${loginResponse.headers.get('location') || '(nenhum)'}`);
        console.log(`🚀 Primeiros 500 chars da resposta:`, loginResult.substring(0, 500));

        // Verifica se deu erro
        if (loginResult.includes('Session expired') ||
            loginResult.includes('log in again') ||
            loginResult.includes('Invalid username or password')) {
            console.error('❌ Login falhou!');
            console.error('Resposta completa:', loginResult);
            isLoggedIn = false;
            throw new Error('Credenciais inválidas ou sessão expirou');
        }

        // Se teve redirect (302), seguir o redirect
        if (loginResponse.status === 302) {
            const redirectUrl = loginResponse.headers.get('location');
            console.log(`↪️ Seguindo redirect para: ${redirectUrl}`);
            const redirectResponse = await fetchWithCookies(redirectUrl);
            console.log(`↪️ Status após redirect: ${redirectResponse.status}`);
        }

        isLoggedIn = true;
        lastLoginTime = now;
        console.log('✅ Login realizado com sucesso!');
        console.log(`✅ Cookies finais: ${globalThis.globalCookies}`);

    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        isLoggedIn = false;
        globalThis.globalCookies = ''; // Limpa cookies em caso de erro
        throw error;
    }
}

export async function getTeamsDict() {

    if (Object.keys(globalThis.teamsDict).length > 0) return globalThis.teamsDict;

    let data = await scrap();

    if (data === 'Session expired') {
        await loga();
        data = await scrap();
    }

    console.log("getTeam")
    console.log(data)
    if (data == 'Session expired') {
        console.error('⚠️ Sessão expirou durante o scraping!');
        isLoggedIn = false;
        globalThis.globalCookies = '';
        return 'Session expired'
    }

    data.forEach((el) => {
        globalThis.teamsDict[el.userSite.split("/")[0]] = el.name;
    })

    return globalThis.teamsDict;
}

export async function scrapRuns() {
    console.log('📊 Iniciando scraping da página de score...');
    const response = await fetchWithCookies('/judge/runchief.php');
    const html = await response.text();

    if (html.includes('Session expired') || html.includes('log in again')) {
        console.error('⚠️ Sessão expirou durante o scraping!');
        isLoggedIn = false;
        globalThis.globalCookies = '';
        return 'Session expired'
    }

    const $ = cheerio.load(html);

    const submissions = [];

    const tries = {}
    const rows = $("table tr").slice(3).toArray().reverse()
    // Pega todos os TR exceto o cabeçalho
    rows.forEach((tr) => {
        const tds = $(tr).find("td");

        // Linha vazia ou quebrada -> ignora
        if (tds.length < 10) return;

        // run number fica dentro do link dentro do td[0]
        const runLink = $(tds[0]).find("a");
        const runNumber = runLink.text().trim();

        const site = $(tds[1]).text().trim();
        const time = $(tds[2]).text().trim();
        const problem = $(tds[3]).text().trim();
        const language = $(tds[4]).text().trim();

        // status pode ter background e espaços bizarros
        const status = $(tds[5]).text().trim();

        const judge = $(tds[6]).text().trim();

        // td[7] é o AJ (normalmente vazio)
        const aj = $(tds[7]).text().trim();

        // answer: pode ter imagens no meio (YES ✅)
        const answerRaw = $(tds[8]).text().trim();

        // Extrai apenas YES / NO
        const answer = answerRaw.startsWith("YES") ? "YES" :
            answerRaw.startsWith("NO") ? "NO" : answerRaw;

        // Também podemos extrair a descrição do erro, ex: "Wrong answer"
        const answerDetail = answerRaw.replace(/^YES|^NO|-|\s/g, "").trim();

        const teamName = $(tds[9]).text().trim();

        ensureCounter(tries, [teamName, problem, "count"])

        submissions.push({
            runNumber: Number(runNumber),
            site: Number(site),
            time: time,
            problem,
            teamName,
            tries: tries[teamName][problem].count++,
            language,
            status,
            judge,
            aj: aj || null,
            answer,
            answerDetail

        });
    });


    return submissions.reverse();

}




export function ensureCounter(obj, keys) {
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
    }

    const last = keys[keys.length - 1];
    if (current[last] == null) current[last] = 0;

    return current[last];
}

export async function computeRankingAtTime(t, teamsDict) {
    // Filtra submissões até o tempo t

    let subs = await scrapRuns();
    if (teamsDict == {}) {
        teamsDict = await getTeamsDict();
    }


    if (subs === 'Session expired') {
        await loga();
        subs = await scrapRuns();
        teamsDict = await getTeamsDict();
    }

    // 🔹 1. Filtrar submissões até o tempo t
    const filtered = subs
        .map(r => ({ ...r, time: Number(r.time) }))
        .filter(r => r.time <= t)
        .sort((a, b) => a.time - b.time || a.runNumber - b.runNumber);

    // 🔹 2. Identificar o primeiro time a resolver cada problema
    const firstSolveByProblem = {}; // { 'A': { teamName, time } }

    for (const run of filtered) {
        if (run.answer === "YES" && !firstSolveByProblem[run.problem]) {
            firstSolveByProblem[run.problem] = {
                teamName: run.teamName,
                time: run.time
            };
        }
    }

    // 🔹 3. Inicializar todos os times do dicionário
    const teams = {};
    for (const [teamKey, teamName] of Object.entries(teamsDict)) {
        teams[teamKey] = {
            userSite: teamKey,
            name: teamName,
            problems: {},
            solved: 0,
            penalty: 0
        };
    }

    // 🔹 4. Processar submissões
    for (const run of filtered) {
        const teamKey = run.teamName;
        const problem = run.problem;
        const time = run.time;
        const answer = run.answer;

        // Se time novo aparecer (não listado no dict), adiciona
        if (!teams[teamKey]) {
            teams[teamKey] = {
                userSite: teamKey,
                name: teamKey,
                problems: {},
                solved: 0,
                penalty: 0
            };
        }

        const team = teams[teamKey];
        if (!team.problems[problem]) {
            team.problems[problem] = {
                tries: 0,
                time: null,
                solved: false,
                firstToSolve: false
            };
        }

        const p = team.problems[problem];

        // Ignora submissões após o primeiro AC
        if (p.solved) continue;

        // Checa se esta submissão é o primeiro AC global do problema
        const firstToSolve =
            answer === "YES" &&
            firstSolveByProblem[problem]?.teamName === teamKey &&
            firstSolveByProblem[problem]?.time === time;

        // Marca também dentro da submissão
        run.firstToSolve = firstToSolve;

        if (answer === "NO") {
            p.tries++;
        } else if (answer === "YES") {
            p.tries++;
            p.time = time;
            p.solved = true;
            p.firstToSolve = firstToSolve;

            team.solved++;
            team.penalty += p.time + 20 * (p.tries - 1);
        }
    }

    // 🔹 5. Gerar ranking completo
    const ranking = Object.values(teams)
        .map(team => ({
            ...team,
            pos: 0 // posição será definida após ordenar
        }))
        .sort((a, b) => {
            if (b.solved !== a.solved) return b.solved - a.solved;
            if (a.penalty !== b.penalty) return a.penalty - b.penalty;
            return a.userSite.localeCompare(b.userSite);
        })
        .map((team, idx) => ({ ...team, pos: idx + 1 }));

    return {
        time: t,
        ranking,
        runs: filtered
    };
}


export async function scrapLetters() {

    if (globalThis.letters.length > 0) {
        return globalThis.letters;
    }

    const response = await fetchWithCookies('/judge/score.php');
    const html = await response.text();

    if (html.includes('Session expired') || html.includes('log in again')) {
        console.error('⚠️ Sessão expirou durante o scraping!');
        isLoggedIn = false;
        globalThis.globalCookies = '';
        return 'Session expired'
    }

    const $ = cheerio.load(html);



    const header = $("#myscoretable tr").first();



    const headers = header.find('td').map((i, el) => {
        return $(el).text().split(' ')[0];
    }).get();

    globalThis.letters = headers.filter(h => /^[A-Z]$/.test(h));

    console.log("letras " + letters)

    return globalThis.letters;

}




export async function computeRankingAtTimeWithPending(t, teamsDict) {

    let runs = await scrapRuns();

    if (runs === 'Session expired') {
        await loga();
        runs = await scrapRuns();
        teamsDict = await getTeamsDict();
    }

    if (teamsDict == {}) {
        teamsDict = await getTeamsDict();
    }

    const allRuns = runs.map(r => ({
        ...r,
        time: Number(r.time),
        freezeSub: r.time > 240,   // <- marca submissões pós-freeze
    }));

    // 🔹 1. Filtra submissões até o tempo t E antes do freeze para o ranking
    const filtered = allRuns
        .filter(r => r.time <= t && r.time <= 240)
        .sort((a, b) => a.time - b.time || a.runNumber - b.runNumber);

    // 🔹 2. Pending (não mexe)
    const pendingRuns = allRuns
        .filter(r => r.time > t && r.time <= t + 1)
        .map(r => ({
            ...r,
            pending: true,
            status: "pending",
            firstToSolve: false,
            answer: null
        }));

    // 🔹 3. Identificar primeiro AC
    const firstSolveByProblem = {};
    for (const run of filtered) {
        if (run.answer === "YES" && !firstSolveByProblem[run.problem]) {
            firstSolveByProblem[run.problem] = {
                teamName: run.teamName,
                time: run.time
            };
        }
    }

    // 🔹 Dicionário auxiliar: contar freeze tries por time/problema
    const freezeCounter = {};

    // 🔹 Inicializa times
    const teams = {};
    for (const [teamKey, teamName] of Object.entries(teamsDict)) {
        teams[teamKey] = {
            userSite: teamKey,
            name: teamName,
            problems: {},
            solved: 0,
            penalty: 0
        };
    }

    // 🔹 5. Processar submissões julgadas (somente até o freeze)
    for (const run of filtered) {
        const { teamName: teamKey, problem, time, answer } = run;

        if (!teams[teamKey]) {
            teams[teamKey] = {
                userSite: teamKey,
                name: teamKey,
                problems: {},
                solved: 0,
                penalty: 0
            };
        }

        const team = teams[teamKey];

        if (!team.problems[problem]) {
            team.problems[problem] = {
                tries: 0,
                time: null,
                solved: false,
                firstToSolve: false,
                freezeTries: 0     // <- inicia o campo novo
            };
        }

        const p = team.problems[problem];

        if (p.solved) continue;

        const firstToSolve =
            answer === "YES" &&
            firstSolveByProblem[problem]?.teamName === teamKey &&
            firstSolveByProblem[problem]?.time === time;

        run.firstToSolve = firstToSolve;

        if (answer === "NO") {
            p.tries++;
        } else if (answer === "YES") {
            p.tries++;
            p.time = time;
            p.solved = true;
            p.firstToSolve = firstToSolve;
            team.solved++;
            team.penalty += p.time + 20 * (p.tries - 1);
        }
    }

    // 🔹 6. Contabilizar freezeTries (runs pós-freeze)
    for (const r of allRuns) {
        if (r.time > 240) {
            const key = `${r.teamName}_${r.problem}`;

            if (!freezeCounter[key]) {
                freezeCounter[key] = 0;
            }

            freezeCounter[key]++;

            // adiciona freezeTrie direto na run
            r.freezeTrie = freezeCounter[key];
        }
    }

    // Copiar freezeTries para o ranking
    for (const [teamKey, team] of Object.entries(teams)) {
        for (const [prob, pdata] of Object.entries(team.problems)) {
            const key = `${teamKey}_${prob}`;
            pdata.freezeTries = freezeCounter[key] || 0;
        }
    }

    // 🔹 7. Montar ranking
    const ranking = Object.values(teams)
        .map(team => ({ ...team, pos: 0 }))
        .sort((a, b) => {
            if (b.solved !== a.solved) return b.solved - a.solved;
            if (a.penalty !== b.penalty) return a.penalty - b.penalty;
            return a.userSite.localeCompare(b.userSite);
        })
        .map((team, idx) => ({ ...team, pos: idx + 1 }));

    // 🔹 8. Combinar todas as runs
    // 🔹 7. Combinar TODAS as runs até t + pendentes
    const combinedRuns = [
        ...allRuns.filter(r => r.time <= t),   // todas até t (inclui pós-freeze)
        ...pendingRuns                         // pendentes
    ].sort((a, b) => a.time - b.time || a.runNumber - b.runNumber);
    return {
        time: t,
        ranking,
        runs: combinedRuns
    };
}


export async function scrap() {
    console.log('📊 Iniciando scraping da página de score...');
    const response = await fetchWithCookies('/judge/score.php');
    const html = await response.text();


    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Primeiros 300 chars:`, html.substring(0, 300));

    if (html.includes('Session expired') || html.includes('log in again')) {
        console.error('⚠️ Sessão expirou durante o scraping!');
        isLoggedIn = false;
        globalThis.globalCookies = '';
        return 'Session expired'
    }

    const $ = cheerio.load(html);

    var teams = []
    $("tr.sitegroup1").each((_, tr) => {
        const tds = $(tr).find("td");

        const pos = $(tds[0]).text().trim();
        const userSite = $(tds[1]).text().trim();
        const name = $(tds[2]).text().trim();

        // As colunas de problemas começam no índice 3 e vão até 3 + 13 (A..M)
        const problems = {};
        const labels = "ABCDEFGHIJKLM".split("");

        labels.forEach((letter, idx) => {
            const cell = $(tds[3 + idx]);
            const font = cell.find("font");

            if (font.length === 0) {
                problems[letter] = null;
            } else {
                const value = font.text().trim();  // ex: "1/59" ou "2/103"
                const [tries, time] = value.split("/").map(Number);
                problems[letter] = { tries, time };
            }
        });

        // A última coluna é o total: "13 (775)"
        const totalCol = $(tds[3 + labels.length]).text().trim();
        const match = totalCol.match(/(\d+)\s*\((\d+)\)/);
        const solved = match ? Number(match[1]) : null;
        const penalty = match ? Number(match[2]) : null;

        teams.push({
            pos: Number(pos),
            userSite,
            name,
            problems,
            solved,
            penalty
        });
    });

    return teams;
}