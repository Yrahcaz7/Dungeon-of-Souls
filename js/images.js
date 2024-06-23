/*  Dungeon of Souls
 *  Copyright (C) 2024 Yrahcaz7
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

const I = {
	player: {
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
	}, card: {
		energy: new Image,
		green_energy: new Image,
		red_energy: new Image,
		back: new Image,
		error: new Image,
		refine: new Image,
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
		starter: {},
		common: {},
		rare: {},
	}, enemy: {
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
	}, background: {
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
	}, bar: {
		health_empty: new Image,
		health_full: new Image,
		shield_empty: new Image,
		shield_full: new Image,
		energy_empty: new Image,
		energy_full: new Image,
	}, select: {
		round: new Image,
		options: new Image,
		options_yellow: new Image,
		card: new Image,
		card_unplayable: new Image,
		card_rare: new Image,
		card_rare_unplayable: new Image,
		deck: new Image,
		discard: new Image,
		popup: new Image,
		item: new Image,
		item_green: new Image,
		item_border: new Image,
		selector: new Number(4),
	}, extra: {
		options: new Image,
		help: new Image,
		looker: new Image,
		end: new Image,
		deck: new Image,
		discard: new Image,
		void: new Image,
	}, cover: {
		top_left: new Image,
		top_left_big: new Image,
		top_right: new Image,
		bottom_left: new Image,
		bottom_right: new Image,
		corner: new Image,
	}, icon: {
		"1704_back": new Image,
	}, artifact: {
		select: {},
	}, intent: {
		defend: new Number(11),
		attack: new Number(11),
		buff: new Image,
	}, popup: {
		back: new Image,
		music: new Image,
		go: new Image,
	}, map: {
		top: new Image,
		row: new Image,
		bottom: new Image,
		select: new Image,
		select_first: new Image,
		scribbles: new Image,
		scribble_back: new Image,
		node: {
			battle: new Image,
			death_zone: new Image,
			treasure: new Image,
			treasure_open: new Image,
			orb: new Image,
			boss: new Image,
			event: new Image,
			select: {},
		},
	}, reward: {
		item: new Image,
		back: new Image,
	},
	title: new Image,
	difficulty: new Image,
	victorious: new Image,
	arrows: new Image,
	aura_blade: new Image,
	war_cry: new Image,
};

/**
 * Loads an image or all images in a folder.
 * @param {object} ref - a reference to the containing folder.
 * @param {object} name - the name of the image to load.
 * @param {string} path - the path of the containing folder.
 * @param {boolean} select - if true, loads the select image as well.
 * @param {boolean} blue - if true, loads the blue select as well.
 */
function loadImage(ref, name, path, select = false, blue = false) {
	if (ref[name] instanceof Image) {
		ref[name].src = path + name + ".png";
		if (select) {
			ref.select[name] = new Image;
			ref.select[name].src = path + "select/" + name + ".png";
		};
		if (blue) {
			name += "_blue";
			ref.select[name] = new Image;
			ref.select[name].src = path + "select/" + name + ".png";
		};
	} else if (ref[name] instanceof Number) {
		let num = +ref[name];
		ref[name] = [];
		for (let index = 0; index < num; index++) {
			ref[name].push(new Image);
			loadImage(ref[name], index, path + name + "/");
		};
	} else {
		select = ref[name].select && !(ref[name].select instanceof Image);
		for (const folder in ref[name]) {
			if (Object.hasOwnProperty.call(ref[name], folder)) {
				loadImage(ref[name], folder, path + name + "/", select, select && name == "node");
			};
		};
	};
};
