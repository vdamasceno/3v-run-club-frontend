import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registra as ferramentas do gráfico que vamos usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VolumeChart = ({ progressionData }) => {
  
  // Prepara os dados para o gráfico
  const data = {
    // O eixo X serão as Semanas (1, 2, 3...)
    labels: progressionData.map(d => `Semana ${d.week}`),
    datasets: [
      {
        label: 'Volume Planejado (min)',
        data: progressionData.map(d => d.volume), // O eixo Y é o Volume
        borderColor: 'rgb(79, 70, 229)', // Cor da linha (Indigo)
        backgroundColor: 'rgba(79, 70, 229, 0.2)', // Cor do preenchimento (Sombra)
        tension: 0.4, // Deixa a linha curvinha (suave)
        fill: true, // Preenche embaixo da linha
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução do Volume Semanal',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutos'
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
       <Line options={options} data={data} />
    </div>
  );
};

export default VolumeChart;