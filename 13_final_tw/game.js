let gameInfo = {
    username : '',
    password : '',
    gameId : '',
    lastMove : '',
    color: '',
    online: false
}
const board = document.querySelector("#board")              //board representa o tabuleiro
const infoDisplay = document.querySelector("#info")         //informador dinamico do jogo num paragrafo
const warningDisplay = document.querySelector("#warning")   //serve para alertar sobre o jogo
const blackStack = document.querySelector(".blackstack")    //espaco das pecas pretas
const whiteStack = document.querySelector(".whitestack")    //espaco das pecas brancas


//notifyAfterMove(1); // 1 = index da nova posição da peça
// Função a ser chamada no momento de definição de index de colocação da peça


let lets_PLAY = false

//auxilio de remocao
let remove = false;
let removed = 0;

//contador de pecas
let blackOut = 12            
let whiteOut = 12

//jogador inicial
let go = "white";
  
//matrix de abstracao // 6X5
const startCells = [
    '','','','','',
    '','','','','',
    '','','','','',
    '','','','','',
    '','','','','',
    '','','','',''
] 

// criar board e pecas
function createBoard(){
    startCells.forEach((_cell, index) => { 
        const cellElement = document.createElement("div");
        cellElement.classList.add("square")
        cellElement.id = index;
        cellElement.addEventListener("click", play) //funcao play recebe como argumento o elemento onde cliquei
        board.append(cellElement)
    })
}

function createBlackStack(){
    for (let i = 0; i < 12; i++) {
        const blackDiv = document.createElement('div');     // Cria um novo elemento div
        blackDiv.classList.add('black');                    // Adiciona a classe "black" ao elemento div
        blackStack.appendChild(blackDiv);                   // Adiciona o elemento div  div "blackstack"
    }
}

function createWhiteStack(){
    for (let i = 0; i < 12; i++) {
        const whiteDiv = document.createElement('div');         // Cria um novo elemento div
        whiteDiv.classList.add('white');                        // Adiciona a classe "white" ao elemento div
        whiteStack.appendChild(whiteDiv);                       // Adiciona o elemento div  div "whitestack"
    }
}

// funcoes para remover das stacks sempre que jogamos playdrop
function removeFromWhiteStack() {
    const whitePieces = document.querySelectorAll('.whitestack .white');
    if (whitePieces.length > 0) {
        whitePieces[whitePieces.length - 1].remove();
    }
}
function removeFromBlackStack() {
    const blackPieces = document.querySelectorAll('.blackstack .black');
    if (blackPieces.length > 0) {
        blackPieces[blackPieces.length - 1].remove();
    }
}

//________AUXILIAR__FOR__DROP_________
//funcao auxiliar de conjuntos
function isSubset(subset, superset) {     
    return [...subset].every(item => superset.has(item));
}

//Por cada linha(row) ha 4 combinacoes (de posicoes relativas) tal que uma  
//jogada nao seja premitida. Cada set representa uma das combinacoes
const set1r = new Set([-1,1,2]);
const set2r = new Set([-2,-1,1]);
const set3r = new Set([-3,-2,-1]);
const set4r = new Set([1,2,3]);

//verifica se e premitido jogar neste cellid desta (row) 
function CantPlayRow(cellId, player) {      //receber o cellId e player como uma string
    let myId = parseInt(cellId);
    let row = Math.floor(myId / 5);         //numero da linha [0,5]
    let firstId = row * 5;                  //primeiro Id da linha 
    let lastId = firstId + 4;               //ltimo Id na linha
    const currentSet = new Set();           //criar um set onde vamos adicionar os ids RELATIVOS na linha respetiva que estao ocupados com player
    for(let j = -3; j <= 3; j++ ){          //percorre os id relativos possiveis
        let currentId = myId+j;
        if(currentId >= firstId && currentId <= lastId && myId!==currentId){ 
            const currentdiv = document.getElementById(currentId.toString());
            if (currentdiv && currentdiv.children && 
                currentdiv.children.length > 0 && currentdiv.children[0].classList.contains(player)){   
                currentSet.add(j)                                                  
            }
        }   
    }
    return (isSubset(set1r,currentSet) || isSubset(set2r,currentSet) || isSubset(set3r,currentSet) || isSubset(set4r,currentSet))
}

