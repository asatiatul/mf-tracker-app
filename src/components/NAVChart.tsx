import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from "react-chartjs-2";
import { NAVEntry, FundConfig, ChartType } from "../types";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

type Props = {
  data: NAVEntry[];
  fund: FundConfig | undefined;
  chartType: 'line' | 'bar' | 'pie';
};

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    title: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: { ticks: { autoSkip: true, maxTicksLimit: 10 }, title: { display: true, text: "Date" } },
    y: { beginAtZero: false, title: { display: true, text: "NAV Value" } }
  }
};

const NAVChart: React.FC<Props> = ({ data, fund, chartType }) => {
  if (!data || data.length === 0 || !fund) return <p>No data to display.</p>;

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: fund.name,
        data: data.map((d) => d.nav),
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
      },
    ],
  };

  if (chartType === 'line') return <Line data={chartData} options={defaultOptions} />;
  if (chartType === 'bar') return <Bar data={chartData} options={defaultOptions} />;
  if (chartType === 'pie') {
    return (
      <Pie
        data={{
          labels: data.map((d) => d.date),
          datasets: [
            {
              label: fund.name,
              data: data.map((d) => d.nav),
              backgroundColor: data.map(
                () =>
                  `rgb(${Math.floor(Math.random() * 255)},
                        ${Math.floor(Math.random() * 255)},
                        ${Math.floor(Math.random() * 255)})`
              ),
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: { display: false }
          }
        }}
      />
    );
  }
  return null;
};
export default NAVChart;