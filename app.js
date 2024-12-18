/* Inicializa el Juego */
var list = [
'aaafrs','aaeeee','aafirs','adennn','aeeeem',
'aeegmu','aegmnn','afirsy','bjkqxz','ccenst',
'ceiilt','ceilpt','ceipst','ddhnot','dhhlor',
'dhlnor','dhlnor','eiiitt','emottt','ensssu',
'fiprsy','gorrvw','iprrry','nootuw','ooottu'
];
let countdown = 120; // Variable para almacenar el intervalo
let timeLeft = 120;
let errors = 0;
var board_generator = []; // Arreglo bidimensional para almacenar los dados originales
var current_track = []; // Seguimiento de los dados seleccionados en orden
var clickable = []; // Dados seleccionables
var submitted = new Set(); // Almacena las palabras enviadas

Counter();
board_generate();
board();
button_event();


// Genera el tablero de juego
function board(){
	var board = [];
	var board_temp = [];
	var dice_arr = [];
	var upside;
	var row;
	var character='';
	shuffle(board_generator); // Mezcla los dados

	 // Asigna una cara visible a cada dado
	for(let i=0;i<board_generator.length;i++){
		dice_arr = board_generator[i];
		upside = random_face(dice_arr);
		if(upside==='Q')upside = 'Qu';
		board_temp.push(upside);
	}
	// Organiza los dados en un arreglo bidimensional
	for(let i=0;i<board_temp.length;i=i+5){
		line = [];
		line.push(board_temp[i]);
		line.push(board_temp[i+1]);
		line.push(board_temp[i+2]);
		line.push(board_temp[i+3]);
		line.push(board_temp[i+4]);
		board.push(line);
	}

	// Renderiza el tablero en el HTML
	for(var row=0;row<4;row++){
		for(var col=0;col<4;col++){
			character = board[row][col];
			var button = "<button type='button' class='btn dice'"+"row="+row+" col="+col+">"+ character + "</button>";
			var row_selector = document.getElementById("row"+row);
			row_selector.innerHTML += button;
		}
	}

}
// Genera los dados iniciales
function board_generate(){
	var dice;
	for(let i=0;i<list.length;i++){
		dice = list[i].toUpperCase().split('');
		board_generator.push(dice);
	}
}

// Mezcla un arreglo de manera aleatoria
function shuffle(arr){
	var j,temp;
	for(let i=arr.length;i>0;i--){
		j=Math.floor(Math.random()*i);
		temp = arr[i-1];
		arr[i-1] = arr[j];
		arr[j] = temp;
	}
}
// Selecciona una cara aleatoria de un dado
function random_face(arr){
	var index = Math.floor(Math.random()*6);
	var upside_face = arr[index];
	return upside_face;
}


// Agrega eventos a los botones del tablero
function button_event(){
	var row,col,text;
	var events = document.getElementsByClassName('dice');
	for(let event of events){
		event.onclick = function(){
			row = Number(event.getAttribute('row'));
			col = Number(event.getAttribute('col'));
			text = event.innerHTML;	
			if(!event.classList.contains('active')){
				current_track.push([row,col]);
				current_word += text;
			}else{
				current_track.pop();
				current_word = current_word.substring(0,current_word.length-1);
			}
			if(current_track.length !== 0){
				var current_dice = current_track[current_track.length-1];
				console.log(current_dice);
				ajacent(current_dice[0],current_dice[1]);
				clickable = modify_clickable(clickable,current_track);
				clickable.push([current_dice[0],current_dice[1]]);
			}
			update_clickable_dice();
			document.getElementById('current_word').innerHTML = current_word;
			event.classList.toggle('active');
		}
	}
	document.getElementById('submit').onclick = function(){
		submit_word();
		after_submit();
	};
}
// Modifica los dados seleccionables excluyendo los seleccionados
function modify_clickable(clickable,current_track){
	var dice1 = [];
	var dice2 = [];
	var difference = clickable.slice();
	for(let i=clickable.length-1;i>=0;i--){
		for(let j=0;j<current_track.length;j++){
			var dice1 = clickable[i];
			var dice2 = current_track[j];
			if( dice1[0] === dice2[0] && dice1[1] === dice2[1] ){
					difference.splice(i,1);
			}
		}
	}
	return difference;
}
// Actualiza los dados seleccionables en el tablero
function update_clickable_dice(){
	var events = document.getElementsByClassName('dice');
	var found = false;
	if(current_track.length === 0 ){
		for(let event of events){
			event.disabled = false;
			event.classList.remove('highlight_btn');
		}
	}else{
		for(let event of events){
			event.disabled = true;
			event.classList.remove('highlight_btn');
			found = false;
			row = Number(event.getAttribute('row'));
			col = Number(event.getAttribute('col'));
			for(let dice of clickable){
				if(dice[0] === row && dice[1] === col){
					found = true; //Encontrar el dado
				}
			}
			if(found){
				event.disabled = false;
				event.classList.add('highlight_btn');
			}
		}
	}

}

var current_word = ""; // Almacena la palabra actual
var err_msg = ""; // Almacena el mensaje de error

