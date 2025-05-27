import React, { useState } from 'react';
import CommitsChart from './CommitsChart'; // Assurez-vous que le chemin est correct

function TestAnalysis() {
  // State pour stocker les données envoyées à l'API
  const [requestData, setRequestData] = useState({
    repo_url: "https://github.com/uha-fr/-archiweb_2025_projets_gr03_front",
    tool: "code_archeologist"
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
  setLoading(true);
  setError(null);
  setResult(null);

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

    // Agrégation commits par date (format YYYY-MM-DD)
    const commitsByDate = data.result.commits.reduce((acc, commit) => {
      const dateKey = commit.date.slice(0, 10); // extraire YYYY-MM-DD
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    // Transformer en tableau [{date, commits}]
    const commitsArray = Object.entries(commitsByDate).map(([date, count]) => ({
      date,
      commits: count,
    }));

    setResult({ ...data.result, commits: commitsArray });
    } catch (err) {
        setError(err.message || "Erreur inconnue");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h2>Test Analyse API</h2>

      {/* Champ pour saisir le repo URL */}
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

      {result && (
        <div>
          <h3>Résultat de l’analyse :</h3>
          {/* Affiche le graphique avec les données commits si dispo */}
            {result.commits ? (
                <CommitsChart data={result.commits} />
            ) : (
                <p>Aucune donnée de commits disponible.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TestAnalysis;
