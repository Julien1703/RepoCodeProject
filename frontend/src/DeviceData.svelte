<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import axios from 'axios';

  export let params = {}; // Empfange die Routenparameter
  let chartContainer;
  let chartInstance;
  let deviceData = [];

  const fetchData = async () => {
    try {
      const mac = params.mac;
      const response = await axios.post(`http://localhost:3000/devicedata/${mac}`);
      deviceData = response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Gerätedaten:', error);
    }
  };

  onMount(() => {
    fetchData();
  });

  $: if (deviceData.length > 0 && chartContainer) {
    const ctx = chartContainer.getContext('2d');
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: deviceData.map(data => new Date(data.timestamp).toLocaleString()),
        datasets: [{
          label: 'Temperatur',
          data: deviceData.filter(d => d.sensorType === 'temperature').map(d => d.value),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }, {
          label: 'Feuchtigkeit',
          data: deviceData.filter(d => d.sensorType === 'humidity').map(d => d.value),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
</script>

<canvas bind:this={chartContainer}></canvas>
