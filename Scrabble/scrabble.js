$(document).ready(function () {
  $("#starter-modal").modal("show");
});

/**
 * Para prevenir que se actualice por accidente la página
 */
window.addEventListener('beforeunload', (event) => {
  // Cancel the event as stated by the standard.
  event.preventDefault();
  // Chrome requires returnValue to be set.
  event.returnValue = '';
});

var playerOneName = "";
var playerTwoName = "";
var playerThreeName = "";
var playerFourName = "";
var players = [];
var currentPlayerId = 0;
var remLetters = 100;
var isGameEnded = false;

/**
 * Se ejcuta al clickear el botón del modal starter
 */
function submitPlayers() {
  playerOneName = $("#playerOneNameStarter").val();
  playerTwoName = $("#playerTwoNameStarter").val();
  playerThreeName = $("#playerThreeNameStarter").val();
  playerFourName = $("#playerFourNameStarter").val();

  if (validatePlayersSize()) {
    // Oculta el modal
    $("#starter-modal").modal("hide");
    // Actualiza la cantidad de jugadores
    $(".players-size").text(players.length);
    // Renderiza los jugadores registrados
    renderPlayers();
    // Muestra botón para comenzar juego
    $("#start-game-btn").show();
    // Muestra el botón para editar jugadores
    $("#edit-players-btn").show();
    // Muestro la cantidad de letras restantes
    updateRemainingLetters();
    // Muestra el container
    $('.container').show();
  }
}

/**
 * Función que valida si se registran al menos dos jugadores.
 * @returns isStarterValid
 */
function validatePlayersSize() {
  let isStarterValid = false;
  players = [];
  if (playerOneName !== "") {
    players.push(createPlayer(players.length + 1, playerOneName));
    currentPlayerId = 1;
  }
  if (playerTwoName !== "") {
    players.push(createPlayer(players.length + 1, playerTwoName));
  }
  if (playerThreeName !== "") {
    players.push(createPlayer(players.length + 1, playerThreeName));
  }
  if (playerFourName !== "") {
    players.push(createPlayer(players.length + 1, playerFourName));
  }

  if (players.length < 2) {
    $("#alertDangerStarter").show();
  } else {
    $("#alertDangerStarter").hide();
    isStarterValid = true;
  }
  return isStarterValid;
}

/**
 * Crea un nuevo jugador (id, nombre, puntos, palabras)
 * @param id
 * @param name
 * @returns new player
 */
function createPlayer(id, name) {
  // Agrego jugador al modal para finalizar juego
  let form = $("#end-game-modal").find("form");
  let div =
    '<div class="mb-3">' 
    + '<label for="player-' + id + '-last-points" class="form-label">Jugador N° ' + id + ' (' + name + '):</label>'
    + '<input type="number" class="form-control border-brown" id="player-' + id + '-last-points" value="0"></div>';
  form.append(div);
  // Resto las 7 letras del jugador
  remLetters -= 7;
  // Creación del jugador
  return { id: id, name: name, points: 0, words: [], average: 0, skipped: 0, difference: '' };
}

/**
 * Mustra los jugadores registrados
 */
function renderPlayers() {
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    renderPlayerCard(player);
  }
}

/**
 * Renderiza la carta del jugador
 * @param {*} player 
 */
