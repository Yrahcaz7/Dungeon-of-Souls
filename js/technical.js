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

var canvas, scale, ctx, action = "none", lastAction = "none", loaded = false;

window.onload = () => {
	load();
	canvasData();
	mapGraphics(true);
	if (game.map.length === 0) {
		draw.lore(200, 100, "Generating Map...", {"color": "white", "text-align": "center"});
		setTimeout(function() {
			generateMap();
			musicPopups();
			updateVisuals();
			loaded = true;
		}, 100);
	} else {
		musicPopups();
		updateVisuals();
		loaded = true;
	};
};

function canvasData() {
	let canv = document.getElementById("canvas");
	if (!canv) return false;
	canvas = canv;
	scale = canvas.width / 400;
	ctx = canvas.getContext("2d");
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	return true;
};

document.addEventListener("keydown", (event) => {
	const key = event.key, prevAction = "" + action;
	if (key == " " || key == "Enter") action = "enter";
	else if (key == "W" || key == "w" || key == "ArrowUp") action = "up";
	else if (key == "A" || key == "a" || key == "ArrowLeft") action = "left";
	else if (key == "S" || key == "s" || key == "ArrowDown") action = "down";
	else if (key == "D" || key == "d" || key == "ArrowRight") action = "right";
	else action = "none";
	if (key == "Escape") fullscreen("exit");
	else if (key == "Tab") fullscreen();
	if (!event.repeat && prevAction == "none" && lastAction == action && global.options.allow_fast_movement) {
		if (action != "enter") selection();
		updateVisuals();
	};
	if (action != "none") lastAction = action;
});

document.addEventListener("keyup", (event) => {
	const key = event.key;
	if (key == " " || key == "Enter" || key == "W" || key == "w" || key == "ArrowUp" || key == "A" || key == "a" || key == "ArrowLeft" || key == "S" || key == "s" || key == "ArrowDown" || key == "D" || key == "d" || key == "ArrowRight") action = "none";
});

function fullscreen(state = "enter") {
	if (state == "exit") {
		if (document.body.exitFullscreen) {
			document.body.exitFullscreen();
		} else if (document.body.webkitExitFullscreen) {
			document.body.webkitExitFullscreen();
		} else if (document.body.mozExitFullScreen) {
			document.body.mozExitFullScreen();
		} else if (document.body.msExitFullscreen) {
			document.body.msExitFullscreen();
		};
	} else {
		if (document.body.requestFullscreen) {
			document.body.requestFullscreen();
		} else if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen();
		} else if (document.body.mozRequestFullScreen) {
			document.body.mozRequestFullScreen();
		} else if (document.body.msRequestFullscreen) {
			document.body.msRequestFullscreen();
		};
	};
};
