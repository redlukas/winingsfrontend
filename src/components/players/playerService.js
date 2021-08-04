import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/players";

function playerUrl(id) {
    return `${apiEndpoint}/${id}`;
}

export function getPlayers() {
    return http.get(apiEndpoint);
}

export function getPlayer(playerID) {
    return http.get(playerUrl(playerID));
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

export function deletePlayer(playerID){
    return http.delete(playerUrl(playerID))
}
