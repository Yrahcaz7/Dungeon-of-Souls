const slime = new Image;

slime.src = "images/slime.png";

function spawnSlime(x, y, frame) {
	ctx.drawImage(
		// load image
		slime,
		// get frame
		frame * 64,
		0,
		64,
		64,
		// print frame
		x,
		y,
		64,
		64
	);
};
