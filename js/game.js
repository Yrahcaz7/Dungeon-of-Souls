var game = {
    health: 60,
    maxHealth: 60,
    shield: 0,
    maxShield: 60,
    floor: 1,
    state: "enter",
    turn: "none",
    select: ["none", 0],
    enemyAtt: "none",
    energy: 3,
    maxEnergy: 3,
    enemies: [],
    enemyPos: [],
    enemyIndex: 0,
    deck: ["slash", "slash", "slash", "slash", "block", "block", "block", "block"],
    hand: [],
    handSize: 5,
    handPos: [],
    activeCard: -1,
    discard: [],
}, actionTimer = -1, notif = [-1, 0], hide = (game.select[0] == "help" || game.select[0] == "looker") && game.select[1];

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

function shuffleDeck(...newCards) {
    if (newCards) {
        for (let card of newCards) {
            game.deck.push("" + card);
        };
    };
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
    // select extras
    if (action == "up" && game.select[0] == "lookat_enemy") {
        game.select = ["looker", 0];
        actionTimer = 1;
        return;
    };
    // activate / deactivate extras
    if (action == "enter" && (game.select[0] == "help" || game.select[0] == "looker")) {
        if (game.select[1] == 0) game.select[1] = 1;
        else game.select[1] = 0;
        actionTimer = 2;
        return;
    };
    // deselect extras
    if ((game.select[0] == "help" || game.select[0] == "looker") && !game.select[1]) {
        if (action == "left" && game.select[0] == "help") {
            game.select = ["looker", 0];
            actionTimer = 1;
            return;
        } else if (action == "right" && game.select[0] == "looker") {
            game.select = ["help", 0];
            actionTimer = 1;
            return;
        } else if (action == "down") {
            game.select = ["lookat_enemy", 0];
            actionTimer = 1;
            return;
        };
    };
    // select card
    if (game.select[0] == "hand") {
        if (!game.hand) {
            game.select[1] = -1;
        } else {
            if (action == "left") {
                if (game.select[1] > 0) {
                    game.select[1]--;
                    actionTimer = 1;
                } else {
                    game.select[1] = game.hand.length - 1;
                };
                return;
            } else if (action == "right") {
                if (game.select[1] < game.hand.length - 1) {
                    game.select[1]++;
                    actionTimer = 1;
                } else {
                    game.select[1] = 0;
                };
                return;
            } else if (action == "up") {
                let to = -1, distance = -1;
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
            if (game.select[1] < 0) game.select[1] = 0;
            else if (game.select[1] >= game.hand.length - 1) game.select[1] = game.hand.length - 1;
        };
    };
    // attack enemy
    if (action == "enter" && game.select[0] == "attack_enemy") {
        if (game.enemyAtt == "slash") {
            game.energy--;
            startPlayerAnim("attack");
        };
        game.select[0] = "attack_fin";
        game.discard.push(game.hand[game.activeCard]);
        game.hand.splice(game.activeCard, 1);
        actionTimer = 4;
        return;
    };
    if (game.select[0] == "attack_fin" && actionTimer < 0) {
        if (game.enemyAtt == "slash") {
            game.enemies[game.select[1]].health -= 5;
        };
        game.select = ["hand", 0];
        game.enemyAtt = "none";
        actionTimer = 1;
        return;
    };
    // select enemy
    if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
        if (action == "left" && game.select[1] < game.enemies.length - 1) {
            game.select[1]++;
            actionTimer = 1;
            return;
        } else if (action == "right" && game.select[1] > 0) {
            game.select[1]--;
            actionTimer = 1;
            return;
        } else if (action == "down" && game.select[0] == "lookat_enemy") {
            game.select = ["hand", game.hand.length - 1];
            actionTimer = 1;
            return;
        };
    };
    // play card
    if (action == "enter" && game.select[0] == "hand") {
        var selected = game.hand[game.select[1]];
        if (selected == "slash" && game.energy >= 1) {
            game.activeCard = game.select[1];
            game.select = ["attack_enemy", game.enemies.length - 1];
            game.enemyAtt = "slash";
            actionTimer = 5;
            return;
        } else if (selected == "block" && game.energy >= 1) {
            game.energy--;
            game.shield += 4;
            game.discard.push(game.hand[game.select[1]]);
            game.hand.splice(game.select[1], 1);
            actionTimer = 5;
            return;
        } else {
            notif = [game.select[1], 0];
            actionTimer = 1;
            return;
        };
    };
};

const gameloop = setInterval(function() {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // update data
    updateData();
    // actions
    if (game.turn == "player") playerTurn();
    // update data again
    updateData();
    // load floor
    if (game.floor == 1) {
        if (game.state == "enter") {
            game.enemyIndex = 0;
            game.enemies.push(new Enemy("slime_small", 1));
            enterBattle();
        };
    } else if (game.floor == 2) {
        if (game.state == "enter") {
            game.enemyIndex = 0;
            game.enemies.push(new Enemy("slime_big", 1));
            enterBattle();
        };
    };
    // visuals
    backgrounds();
    if (!hide) {
        enemies();
        player();
        target();
    };
    foregrounds();
    if (!hide) renderCards();
    if (game.select[0] == "help" && game.select[1]) {
		ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw(select_round, 380, 2);
		draw(help, 381, 3);
		drawLore(1, 1, "Storyline:", "white");
		drawLore(1, 39.5, "Controls:", "white");
		drawLore(1, 67, "How to Play:", "white");
		drawLore(1, 12, text, "white", "right", true);
	};
}, 100);
