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
    character: "knight",
    unlockedCharStage: 0,
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
    auraBladePos: [[65, 10], [80, 25], [40, 0], [25, 35]],
    currentEffect: "none",
    music: true,
    saveNum: 0,
}, actionTimer = -1, notif = [-1, ""], hide = (game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "deck") && game.select[1];

function hardReset() {
    localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save/0");
    game = null;
    location.reload();
};

function musicPopups() {
    let src = document.getElementById("music").src;
    if (!game.music) {
        showPopup("music", "music is off");
    } else if (src.includes("Ruins_of_Caelum.mp3")) {
        showPopup("music", "Ruins of Caelum");
    };
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
    startTurn();
};

function startTurn() {
    drawHand();
    game.turn = "player";
    game.energy = game.maxEnergy;
    game.select = ["hand", 0];
};

function endTurn() {
    if (game.hand.length >= 1) {
        let iteration = 0;
        for (let index = 0; index < game.hand.length; iteration++) {
            game.discard.push(game.hand[index]);
            game.hand.splice(index, 1);
            if (iteration >= 100) break;
        };
    };
    game.turn = "enemy";
};

function playerTurn() {
    // action timer
    if (actionTimer > -1) return;
    if (!actionTimer || actionTimer < -1) actionTimer = -1;
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

function selection() {
    // action timer
    actionTimer--;
    if (actionTimer > -1) return;
    if (!actionTimer || actionTimer < -1) actionTimer = -1;
    // confirmation
    if (game.select[0] == "confirm_end") {
        if (action == "left" && game.select[1]) {
            game.select[1] = 0;
            actionTimer = 1;
        } else if (action == "right" && !game.select[1]) {
            game.select[1] = 1;
            actionTimer = 1;
        } else if (action == "enter") {
            if (!game.select[1]) endTurn();
            game.select = ["end", 0];
            actionTimer = 2;
        };
        return;
    };
    // select hand
    if (game.select[0] == "none") game.select = ["hand", 0];
    // select extras
    if (action == "up" && game.select[0] == "lookat_enemy") {
        game.select = ["music", 0];
        actionTimer = 1;
        return;
    };
    // select / deselect player and more extras
    if (action == "up" && game.select[0] == "discard" && !game.select[1]) {
        if (!game.hand[0]) game.select = ["lookat_enemy", 0];
        else game.select = ["hand", game.prevCard];
        actionTimer = 1;
        return;
    };
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
            if (!game.hand[0]) game.select = ["lookat_enemy", 0];
            else game.select = ["hand", game.prevCard];
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
            if (!game.hand[0]) game.select = ["lookat_enemy", game.enemies.length - 1];
            else game.select = ["hand", game.prevCard];
            actionTimer = 1;
            return;
        };
        if (game.select[0] == "end") {
            game.select = ["lookat_you", 0];
            actionTimer = 1;
            return;
        };
        if (game.select[0] == "hand" && game.select[1] == game.hand.length - 1) {
            if (popups.length >= 1) {
                game.select = ["popups", 0];
            } else {
                game.select = ["discard", 0];
            };
            actionTimer = 1;
            return;
        };
    };
    if ((action == "right" || action == "up") && game.select[0] == "deck" && !game.select[1]) {
        game.select = ["end", 0];
        actionTimer = 1;
        return;
    };
    // popup selection
    if (game.select[0] == "popups") {
        if (popups.length == 0) {
            game.select = ["hand", game.prevCard];
            return;
        } else if (game.select[1] >= popups.length) {
            game.select[1] = popups.length - 1;
            return;
        } else if (action == "up") {
            if (game.select[1] >= popups.length - 1) {
                game.select = ["music", 0];
            } else {
                game.select[1]++;
            };
            actionTimer = 1;
            return;
        } else if (action == "down") {
            if (game.select[1] >= popups.length - 1) {
                game.select = ["discard", 0];
            } else {
                game.select[1]--;
            };
            actionTimer = 1;
            return;
        } else if (action == "left") {
            game.select = ["hand", game.prevCard];
            actionTimer = 1;
            return;
        } else if (action == "enter") {
            popups.splice(game.select[1], 1);
            if (popups.length == 0) {
                game.select = ["hand", game.prevCard];
            } else if (game.select[1] > 0) {
                game.select[1]--;
            };
            actionTimer = 1;
            return;
        };
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
    if (action == "enter" && (game.select[0] == "looker" || game.select[0] == "deck" || game.select[0] == "discard")) {
        if (game.select[1] == 0) game.select[1] = 1;
        else game.select[1] = 0;
        actionTimer = 2;
        return;
    };
    if (action == "enter" && game.select[0] == "help") {
        if (game.select[1] <= 1) game.select[1]++;
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
        musicPopups();
        actionTimer = 2;
        return;
    };
    if (action == "enter" && game.select[0] == "end" && game.turn == "player") {
        let confirm = false;
        if (game.hand.length >= 1) {
            for (let i = 0; i < game.hand.length; i++) {
                if (game.hand[i].energyCost <= game.energy) {
                    confirm = true;
                    break;
                };
            };
        };
        if (confirm) game.select = ["confirm_end", 0];
        else endTurn();
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
    // select enemy
    if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
        if (action == "left") {
            if (game.select[1] < game.enemies.length - 1) game.select[1]++;
            else game.select = ["lookat_you", 0];
            actionTimer = 1;
            return;
        } else if (action == "right") {
            if (game.select[1]) game.select[1]--;
            else game.select = ["discard", 0];
            actionTimer = 1;
            return;
        } else if (action == "down" && game.select[0] == "lookat_enemy") {
            if (!game.hand[0]) game.select = ["discard", 0];
            else game.select = ["hand", game.prevCard];
            actionTimer = 1;
            return;
        };
    };
};

