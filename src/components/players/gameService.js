import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/game";


export function startGame() {
    return http.get(apiEndpoint+ "/start");
}

export function resetGame() {
    return http.get(apiEndpoint+ "/reset");
}

export function endGame() {
    return http.get(apiEndpoint+ "/end");
}
export function getGameStatus(){
    return http.get(apiEndpoint+"/state");
}
