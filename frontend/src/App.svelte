<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from "svelte-spa-router";
  import EspData from "./EspData.svelte";
  import DeviceData from "./DeviceData.svelte";
  import AddEsp from "./AddEsp.svelte";
  import RaumData from "./RaumData.svelte";
  import { isLoggedIn } from "./store";
  import { push } from "svelte-spa-router";

  const routes = {
    "/": Login,
    "/login": Login,
    "/register": Register,
    "/data": EspData,
    "/addesp": AddEsp,
    "/devicedata/:mac": DeviceData,
    "/raumdata": RaumData,
  };

  function logoutUser() {
    // isLoggedIn.update(prev=>false);
    isLoggedIn.set(false);
    localStorage.clear();
    push("/login").then(() => {
      window.location.reload();
    });
  }
</script>

<footer>
  {#if $isLoggedIn}
    <a href="#/raumdata">Räume</a>
    <a href="#/data">Devices</a>
    <a href="#/addesp">Device hinzufügen</a>
    <a href="#/login" on:click={logoutUser}>Logout</a>
  {:else}
    <a href="#/login">Login</a>
    <a href="#/register">Register</a>
  {/if}
</footer>

<main>
  <Router {routes} />
</main>

<style>
  footer {
    background-color: #007bff;
    padding: 10px 0;
    text-align: center;
    position: fixed;
    bottom: 0;
    width: 100%;
  }

  footer a {
    color: white;
    margin: 0 15px;
    text-decoration: none;
    font-size: 18px;
    transition: color 0.3s ease;
  }

  footer a:hover {
    color: #ccc;
    text-decoration: underline;
  }

  main {
    padding: 20px;
    text-align: center;
    margin-bottom: 60px; /* Platz für den Footer */
  }

  :global(html), :global(body) {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    color: #333;
  }
</style>
