'use client';
import { useEffect, useState } from "react";
import BocaScraper from "./components/BocaScraper";

export default function Home() {
  const [teams, setTeams] = useState(null);
  const [letters, setLetters] = useState([]);
  const [contestInfo, setContestInfo] = useState({
    contestName: "",
    startTime: "",
  });

  useEffect(() => {
    fetch('/api/boca-scraper?mode=teamsDict')
      .then(res => res.json())
      .then(data => setTeams(data.data));
  }, []);

  useEffect(() => {
    fetch('/api/boca-scraper?mode=letters')
      .then(res => res.json())
      .then(data => {
        //console.log('📦 Dados recebidos de /api/boca-scraper?mode=letters:', data);
        setLetters(data.data);
      })
      .catch(err => console.error('❌ Erro ao buscar letters:', err));
  }, []);


    useEffect(() => {
    fetch('/api/contest')
      .then(res => res.json())
      .then(data => {
        //console.log('📦 Dados recebidos de /api/boca-scraper?mode=letters:', data);
        setContestInfo(data.data);
      })
      .catch(err => console.error('❌ Erro ao buscar letters:', err));
  }, []);


  if (!teams) return <p>Carregando...</p>;

  return <BocaScraper teamsDict={teams} letters={letters} contestInfo = {contestInfo} />;
}
