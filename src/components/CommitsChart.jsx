import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CommitsChart({ data }) {
  // data attendu : tableau d'objets avec { date: 'YYYY-MM-DD', commits: number }

  // Trie les données par date (sécurité)
  const sortedData = data.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  // Prépare labels (dates) et valeurs (nombre de commits)
  const labels = sortedData.map(entry => entry.date);
  const commitsData = sortedData.map(entry => entry.commits);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nombre de commits',
        data: commitsData,
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Commits à travers le temps',
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Commits',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export default CommitsChart;
