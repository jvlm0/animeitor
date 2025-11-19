'use client';
import { useState } from "react";
import { fetchApi } from '../lib/api';

export default function ContestPage() {
  const [contestName, setContestName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [multiplo, setMultiplo] = useState(1);
  const [simulate, setSimulate] = useState(false); // <-- novo campo (padrão false)
  const [response, setResponse] = useState(null);

  async function updateContest() {
    const res = await fetchApi("/api/contest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contestName, startTime, multiplo, simulate }),
    });

    setResponse(await res.json());
  }

  async function getContest() {
    const res = await fetchApi("/api/contest");
    setResponse(await res.json());
  }

  async function startScraper() {
    const res = await fetchApi("/api/boca-scraper?mode=start");
    setResponse(await res.json());
  }

  async function stopScraper() {
    const res = await fetchApi("/api/boca-scraper?mode=stop");
    setResponse(await res.json());
  }

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-10">

      <h1 className="text-4xl font-extrabold text-white">Gerenciar Contest</h1>

      {/* Atualizar Contest */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4 shadow-lg">

        <h2 className="text-2xl font-semibold text-white mb-2">Atualizar Contest</h2>

        <div className="space-y-3">
          <input
            value={contestName}
            onChange={(e) => setContestName(e.target.value)}
            placeholder="Nome do Contest"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white"
          />

          <input
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Horário de início (13:00:00)"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white"
          />

          <input
            type="number"
            value={multiplo}
            onChange={(e) => setMultiplo(Number(e.target.value))}
            placeholder="Multiplo"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white"
          />

          {/* checkbox simulate - adicionado */}
          <label className="inline-flex items-center gap-3 mt-1 text-white">
            <input
              type="checkbox"
              checked={simulate}
              onChange={(e) => setSimulate(e.target.checked)}
              className="h-4 w-4 rounded bg-zinc-800 border border-zinc-700"
            />
            <span>Simulate (modo simulado)</span>
          </label>
        </div>

        <button
          onClick={updateContest}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
        >
          Atualizar Contest
        </button>
      </div>

      {/* Consultar Contest */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow-lg">

        <h2 className="text-xl font-semibold text-white mb-4">Consultar Contest</h2>

        <button
          onClick={getContest}
          className="px-5 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg"
        >
          GET /api/contest
        </button>
      </div>

      {/* Scraper */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow-lg">

        <h2 className="text-xl font-semibold text-white mb-4">Scraper</h2>

        <div className="flex gap-4">
          <button
            onClick={startScraper}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          >
            Iniciar Scraper
          </button>

          <button
            onClick={stopScraper}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
          >
            Parar Scraper
          </button>
        </div>
      </div>

      {/* Resposta */}
      {response && (
        <div className="bg-black border border-zinc-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-white font-semibold mb-2">Resposta</h3>
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