//Por coluna(col) ha 4 combinacoes (de posicoes relativas) tal que uma  
//jogada nao seja premitida. Cada set representa uma das combinacoes
const set1c = new Set([-5,5,10]);
const set2c = new Set([-10,-5,5]);
const set3c = new Set([-15,-10,-5]);
const set4c = new Set([5,10,15]);

//verifica se e premitido jogar neste cellid desta (row) 
function CantPlayCol(cellId, player) {      //receber o cellId e player como uma string
    let myId = parseInt(cellId);
    let column = myId % 5;                  // numero da coluna [0,4]
    let firstId = column;                   //primeiro Id da coluna 
    let lastId = firstId + 25;              //ultimo Id na coluna
    const currentSet = new Set();           //criar um set onde vamos adicionar os ids RELATIVOS na linha respetiva que estao ocupados com player
    for(let j = -15; j <= 15; j+=5 ){       //percorre os id relativos possiveis
        let currentId = myId+j;
        if(currentId >= firstId && currentId <= lastId && myId!==currentId){ 
            const currentdiv = document.getElementById(currentId.toString());
            if (currentdiv && currentdiv.children && 
                currentdiv.children.length > 0 && currentdiv.children[0].classList.contains(player)){   
                currentSet.add(j)                                                  
            }
        }   
    }
    return (isSubset(set1c,currentSet) || isSubset(set2c,currentSet) || isSubset(set3c,currentSet) || isSubset(set4c,currentSet))
}

//__________ALLOW__DROP______________junta as duas funcoes anteriores
function cantDropHere(cellId,player){
    return (CantPlayRow(cellId,player) || CantPlayCol(cellId,player))
}

////__________JOGABILIDADE___________
//___________inciciar_jogada_________
function play(e){
    if (lets_PLAY === true){
        warningDisplay.textContent = "" 
        if( blackOut > 0 || blackOut>0){
            playDrop(e)//quando ainda ha pecas
            //aqui vou criar a funcao grabpiece: para remover das peas nao usadas
        }
    }          
}

//_____________PLAY__DROP___________
function playDrop(e){
    
    const eId = e.target.id     //e uma string
    if(cantDropHere(eId,go)){
        warningDisplay.textContent = "Invalid Drop! 4 in line";                         
        return; // Exit the function if the move is invalid
    }
    else{
        if (go === "white") {
            removeFromWhiteStack(); // Remove uma peca do whitestack
            whiteOut--;
        } else {
            removeFromBlackStack(); // Remove uma peca do blackstack
            blackOut--;
        }
        
        const piece = document.createElement("div");
        piece.classList.add(go)
        e.target.append(piece);
        notifyAfterMove(e.target.id);
        
        if(gameInfo.online == false) go = go === "white" ? "black": "white"
        infoDisplay.textContent = "It is now "+go+"'s turn."
        e.target.removeEventListener("click", play);
    }
    if(blackOut==0 && whiteOut==0){
        prepareForPlayMove()
        warningDisplay.textContent = "Now let's move!";
    }
}

//__________PREPARE__MOVE_______
//funcao que prepara eventos para podermos jogar a fase play move
//esta foi a solucao para movermos as pecas(o desejo era clicar apenas nos quadrados o que nao foi possivel devido a event propagation que nao conseguimos limitar)
function prepareForPlayMove() {

    startCells.forEach((_cell, index) => {
        const cellElement = document.getElementById(index);
        cellElement.removeEventListener("click", play);
        cellElement.addEventListener("click", selectTo);
        // adicionar evento as pecas para move-las
        //setTimeOut para evitar erros
        setTimeout(() => {
            const whiteElements = cellElement.querySelectorAll('.white');
            whiteElements.forEach(element => {
                element.addEventListener("click", function(e) {
                    e.stopPropagation(); // Previne event propagation
                    selectFrom(e);
                });
            });

            const blackElements = cellElement.querySelectorAll('.black');
            blackElements.forEach(element => {
                element.addEventListener("click", function(e) {
                    e.stopPropagation(); // Previne event propagation
                    selectFrom(e);
                });
            });
        }, 1);
    });
}

