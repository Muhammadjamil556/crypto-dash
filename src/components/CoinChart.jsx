import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

const API_URL = import.meta.env.VITE_COIN_API_URL;

const CoinChart = ({ coinId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Abort superseded requests so a stale response can't overwrite newer state
    const controller = new AbortController();

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/${coinId}/market_chart?vs_currency=usd&days=7`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Failed to load chart data');
        const data = await res.json();

        const prices = data.prices.map((price) => ({
          x: price[0],
          y: price[1],
        }));

        setChartData({
          datasets: [
            {
              label: 'Price (USD)',
              data: prices,
              fill: true,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              pointRadius: 0,
              tension: 0.3,
            },
          ],
        });
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchPrices();

    return () => controller.abort();
  }, [coinId]);

  if (loading) return <p>Loading Chart...</p>;
  if (error) return <div className='error'>❌ {error}</div>;

  return (
    <div style={{ marginTop: '30px' }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 7,
              },
            },
            y: {
              ticks: {
                callback: (value) => `$${value.toLocaleString()}`,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default CoinChart;
