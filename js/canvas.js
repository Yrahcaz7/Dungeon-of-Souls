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

var canvas, scale, ctx, action = "none", screenState = "window";

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
	let key = event.keyCode;
	if (key == 32 || key == 13) action = "enter";
	else if (key == 87 || key == 38) action = "up";
	else if (key == 65 || key == 37) action = "left";
	else if (key == 83 || key == 40) action = "down";
	else if (key == 68 || key == 39) action = "right";
	else action = "none";
	if (key == 27) fullscreen("exit");
	else if (key == 9) fullscreen();
});

document.addEventListener("keyup", () => {
	action = "none";
});

function fullscreen(state = "enter") {
	if (state == "exit") {
		if (document.body.exitFullscreen) {
			document.body.exitFullscreen();
		} else if (document.body.webkitExitFullscreen) {
			document.body.webkitExitFullscreen();
	  	} else if (document.body.msExitFullscreen) {
			document.body.msExitFullscreen();
		};
	} else {
		screenState = "fullscreen";
  		if (document.body.requestFullscreen) {
    		document.body.requestFullscreen();
  		} else if (document.body.webkitRequestFullscreen) {
    		document.body.webkitRequestFullscreen();
  		} else if (document.body.msRequestFullscreen) {
	    	document.body.msRequestFullscreen();
  		};
	};
};