//___________MOVE__FROM_________ 
//funcoes para mover com click
function selectFrom(e){         

    if (remove === false){                           //esta funcao seleciona a peca que queremos mover
        const parentFrom = e.target.parentNode;                 //PARENT NODE guardamos em parent o quadrado onde esta a peca
        const squares = document.querySelectorAll('.square');   
        squares.forEach(square => {
            square.classList.remove('selectedFrom');            //Remove 'selected' class from all squares
        });
        //so queremos uma peca selecionada de cada vez
        if(parentFrom && parentFrom.children && 
        parentFrom.children.length > 0 
        && parentFrom.children[0].classList.contains(go)) {

            parentFrom.classList.add('selectedFrom'); //quadrado fica selecionado
            warningDisplay.textContent = "Where you want to move the piece?";
        } 
        else {
            warningDisplay.textContent = "It's not your time to play";
        } 
    }
    else {
        removePiece(e);
        //aqui vai aconecer o remover, no final alterar para false
    }
}

//___________MOVE__TO__________
const playableSet = new Set([-1, 1, -5, 5]);   //jogadas relativas possiveis nao condicionadas
//finaliza o movimento
function selectTo(e) {
    const fromSelected = document.querySelector('.selectedFrom');           //casa de onde parte selecionada
    const toSelected = e.target;                                            //casa para onde vai
    const fromIndexId = fromSelected ? parseInt(fromSelected.id) : null;  // id from
    const toIndexId = toSelected ? parseInt(toSelected.id) : null;  // id to     //id to
    const indexDiff = toIndexId - fromIndexId;     //guardar diferenca
    
    if (fromIndexId !== null && toIndexId !== null) {
        const indexDiff = toIndexId - fromIndexId;  // guardar diferenca
    
        // Continue with your logic here
        // ...
        //condicoes que impossiblitam jogada
        if (toSelected.childElementCount > 0) {
            // Se o quadrado de destino ja estiver ocupado, exibir uma mensagem de aviso
            warningDisplay.textContent = 'That square is taken';
        } 
        else if ((   //Verifica se ha um quadrado de origem selecionado e se o quadrado de destino esta vazio
               (go === "black" && fromSelected.classList.contains('lastblack') && toSelected.classList.contains('lastblack') ) 
            || (go === "white" && fromSelected.classList.contains('lastwhite') && toSelected.classList.contains('lastwhite')) 
        )){
           //avisar que nao podemos retroceder a jogada
           warningDisplay.textContent = "you can't go back"; 
        }
        else if (ifNline(fromIndexId,toIndexId,go,4)){                              //passo como parametro o index para onde quero jogar,a vez dojogador, o tamanho da linha a verificar
            //alert para ver as regras->nao podemos ter 4 em linha
            warningDisplay.textContent = "Invalid Move! 4 in line"; 
        }
        else if(!fromSelected){
            //se ainda nao foi selecionada a peca
            warningDisplay.textContent = "Select the piece to move";
        }

        ///_______________________________AQUI____________________________________
        else {
            //Verifica se a diferenca de indices esta dentro do conjunto de movimentos permitidos
            if (playableSet.has(indexDiff)) {
                // Identifique o elemento filho a ser movido
                const childToMove = fromSelected.children[0];
                // Remova o elemento filho do quadrado de origem
                fromSelected.removeChild(childToMove);
                // Adicione o elemento filho ao quadrado de destino
                toSelected.appendChild(childToMove);

                // Remova as classes de selecao para evitar conflitos futuros
                fromSelected.classList.remove('selectedFrom');
                toSelected.classList.remove('selectedTo');

                notifyAfterMove(e.target.id)

                //______verifica_se_formou_LINHA_de_3_________
                if (n3Line(toIndexId,go)){
                    warningDisplay.textContent = 'You have 3 in line! Now Remove one!'
                    remove = true;
                    checkWin()          //ao remover posso ja ter removido 10 ent.. faço checkwin.
                }
                else{
                    //__ja_removida__
                        // Alternar o jogador
                    if (go==="white"){
                        //atualizar envolve:
                        //limpar anterior
                        const cellsWithLastWhite = document.querySelectorAll('.lastwhite');
                        cellsWithLastWhite.forEach(cell => {cell.classList.remove('lastwhite');});
                        //e adicionar novas
                        fromSelected.classList.add('lastwhite')
                        toSelected.classList.add('lastwhite')
                        if(gameInfo.online == false)go =  "black"
                    }
                    else if(go==="black"){
                        //atualizar envolve:
                        //limpar anterior
                        const cellsWithLastBlack = document.querySelectorAll('.lastblack');
                        cellsWithLastBlack.forEach(cell => {cell.classList.remove('lastblack');});
                        // e adicionar novas
                        fromSelected.classList.add('lastblack')
                        toSelected.classList.add('lastblack')
                        if(gameInfo.online == false)go =  "white"
                    }

                    infoDisplay.textContent = "It is now "+go+"'s turn."
                    checkWin()
                    check_pre_wins()
                }
            } 
            else{
                warningDisplay.textContent = 'Invalid move';
            }
        } 

    }
    else{
        warningDisplay.textContent = 'choose a piece first';
    }
}

