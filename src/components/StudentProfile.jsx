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
                <h1>Profil de l'étudiant : {student.name}</h1>
                <p><strong>Numéro étudiant:</strong> {student.no_etudiant}</p>
                <p><strong>Filière:</strong> {student.class}</p>
            </header>

            <section className="student-profile-section">
                <h2>Groupes assignés</h2>
                {student.groups && student.groups.length > 0 ? (
                    <ul className="group-list">
                        {student.groups.map(group => (
                            <li key={group.id}>
                                Groupe **{group.name}** (Année: {group.year})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Cet étudiant n'est assigné à aucun groupe.</p>
                )}
            </section>

            <section className="student-profile-section">
                <h2>Années académiques assignées</h2>
                {student.years_assigned && student.years_assigned.length > 0 ? (
                    <ul className="year-list">
                        {student.years_assigned.sort((a, b) => b - a).map((year, index) => (
                            <li key={index}>Année **{year}**</li>
                        ))}
                    </ul>
                ) : (
                    <p>Cet étudiant n'est assigné à aucune année académique.</p>
                )}
            </section>

            {/* You can add more sections here for projects, etc., if available in student data */}
        </div>
    );
}

export default StudentProfile;