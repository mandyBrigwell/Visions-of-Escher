// Visions of Escher
// 2022 Mandy Brigwell
// Fonts from Google Fonts, released under open source licenses and usable in any non-commercial or commercial project.

var nameOfPiece = "Visions of Escher";

let randomSeedValue = ~~(fxrand() * 12345);
let noiseSeedValue = ~~(fxrand() * 56789);

// Graphics buffers, resolution, frames and rendering
var theCanvas, graphicsBuffer, renderBuffer, saveBuffer;

// These are the graphics layers that form the eye, in the order they will be rendered
const buffer = {
	background: 0,
	sclera: 1,
	irisBackground: 2,
	iris: 3,
	pupil: 4,
	specular: 5,
	shading: 6,
	eyelid: 7
};


var graphicsBuffers = [];
var renderFlags = [];

var screenSize;

// A secret test mode, intended for taking screenshots for Twitter - activation key is z
var alwaysShowTitle = false;

// Resolution independence
var fullRes = 2048;

// Sizes for the rendering canvases
// Note that these aren't appropriate for the main canvas which has dimensions of screenSize, not fullRes
const size = {
	half: fullRes / 1024,
	one: fullRes / 512,
	two: fullRes / 256,
	three: fullRes / 128,
	four: fullRes / 64,
	five: fullRes / 32,
	six: fullRes / 16,
	seven: fullRes / 8,
	eight: fullRes / 2
};

// Prepare fonts for preloading
var titleFont, labelFont;

// HUD Variables
var infoTargetAlpha = 0;
var infoAlpha = 0;
var titleTargetAlpha = 0;
var titleAlpha = 360;
var messageAlpha = 360;
var messageString = "Press 'I' for information";
var startFrame, endFrame, requiredFrames;
var infoText;

// Flags
var firstRenderComplete = false;
var currentlyRendering = false;

// Colours
var colorMapName, backgroundColor;
var colorStructures = [];
pushColorStructures();
colorStructure = colorStructures[~~(fxrand() * colorStructures.length)];
// Data items in the colorStructure arrays are:
const colors = {
	name: 0,
	irisInner: 1,
	irisMain: 2,
	irisOuter: 3,
	skull: 4,
	accent: 5
};

// Rare options
var darkMode, specularDetail, ultraZoom;
var rareFeatureDescription;

// Populate render quotes and choose render quote
var renderQuotes = [];
pushRenderQuotes();
var renderQuote = renderQuotes[~~(fxrand() * renderQuotes.length)];

// Populate the instruction text
var instructionText = "";
pushInstructionTexts();

// Measurements
var irisRadius, irisDiameter, irisStriations;
var pupilRadius, pupilDiameter, pupilScale;

// Eye Shapes
var eyeShapes = [];
pushEyeShapes();
var eyeName, eyelidVariationX, eyelidVariationY, eyeScaleX, eyeScaleY;
var eyeCoordinates = [];

// Skull
var skullRadius, eyeSocketRadius, eyeSocketPosition, nostrilRadius, nostrilXShift, nostrilYShift, cheekHollowRadius;

initiate();

window.$fxhashFeatures = {
	"Palette": colorStructure[colors.name],
	"Iris size": irisDiameter < 0.88 ? "Small" : irisDiameter > 0.92 ? "Large" : "Medium",
	"Iris complexity": (irisStriations < 4 ? "Low" : (irisStriations > 6 ? "High" : "Normal")),
	"Pupil size": (pupilScale < 0.325 ? "Small" : (pupilScale > 0.3875 ? "Large" : "Normal")),
	"Eyelid style": eyeName,
	"Rare features": rareFeatureDescription
}

// The initiate function sets variables for the render,
function initiate() {

	colorStructure = colorStructures[~~(fxrand() * colorStructures.length)];

	irisDiameter = fxrandbetween(0.85, 0.98);
	irisRadius = irisDiameter * 0.5;
	pupilScale = fxrandbetween(0.25, 0.4);
	pupilDiameter = irisDiameter * pupilScale;
	pupilRadius = pupilDiameter * 0.5;
	irisStriations = ~~(fxrandbetween(2, 8));

	// Choose an eye shape and parse data
	eyeShape = eyeShapes[~~(fxrand() * eyeShapes.length)];
	eyeName = eyeShape[0];
	eyelidVariationX = fxrandbetween(0.95, 1.05);
	eyelidVariationY = fxrandbetween(0.95, 1.05);
	eyeScaleX = eyeShape[1][0] * eyelidVariationX;
	eyeScaleY = eyeShape[1][1] * eyelidVariationY;
	eyeCoordinates = eyeShape.slice(2);
	eyeCoordinates.splice(0, 0, eyeCoordinates[0]);
	eyeCoordinates.push(eyeCoordinates[eyeCoordinates.length - 1]);

	// Rare options
	rareFeatureDescription = "None";
	specularDetail = 0;
	darkMode = false;
	ultraZoom = false;
	if (fxrand() < 0.04) {
		specularDetail = 2;
		rareFeatureDescription = "Specular striation";
		messageString += "\nRare feature active: Specular striation";
	} else if (fxrand() < 0.04) {
		darkMode = true;
		rareFeatureDescription = "Dark mode";
		messageString += "\nRare feature active: Dark mode";
	} else if (fxrand() < 0.04) {
		ultraZoom = true;
		irisDiameter = 2;
		irisRadius = irisDiameter * 0.5;
		pupilDiameter = 0.2;
		pupilRadius = pupilDiameter * 0.5;
		rareFeatureDescription = "Ultra zoom";
		messageString += "\nRare feature active: Ultra zoom";
	} else if (fxrand() < 0.04) {
		eyeScaleX = 3.125;
		eyeScaleY = 3.125;
		rareFeatureDescription = "Wide-eyed";
		messageString += "\nRare feature active: Wide-eyed";
	}

	skullRadius = pupilRadius * fxrandbetween(0.5, 0.65);
	eyeSocketRadius = skullRadius * 0.6;
	eyeSocketPosition = skullRadius * 0.3;
	nostrilRadius = skullRadius * 0.4;
	nostrilXShift = skullRadius * 0.055;
	nostrilYShift = skullRadius * 0.6;
	cheekHollowRadius = skullRadius * 0.45;

	alwaysShowTitle = false;

}