function renderPlayerCard(player) {
  // Player card
  let card = $("#player-card-" + player["id"]);
  if (card.length === 0) {
    // No existe
    card = $("#player-card").clone();
    card.attr("id", "player-card-" + player["id"]);
    card.attr("data-id", player["id"]);
    $("#player-card-container").append(card);
  }
  card.find(".card-title").html(renderPlayerName(player["name"]));
  card.find(".card-subtitle").text("Jugador N°" + player["id"]);
  card
    .find(".card-text")
    .html(
      '<ul class="list-unstyled fs-6 px-3">'
        +'<li class="my-1 game-points"><i class="bi-stars me-2"></i><b>' + player["points"] + '</b> Puntos</li>'
        +'<li class="my-1"><i class="bi-spellcheck me-2"></i><b>' + player["words"].length + '</b> Palabras</li>'
        +'<li class="my-1"><i class="bi-chevron-double-right me-2"></i><b>' + player["skipped"] + '</b> Turnos pasados</li>'
        +'<li class="my-1 game-points"><i class="bi-clipboard-data me-2"></i><b>' + player["average"] + '</b> Puntos por palabra</li>'
      +'</ul>'
    );
  // Bind botón "Ver detalles"
  card.find(".word-detail-btn").attr("onclick", "viewDetails(" + player["id"] + ");");
  // Bind botón "Pasar turno"
  card.find(".skip-btn").attr("onclick", "skipTurnModal(" + player["id"] + ");");
  // Bind botón "Agregar palabra"
  card.find(".add-word-btn").attr("onclick", "addWord(" + player["id"] + ");");
  // Muestro/oculto según configuración
  updateConfiguration();
  // Muestro al jugador
  card.removeClass("d-none");
}

/**
 * Renderiza el nombre del jugador con el estilo Scrabble
 */
function renderPlayerName(name) {
  let htmlName = '';
  for (var i = 0; i < name.length; i++) {
    htmlName += '<span class="badge text-dark rounded bg-white border border-brown p-1 px-2 me-1">' + name[i] + '</span>';
  }
  return htmlName;
}

/**
 * Abre el modal para editar jugadores
 */
function editPlayers() {
  $("#btn-submit-starter").attr("onclick", "updatePlayers();");
  $("#starter-modal").modal("show");
}

/**
 * Vacía la lista previa de jugadores y crea una nueva.
 */
function updatePlayers() {
  // Oculto turno actual
  $("#current-player-row").hide();
  $("#current-player-container").html("");
  // Elimino jugadores actuales
  $("#player-card-container").html("");
  players = [];
  $("#end-game-modal form").html("");
  // Renderizo nueva lista de jugadores
  submitPlayers();
}

/**
 * Comienza la partida
 */
function startGame() {
  // Oculto botón "Comenzar juego" y "Editar"
  $("#start-game-btn").hide();
  $("#edit-players-btn").hide();
  // Muestro botón de "Finalizar juego" y "Reiniciar juego"
  $("#end-game-btn").show();
  $("#restart-game-btn").show();
  // Comienza el Jugador N°1
  let current = $("#player-card-1").clone();
  // Muestro botones
  current.find(".skip-btn").removeClass("d-none");
  current.find(".add-word-btn").removeClass("d-none");
  // Cambio card del jugador N°1 de contenedor
  $("#player-card-1").remove();
  $("#current-player-container").append(current);
  $("#current-player-row").show();
}

/**
 * Reemplaza al jugador actual por el siguiente
 * @param id
 */
function toggleCurrentPlayer(id) {
  // Oculto el modal de agregar palabra
  clearAddWordModal();
  // Id del próximo jugador
  let nextNum = id + 1;
  if (nextNum > players.length) {
    nextNum = 1;
  }
  // Jugador actual
  let current = $("#player-card-" + id).clone();
  // Oculto botones
  current.find(".skip-btn").addClass("d-none");
  current.find(".add-word-btn").addClass("d-none");
  // Cambio card de contenedor
  $("#player-card-" + id).remove();
  $("#player-card-container").append(current);
  // Próximo jugador
  let next = $("#player-card-" + nextNum).clone();
  // Muestro botones
  next.find(".skip-btn").removeClass("d-none");
  next.find(".add-word-btn").removeClass("d-none");
  // Cambio card de contenedor
  $("#player-card-" + nextNum).remove();
  $("#current-player-container").append(next);
  // Actualizo id del jugador actual
  currentPlayerId = nextNum;
  console.log("Current player id: " + currentPlayerId);
}

/**
 * Abre el modal de confirmación para pasar de turno
 * @param id
 */
function skipTurnModal(id) {
  // Bind botón "Sí"
  $('#btn-skip-turn').attr('onclick', 'skipTurn(' + id + ');');
  // Muestro el modal de confirmación
  $('#skip-turn-modal').modal('show');
}

