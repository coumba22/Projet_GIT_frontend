import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommitsChart from '../graphs/CommitsChart.jsx';
import '../style/GroupAnalysis.css';  // Import du CSS
import CommitActivityTimeline from '../graphs/CommitActivityTimeline.jsx';
import HeatMapFileChanges from '../graphs/HeatMapFileChanges.jsx';


function GroupAnalysis() {
  const { id } = useParams();
  const [repos, setRepos] = useState([]);
  const [chartsData, setChartsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [repoLoading, setRepoLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/groups/${id}/repositories`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des repositories');
        return res.json();
      })
      .then(data => {
        setRepos(data);
        setLoading(false);
      })
      .catch(err => {
        setErrors(prev => ({ ...prev, global: err.message }));
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/groups/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des étudiants');
        return res.json();
      })
      .then(data => {
        setStudents(data.students || []);
      })
      .catch(err => {
        setErrors(prev => ({ ...prev, students: err.message }));
      });
  }, [id]);

  useEffect(() => {
    if (repos.length === 0) return;
    repos.forEach(repo => {
      launchAnalysis(repo);
    });
  }, [repos]);

  const launchAnalysis = async (repo) => {
    setRepoLoading(prev => ({ ...prev, [repo.id]: true }));
    setErrors(prev => ({ ...prev, [repo.id]: null }));

    try {
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repo.name.startsWith('http') ? repo.name : `https://github.com/${repo.name}`,
          tool: 'code_archeologist'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();

      if (data.result.data.status !== 'completed') {
        throw new Error('Aucune donnée de commits disponible.');
      } else {
        // Calcul total commits corrigé
        const totalCommits = Object.values(data.result.data.commit_activity || {})
          .reduce((acc, contributors) => acc + Object.values(contributors).reduce((sum, c) => sum + c, 0), 0);

        setChartsData(prev => ({
          ...prev,
          [repo.id]: {
            analysisId: parseInt(data.result.data.id, 10),
            message: `Nombre de commits : ${totalCommits}`
          }
        }));
      }

    } catch (err) {
      setErrors(prev => ({
        ...prev,
        [repo.id]: err.message || 'Erreur inconnue'
      }));
    } finally {
      setRepoLoading(prev => ({
        ...prev,
        [repo.id]: false
      }));
    }
  };

  if (loading) {
    return <div className="loading-text">Chargement des repositories du groupe...</div>;
  }
  if (errors.global) {
    return <div className="error-text">Erreur : {errors.global}</div>;
  }

  return (
    <div className="group-analysis-container">
      <h2>Projet du groupe {id}</h2>

      {students.length > 0 ? (
        <div className="students-list">
          <h3>Membres du groupe :</h3>
          <ul>
            {students.map(student => (
              <li key={student.id}>
                {student.name} {student.surname}
              </li>
            ))}
          </ul>
        </div>
      ) : errors.students ? (
        <p className="error-text">Erreur : {errors.students}</p>
      ) : (
        <p className="loading-text">Chargement des étudiants...</p>
      )}

      {repos.length === 0 && <p>Aucun repository trouvé pour ce groupe.</p>}

      {repos.map(repo => (
        <div key={repo.id} className="repo-card">
          <h3>{repo.name}</h3>
          {repoLoading[repo.id] ? (
            <p className="loading-text">Analyse en cours...</p>
          ) : errors[repo.id] ? (
            <p className="error-text">Erreur : {errors[repo.id]}</p>
          ) : chartsData[repo.id] ? (
            <>
              <p>{chartsData[repo.id].message}</p>
              <CommitActivityTimeline analysisId={chartsData[repo.id].analysisId} />
              <HeatMapFileChanges analysisId={chartsData[repo.id].analysisId} />
            </>
          ) : (
            <p className="loading-text">Préparation de l’analyse...</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default GroupAnalysis;