//___________FORBIDDEN__MOVE________
//verificar se se forma linha de 4
function ifNline(fromIndexId,toIndexId,player,number){ //indice de onde vem| indice jogado| jogador |  tamanho da linha
    return (ifNline_Row(fromIndexId,toIndexId,player,number) || ifNline_Col(fromIndexId,toIndexId,player,number))
}

//verificar se se forma linha de 4 na row jogada
function ifNline_Row(fromIndexId,toIndexId,player,number){
    //verlinha
    let myId = toIndexId;
    let row = Math.floor(myId / 5);         //numero da linha [0,5]
    let firstId = row * 5;                  //primeiro Id da linha 
    let lastId = firstId + 4;    
    let counter = 0;
    for (let currentId = firstId; currentId<=lastId; currentId++){
        if( currentId === myId){
            counter++;
            if (counter === parseInt(number)){return true;} //retorna verdade se nao puder jogar
        }
        else if(currentId === fromIndexId){
            counter=0;
        }
        else{
            const currentdiv = document.getElementById(currentId.toString());
            if (currentdiv && currentdiv.children && 
                currentdiv.children.length > 0 && currentdiv.children[0].classList.contains(player)){
                counter++;
                if (counter === parseInt(number)){return true;} //retorna verdade se nao puder jogar
            }
            else{ counter = 0}
        }
    }
    return false;
}

////verificar se se forma linha de 4 na col jogada
function ifNline_Col(fromIndexId,toIndexId,player,number){
    //ver coluna
    let myId = parseInt(toIndexId);
    let column = myId % 5;                  // numero da coluna [0,4]
    let firstId = column;                   //primeiro Id da coluna 
    let lastId = firstId + 25; 
    let counter=0;
    for (let currentId = firstId; currentId<=lastId; currentId+=5){
        if( currentId === toIndexId){
            counter++;
            if (counter === parseInt(number)){return true;} //retorna verdade se nao puder jogar
        }
        else if(currentId === fromIndexId){
            counter=0;
        }
        else{
            const currentdiv = document.getElementById(currentId.toString());
            if (currentdiv && currentdiv.children && 
                currentdiv.children.length > 0 && currentdiv.children[0].classList.contains(player)){
                counter++;
                if (counter === parseInt(number)){return true;} //retorna verdade se nao puder jogar
            }
            else{ counter = 0}
        }
    }
    return false;
}

//_________3__IN__LINE__CHECK________
//nao vou aproveitar as funcoes de cima porque teria que as usar antes da acao o que pode levar a conflitos
function n3Line(toIndexId,player){
    return (nLine_Row(toIndexId,player) || nLine_Col(toIndexId,player))
}

//possiveis combinacoes relativas para formar linha de 3 na row
const line1r = new Set([-1,1]);
const line2r = new Set([-2,-1]);
const line3r = new Set([1,2]);

//_verificar_linha_
function nLine_Row(toIndexId,player){ //aqui o number serao 3.
    let myId = parseInt(toIndexId);
    let row = Math.floor(myId / 5);         //numero da linha [0,5]
    let firstId = row * 5;                  //primeiro Id da linha 
    let lastId = firstId + 4;               //ltimo Id na linha
    const currentSet = new Set();           //criar um set onde vamos adicionar os ids RELATIVOS na linha respetiva que estao ocupados com player
    for(let j = -2; j <= 2; j++ ){          //percorre os id relativos possiveis
        let currentId = myId+j;
        if(currentId >= firstId && currentId <= lastId && myId!==currentId){ 
            const currentdiv = document.getElementById(currentId.toString());
            if (currentdiv && currentdiv.children && 
                currentdiv.children.length > 0 && currentdiv.children[0].classList.contains(player)){   
                currentSet.add(j)                                                  
            }
        }   
    }
    return (isSubset(line1r,currentSet) || isSubset(line2r,currentSet) || isSubset(line3r,currentSet))
}

