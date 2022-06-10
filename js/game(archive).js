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
    // attack enemy
    if (action == "enter" && game.select[0] == "attack_enemy") {
        if ("basic_attack") {
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
    // select things
    if (action == "up") {
        var index = game.select[1], x, y;
        if ((game.select[0] == "help" || game.select[0] == "lookat") && index == 1) return;
        if (game.select[0] == "card") {
            x = game.handPos[index] + 32;
            y = 138 + 48;
        } else if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
            x = game.enemyPos[index][0] + 32;
            y = game.enemyPos[index][1] + 32;
        } else if (game.select[0] == "help") {
            x = 2 + 9;
            y = 11 + 9;
        } else if (game.select[0] == "looker") {
            x = 22 + 9;
            y = 11 + 9;
        };
        var to = -1, type = "none", distance = [9999, 9999];
        for (let a = 0; a < game.hand.length; a++) {
            if (y - (138 + 48) < 0) continue;
            if (y - (138 + 48) < distance[1]) {
                distance[1] = y - 138 + 48;
                to = a;
                type = "hand";
            } else if (y - (138 + 48) == distance[1]) {
                if (Math.abs(x - (game.handPos[a] + 32)) < distance[0]) {
                    distance[0] = Math.abs(x - (game.handPos[a] + 32));
                    to = a;
                    type = "hand";
                };
            };
        };
        for (let a = 0; a < game.enemies.length; a++) {
            if (y - (game.enemyPos[a][1] + 32) < 0) continue;
            if (y - (game.enemyPos[a][1] + 32) < distance[1]) {
                distance[1] = y - (game.enemyPos[a][1] + 32);
                to = a;
                type = "lookat_enemy";
            } else if (y - (game.enemyPos[a][1] + 32) == distance[1]) {
                if (Math.abs(x - (game.enemyPos[a][0] + 32)) < distance[0]) {
                    distance[0] = Math.abs(x - (game.enemyPos[a][0] + 32));
                    to = a;
                    type = "lookat_enemy";
                };
            };
        };
        if (y - (11 + 9) >= 0) {
            if (y - (11 + 9) < distance[1]) {
                distance[1] = y - (11 + 9);
                to = 0;
                type = "help";
            } else if (y - (11 + 9) == distance[1]) {
                if (Math.abs(x - (2 + 9)) < distance[0]) {
                    distance[0] = Math.abs(x - (2 + 9));
                    to = 0;
                    type = "help";
                };
            };
        };
        if (y - (11 + 9) >= 0) {
            if (y - (11 + 9) < distance[1]) {
                distance[1] = y - (11 + 9);
                to = 0;
                type = "looker";
            } else if (y - (11 + 9) == distance[1]) {
                if (Math.abs(x - (22 + 9)) < distance[0]) {
                    distance[0] = Math.abs(x - (22 + 9));
                    to = 0;
                    type = "looker";
                };
            };
        };
        if (type == "help" || type == "looker") {
            game.select = [type, 0];
        } else {
            game.select = [type, to];
        };
        actionTimer = 1;
    };
    if (action == "down") {
        var index = game.select[1], x, y;
        if ((game.select[0] == "help" || game.select[0] == "lookat") && index == 1) return;
        if (game.select[0] == "card") {
            x = game.handPos[index] + 32;
            y = 138 + 48;
        } else if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
            x = game.enemyPos[index][0] + 32;
            y = game.enemyPos[index][1] + 32;
        } else if (game.select[0] == "help") {
            x = 2 + 9;
            y = 11 + 9;
        } else if (game.select[0] == "looker") {
            x = 22 + 9;
            y = 11 + 9;
        };
        var to = -1, type = "none", distance = [9999, 9999];
        for (let a = 0; a < game.hand.length; a++) {
            if (y - (138 + 48) > 0) continue;
            if (y - (138 + 48) < distance[1]) {
                distance[1] = y - 138 + 48;
                to = a;
                type = "hand";
            } else if (y - (138 + 48) == distance[1]) {
                if (Math.abs(x - (game.handPos[a] + 32)) < distance[0]) {
                    distance[0] = Math.abs(x - (game.handPos[a] + 32));
                    to = a;
                    type = "hand";
                };
            };
        };
        for (let a = 0; a < game.enemies.length; a++) {
            if (y - (game.enemyPos[a][1] + 32) > 0) continue;
            if (y - (game.enemyPos[a][1] + 32) < distance[1]) {
                distance[1] = y - (game.enemyPos[a][1] + 32);
                to = a;
                type = "lookat_enemy";
            } else if (y - (game.enemyPos[a][1] + 32) == distance[1]) {
                if (Math.abs(x - (game.enemyPos[a][0] + 32)) < distance[0]) {
                    distance[0] = Math.abs(x - (game.enemyPos[a][0] + 32));
                    to = a;
                    type = "lookat_enemy";
                };
            };
        };
        if (y - (11 + 9) <= 0) {
            if (y - (11 + 9) < distance[1]) {
                distance[1] = y - (11 + 9);
                to = 0;
                type = "help";
            } else if (y - (11 + 9) == distance[1]) {
                if (Math.abs(x - (2 + 9)) < distance[0]) {
                    distance[0] = Math.abs(x - (2 + 9));
                    to = 0;
                    type = "help";
                };
            };
        };
        if (y - (11 + 9) <= 0) {
            if (y - (11 + 9) < distance[1]) {
                distance[1] = y - (11 + 9);
                to = 0;
                type = "looker";
            } else if (y - (11 + 9) == distance[1]) {
                if (Math.abs(x - (22 + 9)) < distance[0]) {
                    distance[0] = Math.abs(x - (22 + 9));
                    to = 0;
                    type = "looker";
                };
            };
        };
        if (type == "help" || type == "looker") {
            game.select = [type, 0];
        } else {
            game.select = [type, to];
        };
        actionTimer = 1;
    };
    if (action == "right") {
        var index = game.select[1], x, y;
        if ((game.select[0] == "help" || game.select[0] == "lookat") && index == 1) return;
        if (game.select[0] == "card") {
            x = game.handPos[index] + 32;
            y = 138 + 48;
        } else if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
            x = game.enemyPos[index][0] + 32;
            y = game.enemyPos[index][1] + 32;
        } else if (game.select[0] == "help") {
            x = 2 + 9;
            y = 11 + 9;
        } else if (game.select[0] == "looker") {
            x = 22 + 9;
            y = 11 + 9;
        };
        var to = -1, type = "none", distance = [9999, 9999];
        for (let a = 0; a < game.hand.length; a++) {
            if (x - (game.handPos[a] + 32) < 0) continue;
            if (x - (game.handPos[a] + 32) < distance[0]) {
                distance[0] = y - 138 + 48;
                to = a;
                type = "hand";
            } else if (x - (game.handPos[a] + 32) == distance[0]) {
                if (Math.abs(y - (138 + 48)) < distance[1]) {
                    distance[1] = Math.abs(y - (138 + 48));
                    to = a;
                    type = "hand";
                };
            };
        };
        for (let a = 0; a < game.enemies.length; a++) {
            if (x - (game.enemyPos[a][0] + 32) < 0) continue;
            if (x - (game.enemyPos[a][0] + 32) < distance[1]) {
                distance[0] = x - (game.enemyPos[a][0] + 32);
                to = a;
                type = "lookat_enemy";
            } else if (x - (game.enemyPos[a][0] + 32) == distance[0]) {
                if (Math.abs(y - (game.enemyPos[a][1] + 32)) < distance[1]) {
                    distance[1] = Math.abs(y - (game.enemyPos[a][1] + 32));
                    to = a;
                    type = "lookat_enemy";
                };
            };
        };
        if (x - (2 + 9) >= 0) {
            if (x - (2 + 9) < distance[0]) {
                distance[0] = x - (2 + 9);
                to = 0;
                type = "help";
            } else if (x - (2 + 9) == distance[0]) {
                if (Math.abs(y - (11 + 9)) < distance[1]) {
                    distance[1] = Math.abs(y - (11 + 9));
                    to = 0;
                    type = "help";
                };
            };
        };
        if (x - (22 + 9) >= 0) {
            if (x - (22 + 9) < distance[0]) {
                distance[0] = x - (22 + 9);
                to = 0;
                type = "looker";
            } else if (x - (22 + 9) == distance[0]) {
                if (Math.abs(y - (11 + 9)) < distance[1]) {
                    distance[1] = Math.abs(y - (11 + 9));
                    to = 0;
                    type = "looker";
                };
            };
        };
        if (type == "help" || type == "looker") {
            game.select = [type, 0];
        } else {
            game.select = [type, to];
        };
        actionTimer = 1;
    };/*
    if (game.select[0] == "hand") {
        if (!game.hand) {
            game.select[1] = -1;
        } else {
            if (action == "left" && game.select[1] > 0) {
                game.select[1]--;
                actionTimer = 1;
            } else if (action == "right" && game.select[1] < game.hand.length - 1) {
                game.select[1]++;
                actionTimer = 1;
            };
            if (game.select[1] < 0) game.select[1] = 0;
            else if (game.select[1] >= game.hand.length - 1) game.select[1] = game.hand.length - 1;
        };
    };*/
};
