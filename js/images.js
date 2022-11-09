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
	hit: new Image,
	death: new Image,
}, card = {
	energy: new Image,
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
		"reinforce": new Image,
		"aura blade": new Image,
		"war cry": new Image,
	},
	rare: {
		"everlasting shield": new Image,
		"heat wave": new Image,
	},
}, enemy = {
	slime: {
		big: new Image,
		slime_ball: new Image,
		small: new Image,
		small_launch: new Image,
		to_prime: new Image,
		prime: new Image,
		prime_fist: new Image,
	},
}, background = {
	cave: new Image,
	temple: new Image,
	floating_arch: new Image,
}, clock = {
	face: new Image,
	hour_hand: new Image,
	min_hand: new Image,
	node: new Image,
}, letters = {
	black: new Image,
	blue: new Image,
	red: new Image,
	white: new Image,
	yellow: new Image,
	deep_red: new Image,
	light_green: new Image,
	red_fade: [new Image, new Image, new Image],
	outline_black: new Image,
	outline_white: new Image,
}, bar = {
	health_empty: new Image,
	health_full: new Image,
	shield_empty: new Image,
	shield_full: new Image,
	energy_empty: new Image,
	energy_full: new Image,
}, select = {
	round: new Image,
	card_normal: new Image,
	card_unplayable: new Image,
	card_rare: new Image,
	card_rare_unplayable: new Image,
	deck: new Image,
	discard: new Image,
	popup: new Image,
	map: new Image,
	battle: new Image,
	battle_blue: new Image,
	treasure: new Image,
	treasure_blue: new Image,
	treasure_open_blue: new Image,
	death_zone: new Image,
	death_zone_blue: new Image,
	iron_will: new Image,
	selector: [new Image, new Image, new Image, new Image],
	item: new Image,
	item_green: new Image,
	item_border: new Image,
}, extra = {
	help: new Image,
	looker: new Image,
	music: new Image,
	end: new Image,
	deck: new Image,
	discard: new Image,
	map: new Image,
	seed: new Image,
}, icon = {
	aura_blade: new Image,
	burn: new Image,
	iron_will: new Image,
	reinforce: new Image,
}, intent = {
	defend: [new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image],
	attack: [new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image],
}, popup = {
	back: new Image,
	music: new Image,
	go: new Image,
}, map = {
	top: new Image,
	row: new Image,
	bottom: new Image,
	battle: new Image,
	treasure: new Image,
	treasure_open: new Image,
	death_zone: new Image,
	select: new Image,
	select_first: new Image,
}, rewards = {
	item: new Image,
	back: new Image,
},
view = new Image, title = new Image, aura_blade = new Image, arrows = new Image, war_cry = new Image; // other

// player
for (const image in player) {
	if (Object.hasOwnProperty.call(player, image)) {
		player[image].src = "images/player/" + image + ".png";
	};
};

// card stuff
card.energy.src = "images/cards/energy.png";
card.back.src = "images/cards/back.png";
card.error.src = "images/cards/error.png";

// starter cards
card.starter["slash"].src = "images/cards/starter/slash.png";
card.starter["block"].src = "images/cards/starter/block.png";

// common cards
card.common["reinforce"].src = "images/cards/common/reinforce.png";
card.common["aura blade"].src = "images/cards/common/aura_blade.png";
card.common["war cry"].src = "images/cards/common/war_cry.png";

// rare cards
card.rare["everlasting shield"].src = "images/cards/rare/everlasting_shield.png";
card.rare["heat wave"].src = "images/cards/rare/heat_wave.png";

// card outlines
for (const image in card.outline) {
	if (Object.hasOwnProperty.call(card.outline, image)) {
		card.outline[image].src = "images/cards/outline/" + image + ".png";
	};
};

// card rarities
card.rarity.rare.src = "images/cards/rarity/rare.png";

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

// the clock
for (const image in clock) {
	if (Object.hasOwnProperty.call(clock, image)) {
		clock[image].src = "images/clock/" + image + ".png";
	};
};

// letters
for (const image in letters) {
	if (Object.hasOwnProperty.call(letters, image)) {
		if (letters[image] instanceof Array) continue;
		letters[image].src = "images/letters/" + image + ".png";
	};
};
letters.red_fade[0].src = "images/letters/red_fade_0.png";
letters.red_fade[1].src = "images/letters/red_fade_1.png";
letters.red_fade[2].src = "images/letters/red_fade_2.png";

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

// intents
for (const folder in intent) {
	if (Object.hasOwnProperty.call(intent, folder)) {
		for (let index = 0; index < intent[folder].length; index++) {
			intent[folder][index].src = "images/intent/" + folder + "/" + index + ".png";
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
rewards.item.src = "images/rewards/item.png";
rewards.back.src = "images/rewards/back.png";

// other
view.src = "images/view.png";
title.src = "images/title.png";
aura_blade.src = "images/aura_blade.png";
arrows.src = "images/arrows.png";
war_cry.src = "images/war_cry.png";