//possiveis combinacoes para linha de 3 a column
const line1c = new Set([-5,5]);
const line2c = new Set([-10,-5]);
const line3c = new Set([5,10]);
function nLine_Col(toIndexId,player){
    let myId = parseInt(toIndexId);
    let column = myId % 5;                  // numero da coluna [0,4]
    let firstId = column;                   //primeiro Id da coluna 
    let lastId = firstId + 25;              //ultimo Id na coluna
    const currentSet = new Set();           //criar um set onde vamos adicionar os ids RELATIVOS na linha respetiva que estao ocupados com player
    for(let j = -10; j <= 10; j+=5 ){       //percorre os id relativos possiveis
        let currentId = myId+j;
        if(currentId >= firstId && currentId <= lastId && myId!==currentId){ 
            const currentdiv = document.getElementById(currentId.toString());
            if (currentdiv && currentdiv.children && 
                currentdiv.children.length > 0 && currentdiv.children[0].classList.contains(player)){   
                currentSet.add(j)                                                  
            }
        }   
    }
    return (isSubset(line1c,currentSet) || isSubset(line2c,currentSet) || isSubset(line3c,currentSet))
}

//preparar remocao da peca do tabuleiro
function removePiece(e){
    const son = e.target;
    const parent = son.parentNode; 
    const prejudicado = go === "white" ? "black" : "white";
    if (son.classList.contains(prejudicado)){    
        parent.removeChild(son);
        remove = false;
        if (prejudicado === "white") {
            whiteOut++;
            addToWhiteStack();
        } else {
            blackOut++;
            addToBlackStack();
        }
        
        console.log("white: "+whiteOut+"|black"+blackOut);
        if(gameInfo.online == false) go = go=== "white" ? "black" : "white";
        infoDisplay.textContent = "It is now "+go+"'s turn.";
        warningDisplay.textContent = '';
    }
    checkWin()
}

function addToWhiteStack() {
    const whiteStack = document.querySelector('.whitestack');
    const piece = document.createElement('div');
    piece.classList.add('white');
    whiteStack.appendChild(piece);
}

function addToBlackStack() {
    const blackStack = document.querySelector('.blackstack');
    const piece = document.createElement('div');
    piece.classList.add('black');
    blackStack.appendChild(piece);
}

function checkWin(){
    if (whiteOut>=10){
        disableGameplay();
        warningDisplay.textContent = "BLACK WINS!"
        infoDisplay.textContent = "BLACK WINS!"
        getGameStatus();
     }
    else if (blackOut>=10){
        disableGameplay()
        warningDisplay.textContent = "WHITE WINS!"
        infoDisplay.textContent = "WHITE WINS!"
        getGameStatus();
    }
}

//estas funcoes nao estao a ser usadas
function disableGameplay(){
    //remover selectTo
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.removeEventListener('click', selectTo);
    }); 
    //remover selectFrom
    const whites = document.querySelectorAll('.white');
    whites.forEach(white => {
        white.removeEventListener('click', selectFrom);
    });
    const blacks = document.querySelectorAll('.black');
    blacks.forEach(black => {
        black.removeEventListener('click', selectFrom);
    });
}




//___________________________FUNCTIONS FOR PRECOCE LOSS_______________________
function get_moves(squareId){
    let myId = parseInt(squareId);  //recebe o ID do quadrado
    let row = Math.floor(myId / 5); 
    let col = myId % 5;     
    
    const moveDirections = [-5, -1, 1, 5];
    
    const set_to = new Set();
    
    for (let i = 0; i < moveDirections.length; i++){
        const to_id = moveDirections[i]+myId;
        const new_row = Math.floor(to_id / 5); 
        const new_col = to_id % 5;  
        
        if (new_row == row || new_col == col){
            // Adiciona ao conjunto apenas se o quadrado de destino não estiver ocupado
            const destinationSquare = document.getElementById(to_id.toString());
            if (destinationSquare && destinationSquare.children.length === 0) {
                set_to.add(to_id);
            }
        }
    }
    return set_to
}

