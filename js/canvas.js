var canvas;
var ctx;

window.addEventListener("resize", (_=>resizeCanvas()));

function retrieveCanvasData() {
	let canv = document.getElementById("canvas");
	if (canv === undefined || canv === null) return false;
	canvas = canv;
	ctx = canvas.getContext("2d");
	return true;
};

function resizeCanvas() {
	if (!retrieveCanvasData()) return;
	canvas.width = 0;
    canvas.height = 0;
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
};
