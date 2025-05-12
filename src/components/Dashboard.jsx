import React, { useState, useEffect } from 'react';
import Chart from './Chart';

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
            <Chart data={data} />
        </div>
    );
}

export default Dashboard;
