"use client"

import { useState, useEffect, useCallback } from 'react';
import BrazilianFinals from "./BrazilianFinals"
import { fetchApi } from '../lib/api';
import SedeFilter from './SedeFilter';

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
  const [sede, setSede] = useState('Todos');

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
    return diffMin*multiplo;
  }


  const handleScrapeScore = useCallback(async () => {
    setError('');

    try {
      const response = await fetchApi('/api/boca-scraper?mode=score');
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
    try {
      /*
      if (minutosDesde(contestTime) > 300) {
        return;
      }
        */
      const response = await fetchApi(`/api/boca-scraper?mode=getStateByTime&sede=${sede}`);
      const data = await response.json();

      if (data.success) {
        setScoreData(data.data.ranking);
        setSubmissions(data.data.runs);
        setTime(data.data.time);
      }
    } catch (err) {
      setError('Erro ao buscar dados de score: ' + err.message);
    }
  }, [sede]);

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

  const handleReleaseOneProblem = useCallback(async () => {
    setError('');

    try {
      const response = await fetchApi('/api/boca-scraper?mode=releaseOneProblem');
      const data = await response.json();

      if (data.success) {
        setScoreData(data.data.ranking);
        setSubmissions(data.data.runs);
        setTime(data.data.time);
      }
    } catch (err) {
      setError('Erro ao liberar problema: ' + err.message);
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

  // Hook para detectar tecla Espaço e liberar um problema
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); // Previne scroll da página
        handleReleaseOneProblem();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup: remove o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleReleaseOneProblem]);

  useEffect(() => {
    fetchAllData();
  }, [sede, fetchAllData]);
  return (
    <>
    <SedeFilter currentSede={sede} onSedeChange={setSede} />
      <BrazilianFinals
        initialScoreboard={scoreData}
        initialSubmissions={submissions}
        teamsDict={teamsDict}
        letters={letters}
        START_TIME={contestTime}
        multiplo = {multiplo}
        contestName = {contestName}
        enableGifs = {true}
        timeLastUpdate = {time}
      />
    </>
  );
}