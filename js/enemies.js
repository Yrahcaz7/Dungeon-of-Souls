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

class Enemy {
    constructor(type, power) {
        if (type == "slime_small") power--;
        this.type = type;
        this.maxHealth = Math.round(((Math.random() / 4) + 0.875) * ((power * 10) + 20));
        this.health = this.maxHealth;
        this.maxShield = Math.round(((Math.random() / 4) + 0.875) * ((power * 5) + 10));
        this.shield = 0;
        this.attackPower = Math.round(((power / 2) + 1) * 5);
        this.location = game.enemyIndex;
        game.enemyIndex++;
    };
    startAction(type) {
        if (type == "attack") {
            if (game.shield >= 1) startAnim.player("shield");
            startAnim.enemy(this.location, "slime_small_launch");
        };
    };
    middleAction(type) {
        if (type == "attack") {
            var damage = this.attackPower;
            if (game.shield <= damage) {
                damage -= game.shield;
                game.shield = 0;
                game.health -= damage;
            } else {
                game.shield -= damage;
            };
            if (game.shield < 1) startAnim.player("hit");
        };
    };
    finishAction(type) {
        if (this.location == game.enemies.length - 1) {
            game.turn = "player";
        };
    };
};
