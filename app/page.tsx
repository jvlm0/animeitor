'use client';
import { useEffect, useState } from "react";
import BocaScraper from "./components/BocaScraper";
import { fetchApi } from './lib/api';

export default function Home() {
  const [teams, setTeams] = useState(null);
  const [letters, setLetters] = useState([]);
  const [contestTime, setContestTime] = useState('');
  const [contestInfo, setContestInfo] = useState({ startTime: "", contestName: "", multiplo: 1 });



  useEffect(() => {
    fetchApi('/api/contest')
      .then(res => res.json())
      .then(data => {
        console.log('📦 Dados recebidos de /api/contest:', data.data.startTime);
        setContestInfo(data.data);
      })
      .catch(err => console.error('❌ Erro ao buscar letters:', err));
  }, []);

  useEffect(() => {
    fetchApi('/api/boca-scraper?mode=letters')
      .then(res => res.json())
      .then(data => {
        console.log('📦 Dados recebidos de /api/boca-scraper?mode=letters:', data);
        setLetters(data.data);
      })
      .catch(err => console.error('❌ Erro ao buscar letters:', err));
  }, []);

  useEffect(() => {
    fetchApi('/api/boca-scraper?mode=teamsDict')
      .then(res => res.json())
      .then(data => {
        setTeams(data.data)
        console.log('📦 Dados recebidos de /api/boca-scraper?mode=teamsDict:', data);
      });
  }, []);


  if (!teams) return <p>Carregando...</p>;

  return <BocaScraper teamsDict={teams} letters={letters}
    contestTime={contestInfo.startTime} contestName={contestInfo.contestName} multiplo={contestInfo.multiplo} />;
}
