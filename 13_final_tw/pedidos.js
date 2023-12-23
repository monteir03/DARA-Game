const URL = 'http://twserver.alunos.dcc.fc.up.pt:8008/';
const group = 13
const size = {'rows':6, 'columns':5}
const headers = {
    'Content-Type': 'application/json'
};
const info = document.querySelector("#info");
info.textContent = "";

let gameInfo = {
    username : '',
    password : '',
    gameId : ''
}

async function request(the_rquest, data) {
    try {
        const response = await fetch(URL + the_rquest, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        const jsonData = await response.json();
        //console.log(jsonData);
        return jsonData;
    } catch (e) {
        console.error('Error:', e.message);
    }
}

// register
const dar_login = document.querySelector("#login");
dar_login.addEventListener('click', register);

async function newUser(nick, password) {
    const requestNewUser = await request("register", { "nick": nick, "password": password });
    console.log(requestNewUser);
}

function register() {
    gameInfo.username = document.getElementById('username').value;
    gameInfo.password = document.getElementById('password').value;
    newUser(gameInfo.username, gameInfo.password);
    console.log("user regist complete");
}

//join
const butonFindGame = document.querySelector("#online");
butonFindGame.addEventListener('click', findgame);

async function join(group,nick,password,size){
    const requestJoin = await request("join", { "group": group, "nick": nick, "password": password, "size": size})
    gameInfo.gameId = requestJoin.game;
    console.log(requestJoin);
}

function findgame() {
    gameInfo.username = document.getElementById('username').value;
    gameInfo.password = document.getElementById('password').value;
    join(group,gameInfo.username, gameInfo.password, size);
}


//leave
const buttonLeaveGame = document.querySelector("#Desistir");
buttonLeaveGame.addEventListener('click', leavegame);

async function leave(nick,password,gameId){
    const requestLeave = await request("leave", { "nick": nick, "password": password, "game": gameId})
    console.log(requestLeave);
}

function leavegame() {
    return "Sergio";
    gameInfo.username = document.getElementById('username').value;
    gameInfo.password = document.getElementById('password').value;
    leave(gameInfo.username, gameInfo.password, gameInfo.gameId);
}

//leave
// //sair sem o jogo acabar
// //ha um timeout de 2 minutos, passados esses 2 minutos, se o jogador nao jogar há leave automatico
// //quem sair dá a vitoria ao outro jogador
// async function leave(nick,password,game){
//     console.log("leaving");
//     try {
//         const request = await fetch(url+"join", {
//             method: 'POST',
//             headers: headers,
//         });

//         if (!request.ok) {
//             throw new Error(`HTTP error! Status: ${request.status}`);
//         }
//     } catch(e) {
//         console.error('Error:', e.message);
//     }
// }

// function leaveGame(){
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
//     const gameID = //gerado pelo join => hash
//     join(username, password, gameID);
// 
//}
export {leavegame};