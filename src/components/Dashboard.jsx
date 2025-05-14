import React, { useState, useEffect } from 'react'; 
import Chart from './Chart';
import StudentList from './StudentList'; // Importer le composant StudentList

function Dashboard() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/reports')
            .then(response => response.json())
            .then(data => setReports(data));
    }, []);

    const data = reports.map(report => ({
        name: report.name,
        commits: JSON.parse(report.content).commits_count
    }));

    return (
        <div>
            <h2>Rapports d'Analyse</h2>
            <Chart data={data} />  {/* Affichage du graphique */}

            <h2>Liste des Élèves</h2>
            <StudentList />  {/* Affichage de la liste des étudiants */}
        </div>
    );
}

export default Dashboard;
