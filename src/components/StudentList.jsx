import React, { useState, useEffect } from 'react';

function StudentList() {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');

    // Récupère les étudiants depuis l'API
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/students');
                
                // Si la réponse n'est pas ok (par exemple 404 ou 500), lance une erreur
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                // Parse la réponse en JSON
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des étudiants:", error);
                setError("Erreur lors de la récupération des étudiants.");
            }
        };

        fetchStudents();
    }, []);

    // Si une erreur se produit, affiche un message d'erreur
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Liste des élèves</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Groupe</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.name}</td>
                            <td>{student.group_id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StudentList;
