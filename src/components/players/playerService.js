import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/players";

function playerUrl(id) {
    return `${apiEndpoint}/${id}`;
}

export function getPlayers() {
    return http.get(apiEndpoint);
}

export function getPlayer(movieId) {
    return http.get(playerUrl(movieId));
}

export function createPlayer(playerName) {
    return http.post(apiEndpoint, playerName);
}

export function togglePlayStatus(playerId) {
    return http.get(apiEndpoint + "/togglePlaying/" + playerId);
}

export function addDeuce(playerId){
    return http.get(apiEndpoint + "/deuce/" + playerId)
}
