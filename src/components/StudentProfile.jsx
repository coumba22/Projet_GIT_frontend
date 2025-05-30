// src/components/StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get the student ID from the URL
import '../style/StudentProfile.css'; // Create this CSS file for styling

function StudentProfile() {
    const { id } = useParams(); // Get the student ID from the URL parameter
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                <ul className="repo-td-list">
                    {student.repositories_td.map(repo => (
                        <li key={repo.id}>
                            {repo.name}
                        </li>
                    ))}
                </ul>
            </section>
            ) : null}

            {/* You can add more sections here for projects, etc., if available in student data */}
        </div>
    );
}

export default StudentProfile;