/**
 * Jugador pasa de turno
 * @param id
 */
 function skipTurn(id) {
  // Actualizo el contador
  let player = findPlayerById(id);
  player["skipped"] = player["skipped"] + 1;
  // Actualizo jugador
  renderPlayerCard(player);
  // Oculto el modal de confirmación
  $('#skip-turn-modal').modal('hide');
  // Se pasa de turno
  toggleCurrentPlayer(id);
}

/**
 * Jugador agrega palabra al tablero
 * @param id
 */
function addWord(id) {
  // Bind botón "Guardar"
  $("#btn-submit-word").attr("onclick", "submitWord(" + id + ")");
  // Muestro el modal "Agregar palabra"
  $("#add-word-modal").modal("show");
}

/**
 * Se registra la palabra agregada por el jugador actual
 * @param id
 */
function submitWord(id) {
  // Oculto alerta
  $('#alertDangerAddWord').hide();
  // Valores del formulario
  let word = $("#word-literal").val();
  let points = parseInt($("#word-points").val());
  if (word !== "" && !isNaN(points)) {
    let letters = $("#word-letters").val();
    let position = $("#word-position").val();
    // Jugador actual
    let player = findPlayerById(id);
    player["points"] = player["points"] + points;
    let words = player["words"];
    let wordId = words.length + 1;
    words.push(createWord(wordId, word.trim().toUpperCase(), points, letters, position.toUpperCase()));
    // Recalculo promedio
    player["average"] = parseFloat(player["points"] / words.length).toFixed(2);
    // Actualizo jugador
    renderPlayerCard(player);
    // Actualizo y muestro la cantidad de letras restantes
    remLetters -= letters;
    updateRemainingLetters();
    // Cambio de turno
    toggleCurrentPlayer(id);
  } else {
    // Muestro alerta
    $('#alertDangerAddWord').show();
  }
}

/**
 * Crea una nueva palabra
 * @param word
 * @param points
 * @param position
 * @returns
 */
function createWord(id, word, points, letters, position) {
  return { id: id, word: word, points: points, letters: letters, position: position };
}

/**
 * Vacía los campos del modal para agregar palabra
 */
function clearAddWordModal() {
  $("#add-word-modal").modal("hide");
  $("#word-literal").val("");
  $("#word-points").val("");
  $("#word-position").val("");
  $("#word-letters").val("");
}

/**
 * Finaliza el juego. Abre modale para finalizar juego
 */
function endGame() {
  // Seteo variable global de juego terminado
  isGameEnded = true;
  // Abro modal para puntos finales
  $("#end-game-modal").modal("show");
  // Oculto fila de jugador actual
  $("#current-player-row").hide();
  // Jugador actual pasa a lista de jugadores en la partida
  let current = $("#player-card-" + currentPlayerId).clone();
  // Oculto botones
  current.find(".skip-btn").addClass("d-none");
  current.find(".add-word-btn").addClass("d-none");
  // Cambio card de contenedor
  $("#player-card-" + currentPlayerId).remove();
  $("#player-card-container").append(current);
}

/**
 * Ejecuta el cálculo final de puntos
 */
function submitLastPoints() {
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let input = $("#player-" + player["id"] + "-last-points");
    if (input) {
      let value = (input.val() !== '') ? input.val() : 0;
      player["points"] = player["points"] + parseInt(value);
      // Guardo los puntos de diferencia del jugador
      let operation = 'sumaron';
      if (parseInt(value) < 0) {
        operation = 'restaron';
      }
      player["difference"] = 'Se <b>' + operation + ' ' + Math.abs(parseInt(value)) + ' puntos</b> al finalizar la partida.';
    }
    console.log(
      "Puntos del Jugador N°" + player["id"] + ": " + player["points"]
    );
  }
  showFinalResults();
}

/**
 * Muestra el resultado final de la partida
 */
