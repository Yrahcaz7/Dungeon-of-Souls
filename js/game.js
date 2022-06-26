/*
    Dungeon of Souls
    Copyright (C) 2022 Yrahcaz7

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

var game = {
    health: 60,
    maxHealth: 60,
    shield: 0,
    maxShield: 60,
    floor: 1,
    state: "enter",
    turn: "none",
    select: ["none", 0],
    cardSelect: [0, 0],
    enemyAtt: new Card(),
    energy: 3,
    maxEnergy: 3,
    enemies: [],
    enemyPos: [],
    enemyIndex: 0,
    deck: [new Card("slash"), new Card("slash"), new Card("slash"), new Card("slash"), new Card("block"), new Card("block"), new Card("block"), new Card("block"), new Card("block"), new Card("aura blade")],
    deckProxy: "",
    deckPos: 0,
    deckMove: "none",
    hand: [],
    handSize: 5,
    handPos: [],
    prevCard: -1,
    activeCard: -1,
    discard: [],
    discardProxy: "",
    auraBlades: 0,
    auraBladePos: 0,
    currentEffect: "none",
    music: true,
}, actionTimer = -1, notif = [-1, ""], hide = (game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "deck") && game.select[1];

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
            if (card instanceof Object) game.deck.push(card);
            else game.deck.push(new Card("" + card));
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
        game.select = ["music", 0];
        actionTimer = 1;
        return;
    };
    // select / deselect player and more extras
    if (action == "left") {
        if (game.select[0] == "hand" && !game.select[1]) {
            game.select = ["lookat_you", 0];
            actionTimer = 1;
            return;
        };
        if (game.select[0] == "lookat_you") {
            game.select = ["end", 0];
            actionTimer = 1;
            return;
        };
        if (game.select[0] == "discard" && !game.select[1]) {
            game.select = ["hand", game.prevCard];
            actionTimer = 1;
            return;
        };
    };
    if ((action == "left" || action == "down") && game.select[0] == "end") {
        game.select = ["deck", 0];
        actionTimer = 1;
        return;
    };
    if (action == "right") {
        if (game.select[0] == "lookat_you") {
            game.select = ["hand", game.prevCard];
            actionTimer = 1;
            return;
        };
        if (game.select[0] == "end") {
            game.select = ["lookat_you", 0];
            actionTimer = 1;
            return;
        };
        if (game.select[0] == "hand" && game.select[1] == game.hand.length - 1) {
            game.select = ["discard", 0];
            actionTimer = 1;
            return;
        };
    };
    if ((action == "right" || action == "up") && game.select[0] == "deck" && !game.select[1]) {
        game.select = ["end", 0];
        actionTimer = 1;
        return;
    };
    // deck selection
    if ((game.select[0] == "deck" || game.select[0] == "discard") && game.select[1]) {
        let coor = game.cardSelect, len = game.deck.length;
        if (game.select[0] == "discard") len = game.discard.length;
        if (action == "left") {
            if (coor[0] > 0) {
                game.cardSelect[0]--;
            } else if (coor[1] > 0) {
                game.cardSelect[0] = 5;
                game.cardSelect[1]--;
                game.deckMove = "up";
            };
            actionTimer = 1;
            return;
        } else if (action == "right" && (coor[0] < (len - 1) % 6 || coor[1] < Math.floor(len / 6))) {
            if (coor[0] < 5) {
                game.cardSelect[0]++;
            } else if (coor[0] + (coor[1] * 6) < len - 1) {
                game.cardSelect[0] = 0;
                game.cardSelect[1]++;
                game.deckMove = "down";
            };
            actionTimer = 1;
            return;
        } else if (action == "up" && coor[1] > 0) {
            game.cardSelect[1]--;
            game.deckMove = "up";
            actionTimer = 1;
            return;
        } else if (action == "down" && coor[1] < Math.floor(len / 6) && (coor[0] < len % 6 || coor[1] < Math.floor(len / 6) - 1)) {
            game.cardSelect[1]++;
            game.deckMove = "down";
            actionTimer = 1;
            return;
        };
    };
    // activate / deactivate extras
    if (action == "enter" && (game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "deck" || game.select[0] == "discard")) {
        if (game.select[1] == 0) game.select[1] = 1;
        else game.select[1] = 0;
        actionTimer = 2;
        return;
    };
    if (action == "enter" && game.select[0] == "music") {
        if (game.music) {
            document.getElementById("music").pause();
            game.music = false;
        } else {
            document.getElementById("music").play();
            game.music = true;
        };
        actionTimer = 2;
        return;
    };
    // deselect extras
    if ((game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "music") && !game.select[1]) {
        if (action == "left" && game.select[0] == "looker") {
            game.select = ["music", 0];
            actionTimer = 1;
            return;
        } else if (action == "left" && game.select[0] == "help") {
            game.select = ["looker", 0];
            actionTimer = 1;
            return;
        } else if (action == "right" && game.select[0] == "music") {
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
            game.select = ["end", 0];
        } else {
            if (action == "left") {
                game.select[1]--;
                actionTimer = 1;
                return;
            } else if (action == "right") {
                game.select[1]++;
                actionTimer = 1;
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
        if (game.enemyAtt.name == "slash") {
            game.energy--;
            startAnim.player("attack");
        };
        if (game.auraBlades) {
            game.auraBlades--;
            game.currentEffect = "aura blade";
        };
        game.select[0] = "attack_fin";
        game.discard.push(game.hand[game.activeCard]);
        game.hand.splice(game.activeCard, 1);
        actionTimer = 4;
        return;
    };
    if (game.select[0] == "attack_fin") {
        let damage = 0;
        if (game.enemyAtt.name == "slash") {
            damage = 5;
        };
        if (game.currentEffect == "aura blade") {
            damage += 10 + game.auraBlades;
        };
        game.enemies[game.select[1]].health -= damage;
        game.select = ["hand", game.prevCard - 1];
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
        } else if (action == "right" && game.select[1]) {
            game.select[1]--;
            actionTimer = 1;
            return;
        } else if (action == "down" && game.select[0] == "lookat_enemy") {
            game.select = ["hand", game.prevCard];
            actionTimer = 1;
            return;
        };
    };
    // play card
    if (action == "enter" && game.select[0] == "hand") {
        var selected = game.hand[game.select[1]];
        if (selected.name == "slash" && game.energy >= selected.energyCost) {
            game.activeCard = game.select[1];
            game.select = ["attack_enemy", game.enemies.length - 1];
            game.enemyAtt = game.hand[game.activeCard];
            actionTimer = 5;
        } else if (selected.name == "block" && game.energy >= selected.energyCost) {
            game.energy -= selected.energyCost;
            game.shield += 4;
            game.discard.push(game.hand[game.select[1]]);
            game.hand.splice(game.select[1], 1);
            actionTimer = 5;
        } else if (selected.name == "aura blade" && game.energy >= selected.energyCost) {
            game.energy -= selected.energyCost;
            game.auraBlades++;
            game.discard.push(game.hand[game.select[1]]);
            game.hand.splice(game.select[1], 1);
            actionTimer = 5;
        } else if (selected.unplayable) {
            notif = [game.select[1], 0, "unplayable"];
            actionTimer = 1;
        } else {
            notif = [game.select[1], 0, "not enough energy"];
            actionTimer = 1;
        };
        return;
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
            game.enemies.push(new Enemy("slime_small"));
            enterBattle();
        };
    } else if (game.floor == 2) {
        if (game.state == "enter") {
            game.enemyIndex = 0;
            game.enemies.push(new Enemy("slime_big"));
            enterBattle();
        };
    };
    // visuals
    backgrounds();
    if (!hide) {
        playerGraphics();
        enemyGraphics();
    };
    foregrounds();
    if (!hide) {
        renderCards();
        if (game.select[0] != "deck" || !game.select[1]) target();
    };
    if (game.select[0] == "help" && game.select[1]) {
        helpGraphics();
	} else if (game.select[0] == "deck" && game.select[1]) {
        deckGraphics();
	} else if (game.select[0] == "discard" && game.select[1]) {
        deckGraphics("discard");
	} else {
        game.cardSelect = [0, 0];
        deckPos = 0;
        deckMove = "none";
    };
}, 100), musicloop = setInterval(function() {
    let time = document.getElementById("music").currentTime;
    if (game.music) {
        if (time === 0) {
            document.getElementById("music").play();
        } else if (time > document.getElementById("music").duration - 0.1) {
            document.getElementById("music").currentTime = 0;
        };
    };
}, 2);
