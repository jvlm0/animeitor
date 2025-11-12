'use client';
import { useEffect, useState } from "react";
import BocaScraper from "./components/BocaScraper";

export default function Home() {
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    fetch('/api/boca-scraper?mode=teamsDict')
      .then(res => res.json())
      .then(data => setTeams(data.data));
  }, []);

  if (!teams) return <p>Carregando...</p>;

  return <BocaScraper teamsDict={teams} />;
}
