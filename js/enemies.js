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

class Enemy {
	constructor(type, power = 1, override = {}) {
		if (Object.keys(override).length) {
			this.type = override.type;
			this.maxHealth = override.maxHealth;
			this.health = override.health;
			this.maxShield = override.maxShield;
			this.shield = override.shield;
			this.attackPower = override.attackPower;
			this.intent = override.intent;
			this.location = override.location;
			return;
		};
		if (type == "slime_small") power--;
		power += game.floor * 0.05;
		this.type = type;
		this.maxHealth = Math.round(((Math.random() / 5) + 0.9) * ((power * 10) + 20));
		this.health = this.maxHealth;
		this.maxShield = Math.round(((Math.random() / 5) + 0.9) * ((power * 5) + 10));
		this.shield = 0;
		this.attackPower = Math.round(((power / 2) + 1) * 5 - 0.25);
		this.defendPower = Math.round(((power / 2) + 1) * 5 - 1);
		this.intent = (Math.random()>=0.4)?"attack":"defend";
		this.location = game.enemyIndex;
		game.enemyIndex++;
	};
	startAction() {
		if (this.intent == "attack") {
			if (game.shield) {
				if (game.reinforces) startAnim.player("shield_reinforced");
				else startAnim.player("shield");
			};
			if (this.type == "slime_small") startAnim.enemy(this.location, "slime_small_launch");
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
		if (this.location == game.enemies.length - 1) {
			game.enemyNum = 0;
			startTurn();
		} else {
			game.enemyNum++;
		};
		this.intent = (Math.random()>=0.4)?"attack":"defend";
		game.enemyStage = "none";
	};
};
