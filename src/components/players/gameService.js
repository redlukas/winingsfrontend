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

export function setBet(betAmount){
    return http.post(apiEndpoint + "/bet", {bet:betAmount});
}

export function setWinning(rank, percentage){
    return http.post(apiEndpoint + "/winnings", {rank:rank, percentage:percentage})
}

export function resetWinnings(){
    return http.get(apiEndpoint + "/winnings/reset")
}

export function getWinnings(){
    return http.get(apiEndpoint + "/winnings")
}

export function getEarnings(){
    return http.get(apiEndpoint + "/earnings")
}