function showFinalResults() {
  // Ordeno la lista de jugadores por puntos
  players = players.sort(function (a, b) {
    if (a.points > b.points) {
      return -1;
    }
    if (a.points < b.points) {
      return 1;
    }
    return 0;
  });
  let max = players[0]["points"];
  console.log('Puntos máximos: ' + max);
  // Pinto nuevamente los jugadores con puntos actualizados
  $("#player-card-container").html("");
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    renderPlayerCard(player);
    if (max !== 0 && player["points"] === max) {
      $('#player-card-' + player["id"]).find('.ribbon-winner').removeClass('d-none');
    }
  }
  // Muestro los puntos de cada jugador
  $('.game-points').show();
  // Oculto botón para terminar juego y de cofiguración
  $('#end-game-btn').hide();
  $('#configuration-game-btn').hide();
  // Cierro modal para puntos finales
  $("#end-game-modal").modal("hide");
}

/**
 * Modal con detalles de la partida de un jugador
 * @param id 
 */
function viewDetails(id) {
  // Oculto caption
  $('#no-words-caption').hide();
  // Busco al jugador
  let player = findPlayerById(id);
  $('#details-modal').find('.player-name').text(player["name"]);
  let words = player["words"];
  // Detalle textual
  let details = 'Ha jugado <b>' + words.length + ' palabras</b><span class="game-points">, acumulando <b>' + player["points"] + ' puntos</b> en esta partida, con un promedio de <b>' + player["average"] + ' puntos por palabra</b></span>.';
  $('#details-modal').find('.player-details').html(details);
  // Creo la tabla con el detalle de cada palabra
  let table = $('#details-modal .table');
  table.find('tbody').html('');
  let body = '';
  if (words.length > 0) {
    for (let i = 0; i < words.length; i++) {
    let word= words[i];
    body += '<tr>'
              + '<td>' + word["word"] + ' (' + word["letters"] + ')</td>'
              + '<td class="game-points">' + word["points"] + '</td>'
              + '<td class="game-position">' + word["position"] + '</td>'
            +'</tr>'
    }
  } else {
    $('#no-words-caption').show();
  }
  if(player["difference"] !== '') {
    body += '<tr><td colspan="3">' + player["difference"] + '</td></tr>';
  }
  table.find('tbody').html(body);
  // Muestro/oculto según configuración
  updateConfiguration();
  // Muestro el modal
  $('#details-modal').modal('show');
}

/**
 * Busca un jugador por id
 * @param {*} id 
 * @returns 
 */
function findPlayerById(id) {
  return players.find(x => x.id === id);
}

/**
 * Guardo la configuración del juego
 */
function updateConfiguration() {
  if (!isGameEnded) {
    // Muestro/oculto los puntos
    toggleGamePoints();
  }
  // Muestro/oculto coordenadas
  toggleGamePositions();
  // Muestro/oculto coordenadas
  toggleGameLetters();
  // Cierro el modal de configuración
  $('#configuration-modal').modal('hide');
  
}

/**
 * Función para mostrar/ocultar puntos
 */
function toggleGamePoints() {
  if (document.getElementById("check-hide-points").checked) {
    $(".game-points").hide();
  } else {
    $(".game-points").show();
  }
}

/**
 * Función para mostrar/ocultar coordenadas
 */
function toggleGamePositions() {
  if (document.getElementById("check-hide-position").checked) {
    $(".game-position").hide();
  } else {
    $(".game-position").show();
  }
}

/**
 * Función para mostrar/ocultar letras restantes
 */
function toggleGameLetters() {
  if (document.getElementById("check-hide-letters").checked) {
    $(".game-letters").hide();
  } else {
    $(".game-letters").show();
  }
}

/**
 * Renderiza el html con la cantidad de letras restantes
 */
function updateRemainingLetters() {
  let htmlLetters = '';
  let strLetters = remLetters.toString();
  if (remLetters > 0) {
    for (let i = 0; i < strLetters.length; i++) {
      htmlLetters += '<span class="badge text-dark rounded bg-white border border-brown p-1 px-2 mb-1">' + strLetters[i] + '</span>';
    }  
  } else {
    htmlLetters += '<span class="badge text-dark rounded bg-white border border-brown p-1 px-2 mb-1">0</span>';
  }
  $('.letters-size').html(htmlLetters);
}