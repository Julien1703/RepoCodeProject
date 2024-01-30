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

  // Funktion zum Ermitteln des Bildpfads basierend auf dem Raumnamen
  const getImagePath = (raum) => {
    const raumName = raum?._id || 'Raum'; // Falls _id nicht vorhanden ist, 'Raum' verwenden
    console.log(raumName); 
    const lowerRaumName = raumName.toLowerCase();
    const imagePath = `images/${lowerRaumName}.jpg`;

    // Überprüfen, ob das Bild vorhanden ist, sonst 'Raum.jpg' verwenden
    return imageExists(imagePath) ? imagePath : 'images/raum.jpg';
  };

  // Funktion zum Überprüfen, ob eine Bilddatei existiert
  const imageExists = (imagePath) => {
    const http = new XMLHttpRequest();

    http.open('HEAD', imagePath, false);
    http.send();

    return http.status !== 404;
  };

</script>

<style>
  .raum-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 15px 5px;
    padding: 0px;
    padding-top: 0px;
    border-radius: 15px;
    background-color: #f5f5f5;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative; /* Positionierung für das Hintergrundbild */
    overflow: hidden; /* Verhindert das Überlaufen des Hintergrundbilds */
    z-index: 0;
  }

  .raum-container:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px);
  }

  .raum-data {
    font-size: 20px;
    color: #333;
    padding: 15px 20px 10px;
    margin: 0; /* Setze den margin auf 0 */
    margin-bottom: 0px;
  }

  button {
    width: 285px;
    padding: 15px 24px;
    border: none;
    border-radius: 10px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 16px;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 46px;
    margin-bottom: 15px;
    z-index: 1;
    transition: background-color 0.3s, transform 0.3s;
  }

  button:hover {
    background-color: #0056b3;
    transform: scale(1.1);
  }

  .raum-background {
    width: 100%;
    height: 120px;
    background-size: cover; /* Bild wird skaliert, um die Höhe zu füllen, und beschnitten, um zum Seitenverhältnis zu passen */
    background-position: center; /* Zentriert das Bild im Container */
    background-repeat: no-repeat; /* Verhindert das Wiederholen des Bilds */
    position: relative;
  overflow: hidden;
  box-shadow: inset 0 10px 10px -10px rgba(0, 0, 0, 0.5), inset 0 -10px 10px -10px rgba(0, 0, 0, 0.5);
  }
</style>

<!-- HTML Teil -->
<div>
  {#if raumData.length > 0}
    <h2>Deine ærooms</h2>
    {#each raumData as raum}
      <div class="raum-container">
        <p class="raum-data">{raum?._id}</p>
        <div class="raum-background" style={`background-image: url(${getImagePath(raum)})`}></div>
        <!-- Annahme: raum.devices enthält eine Liste der Geräte im Raum -->
        {#if raum.devices.length > 0}
          <button on:click={() => viewDetailsForRoom(raum.devices[0].mac)}>
            Daten ansehen
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