//func que avalia a possibilidade de um move destino   retorna false se a peça estiver presa
function is_it_free(fromID, toSet){
    
    console.log('FromID:', fromID);
    // Check if the set of possible moves is empty
    if (toSet.size === 0) {
        return false;
    }
    
    const fromSquare = document.getElementById(fromID.toString());
    
    const possibleMoves = new Set();  // peças que passam
    // Iterate over each element in the Set
    toSet.forEach(element => {
        // verificar numero 
        
        const toID = element;
        //derivar para o square
        const toSquare = document.getElementById(toID.toString());
        
        //verificar se forma linha de quatro, recebe apenas o valor disso
        const is_line_4_value = ifNline(fromID,toID,go,4);   // não pode formar linhas de 4
        
        
        //WATCH OUT BECOUSE GO AND LASTCOLOR ARE INVERTED ALWAIYS CHECK CAN CHANGE IN THE FUTURE
        const is_last_move_value_black = (fromSquare.classList.contains('lastblack') && toSquare.classList.contains('lastblack'))
        const is_last_move_value_white = (fromSquare.classList.contains('lastwhite') && toSquare.classList.contains('lastwhite'))
        
        //invertido
        if (go==="black"){
            if (!is_last_move_value_black && !is_line_4_value){
                console.log("add",toID)
                possibleMoves.add(toID)
            }
            
        }
        //invertido
        else if (go==="white"){
            if (!is_last_move_value_white && !is_line_4_value){
                console.log("add",toID)
                possibleMoves.add(toID)
            }
        }
        
    });
    // Check if there are no possible moves
    if (possibleMoves.size === 0) {
        return false;
    }
    // Return true if there are possible moves
    return true;
}

function check_white_loss() {
    let counter_all_white = 0;
    let counter_free= 0;
    
    const squares = document.querySelectorAll('.square');
    
    squares.forEach(square => {
        let isWhitePiece = square.querySelector('.white');
        if (isWhitePiece) {
            counter_all_white += 1;
            
            const fromId = parseInt(square.id);
            console.log("WHITE ID Pieces on game", fromId)
            
            const toSet = get_moves(fromId);
            const isMoveBlocked = is_it_free(fromId, toSet);
            if (isMoveBlocked) {
                counter_free += 1;
            }
        }
    });
    console.log("WHITE: count all: ", counter_all_white)
    console.log("WHITE: count free: ", counter_free)
    
    if (counter_free === 0) {
        console.log("WHITE: blocked_player");
        disableGameplay();
        warningDisplay.textContent = "BLACK WINS!";
        infoDisplay.textContent = "BLACK WINS!";
        getGameStatus();
    }
}

function check_black_loss() {
    let counter_all_black = 0;
    let counter_free= 0;
    
    const squares = document.querySelectorAll('.square');
    
    squares.forEach(square => {
        let isBlackPiece = square.querySelector('.black');
        
        if (isBlackPiece) {
            counter_all_black += 1;
            
            const fromId = parseInt(square.id);
            console.log("BLACK: ID on game", fromId)
            
            const toSet = get_moves(fromId);
            const isMoveBlocked = is_it_free(fromId, toSet);
            if (isMoveBlocked) {
                counter_free += 1;
            }
        }
    });
    console.log("BLACK: count all:", counter_all_black)
    console.log("BLACK: count free: ", counter_free)
    
    if (counter_free === 0) {
        console.log("BLACK: blocked_player");
        disableGameplay();
        warningDisplay.textContent = "WHITE WINS!";
        infoDisplay.textContent = "WHITE WINS!";
        getGameStatus();
    }
}

//func que aplica as duas func anteriores a todas as peças de o jogador se ele tiver 
function check_pre_wins(){
    console.log("------JOGADA SPEARAÇÃO JOGADA SEPARAÇAO------")
    if (go === "white"){
        check_white_loss()
    }
    else {
        check_black_loss()
    }
    
}

// o tabuleiro está sempre criado
function createGame(){
    createBlackStack()
    createBoard()
    createWhiteStack()
}
createGame()

// quando esta função é chamada é qunado podemos jogar
function startGame(){
    lets_PLAY = true
    warningDisplay.textContent = "let's play"
    infoDisplay.textContent  = "White goes first"  
}

const jogo_offline = document.getElementById('offline');
jogo_offline.addEventListener('click', startGame)




//// PEDIDOS ///////
const URL = 'http://twserver.alunos.dcc.fc.up.pt:8008/';
const group = 13
const size = {'rows':6, 'columns':5}
const headers = {
    'Content-Type': 'application/json'
};

