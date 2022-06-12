var canvas, width = 0, height = 0, centerY = 0, ctx, action = "none";

function canvasData() {
	document.body.style.cursor = "none";
	let canv = document.getElementById("canvas");
	if (canv === null || canv === undefined) return false;
	canvas = canv;
	width = canvas.width;
	height = canvas.height;
	centerY = height / 2 - 50;
	ctx = canvas.getContext("2d");
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
});

document.addEventListener("keyup", () => {
	action = "none";
});
