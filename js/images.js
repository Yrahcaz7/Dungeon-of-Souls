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

const player = {
	idle: new Image,
	attack: new Image,
	attack_aura: new Image,
	attack_2: new Image,
	attack_2_aura: new Image,
	shield: new Image,
	shield_reinforced: new Image,
	crouch_shield: new Image,
	crouch_shield_reinforced: new Image,
	hit: new Image,
	death: new Image,
}, card = {
	energy: new Image,
	green_energy: new Image,
	red_energy: new Image,
	back: new Image,
	error: new Image,
	outline: {
		attack: new Image,
		curse: new Image,
		defense: new Image,
		skill: new Image,
		magic: new Image,
	},
	rarity: {
		rare: new Image,
	},
	starter: {
		"slash": new Image,
		"block": new Image,
	},
	common: {
		"aura blade": new Image,
		"burn": new Image,
		"cower": new Image,
		"gold slash": new Image,
		"iron slash": new Image,
		"rage": new Image,
		"reinforce": new Image,
		"sweeping slash": new Image,
		"the eternal gold": new Image,
		"war cry": new Image,
	},
	rare: {
		"aura blaze": new Image,
		"bladestorm": new Image,
		"everlasting shield": new Image,
		"heat wave": new Image,
		"memorize": new Image,
		"resilience": new Image,
	},
}, enemy = {
	slime: {
		big: new Image,
		big_attack: new Image,
		big_defend: new Image,
		small: new Image,
		small_attack: new Image,
		small_defend: new Image,
		to_prime: new Image,
		to_prime_defend: new Image,
		prime: new Image,
		prime_attack: new Image,
		prime_defend: new Image,
	},
	fragment: {
		roll: new Image,
		open: new Image,
		idle: new Image,
		attack: new Image,
	},
	sentry: {
		big: new Image,
		big_attack: new Image,
		big_defend: new Image,
		small: new Image,
		small_attack: new Image,
		small_defend: new Image,
		to_prime: new Image,
		prime: new Image,
		prime_attack: new Image,
		prime_defend: new Image,
	},
}, background = {
	cave: new Image,
	temple: new Image,
	floating_arch: new Image,
	debris: new Image,
	column_debri: new Image,
	clock_face: new Image,
	clock_node: new Image,
	tunnel_of_time: new Image,
	hallway: new Image,
	panel: new Image,
	panel_cover: new Image,
	tiles: new Image,
}, bar = {
	health_empty: new Image,
	health_full: new Image,
	shield_empty: new Image,
	shield_full: new Image,
	energy_empty: new Image,
	energy_full: new Image,
}, select = {
	// menu stuff
	round: new Image,
	options: new Image,
	// card stuff
	card_normal: new Image,
	card_unplayable: new Image,
	card_rare: new Image,
	card_rare_unplayable: new Image,
	deck: new Image,
	discard: new Image,
	// popups
	popup: new Image,
	// map stuff
	map: new Image,
	battle: new Image,
	battle_blue: new Image,
	treasure: new Image,
	treasure_blue: new Image,
	treasure_open_blue: new Image,
	death_zone: new Image,
	death_zone_blue: new Image,
	orb: new Image,
	orb_blue: new Image,
	boss: new Image,
	boss_blue: new Image,
	// artifacts
	candy: new Image,
	card_charm: new Image,
	corrosion: new Image,
	determination: new Image,
	gem_of_rage: new Image,
	iron_will: new Image,
	nutritious_meal: new Image,
	supershield: new Image,
	// other
	selector: [new Image, new Image, new Image, new Image],
	item: new Image,
	item_green: new Image,
	item_border: new Image,
}, extra = {
	options: new Image,
	help: new Image,
	looker: new Image,
	end: new Image,
	deck: new Image,
	discard: new Image,
	void: new Image,
	map: new Image,
}, icon = {
	aura_blade: new Image,
	burn: new Image,
	countdown: new Image,
	reinforce: new Image,
	resilience: new Image,
	rewind: new Image,
	shroud: new Image,
	weakness: new Image,
}, artifact = {
	candy: new Image,
	card_charm: new Image,
	corrosion: new Image,
	determination: new Image,
	gem_of_rage: new Image,
	iron_will: new Image,
	nutritious_meal: new Image,
	supershield: new Image,
}, intent = {
	defend: [new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image],
	attack: [new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image],
	buff: new Image,
}, popup = {
	back: new Image,
	music: new Image,
	go: new Image,
}, map = {
	top: new Image,
	row: new Image,
	bottom: new Image,
	battle: new Image,
	death_zone: new Image,
	treasure: new Image,
	treasure_open: new Image,
	orb: new Image,
	boss: new Image,
	event: new Image,
	select: new Image,
	select_first: new Image,
	scribbles: new Image,
	scribble_back: new Image,
}, rewards = {
	item: new Image,
	back: new Image,
},
title = new Image, difficulty = new Image, victorious = new Image, arrows = new Image, aura_blade = new Image, war_cry = new Image; // other

