import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommitsChart from '../graphs/CommitsChart.jsx';
import '../style/GroupAnalysis.css';  // Import du CSS
import '../graphs/CommitActivityTimeline.jsx'; // Import du CSS pour les graphiques

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

      if (!data.result?.commits || data.result.commits.length === 0) {
        throw new Error('Aucune donnée de commits disponible.');
      }

      const commits = data.result.commits;
      const datesSet = new Set();
      commits.forEach(c => datesSet.add(c.date.slice(0, 10)));
      const labels = Array.from(datesSet).sort();
      const authors = Array.from(new Set(commits.map(c => c.author)));
      const commitsByDateAuthor = {};
      labels.forEach(date => {
        commitsByDateAuthor[date] = {};
        authors.forEach(author => commitsByDateAuthor[date][author] = 0);
        commitsByDateAuthor[date].total = 0;
      });
      commits.forEach(c => {
        const date = c.date.slice(0, 10);
        commitsByDateAuthor[date][c.author]++;
        commitsByDateAuthor[date].total++;
      });

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

      setChartsData(prev => ({
        ...prev,
        [repo.id]: { labels, datasets }
      }));
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
            <CommitActivityTimeline commits={chartsData[repo.id]} />
          ) : (
            <p className="loading-text">Préparation de l’analyse...</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default GroupAnalysis;
