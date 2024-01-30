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
  import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte'
  import MdDeviceHub from 'svelte-icons/md/MdDeviceHub.svelte'
  import MdPictureInPicture from 'svelte-icons/md/MdPictureInPicture.svelte'
  import IoMdLogOut from 'svelte-icons/io/IoMdLogOut.svelte'
  //import IoMdPerson from 'svelte-icons/io/IoMdPerson.svelte'

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
    isLoggedIn.set(false);
    localStorage.clear();
    push("/login").then(() => {
      window.location.reload();
    });
  }
</script>

<footer>
  {#if $isLoggedIn}
    <a href="#/raumdata" class="footer-link">
      <MdPictureInPicture style="width: 24px; height: 24px;"/>
      <span class="footer-text">Rooms</span>
    </a>
    <a href="#/data" class="footer-link">
      <MdDeviceHub style="width: 24px; height: 24px;"/>
      <span class="footer-text">Geräte</span>
    </a>
    <a href="#/addesp" class="footer-link">
      <IoIosAddCircleOutline style="width: 24px; height: 24px;"/>
      <span class="footer-text">Hinzufügen</span>
    </a>
    <!-- <a href="#/login" on:click={logoutUser}><IoMdLogOut/></a> -->
  {:else}
    <a href="#/login" style="color: white;">Login</a>
    <a href="#/register" style="color: white;">Register</a>
  {/if}
</footer>
<main>
  <Router {routes} />
</main>

<style>

  :global(#small-button) {
  --unit: 40px;
  padding: var(--unit);
  height: calc(4 * var(--unit));
  width: calc(4 * var(--unit));
}

:global(#small-button svg) {
  width: calc(2 * var(--unit));
  height: calc(2 * var(--unit));
}

  footer {
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    display: flex;
    justify-content: space-around;
    background-color: #007bff;
    padding: 10px 0;
    text-align: center;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 8%;
    z-index: 2;
  }

  .footer-link {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgb(202, 202, 202);
  }

  .footer-link span {
    font-size: 12px;
    margin-top: 2px;
  }

  footer a:hover {
    color: #ffffff;
    text-decoration: none;
  }

  .footer-text {
    font-size: 12px;
    margin-top: 2px;
    font-weight: normal; /* Startwert */
  }

  .footer-link:hover .footer-text {
    font-weight: bold; /* Ändern Sie dies nach Bedarf */
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