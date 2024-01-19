import { writable } from "svelte/store";

export const isLoggedIn = writable(false);
export const jwtToken = writable("");
export const token = writable("");
export const username = writable("");
export const macAddress = writable("");
export const devicename = writable("");
export const raum = writable("");
