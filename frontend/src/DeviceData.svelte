//dynamische Charts

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
  const macAddressOfCurrentDevice = params.mac; // Die MAC-Adresse des aktuellen Geräts

  socket.on('connect', () => {
    console.log('WebSocket verbunden');
  });


  socket.on('liveData', (data) => {
    // Überprüfen, ob die Daten vom aktuellen Gerät stammen
    if (data.mac === macAddressOfCurrentDevice) {
      console.log("Live-Daten empfangen:", data.data.sensorType);
      let newDataPoint;
      let chartInstance;

      switch(data.data.sensorType) {
        case "temperature":
          liveTemperature = parseFloat(data.data.value).toFixed(2);
          newDataPoint = { x: new Date(), y: liveTemperature };
          chartInstance = temperatureChartInstance;
          console.log("Live-Temperatur:", liveTemperature);
          break;
        case "humidity":
          liveHumidity = parseFloat(data.data.value).toFixed(2);
          newDataPoint = { x: new Date(), y: liveHumidity };
          chartInstance = humidityChartInstance;
          console.log("Live-Luftfeuchtigkeit:", liveHumidity);
          break;
        case "dust":
          liveDust = parseFloat(data.data.value).toFixed(2);
          newDataPoint = { x: new Date(), y: liveDust };
          chartInstance = dustChartInstance;
          console.log("Live-Staub:", liveDust);
          break;
        case "co2":
          liveCo2 = parseFloat(data.data.value).toFixed(2);
          newDataPoint = { x: new Date(), y: liveCo2 };
          chartInstance = co2ChartInstance;
          console.log("Live-CO2:", liveCo2);
          break;
      }

      if (chartInstance) {
        updateChartData(chartInstance, newDataPoint);
      }
    }
  });
  function updateChartData(chart, newDataPoint) {
    chart.data.labels.push(newDataPoint.x.toLocaleString());
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(newDataPoint.y);
    });

    // Beschränken Sie die Anzahl der angezeigten Datenpunkte
    if (chart.data.labels.length > 60) {
      chart.data.labels.shift();
      chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
      });
    }

    chart.update();
  }


  const fetchData = async () => {
  try {
    const mac = params.mac;
    if (!mac) {
      console.error('Keine MAC-Adresse bereitgestellt');
      return;
    }
    const response = await axios.post(`http://localhost:3000/devicedata/${mac}`);
    deviceData = response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Gerätedaten:', error);
  }
};

  const createChart = (chartContainer, label, filterType, borderColor, backgroundColor, yMin, yMax) => {
    const ctx = chartContainer.getContext('2d');
    const filteredData = deviceData.filter(d => d.sensorType === filterType);
    const limitedData = filteredData.slice(Math.max(filteredData.length - 60, 0));

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: limitedData.map(data => new Date(data.timestamp).toLocaleString()),
        datasets: [{
          label: label,
          data: limitedData.map(d => d.value),
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            min: yMin,
            max: yMax
          },
          x: {
            ticks: {
              callback: function(value, index, values) {
                if (index === 0 || index === values.length - 1) {
                  return value;
                }
                return null;
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
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

    humidityChartInstance = createChart(humidityChartContainer, 'Luftfeuchtigkeit', 'humidity', 'rgb(54, 162, 235)', 'rgba(54, 162, 235, 0.5)', 0, 100);
    temperatureChartInstance = createChart(temperatureChartContainer, 'Temperatur', 'temperature', 'rgb(255, 99, 132)', 'rgba(255, 99, 132, 0.5)', 0, 40);
    dustChartInstance = createChart(dustChartContainer, 'Staub', 'dust', 'rgb(153, 102, 255)', 'rgba(153, 102, 255, 0.5)', 0, 100);
    co2ChartInstance = createChart(co2ChartContainer, 'CO2', 'co2', 'rgb(75, 192, 192)', 'rgba(75, 192, 192, 0.5)', 0, 5000);
   }
</script>

<style>
  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chart-card {
    width: 90%; /* Breite der Karten anpassen */
    margin: 10px 0;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 10px;
    box-sizing: border-box;
  }

  .chart-title {
    text-align: center;
    margin-bottom: 10px;
    font-weight: bold;
  }

  canvas {
    max-width: 100%;
    height: auto;
  }
</style>

<div class="chart-container">
  <div class="chart-card">
    <div class="chart-title">Temperatur</div>
    <canvas bind:this={temperatureChartContainer}></canvas>
    <p>Live Temperatur: {liveTemperature}°C</p>
  </div>
  <div class="chart-card">
    <div class="chart-title">Luftfeuchtigkeit</div>
    <canvas bind:this={humidityChartContainer}></canvas>
    <p>Live Luftfeuchtigkeit: {liveHumidity}%</p>
  </div>
  <div class="chart-card">
    <div class="chart-title">Staub</div>
    <canvas bind:this={dustChartContainer}></canvas>
    <p>Live Staub: {liveDust} μg/m³</p>
  </div>
  <div class="chart-card">
    <div class="chart-title">CO2</div>
    <canvas bind:this={co2ChartContainer}></canvas>
    <p>Live CO2: {liveCo2} ppm</p>
  </div>
</div>
