/*  Dungeon of Souls
 *  Copyright (C) 2025 Yrahcaz7
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
		head: new Image,
	}, card: {
		energy: new Image,
		green_energy: new Image,
		red_energy: new Image,
		back: new Image,
		error: new Image,
		refine: new Image,
		plus: new Image,
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
		"-1": {},
		0: {},
		1: {},
		2: {},
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
			sticky: new Image,
			sticky_attack: new Image,
			sticky_defend: new Image,
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
		singularity: {
			idle: new Image,
			orbs: new Image,
			attack: new Image,
			attack_overlay: new Image,
			defend: new Image,
			shield: new Image,
		},
	}, background: {
		difficulty: new Image,
		cave: new Image,
		temple: new Image,
		floating_arch: new Image,
		debris: new Image,
		column_debris: new Image,
		clock_face: new Image,
		clock_node: new Image,
		tunnel_of_time: new Image,
		hallway: new Image,
		panel: new Image,
		panel_cover: new Image,
		tiles: new Image,
		victorious: new Image,
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
		card_rare: new Image,
		card_unplayable: new Image,
		card_rare_unplayable: new Image,
		card_plus: new Image,
		card_rare_plus: new Image,
		card_unplayable_plus: new Image,
		card_rare_unplayable_plus: new Image,
		deck: new Image,
		discard: new Image,
		popup: new Image,
		item: new Image,
		item_green: new Image,
		item_border: new Image,
		selector: [4],
	}, extra: {
		options: new Image,
		help: new Image,
		arrows: new Image,
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
		_: {wo: {}},
	}, intent: {
		defend: [11],
		attack: [11],
		buff: new Image,
		summon: new Image,
		ritual: new Image,
		increase: new Image,
		decrease: new Image,
	}, popup: {
		back: new Image,
		music: new Image,
		go: new Image,
	}, map: {
		top: new Image,
		bottom: new Image,
		select: new Image,
		select_first: new Image,
		scribbles: new Image,
		scribble_back: new Image,
		node: {
			100: [4, {wo: [], bo: []}],
			101: [2, {wo: [], bo: []}],
			102: new Image,
			103: new Image,
			104: new Image,
			105: new Image,
			_: {wo: {}, bo: {}},
		},
	}, reward: {
		item: new Image,
		back: new Image,
	}, effect: {
		war_cry: new Image,
	},
	x: new Image,
	aura_blade: new Image,
	title: new Image,
};

/**
 * Loads all images.
 */
const loadImages = (() => {
	const promises = [];
	let loadSteps = 0;
	let loadProg = 0;
	/**
	 * Counts an image or all images in a folder.
	 * @param {object} ref - a reference to the containing folder.
	 * @param {string} name - the name of the image to count.
	 */
	function countImages(ref, name) {
		if (ref[name] instanceof Image) {
			return 1 + Object.keys(ref._ || {}).length;
		} else if (ref[name] instanceof Array) {
			return ref[name][0] * (1 + Object.keys(ref[name][1] || {}).length);
		} else {
			let count = 0;
			for (const folder in ref[name]) {
				count += countImages(ref[name], folder);
			};
			return count;
		};
	};
	/**
	 * Loads an image or all images in a folder.
	 * @param {object} ref - a reference to the containing folder.
	 * @param {string} name - the name of the image to load.
	 * @param {string} path - the path of the containing folder.
	 */
	async function loadImage(ref, name, path) {
		if (ref[name] instanceof Image) {
			if (!ref[name].src) {
				ref[name].src = path + name + ".png";
				promises.push(new Promise(resolve => ref[name].onload = resolve).then(updateLoadProg));
			};
			for (const extra in ref._) {
				if (ref._[extra][name]?.src) continue;
				ref._[extra][name] = new Image;
				ref._[extra][name].src = path + extra + "/" + name + ".png";
				promises.push(new Promise(resolve => ref._[extra][name].onload = resolve).then(updateLoadProg));
			};
		} else if (ref[name] instanceof Array) {
			const num = ref[name][0];
			const extras = ref[name][1];
			ref[name] = [];
			if (extras) ref[name]._ = extras;
			for (let index = 0; index < num; index++) {
				ref[name].push(new Image);
				promises.push(loadImage(ref[name], index, path + name + "/"));
			};
		} else {
			for (const folder in ref[name]) {
				await loadImage(ref[name], folder, path + name + "/");
			};
		};
	};
	/**
	 * Updates the graphics loading progress.
	 */
	async function updateLoadProg() {
		clearCanvas();
		draw.lore(200 - 2, 100 - 5.5 * 3, "Loading graphics...\n\n" + (loadProg / loadSteps * 100).toFixed(1) + "%", {"color": "#fff", "text-align": DIR.CENTER});
		loadProg++;
		await new Promise(resolve => setTimeout(resolve));
	};
	return async () => {
		const loadStartTime = Date.now();
		// setup cards
		for (const id in CARDS) {
			if (id <= 0) continue;
			I.card[CARDS[id].rarity][id] = new Image;
			if (CARDS[id].rarity >= 0) CARD_IDS[CARDS[id].rarity].push(+id);
		};
		// setup artifacts
		for (const id in ARTIFACTS) {
			I.artifact[id] = new Image;
			if (id >= 100 && id < 200) ARTIFACT_IDS.push(+id);
		};
		// setup effect icons
		for (const eff in EFF) {
			I.icon[EFF[eff]] = new Image;
		};
		// setup enemy effect icons
		for (const eff in ENEMY_EFF) {
			I.icon[ENEMY_EFF[eff]] = new Image;
		};
		// count images
		for (const folder in I) {
			loadSteps += countImages(I, folder);
		};
		// load images
		updateLoadProg();
		for (const folder in I) {
			loadImage(I, folder, "images/");
		};
		await Promise.all(promises);
		console.log("[images loaded in " + (Date.now() - loadStartTime) + "ms]");
	};
})();