function preload() {
	titleFont = loadFont("CinzelDecorative-Regular.ttf");
	quoteFont = loadFont("Bitter-Regular.ttf");
}

function setup() {
	pixelDensity(1);
	randomSeed(randomSeedValue);
	noiseSeed(noiseSeedValue);

	screenSize = min(windowWidth, windowHeight);
	theCanvas = createCanvas(screenSize, screenSize);
	colorMode(HSB, 360);
	rectMode(CENTER);
	imageMode(CENTER);
	background(0);

	// Set up
	createGraphicsBuffers();
	createInfo();
	startRender();
}

function createGraphicsBuffers() {
	// Graphics buffer
	graphicsBuffer = createGraphics(fullRes, fullRes);
	graphicsBuffer.colorMode(HSB, 360);

	// Render buffer
	renderBuffer = createGraphics(fullRes, fullRes);
	renderBuffer.colorMode(HSB, 360);

	// Render buffer
	saveBuffer = createGraphics(fullRes, fullRes);
	saveBuffer.colorMode(HSB, 360);
	saveBuffer.rectMode(CENTER);
	saveBuffer.imageMode(CENTER);

	for (var i = 0; i < Object.keys(buffer).length; i++) {
		graphicsBuffers[i] = createGraphics(fullRes, fullRes);
		graphicsBuffers[i].colorMode(HSB, 360);
		graphicsBuffers[i].rectMode(CENTER);
		renderFlags[i] = true;
	}
}

function startRender() {
	// Clear main canvas and render buffer
	theCanvas.clear();
	renderBuffer.clear();

	// Clear all graphics buffers
	for (var eachBuffer of graphicsBuffers) {
		eachBuffer.clear();
	}

	requiredFrames = 360;
	startFrame = frameCount;
	endFrame = startFrame + requiredFrames;

	// Disable specific layers for two rare features
	if (darkMode) {
		renderFlags[buffer.sclera] = false;
		renderFlags[buffer.pupil] = false;
	}
	if (ultraZoom) {
		renderFlags[buffer.eyelid] = false;
		renderFlags[buffer.specular] = false;
	}
	
	currentlyRendering = true;
}

function renderLayers(toCanvas, layers) {
	toCanvas.clear();
	toCanvas.colorMode(HSB, 360);
	toCanvas.background(0);
	var toCanvasSize = min(toCanvas.width, toCanvas.height);
	for (layer in layers) {
		var thisLayer = layers[layer];
		toCanvas.image(thisLayer, 0, 0, toCanvasSize, toCanvasSize);
	}
}

function setAllRenderFlags(state) {
	for (var i = 0; i < renderFlags.length; i++) {
		renderFlags[i] = state;
	}
}

function fxrandbetween(from, to) {
	return from + (to - from) * fxrand();
}

function randomPointInCircle(theta, radius) {
	return new p5.Vector(cos(theta) * sqrt(radius), sin(theta) * sqrt(radius));
}

function getColor(colorPosition, colorAlpha) {
	var thisColor = color(colorStructure[colorPosition]);
	thisColor.setAlpha(colorAlpha);
	return thisColor;
}

function displayMessage(message) {
	messageString = message;
	messageAlpha = 360;
}

