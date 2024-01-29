<script>
    import axios from 'axios';
    import {username,} from './store'
    let devicename = '';
     let raum  = '';
    let macAddress = '';

    async function addEspDevice() {
        try {
            console.log(`mac: ${macAddress}, username: ${$username}`);
            const response = await axios.post('http://localhost:3000/add-esp-device', {
                mac: macAddress,
                username: username,
                devicename: devicename,
                raum: raum,
            });
            console.log('ESP-Gerät hinzugefügt:', response);
            macAddress = ''; // MAC-Adresse zurücksetzen
            devicename = ''; // MAC-Adresse zurücksetzen
            raum = ''; // MAC-Adresse zurücksetzen
            console.log({ mac: macAddress, username });

        } catch (error) {
            console.log('Fehler beim Hinzufügen des ESP-Geräts:', error.response.data);
            console.error(error);
        }
    }
</script>

<div class="container">
<form on:submit|preventDefault={addEspDevice}>
        <h1>ESP-Gerät hinzufügen</h1>
    <div>
        <input id="devicename" placeholder="Gerätename" type="text" bind:value={devicename} />
    </div>
    <div>
       
        <input id="macAddress" placeholder="MAC-Adresse" type="text" bind:value={macAddress} />
    </div>
    <div>
        <input id="raum" placeholder="Raum" type="text" bind:value={raum} />
    </div>
    <button type="submit">ESP-Gerät hinzufügen</button>
</form>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center; /* Zentriert den Inhalt vertikal */
    background-color: #f4f4f4;
    padding: 0px; /* Verhindert, dass der Inhalt direkt am Rand des Bildschirms ist */
    box-sizing: border-box;
  }
  
  form {
    width: 400px;
    margin-top: 90px;
    padding: 40px;
    border: 1px solid white;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 8px rgba(152, 152, 152, 0.1);
  }
  
    input {
    width: calc(100% - 0px);
    box-sizing: border-box;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #bbb;
    border-radius: 4px;
    font-size: 16px;
    &:focus {
      border-color: #007bff;
      outline: none;
    }

    /* Neue Regel für den Placeholder im Fokus */
    &::placeholder {
      transition: transform 0.3s ease-out;
    }

    &:focus::placeholder {
      transform: translateY(-16px);
      font-size: 11px;
    }
  }
  
    button {
    width: 100%; /* Breite des Buttons und der Inputfelder gleich setzen */
    box-sizing: border-box;
      padding: 14px; /* Größerer Innenabstand */
      margin-top: 20px;
      margin-bottom: 15px; /* Abstand zwischen den Feldern */
      border: none;
      background-color: #007bff; /* Blaue Farbe, passend zum App-Layout */
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px; /* Größere Schrift */
    }
  
    button:hover {
      background-color: #0056b3;
    }
    :global(h1){
      text-align: center;
      margin-top: 1px;
      margin-bottom: 40px;
    }
  </style>
