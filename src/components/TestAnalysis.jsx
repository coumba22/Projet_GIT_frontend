import React, { useState } from 'react';
import CommitsChart from './CommitsChart'; // ton composant déjà défini

function TestAnalysis() {
  const [requestData, setRequestData] = useState({
    repo_url: "https://github.com/coumba22/Projet-GIT",
    tool: "code_archeologist"
  });
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();

      if (!data.result?.commits || data.result.commits.length === 0) {
        setError('Aucune donnée de commits disponible.');
        setLoading(false);
        return;
      }

      // Préparation des données pour le graphique
      const commits = data.result.commits;
      const datesSet = new Set();
      commits.forEach(c => datesSet.add(c.date.slice(0, 10)));
      const labels = Array.from(datesSet).sort();

      const authors = Array.from(new Set(commits.map(c => c.author)));

      // Initialisation structure
      const commitsByDateAuthor = {};
      labels.forEach(date => {
        commitsByDateAuthor[date] = {};
        authors.forEach(author => commitsByDateAuthor[date][author] = 0);
        commitsByDateAuthor[date].total = 0;
      });

      // Remplissage
      commits.forEach(c => {
        const date = c.date.slice(0, 10);
        commitsByDateAuthor[date][c.author]++;
        commitsByDateAuthor[date].total++;
      });

      // Couleurs pour les séries
      const colors = [
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)',
        'rgb(255, 206, 86)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
      ];

      const datasets = [{
        label: 'Total',
        data: labels.map(date => commitsByDateAuthor[date].total),
        borderColor: 'rgba(0,0,0,0.7)',
        backgroundColor: 'rgba(0,0,0,0.3)',
        fill: false,
        tension: 0.1,
      }];

      authors.forEach((author, i) => {
        datasets.push({
          label: author,
          data: labels.map(date => commitsByDateAuthor[date][author]),
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length],
          fill: false,
          tension: 0.1,
        });
      });

      setChartData({ labels, datasets });
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Test Analyse API</h2>
      <input
        type="text"
        value={requestData.repo_url}
        onChange={e => setRequestData({ ...requestData, repo_url: e.target.value })}
        placeholder="URL du repo GitHub"
        style={{ width: '400px', marginRight: '10px' }}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyse en cours...' : 'Lancer l’analyse'}
      </button>

      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      {chartData ? (
        <CommitsChart chartData={chartData} />
      ) : !loading && !error ? (
        <p>Résultat de l’analyse : Aucune donnée de commits disponible.</p>
      ) : null}
    </div>
  );
}

export default TestAnalysis;