function draw() {

	// Reset all graphics buffers
	for (var eachBuffer of graphicsBuffers) {
		eachBuffer.resetMatrix();
		eachBuffer.translate(eachBuffer.width * 0.5, eachBuffer.height * 0.5);
		eachBuffer.noFill();
		eachBuffer.noStroke();
		eachBuffer.strokeWeight(size.one);
	}

	// Manage framecount and rendering process
	var elapsedFrame = frameCount - startFrame;
	var renderProgress = elapsedFrame / requiredFrames;
	var renderProgressRemaining = 1 - renderProgress;

	// Shade the iris background over the fifth of the render
	if (renderProgress < 0.25) {
		graphicsBuffers[buffer.irisBackground].fill(map(sqrt(renderProgress), 0, sqrt(0.25), 360, 0), map(renderProgress, 0, 0.25, 0, 360));
		graphicsBuffers[buffer.irisBackground].ellipse(0, 0, fullRes * irisDiameter);
		graphicsBuffers[buffer.irisBackground].erase(360);
		graphicsBuffers[buffer.irisBackground].ellipse(0, 0, fullRes * pupilDiameter - size.two);
		graphicsBuffers[buffer.irisBackground].noErase();
	}

	// Shade the sclera over four frames, otherwise it's a little slow	
	if (elapsedFrame <= 4) {
		for (var i=elapsedFrame; i<fullRes; i += 4) {
			graphicsBuffers[buffer.sclera].stroke(map(i, 0, fullRes, 180, 360));
			graphicsBuffers[buffer.sclera].strokeWeight(size.one);
			graphicsBuffers[buffer.sclera].line(-fullRes * 0.5, fullRes * -0.5 + i, fullRes * 0.5, fullRes * -0.5 + i);
		}
	}

	if (elapsedFrame == 1) {

		// Fill sclera
		graphicsBuffers[buffer.sclera].background(180);

		// Fill pupil
		graphicsBuffers[buffer.pupil].fill(0);
		graphicsBuffers[buffer.pupil].ellipse(0, 0, fullRes * pupilDiameter);

		// Eyelid
		graphicsBuffers[buffer.eyelid].fill(0);
		graphicsBuffers[buffer.eyelid].rect(0, 0, fullRes, fullRes);
		for (var i = 1; i > 0; i -= 1 / 64) {
			graphicsBuffers[buffer.eyelid].fill(map(i, 0, 1, 160, 0), 345);
			graphicsBuffers[buffer.eyelid].ellipse(0, 0, i * fullRes * 1.05);
		}

		// Eyelid noise texture
		for (var i = -0.5; i < 0.5; i += 1 / 65536) {
			graphicsBuffers[buffer.eyelid].stroke(0);
			graphicsBuffers[buffer.eyelid].strokeWeight(size.half);
			var xPos = fullRes * i;
			var yPos = random() * random(0.5);
			graphicsBuffers[buffer.eyelid].stroke(0);
			graphicsBuffers[buffer.eyelid].stroke(360, map(noise(5 + i * 100, yPos * 0.1), 0, 1, 0, 60));
			graphicsBuffers[buffer.eyelid].point(xPos, fullRes * (0.5 - yPos));
			graphicsBuffers[buffer.eyelid].point(xPos, fullRes * (-0.5 + yPos));
		}

		// 		Erase central portion of eyelid
		graphicsBuffers[buffer.eyelid].erase(360);
		graphicsBuffers[buffer.eyelid].beginShape();
		for (var i = 0; i < eyeCoordinates.length; i++) {
			graphicsBuffers[buffer.eyelid].curveVertex(eyeCoordinates[i][0] * fullRes * eyeScaleX, (eyeCoordinates[i][1] - 0.05) * fullRes * eyeScaleY);
		}
		graphicsBuffers[buffer.eyelid].endShape(CLOSE);
		graphicsBuffers[buffer.eyelid].noErase();

		var shadowLayers = 32;
		graphicsBuffers[buffer.eyelid].noFill();
		graphicsBuffers[buffer.eyelid].stroke(30, 3);
		for (var j = 0; j < shadowLayers; j++) {
			graphicsBuffers[buffer.eyelid].strokeWeight(map(j, 0, shadowLayers - 1, size.seven, size.half));
			graphicsBuffers[buffer.eyelid].beginShape();
			for (var i = 0; i < eyeCoordinates.length; i++) {
				graphicsBuffers[buffer.eyelid].curveVertex(eyeCoordinates[i][0] * fullRes * eyeScaleX, (eyeCoordinates[i][1] - 0.05) * fullRes * eyeScaleY);
			}
			graphicsBuffers[buffer.eyelid].endShape(CLOSE);
		}
	}

	// If we're within the required frames, this loop renders multiple points
	if (elapsedFrame <= requiredFrames) {

		// Sclera
		for (var i = 0; i < 1024; i++) {
			var radius, newPoint;

			// Point near to iris
			radius = irisRadius * irisRadius * (1 + random() * random() * random() * random());
			newPoint = randomPointInCircle(random(TAU), radius);
			graphicsBuffers[buffer.sclera].strokeWeight(size.half);
			graphicsBuffers[buffer.sclera].stroke(0, 15);
			graphicsBuffers[buffer.sclera].point(newPoint.x * fullRes, newPoint.y * fullRes);

			// Point near to eyelid
			radius = 0.5 - random() * random();
			newPoint = randomPointInCircle(random(TAU), radius);
			var noiseValue = noise((1 + newPoint.x) * 10, (1 + newPoint.y) * 10);
			if (noiseValue > 0.47 && noiseValue < 0.5) {
				graphicsBuffers[buffer.sclera].strokeWeight(map(noiseValue, 0.47, 0.5, size.half, size.one));
				graphicsBuffers[buffer.sclera].stroke(0, 360, 360, map(noiseValue, 0.49, 0.5, 60, 30));
				graphicsBuffers[buffer.sclera].point(newPoint.x * fullRes, newPoint.y * fullRes);
			}
		}

		// Iris points
		for (var i = 0; i < 512; i++) {
			var theta = renderProgress * TAU + map(i % irisStriations, 0, irisStriations - 1, 0, TAU) + random(-1, 1) * random();
			var radius = random(pupilRadius * pupilRadius, irisRadius * irisRadius);
			var newPoint = randomPointInCircle(theta, radius);
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisMain, 30 * radius));
			graphicsBuffers[buffer.iris].strokeWeight(size.one);
			graphicsBuffers[buffer.iris].point(newPoint.x * fullRes, newPoint.y * fullRes);
		}

		// Iris striations inner
		for (var i = 0; i < ~~(renderProgressRemaining * 64); i++) {
			var theta = map(i % (irisStriations * 4), 0, (irisStriations * 4) - 1, -PI * i, PI * i) + (random(-PI, PI) * random() * random());
			var radius = irisRadius;
			var innerPoint = randomPointInCircle(theta, pupilRadius * pupilRadius + (pupilRadius * random() * random() * random() * random() * random() * random()));
			var outerPoint = randomPointInCircle(theta, pupilRadius * pupilRadius + (pupilRadius * random() * random() * random() * random() * random() * random()));
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisInner, 15));
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].line(innerPoint.x * fullRes, innerPoint.y * fullRes, outerPoint.x * fullRes, outerPoint.y * fullRes);
		}

		// Iris Darkening inner
		for (var i = 0; i < 64; i++) {
			var theta = map(i % (irisStriations * 4), 0, (irisStriations * 4) - 1, -PI * i, PI * i) + (random(-PI, PI) * random() * random());
			var radius = irisRadius;
			var innerPoint = randomPointInCircle(theta, pupilRadius * pupilRadius + (pupilRadius * 2 * random() * random() * random() * random() * random() * random() * random()));
			var outerPoint = randomPointInCircle(theta, pupilRadius * pupilRadius + (pupilRadius * random() * random() * random() * random() * random() * random() * random()));
			graphicsBuffers[buffer.iris].stroke(0, 10);
			graphicsBuffers[buffer.iris].strokeWeight(size.two);
			graphicsBuffers[buffer.iris].line(innerPoint.x * fullRes, innerPoint.y * fullRes, outerPoint.x * fullRes, outerPoint.y * fullRes);
		}

		// Iris striations mid
		for (var i = 0; i < 32; i++) {
			var theta = map(i % (irisStriations * 4), 0, (irisStriations * 4) - 1, -PI * i, PI * i) + (random(-PI, PI) * random() * random());
			var innerPoint = randomPointInCircle(theta, pupilRadius * pupilRadius * (1 + (random() * random())));
			var outerPoint = randomPointInCircle(theta, (pupilRadius * pupilRadius) + (irisRadius * irisRadius) * random() * 0.75); //*random()*random());
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisMain, 30));
			graphicsBuffers[buffer.iris].line(innerPoint.x * fullRes, innerPoint.y * fullRes, outerPoint.x * fullRes, outerPoint.y * fullRes);
		}

		// Iris striations outer
		for (var i = 0; i < 32; i++) {
			var theta = map(i % (irisStriations * 4), 0, (irisStriations * 4) - 1, -PI * i, PI * i) + (random(-PI, PI) * random() * random());
			var radius = irisRadius;
			var innerPoint = randomPointInCircle(theta, max(pupilRadius * pupilRadius, irisRadius * irisRadius - (irisRadius * random() * random() * random() * random() * random() * random())));
			var outerPoint = randomPointInCircle(theta, max(pupilRadius * pupilRadius, irisRadius * irisRadius - (irisRadius * random() * random() * random() * random() * random() * random())));
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisOuter, 30));
			graphicsBuffers[buffer.iris].line(innerPoint.x * fullRes, innerPoint.y * fullRes, outerPoint.x * fullRes, outerPoint.y * fullRes);
		}

		// Reflection - Arc
		graphicsBuffers[buffer.shading].fill(180, renderProgress < 0.5 ? renderProgress * 1.5 : 0);
		graphicsBuffers[buffer.shading].arc(0, 0, fullRes * irisRadius * 2, fullRes * irisRadius * 2, renderProgress * TAU * 13 / 16, renderProgressRemaining * TAU * 15 / 16);
		graphicsBuffers[buffer.shading].erase(360);
		graphicsBuffers[buffer.shading].ellipse(0, 0, pupilDiameter * fullRes);
		graphicsBuffers[buffer.shading].noErase();

		// Pupil border
		for (var i = 0; i < 8; i++) {
			var pupilpoint = randomPointInCircle(TAU * random(), max(pupilRadius * pupilRadius, pupilRadius * pupilRadius + (pupilRadius * pupilRadius * random() * random() * random() * random() * random())));
			graphicsBuffers[buffer.pupil].strokeWeight(size.half);
			graphicsBuffers[buffer.pupil].stroke(0, 180);
			graphicsBuffers[buffer.pupil].point(pupilpoint.x * fullRes, pupilpoint.y * fullRes);
		}

		// Pupil skull
		graphicsBuffers[buffer.pupil].push();
		graphicsBuffers[buffer.pupil].translate(0, -pupilRadius * 0.2 * fullRes);
		for (var i = 0; i < map(skullRadius, pupilRadius * 0.6, pupilRadius * 0.65, 96, 128); i++) {

			graphicsBuffers[buffer.pupil].strokeWeight(size.two);
			graphicsBuffers[buffer.pupil].stroke(getColor(colors.skull, map(renderProgress, 0, 1, 15, 0))); //), 90);

			// Cranium
			if (i % 3 == 0) {
				var randomPoint = random(skullRadius * skullRadius) * random() * random();
				var circlePoint = randomPointInCircle(random(TAU), randomPoint);
				graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x, fullRes * circlePoint.y);
				graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x, 100 + fullRes * circlePoint.y);
			}

			// Eye sockets
			graphicsBuffers[buffer.pupil].strokeWeight(size.one);
			var randomEyeSocketRadius = random(eyeSocketRadius * eyeSocketRadius) * random() * random() * random();
			var circlePoint = randomPointInCircle(random() * TAU, randomEyeSocketRadius);
			var pointDistance = map(dist(circlePoint.x, circlePoint.y, 0, 0), 0, eyeSocketRadius, 180, 0);
			graphicsBuffers[buffer.pupil].stroke(0, sqrt(pointDistance * 4));
			graphicsBuffers[buffer.pupil].push();
			// Move negatively to first eye socket
			graphicsBuffers[buffer.pupil].translate(-eyeSocketPosition * fullRes, eyeSocketPosition * fullRes);
			graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x, fullRes * circlePoint.y);
			// Move back twice to other eye socket
			graphicsBuffers[buffer.pupil].translate(2 * eyeSocketPosition * fullRes, 0);
			graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x, fullRes * circlePoint.y);
			graphicsBuffers[buffer.pupil].pop();

			// Nostrils
			if (i % 4 == 0) {
				var randomNostrilRadius = random(nostrilRadius * nostrilRadius) * random() * random();
				var circlePoint = randomPointInCircle(random() * TAU, randomNostrilRadius);
				graphicsBuffers[buffer.pupil].stroke(0, map(renderProgress, 0, 1, 60, 10));
				graphicsBuffers[buffer.pupil].push();
				// Move negatively to first nostril
				graphicsBuffers[buffer.pupil].translate(-nostrilXShift * fullRes, nostrilYShift * fullRes);
				graphicsBuffers[buffer.pupil].rotate(1 / 16 * PI);
				graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x * 0.4, fullRes * circlePoint.y);
				graphicsBuffers[buffer.pupil].rotate(-1 / 16 * PI);
				graphicsBuffers[buffer.pupil].translate(2 * nostrilXShift * fullRes, 0);
				graphicsBuffers[buffer.pupil].rotate(-1 / 16 * PI);
				graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x * 0.4, fullRes * circlePoint.y);
				graphicsBuffers[buffer.pupil].pop();
			}

			// Cheek hollows
			graphicsBuffers[buffer.pupil].strokeWeight(size.two);
			if (i % 16 == 0) {
				var randomCheekHollowRadius = cheekHollowRadius * cheekHollowRadius * random() * random() * random();
				var circlePoint = randomPointInCircle(random() * TAU, randomCheekHollowRadius);
				graphicsBuffers[buffer.pupil].stroke(0, 300);
				// Check we're within the bounds of the pupil
				if (dist(circlePoint.x, circlePoint.y, 0, 0) < pupilRadius * 0.225) {
					graphicsBuffers[buffer.pupil].push();
					// Move negatively to first cheek
					graphicsBuffers[buffer.pupil].translate(-eyeSocketPosition * 2.2 * fullRes, 4 * eyeSocketPosition * fullRes);
					graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x * 0.8, fullRes * circlePoint.y);
					// Move back twice to other cheek
					graphicsBuffers[buffer.pupil].translate(4.4 * eyeSocketPosition * fullRes, 0);
					graphicsBuffers[buffer.pupil].point(fullRes * circlePoint.x * 0.8, fullRes * circlePoint.y);
					graphicsBuffers[buffer.pupil].pop();
				}
			}

			// Jaw
			if (i % 2 == 0) {
				graphicsBuffers[buffer.pupil].strokeWeight(size.one);
				graphicsBuffers[buffer.pupil].push();
				graphicsBuffers[buffer.pupil].translate(0, 1.35 * skullRadius * fullRes);
				var xPos = random(-1, 1) * random(skullRadius * 0.5);
				var yPos = random(-1, 1) * random(skullRadius * 0.25) * random();
				graphicsBuffers[buffer.pupil].stroke(0);
				if (dist(xPos, yPos, 0, 0) < pupilRadius) {
					graphicsBuffers[buffer.pupil].point(xPos * fullRes, yPos * fullRes);
				}
				graphicsBuffers[buffer.pupil].pop();
			}
		}
		graphicsBuffers[buffer.pupil].pop();

		// Reflection - Specular
		for (var i = 0; i < 2048; i++) {
			var theta = random(TAU);
			var radius = random() * random() * random() * random();
			var xPos = sin(theta) * sqrt(radius);
			var yPos = cos(theta) * sqrt(radius);

			// Brighter reflection in top right
			graphicsBuffers[buffer.specular].push();
			graphicsBuffers[buffer.specular].translate(fullRes * irisRadius * 0.55, fullRes * irisRadius * -0.55);
			graphicsBuffers[buffer.specular].rotate(PI / 4);
			graphicsBuffers[buffer.specular].stroke(360, map(dist(xPos, yPos, 0, 0.5) % 2, 0, 2, 4, 0));

			// Small chance of striated effect on upper reflection
			if (specularDetail != 0) {
				graphicsBuffers[buffer.specular].stroke(360, map((dist(xPos, yPos, 0, 0.5) * size.four) % specularDetail, 0, 2, 8, 0));
			}

			graphicsBuffers[buffer.specular].strokeWeight(size.one);
			graphicsBuffers[buffer.specular].point(xPos * fullRes * 0.225, yPos * fullRes * 0.125)
			graphicsBuffers[buffer.specular].pop();

			// Lighter reflection in lower left
			graphicsBuffers[buffer.specular].push();
			graphicsBuffers[buffer.specular].translate(-fullRes * irisRadius * 0.5, -fullRes * irisRadius * -0.5);
			graphicsBuffers[buffer.specular].rotate(PI / 4);
			graphicsBuffers[buffer.specular].stroke(360, 1);
			graphicsBuffers[buffer.specular].strokeWeight(size.one);
			graphicsBuffers[buffer.specular].point(xPos * fullRes * 0.225, yPos * fullRes * 0.125)
			graphicsBuffers[buffer.specular].pop();
		}

	} // End elapsedFrame less than required frames loop

	// Create list of layers to render, according to interactive preferences
	var bufferList = [];
	for (var i = 0; i < graphicsBuffers.length; i++) {
		if (renderFlags[i]) {
			bufferList.push(graphicsBuffers[i]);
		}
	}

	// And render!
	renderLayers(renderBuffer, bufferList);

	// Render image to canvas
	translate(screenSize * 0.5, screenSize * 0.5);
	background(0);
	background(getColor(colors.accent, map(renderProgress, 0, 1, 180, 90)));
	stroke(0);
	strokeWeight(screenSize * 0.002);
	noFill();
	image(renderBuffer, 0, 0, screenSize * 0.975, screenSize * 0.975);
	rect(0, 0, screenSize * 0.975, screenSize * 0.975);

	// Handle information text visibility
	if (infoAlpha < infoTargetAlpha) {
		infoAlpha += 30;
	} else if (infoAlpha > infoTargetAlpha) {
		infoAlpha -= 30;
	}

	// Render title text

	if (alwaysShowTitle) {
		titleAlpha = max(30, min(titleAlpha + 30, 360));
	} else {
		titleAlpha -= map(elapsedFrame, 0, requiredFrames, 0, 16);
	}

	if (titleAlpha > 0) {
		textFont(titleFont);
		textSize(screenSize * 0.09 * (titleAlpha < 180 ? map(titleAlpha, 180, 0, 1, 0.975) : 1));
		textAlign(RIGHT, TOP);
		fill(getColor(colors.accent, titleAlpha));
		stroke(0, titleAlpha);
		strokeWeight(size.one);
		strokeJoin(ROUND);
		textStyle(BOLD);
		text(nameOfPiece, screenSize * 0.43, screenSize * -0.47);
		textSize(screenSize * 0.025);
		textStyle(NORMAL);
		textAlign(RIGHT, TOP);
		textFont(quoteFont);
		rectMode(CORNERS);
		text(renderQuote, screenSize * 0.115, screenSize * -0.35, screenSize * 0.35);
		rectMode(CENTER);
	}

	// Render information text
	if (infoAlpha > 0) {
		textFont(quoteFont);
		textSize(screenSize * 0.02);
		fill(360, infoAlpha);
		stroke(0, infoAlpha);
		strokeWeight(screenSize * 0.005);
		strokeJoin(ROUND);
		textAlign(RIGHT, BOTTOM);
		text(instructionText, screenSize * 0.45, screenSize * 0.45);
		textAlign(LEFT, BOTTOM);
		text(infoText + "\n" + (renderProgress < 1 ? ("Rendering " + ~~(renderProgress * 100) + '/100') : "Render complete") + "\n", screenSize * -0.45, screenSize * 0.45);
		textSize(screenSize * 0.025);
		textAlign(LEFT, TOP);
		rectMode(CORNERS);
		text(renderQuote, screenSize * -0.48, screenSize * -0.48, screenSize * 0.35);
		rectMode(CENTER);
	}

	// Render message text
	if (messageAlpha > 0) {
		messageAlpha -= map(messageAlpha, 0, 360, 1, 8) * (elapsedFrame < requiredFrames ? 1 : 0.5);
		textAlign(CENTER, CENTER);
		textSize(screenSize * 0.02);
		strokeWeight(screenSize * 0.005);
		textFont(quoteFont);
		fill(360, messageAlpha);
		stroke(0, messageAlpha);
		text(messageString, 0, screenSize * 0.45);
	}

	// Check if render is complete for fxpreview(), and set related flags;
	if (elapsedFrame == requiredFrames) {
		if (!firstRenderComplete) {
			fxpreview();
		}
		currentlyRendering = false;
		firstRenderComplete = true;
	}

}

