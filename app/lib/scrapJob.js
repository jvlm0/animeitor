import { getContestInfo } from "../contest/contestInfo";
import { computeRankingAtTimeWithPending } from "./lib";
import { saveContest } from "./saveContest";

console.log("🔌 Módulo carregado!");


let cache = null;

let isJobStarted = false;
let jobId;

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


async function runScraper() {
  // Aqui você coloca seu código de scraping
  console.log("[JOB] Rodando scraper...");



  const time = minutosDesde(getContestInfo().startTime, getContestInfo().multiplo);

  //console.log("condição "+(time <= 300 || cache == null));
  if (time <= 300 || cache == null) {
    const data = await computeRankingAtTimeWithPending(time, globalThis.teamsDict, getContestInfo().simulate);
    cache = data;
    //saveContest(contestInfo.contestName, data);
    console.log("[JOB] Cache atualizado!");
  }

  if (time >  300) {
    clearInterval(jobId);
  }

}

// Inicia o job apenas uma vez
export function startScraperJob() {
  if (isJobStarted) return;

  console.log("🔄 Iniciando job periódico...");

  // Executa 1x ao iniciar
  runScraper();

  
  jobId = setInterval(runScraper, 2 * 1000);

  isJobStarted = true;
}

export function getCache() {
  return cache;
}

export function setCache(ranking, runs) {
  cache.ranking = ranking;
  cache.runs = runs;
}


export function stopJob() {
  isJobStarted = false;
  clearInterval(jobId);
}
