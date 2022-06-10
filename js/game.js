var game = {
    health: 100,
    maxHealth: 100,
    block: 0,
    maxBlock: 100,
    floor: 1,
    state: "enter",
    turn: "none",
    select: ["none", 0],
    enemyAtt: "none",
    energy: 3,
    maxEnergy: 3,
    enemies: [],
    enemyPos: [],
    deck: ["basic_attack", "basic_attack", "basic_attack", "basic_attack", "basic_attack", "basic_attack", "basic_attack"],
    hand: [],
    handSize: 5,
    handPos: [],
    discard: [],
}, actionTimer = -1, notif = [-1, 0];

function hardReset() {
    localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save");
    game = null;
    location.reload();
};

function randomize(array) {
    let index = array.length, randomIndex;
    while (index != 0) {
        randomIndex = Math.floor(Math.random() * index);
        index--;
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    };
    return array;
};

function shuffleDeck(newCard = null) {
    if (newCard) game.deck.push("" + newCard);
    game.deck = randomize(game.deck);
};

function drawHand() {
    let index = 0;
    for (; index < game.handSize && index < game.deck.length; index++) {
        game.hand.push(game.deck[index]);
    };
    if (index != game.handSize) {
        game.deck.push(game.discard);
        shuffleDeck();
        for (; index < game.handSize && index < game.deck.length; index++) {
            game.hand.push(game.deck[index]);
        };
    };
    for (index--; index >= 0; index--) {
        game.deck.splice(index, 1);
    };
};

function enterBattle() {
    game.state = "battle";
    shuffleDeck();
    drawHand();
    game.energy = game.maxEnergy;
    game.turn = "player";
};

function playerTurn() {
    // action timer
    actionTimer--;
    if (actionTimer > -1) return;
    if (!actionTimer || actionTimer < -1) actionTimer = -1;
    // select hand
    if (game.select[0] == "none") game.select = ["hand", 0];
    // activate / deactivate looker
    if (action == "enter" && game.select[0] == "looker") {
        if (game.select[1] == 0) game.select[1] = 1;
        else game.select[1] = 0;
        actionTimer = 2;
    };
    // deselect extras
    if ((game.select[0] == "help" || game.select[0] == "looker") && !game.select[1]) {
        if (action == "left" && game.select[0] == "looker") {
            game.select = ["help", 0];
            actionTimer = 1;
        } else if (action == "right" && game.select[0] == "help") {
            game.select = ["looker", 0];
            actionTimer = 1;
        } else if (action == "down") {
            game.select = ["hand", 0];
            actionTimer = 1;
        };
    };
    // select card
    if (game.select[0] == "hand") {
        if (!game.hand) {
            game.select[1] = -1;
        } else {
            if (action == "left" && game.select[1] > 0) {
                game.select[1]--;
                actionTimer = 1;
            } else if (action == "right") {
                if (game.select[1] < game.hand.length - 1) {
                    game.select[1]++;
                    actionTimer = 1;
                } else {
                    var to = -1, distance = -1;
                    for (let a = 0; a < game.enemies.length; a++) {
                        if (game.enemyPos[a][1] > distance) {
                            distance = game.enemyPos[a][1];
                            to = a;
                        };
                    };
                    game.select = ["lookat_enemy", to];
                    actionTimer = 1;
                    return;
                };
            } else if (action == "up") {
                if (game.handPos[game.select[1]] >= width / 2 - 32) {
                    var to = -1, distance = -1;
                    for (let a = 0; a < game.enemies.length; a++) {
                        if (game.enemyPos[a][1] > distance) {
                            distance = game.enemyPos[a][1];
                            to = a;
                        };
                    };
                    for (let a = 0; a < game.enemies.length; a++) {
                        if (game.enemyPos[a][0] < distance) {
                            distance = game.enemyPos[a][0];
                            to = a;
                        };
                    };
                    game.select = ["lookat_enemy", to];
                    actionTimer = 1;
                    return;
                };
                game.select = ["looker", 0];
                actionTimer = 1;
            };
            if (game.select[1] < 0) game.select[1] = 0;
            else if (game.select[1] >= game.hand.length - 1) game.select[1] = game.hand.length - 1;
        };
    };
    // attack enemy
    if (action == "enter" && game.select[0] == "attack_enemy") {
        if (game.enemyAtt == "basic_attack") {
            game.energy--;
            startPlayerAnim("attack");
            game.select[0] = "attack_fin";
            game.discard.push(selected);
            game.hand.splice(game.select[1], 1);
            actionTimer = 4;
        };
    };
    if (game.select[0] == "attack_fin" && actionTimer < 0) {
        game.enemies[game.select[1]][1] -= 5;
        game.select = ["hand", 0];
        game.enemyAtt = "none";
        actionTimer = 1;
    };
    // select enemy
    if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
        if (action == "left" && game.select[1] < game.enemies.length - 1) {
            game.select[1]++;
            actionTimer = 1;
        } else if (action == "right" && game.select[1] > 0) {
            game.select[1]--;
            actionTimer = 1;
        } else if (action == "down" && game.select[0] == "lookat_enemy") {
            game.select = ["hand", game.hand.length - 1];
            actionTimer = 1;
        };
    };
    // play card
    if (action == "enter" && game.select[0] == "hand") {
        var selected = game.hand[game.select[1]];
        if (selected == "basic_attack" && game.energy >= 1) {
            game.select = ["attack_enemy", game.enemies.length - 1];
            game.enemyAtt = "basic_attack";
            actionTimer = 5;
        //} else if (selected == "card_name" && game.energy >= 1) {
            
        } else {
            notif = [game.select[1], 0];
            actionTimer = 1;
        };
    };
};

const gameloop = setInterval(function() {
    // clear
    ctx.clearRect(0, 0, width, height);
    // actions
    if (game.turn == "player") playerTurn();
    // load floor
    if (game.floor == 1) {
        if (game.state == "enter") {
            game.enemies.push(["slime_small", 20, 20, 0, 10]);
            enterBattle();
        };
    } else if (game.floor == 2) {
        if (game.state == "enter") {
            game.enemies.push(["slime_big", 30, 30, 5, 25]);
            enterBattle();
        };
    };
    // visuals
    renderRoom();
    if (game.select[0] != "looker" || !game.select[1]) {
        player();
        renderCards();
        target();
    };
}, 100);
