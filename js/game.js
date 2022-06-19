/*
    Dungeon of Souls
    Copyright (C) 2022 Yrahcaz7

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
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
    enemyAtt: "none",
    energy: 3,
    maxEnergy: 3,
    enemies: [],
    enemyPos: [],
    enemyIndex: 0,
    deck: [new Card("slash"), new Card("slash"), new Card("slash"), new Card("slash"), new Card("block"), new Card("block"), new Card("block"), new Card("block")],
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
        if (selected.name == "slash" && game.energy >= 1) {
            game.activeCard = game.select[1];
            game.select = ["attack_enemy", game.enemies.length - 1];
            game.enemyAtt = "slash";
            actionTimer = 5;
            return;
        } else if (selected.name == "block" && game.energy >= 1) {
            game.energy--;
            game.shield += 4;
            game.discard.push(game.hand[game.select[1]]);
            game.hand.splice(game.select[1], 1);
            actionTimer = 5;
            return;
        } else if (!selected.unplayable) {
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
        enemyGraphics();
        playerGraphics();
        target();
    };
    foregrounds();
    if (!hide) {
        renderCards();
    };
    if (game.select[0] == "help" && game.select[1]) {
        draw.rect("#000000cc");
        draw.image(help, 381, 3);
        draw.image(select.round, 380, 2);
        draw.lore(1, 1, "Dungeon of Souls", "white");
        draw.lore(1, 23, "Storyline:", "white");
        draw.lore(1, 67, "Controls:", "white");
        draw.lore(1, 100, "How to Play:", "white");
        draw.lore(1, 149.5, "An ominous feeling...", "white");
        draw.lore(1, 12, text, "white", "right", true);
	};
}, 100);
