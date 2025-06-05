import React, { useEffect, useState } from 'react';
import CommitsChart from './CommitsChart';

function CommitActivityTimeline({ analysisId }) {
  const [commitActivity, setCommitActivity] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const prepareChartData = (activity) => {
    if (!activity.length) return null;

    const data = activity.map((week) => ({
      date: new Date(week.week * 1000), // timestamp en secondes
      count: week.total,
    }));

    return {
      labels: data.map(d => d.date.toLocaleDateString()),
      datasets: [{
        label: 'Commits',
        data: data.map(d => d.count),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        tension: 0.1,
        fill: true,
      }]
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/commit-activity-timeline', {
          withCredentials: true,
          params: { analysisId }
        });

        if (response.data.status === 'success') {
          const activity = response.data.data || [];
          setCommitActivity(activity);
          setChartData(prepareChartData(activity));
        } else {
          throw new Error(response.data.error);
        }
      } catch (err) {
        console.error('Error fetching commit activity:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des données.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [analysisId]);

  return (
    <div className="commit-activity-timeline" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Commit Activity Timeline</h2>
      {isLoading && <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Chargement des données…</div>}
      {error && <div style={{ textAlign: 'center', color: '#e53935' }}>{error}</div>}
      {!isLoading && !error && commitActivity.length === 0 && (
        <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Aucune donnée disponible.</div>
      )}
      {chartData && <CommitsChart chartData={chartData} />}
    </div>
  );
}

export default CommitActivityTimeline;