// player
for (const image in player) {
	if (Object.hasOwnProperty.call(player, image)) {
		player[image].src = "images/player/" + image + ".png";
	};
};

// card stuff
card.energy.src = "images/cards/energy.png";
card.green_energy.src = "images/cards/green_energy.png";
card.red_energy.src = "images/cards/red_energy.png";
card.back.src = "images/cards/back.png";
card.error.src = "images/cards/error.png";

// cards
for (const folder in card) {
	if (Object.hasOwnProperty.call(card, folder)) {
		for (const image in card[folder]) {
			if (Object.hasOwnProperty.call(card[folder], image)) {
				card[folder][image].src = "images/cards/" + folder + "/" + image.replace(/\s/g, "_") + ".png";
			};
		};
	};
};

// enemies
for (const folder in enemy) {
	if (Object.hasOwnProperty.call(enemy, folder)) {
		for (const image in enemy[folder]) {
			if (Object.hasOwnProperty.call(enemy[folder], image)) {
				enemy[folder][image].src = "images/enemies/" + folder + "/" + image + ".png";
			};
		};
	};
};

// backrounds
for (const image in background) {
	if (Object.hasOwnProperty.call(background, image)) {
		background[image].src = "images/background/" + image + ".png";
	};
};

// bars
for (const image in bar) {
	if (Object.hasOwnProperty.call(bar, image)) {
		bar[image].src = "images/bars/" + image + ".png";
	};
};

// selectors
for (const image in select) {
	if (Object.hasOwnProperty.call(select, image)) {
		if (select[image] instanceof Array) continue;
		select[image].src = "images/select/" + image + ".png";
	};
};
select.selector[0].src = "images/select/u_l.png";
select.selector[1].src = "images/select/u_r.png";
select.selector[2].src = "images/select/d_l.png";
select.selector[3].src = "images/select/d_r.png";

// extras
for (const image in extra) {
	if (Object.hasOwnProperty.call(extra, image)) {
		extra[image].src = "images/extras/" + image + ".png";
	};
};

// icons
for (const image in icon) {
	if (Object.hasOwnProperty.call(icon, image)) {
		icon[image].src = "images/icons/" + image + ".png";
	};
};

// artifacts
for (const image in artifact) {
	if (Object.hasOwnProperty.call(artifact, image)) {
		artifact[image].src = "images/artifacts/" + image + ".png";
	};
};

// intents
for (const folder in intent) {
	if (Object.hasOwnProperty.call(intent, folder)) {
		if (intent[folder] instanceof Array) {
			for (let index = 0; index < intent[folder].length; index++) {
				intent[folder][index].src = "images/intent/" + folder + "/" + index + ".png";
			};
		} else {
			intent[folder].src = "images/intent/" + folder + ".png";
		};
	};
};

// popups
for (const image in popup) {
	if (Object.hasOwnProperty.call(popup, image)) {
		popup[image].src = "images/popup/" + image + ".png";
	};
};

// map
for (const image in map) {
	if (Object.hasOwnProperty.call(map, image)) {
		map[image].src = "images/map/" + image + ".png";
	};
};

// rewards
for (const image in rewards) {
	if (Object.hasOwnProperty.call(rewards, image)) {
		rewards[image].src = "images/rewards/" + image + ".png";
	};
};

// other
title.src = "images/title.png";
difficulty.src = "images/difficulty.png";
victorious.src = "images/victorious.png";
arrows.src = "images/arrows.png";
aura_blade.src = "images/aura_blade.png";
war_cry.src = "images/war_cry.png";
