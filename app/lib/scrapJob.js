import { getContestInfo } from "../contest/contestInfo";
import { computeRankingAtTimeWithPending } from "./lib";

console.log("🔌 Módulo carregado!");


let cache = {
  updatedAt: null,
  data: null,
};

let isJobStarted = false;

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
    return diffMin*multiplo;
}


async function runScraper() {
  // Aqui você coloca seu código de scraping
  console.log("[JOB] Rodando scraper...");

  const contestInfo = getContestInfo();



  const time = minutosDesde(contestInfo.startTime, contestInfo.multiplo);
  const data = await computeRankingAtTimeWithPending(time, globalThis.teamsDict);

  cache =  data;

  console.log("[JOB] Cache atualizado!");
}

// Inicia o job apenas uma vez
export function startScraperJob() {
  if (isJobStarted) return;

  console.log("🔄 Iniciando job periódico...");

  // Executa 1x ao iniciar
  runScraper();

  // Executa a cada 30 segundos (exemplo)
  setInterval(runScraper, 2 * 1000);

  isJobStarted = true;
}

export function getCache() {
  return cache;
}
