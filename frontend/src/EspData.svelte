<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { push } from 'svelte-spa-router';


  let sensorData = [];

  onMount(async () => {
    try {
      const response = await axios.post('http://localhost:3000/data');
      console.log('Token-Verifizierung:', response);
      sensorData = response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Sensor-Daten:', error);
    }
  });

  const viewDeviceData = (mac) => {
    push(`#/devicedata/${mac}`); // Ändern Sie dies entsprechend Ihrer Routing-Logik
  };
</script>
<style>
  .esp-container {
    display: flex;
    justify-content: space-between; /* Stellt den Abstand zwischen den Elementen ein */
    align-items: center;
    margin: 10px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #e0f7fa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .esp-data {
    margin-right: 20px; /* Fügt Abstand zwischen Text und Button hinzu */
  }

  button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 16px;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>



<!-- HTML Teil -->

{#if sensorData.length > 0}
  <h2>Device auflistung</h2>
  {#each sensorData as data}
    <div class="esp-container">
      <p class="esp-data">{data.sensorType}: {data.value} - {new Date(data.timestamp).toLocaleString()}</p>
      <button on:click={() => viewDeviceData(data.mac)}>Gerätedaten anzeigen</button>
    </div>
  {/each}
{:else}
  <p>Keine Daten verfügbar.</p>
{/if}