// ********************************************************************
// Various interaction functions - key presses, clicking, window-sizing
// ********************************************************************

function keyPressed() {

	if (key == 's') {
		saveBuffer.clear();
		saveBuffer.resetMatrix();
		saveBuffer.translate(fullRes * 0.5, fullRes * 0.5);
		saveBuffer.background(0);
		saveBuffer.background(getColor(colors.accent, 90));
		saveBuffer.stroke(0);
		saveBuffer.strokeWeight(fullRes * 0.002);
		saveBuffer.noFill();
		saveBuffer.image(renderBuffer, 0, 0, fullRes * 0.975, fullRes * 0.975);
		saveBuffer.rect(0, 0, fullRes * 0.975, fullRes * 0.975);
		save(saveBuffer, "Eye" + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
		displayMessage("Render saved ");
	}

	if (key == 'c') {
		saveCanvas("Eye" + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
		displayMessage("Canvas saved ");
	}

	if (key == 'r') {
		createInfo();
		setAllRenderFlags(true);
		startRender();
		displayMessage("Re-rendering with same parameters.");
	}

	if (key == 'p') {
		displayMessage("Re-rendering with new parameters.");
		initiate();
		createInfo();
		setAllRenderFlags(true);
		startRender();
	}

	if (key == 'i') {
		if (infoTargetAlpha == 0) {
			infoTargetAlpha = 360;
		} else {
			infoTargetAlpha = 0;
		}
	}

	if (key == 'z' && !currentlyRendering) {
		alwaysShowTitle = !alwaysShowTitle;
	}

	if (key == '9') {
		setAllRenderFlags(false);
		displayMessage("All render layers inactive");
	}

	if (key == '0') {
		setAllRenderFlags(true);
		displayMessage("All render layers active");
	}

	if (!isNaN(key)) {
		var keyNumber = int(key);
		if (keyNumber > 0 && keyNumber < graphicsBuffers.length) {
			renderFlags[keyNumber] = !renderFlags[keyNumber];
			var keyName = Object.keys(buffer)[keyNumber];
			keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1)
			displayMessage(keyName + " rendering " + (renderFlags[keyNumber] ? "active." : "not active."));
		}
	}

} // End of keyPressed()

function doubleClicked() {
	fullscreen(!fullscreen());
}

function windowResized() {
	if (navigator.userAgent.indexOf("HeadlessChrome") == -1) {
		screenSize = min(windowWidth, windowHeight);
		resizeCanvas(screenSize, screenSize);
	}
}

// ***********************************************************
// The following functions contain data and text-related items
// ***********************************************************

// ColorStructure: Name of palette, irisInner, irisMain, irisOuter, skull, accentColor
function pushColorStructures() {
	colorStructures.push(parseCoolors("https://coolors.co/007a74-c2d076-ffe1ea-b800b5-f193eb", "Green, Yellow, Pink"));
	colorStructures.push(parseCoolors("https://coolors.co/083d77-ebebd3-da4167-725b08-bcbdc7", "Indigo, Beige, Cerise"));
	colorStructures.push(parseCoolors("https://coolors.co/094074-3c6997-5adbff-e0b700-fe9000", "Indigo, Blue, Sky"));
	colorStructures.push(parseCoolors("https://coolors.co/157f1f-4cb963-a0eade-5c6784-adb9d7", "Green, Emerald, Green"));
	colorStructures.push(parseCoolors("https://coolors.co/1f2041-4b3f72-ffc857-084649-88d0e7", "Grey, Grape, Orange"));
	colorStructures.push(parseCoolors("https://coolors.co/353535-3c6e71-ffffff-7a7a7a-9abed6", "Jet, Grey, White"));
	colorStructures.push(parseCoolors("https://coolors.co/423e3b-ff2e00-fea82f-8f8c00-9991de", "Black, Scarlet, Orange"));
	colorStructures.push(parseCoolors("https://coolors.co/424b54-b38d97-d5aca9-72491d-ddd6d0", "Grey, Lavender, Pink"));
	colorStructures.push(parseCoolors("https://coolors.co/463730-1f5673-759fbc-36696d-c1c0d8", "Lava, Sapphire, Blue"));
	colorStructures.push(parseCoolors("https://coolors.co/4c1a57-ff3cc7-f0f600-00a0a3-00e0d9", "Violet, Rose, Yellow"));
	colorStructures.push(parseCoolors("https://coolors.co/540d6e-ee4266-ffd23f-29a387-2fee9c", "Violet, Pink, Yellow"));
	colorStructures.push(parseCoolors("https://coolors.co/5efc8d-8ef9f3-93bedf-8377d1-c6bac9", "Green, Blue, Cerulean"));
	colorStructures.push(parseCoolors("https://coolors.co/650d1b-823200-9b3d12-8c7317-c1df1f", "Brown, Leather, Red"));
	colorStructures.push(parseCoolors("https://coolors.co/820933-d84797-d2fdff-0088cc-26ffe6", "Claret, Pink, Cyan"));
	colorStructures.push(parseCoolors("https://coolors.co/90f1ef-ffd6e0-ffef9f-399d07-7bf1a8", "Blue, Pink, Yellow"));
	colorStructures.push(parseCoolors("https://coolors.co/b4edd2-a0cfd3-8d94ba-9a7aa0-cabac4", "Green, Blue, Ice"));
	colorStructures.push(parseCoolors("https://coolors.co/def5f8-a6b5f2-d9dde8-725e54-e1d7cb", "Cyan, Blue, Lavender"));
	colorStructures.push(parseCoolors("https://coolors.co/f0f66e-09a129-036d19-0a2e36-03b5aa", "Lemon, Green, Green"));
	colorStructures.push(parseCoolors("https://coolors.co/f2ff49-ff4242-fb62f6-645dd7-b3fffc", "Yellow, Red, Pink"));
	colorStructures.push(parseCoolors("https://coolors.co/f3c969-edff86-fff5b2-277406-cbbeb9", "Maize, Yellow, Green"));
	colorStructures.push(parseCoolors("https://coolors.co/fa8334-fffd77-ffe882-388697-d4b1e7", "Orange, Lemon, Yellow"));
	colorStructures.push(parseCoolors("https://coolors.co/ff6b35-f7c59f-efefd0-0068b8-61ace5", "Orange, Peach, Beige"));
	colorStructures.push(parseCoolors("https://coolors.co/ffd289-facc6b-ffd131-f5b82e-f8c977", "Yellow, Yellow, Yellow"));
	colorStructures.push(parseCoolors("https://coolors.co/ffdde2-efd6d2-ff8cc6-de369d-bbb0bf", "Pink, Rose, Red"));
	colorStructures.push(parseCoolors("https://coolors.co/fffc31-5c415d-f6f7eb-b82a14-b3b9bd", "Yellow, Violet, Ivory"));
	colorStructures.push(parseCoolors("https://coolors.co/ffffff-effffa-e5ecf4-2b1bda-ad85ff", "White, Mint, Blue"));
}

// Eyeshape: Name of shape, scale in x and y axes, then co-ordinates
function pushEyeShapes() {
	eyeShapes.push(["Left Eye - Almond", [2.500, 2.75],
		[-0.38, 0.05],
		[-0.20, -0.07],
		[0.00, -0.10],
		[0.2, -0.025],
		[0.4, 0.1],
		[0.43, 0.13],
		[0.4, 0.132],
		[0.2, 0.2],
		[0, 0.24],
		[-0.2, 0.2],
		[-0.38, 0.05]
	]);
	eyeShapes.push(["Left Eye - Downturned", [1.75, 2.2],
		[-0.50, 0.10],
		[-0.30, -0.08],
		[-0.10, -0.125],
		[0.1, -0.12],
		[0.3, -0.025],
		[0.5, 0.15],
		[0.3, 0.2],
		[0.1, 0.29],
		[-0.1, 0.31],
		[-0.3, 0.25],
		[-0.5, 0.1]
	]);
	eyeShapes.push(["Left Eye - Rounded", [1.8, 2.3],
		[-0.4, 0.03],
		[-0.3, -0.05],
		[-0.1, -0.13],
		[0.1, -0.11],
		[0.3, 0],
		[0.5, 0.18],
		[0.3, 0.25],
		[0.1, 0.3],
		[-0.1, 0.29],
		[-0.3, 0.2],
		[-0.4, 0.03]
	]);
	eyeShapes.push(["Left Eye - Upturned", [1.9, 2.3],
		[-0.50, 0.00],
		[-0.30, -0.13],
		[-0.10, -0.15],
		[0.1, -0.1],
		[0.3, 0.025],
		[0.5, 0.2],
		[0.3, 0.25],
		[0.1, 0.3],
		[-0.1, 0.3],
		[-0.3, 0.225],
		[-0.5, 0]
	]);
	eyeShapes.push(["Left Eye - Wide", [1.6, 1.66],
		[-0.5, 0],
		[-0.3, -0.15],
		[-0.1, -0.225],
		[0.1, -0.2],
		[0.3, -0.1],
		[0.5, 0.2],
		[0.3, 0.25],
		[0.1, 0.3],
		[-0.1, 0.3],
		[-0.3, 0.2],
		[-0.5, 0]
	]);
	eyeShapes.push(["Right Eye - Almond", [2.500, 2.75],
		[0.38, 0.05],
		[0.20, -0.07],
		[0.00, -0.10],
		[-0.2, -0.025],
		[-0.4, 0.1],
		[-0.43, 0.13],
		[-0.4, 0.132],
		[-0.2, 0.2],
		[0, 0.24],
		[0.2, 0.2],
		[0.38, 0.05]
	]);
	eyeShapes.push(["Right Eye - Downturned", [1.75, 2.2],
		[0.50, 0.10],
		[0.30, -0.08],
		[0.10, -0.125],
		[-0.1, -0.12],
		[-0.3, -0.025],
		[-0.5, 0.15],
		[-0.3, 0.2],
		[-0.1, 0.29],
		[0.1, 0.31],
		[0.3, 0.25],
		[0.5, 0.1]
	]);
	eyeShapes.push(["Right Eye - Rounded", [1.8, 2.3],
		[0.4, 0.03],
		[0.3, -0.05],
		[0.1, -0.13],
		[-0.1, -0.11],
		[-0.3, 0],
		[-0.5, 0.18],
		[-0.3, 0.25],
		[-0.1, 0.3],
		[0.1, 0.29],
		[0.3, 0.2],
		[0.4, 0.03]
	]);
	eyeShapes.push(["Right Eye - Upturned", [1.9, 2.3],
		[0.50, 0.00],
		[0.30, -0.13],
		[0.10, -0.15],
		[-0.1, -0.1],
		[-0.3, 0.025],
		[-0.5, 0.2],
		[-0.3, 0.25],
		[-0.1, 0.3],
		[0.1, 0.3],
		[0.3, 0.225],
		[0.5, 0]
	]);
	eyeShapes.push(["Right Eye - Wide", [1.6, 1.66],
		[0.5, 0],
		[0.3, -0.15],
		[0.1, -0.225],
		[-0.1, -0.2],
		[-0.3, -0.1],
		[-0.5, 0.2],
		[-0.3, 0.25],
		[-0.1, 0.3],
		[0.1, 0.3],
		[0.3, 0.2],
		[0.5, 0]
	]);
}

function parseCoolors(paletteURL, paletteName) {
	const colorStructure = paletteURL.slice(paletteURL.lastIndexOf('/') + 1).split('-');
	for (var i = 0; i < colorStructure.length; i++) {
		colorStructure[i] = `#${colorStructure[i]}`;
	}
	colorStructure.splice(0, 0, paletteName);
	return colorStructure;
}


function pushRenderQuotes() {
	renderQuotes.push("\"...and to think now that great mathematicians find my work interesting because I am able to illustrate their theories.\"\n—M.C. Escher");
	renderQuotes.push("\"...if that's the way you see it, so be it.\"\n—M.C. Escher");
	renderQuotes.push("\"Are you absolutely certain that you go up when you walk up a staircase?\"\n—M.C. Escher");
	renderQuotes.push("\"Are you really sure that a floor can't also be a ceiling?\"\n—M.C. Escher");
	renderQuotes.push("\"As far as I know, there is no proof whatever of the existence of an objective reality apart from our senses...\"\n—M.C. Escher");
	renderQuotes.push("\"At moments of great enthusiasm it seems to me that no one in the world has ever made something this beautiful and important.\"\n—M.C. Escher");
	renderQuotes.push("\"By their very nature they are more interested in the way in which the gate is opened than in the garden lying behind it.\"\n—M.C. Escher");
	renderQuotes.push("\"Chaos is the beginning, simplicity is the end.\"\n—M.C. Escher");
	renderQuotes.push("\"Drawing is deception.\"\n—M.C. Escher");
	renderQuotes.push("\"Hands are the most honest part of the human body, they cannot lie as laughing eyes and the mouth can.\"\n—M.C. Escher");
	renderQuotes.push("\"He who wonders discovers that this in itself is a wonder.\"\n—M.C. Escher");
	renderQuotes.push("\"I am a graphic artist heart and soul, though I find the term artist rather embarrassing.\"\n—M.C. Escher");
	renderQuotes.push("\"I am always wandering around in enigmas.\"\n—M.C. Escher");
	renderQuotes.push("\"I believe that producing pictures, as I do, is almost solely a question of wanting so very much to do it well.\"\n—M.C. Escher");
	renderQuotes.push("\"I believe that, at bottom, every artist wants no more than to tell the world what he has to say.\"\n—M.C. Escher");
	renderQuotes.push("\"I came to the open gate of mathematics. From here, well-trodden paths lead in every direction.\"\n—M.C. Escher");
	renderQuotes.push("\"I cannot refrain from demonstrating the nonsensicalness of some of what we take to be irrefutable certainties.\"\n—M.C. Escher");
	renderQuotes.push("\"I do not see why we should accept the outside world as such solely by virtue of our senses.\"\n—M.C. Escher");
	renderQuotes.push("\"I experienced a sense of space and three-dimensionality such as I'd not experienced for a long time.\"\n—M.C. Escher");
	renderQuotes.push("\"I myself prefer to abide in abstractions that have nothing to do with reality.\"\n—M.C. Escher");
	renderQuotes.push("\"I often seem to have more in common with mathematicians than with my fellow artists.\"\n—M.C. Escher");
	renderQuotes.push("\"I think I have never yet done any work with the aim of symbolizing a particular idea, but the fact that a symbol is sometimes discovered or remarked upon is valuable for me...\"\n—M.C. Escher");
	renderQuotes.push("\"In my prints I try to show that we live in a beautiful and orderly world.\"\n—M.C. Escher");
	renderQuotes.push("\"In my work, too, everything revolves around a single closed contour.\"\n—M.C. Escher");
	renderQuotes.push("\"It has always irked me as improper that there are still so many people for whom the sky is no more than a mass of random points of light.\"\n—M.C. Escher");
	renderQuotes.push("\"It is a pleasure to deliberately mix together objects of two and three dimensions...\"\n—M.C. Escher");
	renderQuotes.push("\"It is human nature to want to exchange ideas...\"\n—M.C. Escher");
	renderQuotes.push("\"It's pleasing to realize that quite a few people enjoy this sort of playfulness and that they are not afraid to look at the relative nature of rock-hard reality.\"\n—M.C. Escher");
	renderQuotes.push("\"Long before there were people on the earth, crystals were already growing in the earth's crust.\"\n—M.C. Escher");
	renderQuotes.push("\"My subjects are also often playful: I cannot refrain from demonstrating the nonsensicalness of some of what we take to be irrefutable certainties.\"\n—M.C. Escher");
	renderQuotes.push("\"My work is a game, a very serious game.\"\n—M.C. Escher");
	renderQuotes.push("\"One evening I saw a point of light appearing on the horizon, followed a moment later by another one.\"\n—M.C. Escher");
	renderQuotes.push("\"Order is repetition of units. Chaos is multiplicity without rhythm.\"\n—M.C. Escher");
	renderQuotes.push("\"Originality is merely an illusion.\"\n—M.C. Escher");
	renderQuotes.push("\"Science and art sometimes can touch one another, like two pieces of the jigsaw puzzle which is our human life...\"\n—M.C. Escher");
	renderQuotes.push("\"Simplicity and order are, if not the principal, then certainly the most important guidelines for human beings in general.\"\n—M.C. Escher");
	renderQuotes.push("\"So let us then try to climb the mountain, not by stepping on what is below us, but to pull us up at what is above us.\"\n—M.C. Escher");
	renderQuotes.push("\"Sometimes I think I have trodden all the paths... then I suddenly discover a new path and experience fresh delights.\"\n—M.C. Escher");
	renderQuotes.push("\"The laws of the phenomena around us order, regularity, cyclical repetition, and renewals have assumed greater and greater importance for me.\"\n—M.C. Escher");
	renderQuotes.push("\"The result of the struggle between the thought and the ability to express it, between dream and reality, is seldom more than a compromise or an approximation.\"\n—M.C. Escher");
	renderQuotes.push("\"The things I want to express are so beautiful and pure.\"\n—M.C. Escher");
	renderQuotes.push("\"There has to be a certain enigma in it, which does not immediately catch the eye.\"\n—M.C. Escher");
	renderQuotes.push("\"There is something in such laws that takes the breath away.\"\n—M.C. Escher");
	renderQuotes.push("\"To have peace with this peculiar life; to accept what we do not understand; to wait calmly for what awaits us, you have to be wiser than I am.\"\n—M.C. Escher");
	renderQuotes.push("\"To tell you the truth, I am rather perplexed by the concept of 'art'.\"\n—M.C. Escher");
	renderQuotes.push("\"We adore chaos because we love to produce order\"\n—M.C. Escher");
	renderQuotes.push("\"We do not know space. We do not see it, we do not hear it, we do not feel it.\"\n—M.C. Escher");
	renderQuotes.push("\"What I give form to in daylight is only one percent of what I have seen in darkness.\"\n—M.C. Escher");
	renderQuotes.push("\"Wonder is the salt of the earth.\"\n—M.C. Escher");
}
	
function pushInstructionText(textString, newLines) {
	instructionText += textString;
	instructionText += "\n";
}

function createInfo() {
	infoText = nameOfPiece;
	infoText += "\n";
	infoText += "\nA generative artwork by Mandy Brigwell, ";
	infoText += "\ninspired by M.C. Escher's 1946 mezzotint 'Eye'.";
	infoText += "\n";
	infoText += "\nColours: " + colorStructure[0];
	infoText += "\nIris radius   : " + nf(irisRadius, 0, 2);
	infoText += "\nPupil radius  : " + nf(pupilRadius, 0, 2);;
	infoText += "\nStriation complexity: " + irisStriations;
	infoText += "\nEyelid style: " + eyeName;
	infoText += "\nRare features: " + rareFeatureDescription;
	infoText += "\n";
}

function pushInstructionTexts() {
	pushInstructionText("Show/hide information: [I]");
	pushInstructionText("\nSave image: [S]");
	pushInstructionText("Save canvas: [C]");
	pushInstructionText("\nRe-render image: [R]");
	pushInstructionText("Generate new image: [P]");
	pushInstructionText("\nRender layers:");
	for (var i = 1; i < Object.keys(buffer).length; i++) {
		var keyName = Object.keys(buffer)[i];
		keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1)
		pushInstructionText(keyName + ": [" + i + "]");
	}
	pushInstructionText("\nDisable all: [9]");
	pushInstructionText("Enable all: [0]");
}