/*  Dungeon of Souls
 *  Copyright (C) 2022 Yrahcaz7
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

class Enemy {
	constructor(type, power = 1, override = {}) {
		if (Object.keys(override).length) {
			this.type = override.type;
			this.maxHealth = override.maxHealth;
			this.health = override.health;
			this.maxShield = override.maxShield;
			this.shield = override.shield;
			this.attackPower = override.attackPower;
			this.defendPower = override.defendPower;
			this.reinforces = override.reinforces;
			this.intent = override.intent;
			this.intentHistory = override.intentHistory;
			return;
		};
		if (type == "slime_small") power--;
		if (("" + type).includes("prime")) power++;
		power += game.floor * 0.05;
		this.type = type;
		this.maxHealth = Math.round(((Math.random() / 10) + 0.95) * ((power * 10) + 20));
		this.health = this.maxHealth;
		this.maxShield = Math.round(((Math.random() / 10) + 0.95) * ((power * 5) + 10));
		this.shield = 0;
		this.attackPower = Math.round(((power / 2) + 1) * 5 - 0.25);
		this.defendPower = Math.round(((power / 2) + 1) * 5 + 1);
		this.reinforces = 0;
		this.intent = chance(3/5)?"attack":"defend";
		this.intentHistory = [this.intent];
		game.enemyIndex++;
	};
	startAction() {
		if (this.intent == "attack") {
			if (game.shield && playerAnim[1] != "shield" && playerAnim[1] != "shield_reinforced") {
				if (game.reinforces) startAnim.player("shield_reinforced");
				else startAnim.player("shield");
			};
			if (this.type == "slime_big") startAnim.enemy(game.enemyNum, "slime_ball");
			else if (this.type == "slime_small") startAnim.enemy(game.enemyNum, "slime_small_launch");
			else if (this.type == "slime_prime") startAnim.enemy(game.enemyNum, "slime_prime_fist");
			else {
				this.middleAction();
				this.finishAction();
			};
		} else if (this.intent == "defend") {
			this.middleAction(); // teporary
		};
	};
	middleAction() {
		if (this.intent == "attack") {
			var damage = this.attackPower;
			if (game.shield <= damage) {
				damage -= game.shield;
				game.shield = 0;
				game.health -= damage;
			} else {
				game.shield -= damage;
			};
			if (game.shield < 1) startAnim.player("hit");
		} else if (this.intent == "defend") {
			this.shield += this.defendPower;
			this.finishAction(); // teporary
		};
	};
	finishAction() {
		this.intent = chance(3/5)?"attack":"defend";
		this.intentHistory.push(this.intent);
		if (overrideIntent("attack", this.intentHistory, game.enemyNum)) {
			this.intent = "defend";
		} else if (overrideIntent("defend", this.intentHistory, game.enemyNum)) {
			this.intent = "attack";
		};
		if (game.enemyNum == game.enemies.length - 1) {
			game.enemyNum = 0;
			startTurn();
		} else {
			game.enemyNum++;
		};
		game.enemyStage = "none";
	};
};

function overrideIntent(type, history, location) {
	if (!type || !history) return false;
	let location0 = history.indexOf(type), location1, location2;
	if (location0 !== -1) {
		location1 = history.indexOf(type, location0 + 1);
		if (location1 - 1 === location0) {
			location2 = history.indexOf(type, location0 + 1);
			if (location2 - 1 === location1) {
				game.enemies[location].intentHistory = [];
				return true;
			};
		};
	};
	return false;
};
