var canvas, width = 0, height = 0, centerY = 0, scale, ctx, action = "none";

function canvasData() {
	document.body.style.cursor = "none";
	let canv = document.getElementById("canvas");
	if (canv === null || canv === undefined) return false;
	canvas = canv;
	width = canvas.width;
	height = canvas.height;
	centerY = height / 2 - 50;
	scale = width / 400;
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
	if (key == 27) exitFullscreen();
	else if (key == 9) enterFullscreen();
});

document.addEventListener("keyup", () => {
	action = "none";
});

function enterFullscreen() {
  	if (document.body.requestFullscreen) {
    	document.body.requestFullscreen();
  	} else if (document.body.webkitRequestFullscreen) {
    	document.body.webkitRequestFullscreen();
  	} else if (document.body.msRequestFullscreen) {
    	document.body.msRequestFullscreen();
  	};
};

function exitFullscreen() {
  	if (document.body.exitFullscreen) {
    	document.body.exitFullscreen();
  	} else if (document.body.webkitExitFullscreen) {
    	document.body.webkitExitFullscreen();
  	} else if (document.body.msExitFullscreen) {
    	document.body.msExitFullscreen();
  	};
};
