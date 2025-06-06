// src/components/StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get the student ID from the URL
import '../style/StudentProfile.css'; // Create this CSS file for styling

import CommitActivityTimeline from '../graphs/CommitActivityTimeline.jsx';
import FileChangeFrequencyGraph from '../graphs/FileChangeFrequencyGraph.jsx';
import CodeEvolution from '../graphs/CodeEvolution.jsx';


function StudentProfile() {
    const { id } = useParams(); // Get the student ID from the URL parameter
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartsData, setChartsData] = useState({});
    const [repos, setRepos] = useState([]);
    const [error, setError] = useState(null);
    const [repoLoading, setRepoLoading] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`http://localhost:5000/api/students/${id}/repositories`)
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
        if (id) {
            fetch(`http://localhost:5000/api/students/${id}`)
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error("Étudiant non trouvé.");
                        }
                        throw new Error(`Erreur HTTP! statut: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    setStudent(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err);
                    setLoading(false);
                });
        }
    }, [id]); // Re-run effect if the ID in the URL changes

    useEffect(() => {
        if (repos.length === 0) return;
        repos.forEach((repo) => {
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
        console.log(`Analysis data for repo ${repo.id}`, data.result.data);

        if (data.result.data.status !== 'completed') {
            throw new Error('Aucune donnée de commits disponible.');
        } else {
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
        return <div className="student-profile-container">Chargement du profil étudiant...</div>;
    }

    if (error) {
        return <div className="student-profile-container error-message">Erreur : {error.message}</div>;
    }

    if (!student) {
        return <div className="student-profile-container">Aucun étudiant trouvé avec cet ID.</div>;
    }

    return (
        <div className="student-profile-container">
            <header className="student-profile-header">
                <h1>{student.surname} {student.name}</h1>
            </header>

            <section className="student-profile-section">
                <h2>Profil</h2>
                    <ul className="info-list">
                        <li><strong>Numéro étudiant:</strong> {student.no_etudiant}</li>
                        <li><strong>Filière:</strong> {student.class}</li>
                        <li><strong>GitHub:</strong> {student.gitname}</li>
                    </ul>
            </section>

            {student.groups && student.groups.length > 0 ? (
            <section className="student-profile-section">
                <h2>Projet</h2>
                <ul className="group-list">
                    {student.groups.map(group => (
                        <li key={group.id}>
                            Groupe {group.name} - {group.year}
                            <ul className="repo-projet-list">
                                {student.repositories_projet.map(repo => (
                                    <li key={repo.id}>
                                        {repo.name}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </section>
            ) : null}

            {(student.repositories_td && student.repositories_td.length) > 0 ? (
            <section className="student-profile-section">
                <h2>TDs</h2>
                {repos.map(repo => (
                    <div key={repo.id} className="repo-card">
                    <h3>{repo.name}</h3>
                    {repoLoading[repo.id] ? (
                        <p className="loading-text">Analyse en cours...</p>
                    ) : errors[repo.id] ? (
                        <p className="error-text">Erreur : {errors[repo.id]}</p>
                    ) : chartsData[repo.id] ? (
                        <>
                        <h4>{chartsData[repo.id].message}</h4>
                        <div className="charts-wrapper">
                            <CommitActivityTimeline
                            key={`timeline-${chartsData[repo.id].analysisId}`}
                            analysisId={chartsData[repo.id].analysisId}
                            />
                            <FileChangeFrequencyGraph
                            key={`freqgraph-${chartsData[repo.id].analysisId}`}
                            analysisId={chartsData[repo.id].analysisId}
                            />
                            <CodeEvolution
                            key={`codeevo-${chartsData[repo.id].analysisId}`}
                            analysisId={chartsData[repo.id].analysisId}
                            />
                        </div>
                        </>
                    ) : (
                        <p className="loading-text">Préparation de l’analyse...</p>
                    )}
                    </div>
                ))}

            </section>
            ) : null}

            {/* You can add more sections here for projects, etc., if available in student data */}
        </div>
    );
}

export default StudentProfile;