import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/game";

export function getEnvironmentVariables() {
    console.log("Environment variables: ", process.env)
}

export function startGame() {
    return http.get(apiEndpoint+ "/start");
}

export function resetGame() {
    return http.get(apiEndpoint+ "/reset");
}

export function endGame() {
    return http.get(apiEndpoint+ "/end");
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

export function getGame(){
    return http.get(apiEndpoint)
}

export function setDeuceEarnings(amount){
    return http.post(apiEndpoint + "/deuceearnings", {amount: amount})
}
