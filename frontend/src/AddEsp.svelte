<script>
    import axios from 'axios';
    import {username,} from './store'

    // export let username = '';

    let devicename = '';
     let raum  = '';
    let macAddress = '';

    async function addEspDevice() {
        try {
            console.log(`mac: ${macAddress}, username: ${$username}`);
            const response = await axios.post('http://localhost:3000/add-esp-device', {
                mac: macAddress,
                username: $username,
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

<form on:submit|preventDefault={addEspDevice}>
    <div>
        <label for="devicename">Geben Sie den Namen des gerätes an</label>
        <input id="devicename" type="text" bind:value={devicename} />
    </div>
    <div>
        <label for="macAddress">MAC-Adresse:</label>
        <input id="macAddress" type="text" bind:value={macAddress} />
    </div>
    <div>
        <label for="raum">Geben Sie den Raum an in dem sie das gerät haben</label>
        <input id="raum" type="text" bind:value={raum} />
    </div>
    <button type="submit">ESP-Gerät hinzufügen</button>
</form>
