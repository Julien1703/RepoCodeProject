<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { push } from 'svelte-spa-router';
  import { isLoggedIn, token } from './store';

  let raumData = [];

  onMount(async () => {
    if (!$isLoggedIn) {
      push('/login');
    } else {
      try {
        const response = await axios.get('http://localhost:3000/raumdata', {
          headers: {
            Authorization: `Bearer ${$token}`
          }
        });
        raumData = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Raum-Daten:', error);
      }
    }
  });

  const viewDetailsForRoom = (mac) => {
    push(`/devicedata/${mac}`);
  };
</script>

<style>
  .raum-container {
    display: flex;
    flex-direction: column; /* Ändern der Flex-Richtung auf Spalte */
    align-items: flex-start; /* Ausrichtung der Elemente am Anfang */
    margin: 15px 5px;
    padding: 30px;
    padding-top: 20px;
    border-radius: 15px;
    background-color: #f5f5f5;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Schatten hinzufügen */
    transition: all 0.3s ease;
  }

  .raum-container:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px);
  }

  .raum-data {
    font-size: 20px;
    color: #333;
    margin-bottom: 30px; /* Abstand zwischen Text und Button */
  }

  button {
    width: 100%; /* Button nimmt die volle Breite des Containers ein */
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s, transform 0.3s;
  }

  button:hover {
    background-color: #0056b3;
    transform: scale(1.1);
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

