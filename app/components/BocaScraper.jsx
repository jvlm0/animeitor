"use client"

import { useState, useEffect, useCallback } from 'react';
import BrazilianFinals from "./BrazilianFinals"

export default function BocaScraper({ teamsDict = {}, letters = [] }) {
  const [scoreData, setScoreData] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const multiplo = 10;

  // Intervalo em milissegundos (30 segundos)
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
    return diffMin*multiplo;
  }

  const tempoDeInicio = '01:47:00';

  const handleScrapeScore = useCallback(async () => {
    setError('');

    try {
      const response = await fetch('/api/boca-scraper?mode=score');
      const data = await response.json();

      if (data.success) {
        setScoreData(data.data);


      }
    } catch (err) {
      setError('Erro ao buscar dados de score: ' + err.message);
    }
  }, []);


  const handleScrapeByTime = useCallback(async () => {
    setError('');
    console.log("BOCA SCRAPPEER"+letters)
    try {
      const response = await fetch('api/boca-scraper?mode=getStateByTime&time=' + minutosDesde(tempoDeInicio));
      const data = await response.json();

      if (data.success) {
        setScoreData(data.data.ranking);
        setSubmissions(data.data.runs);
      }
    } catch (err) {
      setError('Erro ao buscar dados de score: ' + err.message);
    }
  }, []);

  const handleScrapSub = useCallback(async () => {
    setError('');

    try {
      const response = await fetch('/api/boca-scraper?mode=runs');
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (err) {
      setError('Erro ao buscar dados de submissions: ' + err.message);
    }
  }, []);

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

  return (
    <>
      <BrazilianFinals
        initialScoreboard={scoreData}
        initialSubmissions={submissions}
        teamsDict={teamsDict}
        letters={letters}
        START_TIME={tempoDeInicio}
        multiplo = {multiplo}
      />
    </>
  );
}