import { getContestInfo } from "../contest/contestInfo";
import { computeRankingAtTimeWithPending, computeFullRanking } from "./lib";
import { saveContest } from "./saveContest";

console.log("🔌 Módulo carregado!");

const CONTEST_TIME = 300;

let cache = null;
let isJobStarted = false;
let jobId = null;
let contest = null;

function minutosDesde(horario, multiplo) {
  // Divide "13:00" em [13, 00]
  const [horas, minutos] = horario.split(":").map(Number);

  // Cria um objeto Date para o horário de referência (hoje)
  const agora = new Date();
  const referencia = new Date();
  referencia.setHours(horas, minutos, 0, 0);

  // Calcula a diferença em milissegundos
  const diffMs = agora - referencia;

  // Converte para minutos
  const diffMin = diffMs / 1000 / 60;

  // Retorna diferença em minutos (pode ser negativa se ainda não chegou o horário)
  return diffMin * multiplo;
}

// Tenta obter o contest info via API para garantir consistência entre processos
async function fetchContestInfoFromApi() {
  try {
    const base = process.env.SERVER_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/contest`);
    if (!res.ok) throw new Error('Resposta não OK');
    const json = await res.json();
    return json.data ?? getContestInfo();
  } catch (err) {
    console.warn('[JOB] Falha ao buscar /api/contest, usando getContestInfo():', err.message);
    return getContestInfo();
  }
}

async function runScraper() {
  console.log("[JOB] Rodando scraper...");
  
  // ✅ Busca contest atualizado a cada execução
  contest = await fetchContestInfoFromApi();
  console.log(`[JOB] Contest: ${contest.contestName}, Start: ${contest.startTime}, Multiplo: ${contest.multiplo}, Simulate: ${contest.simulate}`);
  
  const time = minutosDesde(contest.startTime, contest.multiplo);
  console.log(`[JOB] Tempo calculado: ${time.toFixed(2)} minutos`);

  if (time <= CONTEST_TIME || cache == null) {
    let data; 
    if (contest.simulate) {
      data = await computeRankingAtTimeWithPending(time, globalThis.teamsDict, contest.simulate);
    } else {
      //data = await computeFullRanking(time, globalThis.teamsDict);
      data = await computeRankingAtTimeWithPending(10000, globalThis.teamsDict, contest.simulate);
    }
    
    cache = data;
    console.log("[JOB] Cache atualizado!");
  } else {
    console.log("[JOB] Tempo > 300 e cache existe, mantendo cache atual");
  }

  if (time > CONTEST_TIME) {
    console.log("[JOB] ⚠️ Tempo > 300, parando job automaticamente");
    stopJob();
  }
}

// Inicia o job
export async function startScraperJob() {
  // Se já está rodando, não faz nada
  if (isJobStarted) {
    console.log("⚠️ Job já está rodando!");
    return;
  }

  console.log("🔄 Iniciando job periódico...");
  
  // ✅ SEMPRE busca contestInfo atualizado ao iniciar
  contest = await fetchContestInfoFromApi();
  console.log(`[JOB] Configuração carregada:`, contest);

  // Marca como iniciado ANTES de executar
  isJobStarted = true;

  // Executa 1x ao iniciar
  await runScraper();

  // ✅ Só cria o interval se ainda estiver marcado como started
  // (pode ter parado automaticamente no runScraper se time > 300)
  if (isJobStarted) {
    jobId = setInterval(runScraper, 2 * 1000);
    console.log("✅ Job iniciado com sucesso!");
  } else {
    console.log("⚠️ Job foi parado automaticamente durante a primeira execução");
  }
}

export function getCache() {
  return cache;
}

export function setCache(ranking, runs) {
  if (cache) {
    cache.ranking = ranking;
    cache.runs = runs;
  }
}

export function stopJob() {
  if (!isJobStarted && !jobId) {
    console.log("[JOB] Job já estava parado");
    return;
  }
  
  console.log("[JOB] 🛑 Parando job...");
  
  // ✅ Limpa TUDO para garantir que pode reiniciar
  isJobStarted = false;
  
  if (jobId) {
    clearInterval(jobId);
    jobId = null;
  }
  
  // ✅ Opcional: limpar o contest também para forçar reload
  contest = null;
  
  console.log("✅ Job parado com sucesso!");
}