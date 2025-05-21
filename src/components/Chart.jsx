import React from 'react';
import { Bar } from 'react-chartjs-2';


function Chart({ data }) {
    const chartData = {
        labels: data.map((item) => item.name),
        datasets: [
            {
                label: 'Commits par Projet',
                data: data.map((item) => item.commits),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    return (
        <div>
            <h3>Statistiques des Commits</h3>
            <Bar data={chartData} />
        </div>
    );
}

export default Chart;
