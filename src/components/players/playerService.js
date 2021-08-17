import http from "./httpService";
import { apiIP } from "../config.json";

function getApiEndpoint(){
    let ip = apiIP;
    if(ip==="$IP"){
        ip="127.0.0.1";
    }
    return `http://${ip}:8888/api/players`;
}

function playerUrl(id) {
    return `${getApiEndpoint()}/${id}`;
}

export function getPlayers() {
    return http.get(getApiEndpoint());
}

export function getPlayer(playerID) {
    return http.get(playerUrl(playerID));
}

export function createPlayer(playerName) {
    return (http.post(getApiEndpoint(), {name: playerName}));
}

export function togglePlayStatus(playerId) {
    return http.get(getApiEndpoint() + "/togglePlaying/" + playerId);
}

export function addDeuce(playerId){
    return http.get(getApiEndpoint() + "/deuce/" + playerId)
}

export function deletePlayer(playerID){
    return http.delete(playerUrl(playerID))
}