// Verifica y registra la palabra ingresada
function submit_word() {
    if (current_word === "") {
        err_msg = "Necesitas ingresar alguna palabra.";
        document.getElementById('error').innerHTML = err_msg;
    } else if (current_word.length < 3) {
        current_word = "";
        document.getElementById('current_word').innerHTML = current_word;
        update_words();
        err_msg = "Tienes que ingresar una palabra de al menos 3 letras, \nte restamos un punto.";
        document.getElementById('error').innerHTML = err_msg;
        document.getElementById('total-score').value--;
        errors++;
    } else if (submitted.has(current_word)) {
        // Si la palabra ya fue ingresada
        err_msg = "Esta palabra ya fue ingresada. Intenta con otra.";
        document.getElementById('error').innerHTML = err_msg;
        current_word = "";
        document.getElementById('current_word').innerHTML = current_word;
    } else {
        current_track = [];
        callbackword(current_word, (isValid) => {
            if (isValid) {
                submitted.add(current_word); // Agregar al conjunto de palabras ingresadas
                current_word = "";
                document.getElementById('current_word').innerHTML = current_word;
                update_words();
                document.getElementById('error').innerHTML = '';
            } else {
                // Palabra inválida
                submitted.add(current_word); // También se registra para evitar duplicados
                current_word = "";
                document.getElementById('current_word').innerHTML = current_word;
                update_words();
                err_msg = "Palabra incorrecta, \nte restamos un punto.";
                document.getElementById('total-score').value--;
                document.getElementById('error').innerHTML = err_msg;
                errors++;
            }
        });
    }
}

// Reinicia el tablero después de enviar una palabra
function after_submit(){
	var events = document.getElementsByClassName('dice');
	for(let event of events){
		event.classList.remove('active');
	}
	current_track = [];
	update_clickable_dice();
}
// Actualiza las palabras ingresadas y el puntaje total
function update_words(){
	var score;
	var sum = 0;
	document.getElementById('table_words').innerHTML = "";
	for(let word of submitted){
		score = calculate_score(word);
		sum += score;
		document.getElementById('table_words').innerHTML += "<div><span>"+word+"</span>"+"<span>"+score+"</span></div>";
	}
	sum -= errors;
	document.getElementById('total-score').innerHTML = sum;
}
// Calcula el puntaje de cada palabra según su longitud
function calculate_score(word){
	switch(word.length){
		case 1:
		case 2:
			return 0;
		case 3:
		case 4:
			return 1;
		case 5:
			return 2;
		case 6:
			return 3;
		case 7:
			return 5;
		default:
			return 11;
	}
}
// Verifica si una posición está dentro de los límites del tablero
function within_range(row,col){
	return(row>=0 && row<4 && col>=0 && col<4);
}
// Define las posiciones adyacentes a un dado
var ajacent_dice = [
[-1,-1],[-1,0],[-1,1],
[0,-1],			[0,1],
[1,-1],	[1,0],	[1,1]
];
// Calcula las posiciones adyacentes válidas para un dado específico
function ajacent(row,col){
	clickable = [];
	var newrow,newcol;
	for(let neighbor of ajacent_dice){
		newrow = Number(row)+neighbor[0];
		newcol = Number(col)+neighbor[1];
		if(within_range(newrow,newcol)){
			clickable.push([newrow,newcol]);
		}
	}
}
// Verifica si una palabra es válida utilizando un API
function VerifyWord(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    
    return fetch(url)
        .then(response => response.ok) 
        .catch(error => {
            console.error('Error al obtener los datos:', error);
            return false;
        });
}
// Callback para procesar la verificación de la palabra
function callbackword(current_word, callback) {
    VerifyWord(current_word).then(resultado => {
        callback(resultado);
    });
}
// Controla el temporizador del juego
  function Counter() {
	clearInterval(countdown); 
	document.getElementById('timer').textContent = timeLeft;

	countdown = setInterval(() => {
		timeLeft--;
		document.getElementById('timer').textContent = timeLeft;
		if(timeLeft <=20)
		{
			document.getElementById('timer').style.color = 'red';
		}
		else{
			document.getElementById('timer').style.color = 'black';
		}
		if (timeLeft <= 0) {
			clearInterval(countdown); // Detiene el temporizador cuando llega a 0
			document.getElementById('timer').textContent = "¡Tiempo terminado!";
			document.getElementById('board').style.display ="none";
		}
	}, 1000); // Intervalo de 1 segundo (1000 ms)
}
// Configura el inicio del juego
function StartGame()
{
	let nm = document.getElementById('namePlayer').value;
	nm = 'BIENVENIDO ' + nm;
	document.getElementById('namePlayerLabel').innerHTML = nm.toUpperCase();
	document.getElementById('namePlayer').style.display = 'none';
	document.getElementById('startGame').style.display = 'none';
}

// Maneja el envío de correos electrónicos
function sendEmail(event) {
	event.preventDefault(); // Evita que el formulario se envíe de la manera predeterminada

	// Obtener los valores de los campos
	const name = document.getElementById('name').value;
	const email = document.getElementById('email').value;
	const message = document.getElementById('message').value;

	// Crear el enlace mailto con asunto y cuerpo del mensaje
	const subject = encodeURIComponent(`Mensaje de ${name}`);
	const body = encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`);

	// Crear el enlace mailto
	const mailtoLink = `mailto:correo@ejemplo.com?subject=${subject}&body=${body}`;

	// Abrir la herramienta de envío de emails predeterminada
	window.location.href = mailtoLink;
}
async function checkWord(word) {
    const result = await VerifyWord(word);

   return result;
}
