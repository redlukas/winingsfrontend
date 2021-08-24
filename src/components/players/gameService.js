import http from "./httpService";
import { apiIP, apiPort } from "../config.json";

function getApiEndpoint(){
    let ip = apiIP;
    let port = apiPort;
    if(ip==="ipgoeshere"){
        ip="127.0.0.1";
    }
    if(port==="portgoeshere"){
        port="8888";
    }
    return `http://${ip}:${port}/api/game`;
}

export function startGame() {
    return http.get(getApiEndpoint()+ "/start");
}

export function resetGame() {
    return http.get(getApiEndpoint()+ "/reset");
}

export function endGame() {
    return http.get(getApiEndpoint()+ "/end");
}

export function setBet(betAmount){
    return http.post(getApiEndpoint() + "/bet", {bet:betAmount});
}

export function setWinning(rank, percentage){
    return http.post(getApiEndpoint() + "/winnings", {rank:rank, percentage:percentage})
}

export function resetWinnings(){
    return http.get(getApiEndpoint() + "/winnings/reset")
}

export function getWinnings(){
    return http.get(getApiEndpoint() + "/winnings")
}

export function getEarnings(){
    return http.get(getApiEndpoint() + "/earnings")
}

export function getGame(){
    return http.get(getApiEndpoint())
}

export function setDeuceEarnings(amount){
    return http.post(getApiEndpoint() + "/deuceearnings", {amount: amount})
}
