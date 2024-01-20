<script>
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { isLoggedIn, token } from './store';
  
  let username = "";
  let password = "";

  async function loginUser() {
      try {
          const response = await axios.post("http://localhost:3001/login", { username, password });
          console.log("Login erfolgreich:", response);
          token.set(response.data.token);
          isLoggedIn.set(true);
          push("/data");
      } catch (error) {
          console.error("Fehler beim Login:", error);
      }
  }

  // axios interceptor for JWT:
  axios.interceptors.request.use((config) => {
      config.headers.authorization = `Bearer ${$token}`;
      return config;
  }, (error) => {
      return Promise.reject(error);
  });
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center; /* Zentriert den Inhalt vertikal */
    background-color: #f4f4f4;
    padding: 20px; /* Verhindert, dass der Inhalt direkt am Rand des Bildschirms ist */
    box-sizing: border-box;
  }
  
  form {
    width: 400px;
    margin-top: 90px;
    padding: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
    label {
      display: block;
      margin-bottom: 10px; /* Größerer Abstand */
      color: #333; /* Dunklere Schriftfarbe für bessere Lesbarkeit */
      font-size: 16px; /* Größere Schrift */
      text-align: left; /* Labels linksbündig ausrichten */

    }
  
    input {
      width: 100%;
      padding: 12px; /* Größerer Innenabstand */
      margin-bottom: 20px; /* Größerer Abstand zwischen den Feldern */
      border: 1px solid #bbb; /* Leichtere Grenzfarbe */
      border-radius: 4px;
      font-size: 16px; /* Größere Schrift */
    }
  
    button {
    width: 100%; /* Breite des Buttons und der Inputfelder gleich setzen */
      padding: 12px; /* Größerer Innenabstand */
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
  
  <div class="container">
    {#if !$isLoggedIn}
        <form on:submit|preventDefault={loginUser}>
        <h1>Login</h1>

        <div>
          <label for="username">Benutzername:</label>
          <input id="username" type="text" bind:value={username} />
        </div>
        <div>
          <label for="password">Passwort:</label>
          <input id="password" type="password" bind:value={password} />
        </div>
        <button type="submit">Einloggen</button>
      </form>
    {:else}
      <!-- <AddEsp {$username} /> -->
      <!-- <button on:click={logoutUser}>Ausloggen</button> -->
    {/if}
  </div>
  