async function request(the_rquest, data, method, updateBoard) {

    const methodRequest = method != undefined ? method : 'POST';
    let finalURL = URL + the_rquest;
    let finalParams = {};

    if(methodRequest != undefined && methodRequest != "POST") {

        //Preparar link para o GET
        const arrayData = Object.entries(data);
        arrayData.forEach(function(currentValue, index, arr) {
            if(index == 0) finalURL += "?";
            finalURL += currentValue[0] + "=" + currentValue[1];
            if((index+1) < arrayData.length) finalURL += "&";
        })
        finalParams = {};


        //Pedido GET (Informação completa do jogo)
        try {
            const eventSource = new EventSource(finalURL);
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                updateGameInfo(data, updateBoard);
                
                return data.players;
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    }else {
        finalParams = {method: methodRequest,  headers: headers, body: JSON.stringify(data)}

        try {
            const response = await fetch(finalURL, finalParams);
            const jsonData = await response.json();
            return jsonData;
        } catch (e) {
            console.error('Error:', e.message);
        }
    }
}

// register
const dar_login = document.querySelector("#login");
dar_login.addEventListener('click', register);

async function newUser(nick, password) {
    const requestNewUser = await request("register", { "nick": nick, "password": password });
    if(requestNewUser.error == undefined) {
        document.getElementById("online").removeAttribute("disabled");
        document.getElementById("myForm").style.display = "none";
    }
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
    lets_PLAY = true
    warningDisplay.textContent = "let's play"
    infoDisplay.textContent  = "White goes first";

    getGameStatus();
}

function findgame() {
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
    leave(gameInfo.username, gameInfo.password, gameInfo.gameId);
}


//Notify request

async function notify(nick,password,gameId, move){
    const requestLeave = await request("notify", { "nick": nick, "password": password, "game": gameId, "move": move})
    getGameStatus(1);
}

function notifyAfterMove(move) {
    const matriz = identificarPosicao(move);
    gameInfo.lastMove = matriz;
    notify(gameInfo.username, gameInfo.password, gameInfo.gameId, gameInfo.lastMove);
}

function identificarPosicao(numero) {
    if (numero < 0 || numero > 29) {
        return "Número inválido para um tabuleiro 6x5";
    }

    const row = Math.floor(numero / 5);
    const column = numero % 5;

    return { row, column };
}


//Update Request
// const updateButton = document.querySelector("#update");
// updateButton.addEventListener('click', getGameStatus);

function updateGameInfo(dataGame, updateBoard) {

    //Identificar cor do jogador
    const arrayData = Object.entries(dataGame.players);
    arrayData.forEach(function(currentValue, index, arr) {
        if(currentValue[0] == gameInfo.username) {
            //gameInfo.color = currentValue[1];
            go = currentValue[1];
        }
    })


    //Atualizar board online
    const arrayBoard = dataGame.board;

    arrayBoard.forEach(function(currentValue, index, arr) { // Array de linhas da board
        currentValue.forEach(function(currentValueColuna, indexColuna, arrColuna) { // Array de colunas da board
            //peça de jogo com cor correspondente   
            let piece = document.createElement("div");
            piece.classList.add(currentValueColuna)
                
            document.getElementById(identificarNumero({linha:index, coluna: indexColuna})).innerHTML = ''; // limpa retangulo da peça
            document.getElementById(identificarNumero({linha:index, coluna: indexColuna})).appendChild(piece); // criar peça no retangulo
        })
    })
}

function identificarNumero(posicao) {
    const { linha, coluna } = posicao;

    if (linha < 0 || coluna < 0 || linha >= 6 || coluna >= 5) {
        return "Coordenadas inválidas para um tabuleiro 6x5";
    }

    const numero = linha * 5 + coluna;

    return numero;
}

async function updateRequest(gameId, nick, updateBoard){
    const updateB = updateBoard!=undefined ? updateBoard : 0;
    const requestUpdate = await request("update", { "game": gameId, "nick": nick }, "GET", updateB)
}

function getGameStatus(updateBoard) {
    updateRequest(gameInfo.gameId, gameInfo.username, updateBoard);
}

//Update Ranking Request
const updateRankingButton = document.querySelector("#updateRanking");
updateRankingButton.addEventListener('click', updateRankingFunction);

async function updateRankingRequest(group, size){
    const requestUpdateRanking = await request("ranking", { "group": group, "size": size })
    console.log(requestUpdateRanking);
}

function updateRankingFunction() {
    updateRankingRequest(group, size);
}
