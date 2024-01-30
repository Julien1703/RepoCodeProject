<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import axios from 'axios';
  import io from 'socket.io-client';



  export let params = {}; // Empfange die Routenparameter
  let temperatureChartContainer;
  let humidityChartContainer;
  let dustChartContainer;
  let co2ChartContainer;
  let temperatureChartInstance;
  let humidityChartInstance;
  let dustChartInstance;
  let co2ChartInstance;
  let deviceData = [];

  let liveTemperature, liveHumidity, liveDust, liveCo2;
  const socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('WebSocket verbunden');
  });

  socket.on('liveData', (data) => {
  console.log(data);
  if (data.topic === "dp2/temperature") {
    liveTemperature = data.data.temperature;
  } else if (data.topic === "dp2/humidity") {
    liveHumidity = data.data.humidity;
  } else if (data.topic === "dp2/dust") {
    liveDust = data.data.dust;
  } else if (data.topic === "dp2/co2") {
    liveCo2 = data.data.co2;
  }
  // Fügen Sie hier ähnliche Bedingungen für Staub und CO2 hinzu
});
  

  const fetchData = async () => {
    try {
      const mac = params.mac;
      const response = await axios.post(`http://localhost:3000/devicedata/${mac}`);
      deviceData = response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Gerätedaten:', error);
    }
  };

  const createChart = (chartContainer, label, filterType, borderColor, backgroundColor) => {
    const ctx = chartContainer.getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: deviceData.map(data => new Date(data.timestamp).toLocaleString()),
        datasets: [{
          label: label,
          data: deviceData.filter(d => d.sensorType === filterType).map(d => d.value),
          borderColor: borderColor,
          backgroundColor: backgroundColor,
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
  };

  onMount(() => {
    fetchData();
  });

  $: if (deviceData.length > 0) {
    if (temperatureChartInstance) {
      temperatureChartInstance.destroy();
    }
    if (humidityChartInstance) {
      humidityChartInstance.destroy();
    }
    if (dustChartInstance) {
      dustChartInstance.destroy();
    }
    if (co2ChartInstance) {
      co2ChartInstance.destroy();
    }

    temperatureChartInstance = createChart(temperatureChartContainer, 'Temperatur', 'temperature', 'rgb(255, 99, 132)', 'rgba(255, 99, 132, 0.5)');
    humidityChartInstance = createChart(humidityChartContainer, 'Feuchtigkeit', 'humidity', 'rgb(54, 162, 235)', 'rgba(54, 162, 235, 0.5)');
    dustChartInstance = createChart(dustChartContainer, 'Staub', 'dust', 'rgb(153, 102, 255)', 'rgba(153, 102, 255, 0.5)');
    co2ChartInstance = createChart(co2ChartContainer, 'CO2', 'co2', 'rgb(75, 192, 192)', 'rgba(75, 192, 192, 0.5)');
  }
</script>

<canvas bind:this={temperatureChartContainer}></canvas>
<p>Live Temperatur: {liveTemperature}°C</p>
<canvas bind:this={humidityChartContainer}></canvas>
<p>Live Luftfeuchtigkeit: {liveHumidity}%</p>
<canvas bind:this={dustChartContainer}></canvas>
<p>Live Staub: {liveDust} μg/m³</p>
<canvas bind:this={co2ChartContainer}></canvas>
<p>Live CO2: {liveCo2} ppm</p>
