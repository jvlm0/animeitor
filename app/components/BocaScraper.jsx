"use client"

import { useState, useEffect, useCallback } from 'react';
import BrazilianFinals from "./BrazilianFinals"
import { fetchApi } from '../lib/api';
import { releaseOneProblemFreeze } from '../lib/realeseProblem';

export default function BocaScraper({ teamsDict = {},
  letters = [],
  contestTime = "",
  contestName = "",
  multiplo = 1 }) {
  const [scoreData, setScoreData] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [time, setTime] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  // Intervalo em milissegundos (2 segundos)
  const REFRESH_INTERVAL = 2000;

  function minutosDesde(horario) {
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



  const handleScrapeByTime = useCallback(async () => {
    setError('');
    try {
      if (minutosDesde(contestTime) > -99999) {
        return;
      }

      const response = await fetchApi('/api/boca-scraper?mode=getStateByTime&sede=' + sede);
      const data = await response.json();

      if (data.success) {
        setScoreData(data.data.ranking);
        setSubmissions(data.data.runs);
        setTime(data.data.time);
      }
    } catch (err) {
      setError('Erro ao buscar dados de score: ' + err.message);
    }
  }, []);

  const handleScrapSub = useCallback(async () => {
    setError('');

    try {
      const response = await fetchApi('/api/boca-scraper?mode=runs');
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (err) {
      setError('Erro ao buscar dados de submissions: ' + err.message);
    }
  }, []);

  const handleReleaseOneProblem = () => {
    setError('');
    console.log("Liberando um problema...");
    try {
      const data = releaseOneProblemFreeze(scoreData, submissions, time);

      if (data) {
        setScoreData(data.ranking);
        setSubmissions(data.runs);
        setTime(data.time);
      }
    } catch (err) {
      setError('Erro ao liberar problema: ' + err.message);
      console.error(err);
    }
  };

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      handleScrapeByTime(),
      //handleScrapSub()
    ]);
    setIsLoading(false);
  }, [handleScrapeByTime]);

  // Carrega dados inicialmente e configura atualização periódica
  useEffect(() => {
    // Busca inicial
    fetchAllData();

    // Configura intervalo para atualização periódica
    const intervalId = setInterval(() => {
      fetchAllData();
    }, REFRESH_INTERVAL);

    // Cleanup: limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  // Hook para detectar tecla Espaço e liberar um problema
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        handleReleaseOneProblem();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scoreData, submissions, time]);

  const [sede, setSede] = useState("Todos");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchApi(`/api/boca-scraper?mode=getStateByTime&sede=${sede}`);
        const data = await response.json();

        if (data.success) {
          setScoreData(data.data.ranking);
          setSubmissions(data.data.runs);
          setTime(data.data.time);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [sede]);

  return (
    <>

      <div className="flex justify-center gap-4 mt-6">
        {["Toledo", "Curitiba", "Todos", "Remoto"].map((val) => (
          <button
            key={val}
            className={
              (sede === val
                ? " bg-blue-600 text-white"
                : " bg-gray-300 text-black")
            }
            onClick={() => {
              setSede(val)
              console.log("Sede alterada para:", val);
            }}
          >
            {val}
          </button>
        ))}
      </div>

      <BrazilianFinals
        initialScoreboard={scoreData}
        initialSubmissions={submissions}
        teamsDict={teamsDict}
        letters={letters}
        START_TIME={contestTime}
        multiplo={multiplo}
        contestName={contestName}
        enableGifs={true}
        timeLastUpdate={time}
      />



    </>
  );
}