const gameloop = setInterval(function() {
    // bugs
    if (!canvas || !ctx) {
        console.error("Canvas not loaded properly. Please reload page if problem persists.");
        return;
    };
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // update data
    updateData();
    // actions
    if (game.turn == "player") playerTurn();
    selection();
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
        popupGraphics();
    };
    if (game.select[0] == "confirm_end") {
        let x = 140, y = 86;
        draw.rect("#00000088");
        draw.rect("#000000", x, y, 120, 22);
        draw.rect("#cccccc", x + 1, y + 1, 120 - 2, 22 - 2);
        draw.lore(x + 2, y + 2, "Are you sure you want to end your turn?", "black", "right", true);
        if (!game.select[1]) draw.rect("#ffffff", x + 1, y + 7, 23, 14);
        else draw.rect("#ffffff", x + 23, y + 7, 17, 14);
        draw.rect("#000000", x + 2, y + 8, 21, 12);
        draw.rect("#cccccc", x + 3, y + 9, 21 - 2, 12 - 2);
        draw.lore(x + 4, y + 10, "YES");
        draw.rect("#000000", x + 24, y + 8, 15, 12);
        draw.rect("#cccccc", x + 25, y + 9, 15 - 2, 12 - 2);
        draw.lore(x + 26, y + 10, "NO");
    } else if (game.select[0] == "help" && game.select[1]) {
        infoGraphics();
    } else if (game.select[0] == "deck" && game.select[1]) {
        if (game.deckProxy != "[]") {
            deckGraphics();
        } else {
            draw.rect("#000000cc");
            draw.rect("#00000044", 0, 0, 400, 13);
            draw.lore(200, 1, "Deck", "white", "center");
            draw.rect("#ffffff", 1, 12, 398, 1);
        };
    } else if (game.select[0] == "discard" && game.select[1]) {
        if (game.discardProxy != "[]") {
            deckGraphics("discard");
        } else {
            draw.rect("#000000cc");
            draw.rect("#00000044", 0, 0, 400, 13);
            draw.lore(200, 1, "Discard", "white", "center");
            draw.rect("#ffffff", 1, 12, 398, 1);
        };
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
