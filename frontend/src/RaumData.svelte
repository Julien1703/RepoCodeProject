<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { push } from 'svelte-spa-router';
  import { isLoggedIn } from './store';

  let raumData = [];

  onMount(async () => {
    try {
      const response = await axios.get('http://localhost:3000/raumdata');
      raumData = response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Raum-Daten:', error);
    }
  });

  const viewDetailsForRoom = (mac) => {
    push(`/devicedata/${mac}`);
  };
  
</script>

<style>
  .raum-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #e0f7fa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .raum-data {
    margin-right: 20px;
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
<div>
  {#if raumData.length > 0}
    <h2>Raum Auflistung</h2>
    {#each raumData as raum}
      <div class="raum-container">
        <p class="raum-data">{raum._id}</p>
        <!-- Annahme: raum.devices enthält eine Liste der Geräte im Raum -->
        {#if raum.devices.length > 0}
          <button on:click={() => viewDetailsForRoom(raum.devices[0].mac)}>
            Weitere Details
          </button>
        {:else}
          <p>Keine Geräte vorhanden</p>
        {/if}
      </div>
    {/each}
  {:else}
    <p>Keine Räume verfügbar.</p>
  {/if}
</div>

