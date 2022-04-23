// Eye
// 2022 Mandy Brigwell

var nameOfPiece = "Eye_Testing";

let randomSeedValue = ~~(fxrand()*12345);
let noiseSeedValue = ~~(fxrand()*56789);

// Graphics buffers, resolution, frames and rendering
var theCanvas, graphicsBuffer, renderBuffer;
const buffer = {background: 0, sclera: 1, iris: 2, pupil: 3, specular: 4, shading: 5, eyelid: 6};
const colors = {name: 0, irisInner: 1, irisMain: 2, irisOuter: 3, four: 4, accent: 5};
var graphicsBuffers = [];

var screenSize;

// Resolution independence
var fullRes = 2048;
const size = {half: fullRes/1024, one: fullRes/512, two: fullRes/256, three: fullRes/128, four: fullRes/64, five: fullRes/32, six: fullRes/16, seven: fullRes/8, eight: fullRes/2};

// HUD Variables
var infoTargetAlpha = 180;
var infoAlpha = 0;
var titleAlpha = 60;
var messageAlpha = 360;
var messageString = "Press [I] for information";
var startFrame, endFrame, requiredFrames;
var infoText;
var firstRenderComplete = false;

// Variables for test renders
// This mode is inaccessible in the final build
var testRenderCount = 0;
var testRendersRequired = 64;
var showTestingGuides = false;

// Colours
var colorMapName, mainColor, backgroundColor;
var colorStructures = [];
pushColorStructures();
colorStructure = colorStructures[~~(fxrand()*colorStructures.length)];

// RenderQuotes
var renderQuotes = [];
pushRenderQuotes();
var renderQuote = renderQuotes[~~(fxrand()*renderQuotes.length)];

// Instruction text
var instructionText = "";
pushInstructionText("Show/hide information: [I]");
pushInstructionText("\n");
pushInstructionText("Save image: [S]");
pushInstructionText("Save canvas: [C]");
pushInstructionText("\n");
pushInstructionText("Display test overlays: [T]");
pushInstructionText("\n");
pushInstructionText("Re-render with same parameters: [R]");
pushInstructionText("Re-render with new parameters: [P]");

var irisRadius, irisDiameter, irisStriations;
var pupilRadius, pupilDiameter;
var eccentricity;
initiate();

window.$fxhashFeatures = {
	"irisRadius": irisRadius,
	"irisStriations": irisStriations,
	"pupilRadius": pupilRadius,
	"eccentricity": eccentricity
}

// The initiate function sets variables for the render,
function initiate() {

	colorStructure = colorStructures[~~(fxrand()*colorStructures.length)];
	mainColor = colorStructure[1];

	irisDiameter = fxrandbetween(0.8, 0.9);
	irisRadius = irisDiameter * 0.5;
	pupilDiameter = 0.5*fxrandbetween(0.5, irisDiameter*0.5);
	pupilRadius = pupilDiameter * 0.5;
	irisStriations = ~~(fxrandbetween(2, 8));
	eccentricity = 1;
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
	graphicsBuffer.colorMode(HSB, 360);
	
	for (var i=0; i<Object.keys(buffer).length; i++) {
		graphicsBuffers[i] = createGraphics(fullRes, fullRes);
		graphicsBuffers[i].colorMode(HSB, 360);
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
}

function renderLayers(toCanvas, ...layers) {
	toCanvas.clear();
	toCanvas.colorMode(HSB, 360);
	toCanvas.background(0);
	var toCanvasSize = min(toCanvas.width, toCanvas.height);
	for (layer in layers) {
		var thisLayer = layers[layer];
		toCanvas.image(thisLayer, 0, 0, toCanvasSize, toCanvasSize);
	}
}

function fxrandbetween(from, to) {
  return from + (to - from) * fxrand();
}

function randomPointInCircle(theta, radius) {
	return new p5.Vector(cos(theta)*sqrt(radius)*eccentricity, sin(theta)*sqrt(radius));
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
		eachBuffer.translate(eachBuffer.width*0.5, eachBuffer.height*0.5);
		eachBuffer.noFill();
		eachBuffer.noStroke();
		eachBuffer.strokeWeight(size.one);
	}

	// Manage framecount and rendering process
	var elapsedFrame = frameCount-startFrame;
	var renderProgress = elapsedFrame/requiredFrames;
	var renderProgressRemaining = 1 - renderProgress;
	
	if (elapsedFrame == 1) {
		graphicsBuffers[buffer.sclera].background(0);
		graphicsBuffers[buffer.sclera].fill(getColor(colors.accent, 5));
		graphicsBuffers[buffer.sclera].noStroke();
		graphicsBuffers[buffer.sclera].ellipse(0, 0, fullRes*irisDiameter*eccentricity, fullRes*irisDiameter);
		graphicsBuffers[buffer.sclera].erase(360);
		graphicsBuffers[buffer.sclera].ellipse(0, 0, fullRes*pupilDiameter*eccentricity, fullRes*pupilDiameter);
		graphicsBuffers[buffer.sclera].noErase();
	}
	
	// If we're within the required frames, this loop renders multiple points
	if (elapsedFrame <= requiredFrames) {
	
		// Sclera
		for (var i=0; i<512; i++) {
			var xPos = 0.5-random()*random()*random()*random()*random();
			var yPos = 0.5-random()*random()*random()*random()*random();
// 			xPos = 1/512*~~(xPos*512);
// 			yPos = 1/256*~~(yPos*256);
			graphicsBuffers[buffer.sclera].stroke(180, map(dist(xPos, yPos, 0, 0), 0, 0.5, 0, 30));
			graphicsBuffers[buffer.sclera].stroke(getColor(colors.accent, map(dist(xPos, yPos, 0, 0), 0, 0.5, 0, 30)));
			graphicsBuffers[buffer.sclera].strokeWeight(size.half);
			graphicsBuffers[buffer.sclera].point( xPos*fullRes, yPos*fullRes);
			graphicsBuffers[buffer.sclera].point(-xPos*fullRes, -yPos*fullRes);
			graphicsBuffers[buffer.sclera].point(-xPos*fullRes,  yPos*fullRes);
			graphicsBuffers[buffer.sclera].point( xPos*fullRes, -yPos*fullRes);
		}
	
		// Iris points
		for (var i=0; i<512; i++) {
			var theta = renderProgress*TAU + map(i%irisStriations, 0, irisStriations-1, 0, TAU) + random(-1, 1)*random();
			var radius = random(pupilRadius*pupilRadius, irisRadius*irisRadius);
			var newPoint = randomPointInCircle(theta, radius);
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisMain, 30*radius));			
			graphicsBuffers[buffer.iris].strokeWeight(size.one);
			graphicsBuffers[buffer.iris].point(newPoint.x*fullRes, newPoint.y*fullRes);
		}
		
		// Iris striations inner
		for (var i=0; i<~~(renderProgressRemaining*64); i++) {
			var theta = map(i%(irisStriations*4), 0, (irisStriations*4)-1, -PI*i, PI*i)+(random(-PI, PI)*random()*random());
			var radius = irisRadius;
			var innerPoint = randomPointInCircle(theta, pupilRadius*pupilRadius+(pupilRadius*random()*random()*random()*random()*random()*random()));
			var outerPoint = randomPointInCircle(theta, pupilRadius*pupilRadius+(pupilRadius*random()*random()*random()*random()*random()*random()));
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisInner, 15));
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].line(innerPoint.x*fullRes, innerPoint.y*fullRes, outerPoint.x*fullRes, outerPoint.y*fullRes);
		}
		
		// Iris Darkening inner
		for (var i=0; i<64; i++) {
			var theta = map(i%(irisStriations*4), 0, (irisStriations*4)-1, -PI*i, PI*i)+(random(-PI, PI)*random()*random());
			var radius = irisRadius;
			var innerPoint = randomPointInCircle(theta, pupilRadius*pupilRadius+(pupilRadius*2*random()*random()*random()*random()*random()*random()*random()));
			var outerPoint = randomPointInCircle(theta, pupilRadius*pupilRadius+(pupilRadius*random()*random()*random()*random()*random()*random()*random()));
			graphicsBuffers[buffer.iris].stroke(0, 10);
			graphicsBuffers[buffer.iris].strokeWeight(size.two);
			graphicsBuffers[buffer.iris].line(innerPoint.x*fullRes, innerPoint.y*fullRes, outerPoint.x*fullRes, outerPoint.y*fullRes);
		}
		
		// Iris striations mid
		for (var i=0; i<32; i++) {
			var theta = map(i%(irisStriations*4), 0, (irisStriations*4)-1, -PI*i, PI*i)+(random(-PI, PI)*random()*random());
			var innerPoint = randomPointInCircle(theta, pupilRadius*pupilRadius*(1+(random()*random())));
			var outerPoint = randomPointInCircle(theta, (pupilRadius*pupilRadius) + (irisRadius*irisRadius)*random()*0.75); //*random()*random());
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisMain, 30));
			graphicsBuffers[buffer.iris].line(innerPoint.x*fullRes, innerPoint.y*fullRes, outerPoint.x*fullRes, outerPoint.y*fullRes);
		}
		
		// Iris striations outer
		for (var i=0; i<32; i++) {
			var theta = map(i%(irisStriations*4), 0, (irisStriations*4)-1, -PI*i, PI*i)+(random(-PI, PI)*random()*random());
			var radius = irisRadius;
			var innerPoint = randomPointInCircle(theta, max(pupilRadius*pupilRadius, irisRadius*irisRadius-(irisRadius*random()*random()*random()*random()*random()*random())));
			var outerPoint = randomPointInCircle(theta, max(pupilRadius*pupilRadius, irisRadius*irisRadius-(irisRadius*random()*random()*random()*random()*random()*random())));
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].stroke(getColor(colors.irisOuter, 30));
			graphicsBuffers[buffer.iris].line(innerPoint.x*fullRes, innerPoint.y*fullRes, outerPoint.x*fullRes, outerPoint.y*fullRes);
		}
		
		// Eyelid
// 		for (var i=0; i<4096; i++) {
// 			var theta = random(TAU);
// 			var radius = (fullRes*irisRadius*1.2)+ random()*fullRes;
// 			var xPos = sin(theta);
// 			var yPos = cos(theta);
// 			graphicsBuffers[buffer.eyelid].strokeWeight(size.one);
// 			graphicsBuffers[buffer.eyelid].stroke(0, 90);
// 			graphicsBuffers[buffer.eyelid].point(xPos*radius, yPos*radius);
// 			graphicsBuffers[buffer.eyelid].point(xPos*radius*2, yPos*radius*2);
// 		}

		// Reflection - Arc
		graphicsBuffers[buffer.shading].fill(180, renderProgress < 0.5 ? renderProgress*1.5 : 0);
		graphicsBuffers[buffer.shading].arc(0, 0, fullRes*irisRadius*2*eccentricity, fullRes*irisRadius*2, renderProgress*TAU*13/16, renderProgressRemaining*TAU*15/16);
		graphicsBuffers[buffer.shading].erase(360);
		graphicsBuffers[buffer.shading].ellipse(0, 0, pupilDiameter*fullRes*eccentricity, pupilDiameter*fullRes);
		graphicsBuffers[buffer.shading].noErase();
		
		// Pupil border
		for (var i=0; i<8; i++) {
			var pupilpoint = randomPointInCircle(TAU*random(), max(pupilRadius*pupilRadius, pupilRadius*pupilRadius + (pupilRadius*pupilRadius*random()*random()*random()*random()*random())));
			graphicsBuffers[buffer.pupil].strokeWeight(size.half);
			graphicsBuffers[buffer.pupil].stroke(0, 180);
			graphicsBuffers[buffer.pupil].point(pupilpoint.x*fullRes, pupilpoint.y*fullRes);
		}
		
		// Pupil skull
		graphicsBuffers[buffer.pupil].push();
		graphicsBuffers[buffer.pupil].translate(0, -pupilRadius*0.25*fullRes);
		for (var i=0; i<128; i++) {
			
			var skullRadius = pupilRadius * 0.65;
			var eyeSocketRadius = skullRadius * 0.6;
			var eyeSocketPosition = skullRadius * 0.3;
			var nostrilRadius = skullRadius * 0.5;
			var nostrilXShift = skullRadius * 0.055;
			var nostrilYShift = skullRadius * 0.7;
			var cheekHollowRadius = skullRadius * 0.5;
			
			graphicsBuffers[buffer.pupil].strokeWeight(size.half);
			graphicsBuffers[buffer.pupil].stroke(360, 60);
		
			if (i%4 == 0) {
				var randomPoint = random(skullRadius*skullRadius)*random()*random();
				var circlePoint = randomPointInCircle(random(TAU), randomPoint);
				graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x, fullRes*circlePoint.y);
				graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x, 100+fullRes*circlePoint.y);
			}

			// Eye sockets
			graphicsBuffers[buffer.pupil].strokeWeight(size.one);
			var randomEyeSocketRadius = random(eyeSocketRadius*eyeSocketRadius)*random()*random()*random();
			var circlePoint = randomPointInCircle(random()*TAU, randomEyeSocketRadius);
			graphicsBuffers[buffer.pupil].stroke(0);
			graphicsBuffers[buffer.pupil].push();
			// Move negatively to first eye socket
			graphicsBuffers[buffer.pupil].translate(-eyeSocketPosition*fullRes, eyeSocketPosition*fullRes);
			graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x, fullRes*circlePoint.y);
			// Move back twice to other eye socket
			graphicsBuffers[buffer.pupil].translate(2*eyeSocketPosition*fullRes, 0);
			graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x, fullRes*circlePoint.y);
			graphicsBuffers[buffer.pupil].pop();
			
			// Nostrils
			if (i%2 == 0) {
				var randomNostrilRadius = random(nostrilRadius*nostrilRadius)*random()*random();
				var circlePoint = randomPointInCircle(random()*TAU, randomNostrilRadius);
				graphicsBuffers[buffer.pupil].stroke(0, 90);
				graphicsBuffers[buffer.pupil].push();
				// Move negatively to first nostril
				graphicsBuffers[buffer.pupil].translate(-nostrilXShift*fullRes, nostrilYShift*fullRes);
				graphicsBuffers[buffer.pupil].rotate(1/16*PI);
				graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x*0.5, fullRes*circlePoint.y);
				graphicsBuffers[buffer.pupil].rotate(-1/16*PI);
				graphicsBuffers[buffer.pupil].translate(2*nostrilXShift*fullRes, 0);
				graphicsBuffers[buffer.pupil].rotate(-1/16*PI);
				graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x*0.5, fullRes*circlePoint.y);
				graphicsBuffers[buffer.pupil].pop();
			}

			// Cheek hollows
			graphicsBuffers[buffer.pupil].strokeWeight(size.two);
			if (i%8 == 0) {
				var randomCheekHollowRadius = cheekHollowRadius*cheekHollowRadius*random()*random();
				var circlePoint = randomPointInCircle(random()*TAU, randomCheekHollowRadius);
				graphicsBuffers[buffer.pupil].stroke(0);
				graphicsBuffers[buffer.pupil].push();
				// Move negatively to first eye socket
				graphicsBuffers[buffer.pupil].translate(-eyeSocketPosition*2.2*fullRes, 4.2*eyeSocketPosition*fullRes);
				graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x*0.8, fullRes*circlePoint.y);
				// Move back twice to other eye socket
				graphicsBuffers[buffer.pupil].translate(4.4*eyeSocketPosition*fullRes, 0);
				graphicsBuffers[buffer.pupil].point(fullRes*circlePoint.x*0.8, fullRes*circlePoint.y);
				graphicsBuffers[buffer.pupil].pop();
			}
			
			
		}
		graphicsBuffers[buffer.pupil].pop();
		
		// Reflection - Specular
		for (var i=0; i<2048; i++) {
			var theta=random(TAU);
			var radius = random()*random()*random()*random();
			var xPos = sin(theta)*sqrt(radius);
			var yPos = cos(theta)*sqrt(radius);
			
			// Brighter reflection in top right
			graphicsBuffers[buffer.specular].push();
			graphicsBuffers[buffer.specular].translate(fullRes*irisRadius*0.55, fullRes*irisRadius*-0.55);
			graphicsBuffers[buffer.specular].rotate(PI/4);
			graphicsBuffers[buffer.specular].stroke(360, map(dist(xPos, yPos, 0, 0.5)%2, 0, 2, 8, 0));
			
// 			This gives an interesting striated effect	
// 			graphicsBuffers[buffer.specular].stroke(360, map((dist(xPos, yPos, 0, 0.5)*size.four)%2, 0, 2, 8, 0));

			graphicsBuffers[buffer.specular].strokeWeight(size.one);
			graphicsBuffers[buffer.specular].point(xPos*fullRes*0.225, yPos*fullRes*0.125)
			graphicsBuffers[buffer.specular].pop();
			
			// Lighter reflection in lower left
			graphicsBuffers[buffer.specular].push();
			graphicsBuffers[buffer.specular].translate(-fullRes*irisRadius*0.5, -fullRes*irisRadius*-0.5);
			graphicsBuffers[buffer.specular].rotate(PI/4);
			graphicsBuffers[buffer.specular].stroke(360, 1);
			graphicsBuffers[buffer.specular].strokeWeight(size.one);
			graphicsBuffers[buffer.specular].point(xPos*fullRes*0.225, yPos*fullRes*0.125)
			graphicsBuffers[buffer.specular].pop();
		}
		
	} // End elapsedFrame less than required frames loop
	
	// Render everything to the renderBuffer in this order:
	renderLayers(renderBuffer,
		graphicsBuffers[buffer.sclera],
		graphicsBuffers[buffer.iris],
		graphicsBuffers[buffer.shading],
		graphicsBuffers[buffer.pupil],
		graphicsBuffers[buffer.specular],
		graphicsBuffers[buffer.eyelid]);
		
	// Render image to canvas
	translate(screenSize*0.5, screenSize*0.5);
	background(0);
	image(renderBuffer, 0, 0, screenSize, screenSize);
	
	// Add testing guidelines
	if (showTestingGuides) {
		stroke(0, 270, 360, 300);
		strokeWeight(8);
		noFill();
		ellipse(0, 0, pupilDiameter*screenSize*eccentricity, pupilDiameter*screenSize);
		ellipse(0, 0, irisDiameter*screenSize*eccentricity, irisDiameter*screenSize);
	}

	// Handle information text visibility
	if (infoAlpha < infoTargetAlpha) {
		infoAlpha += 30;
	} else if (infoAlpha > infoTargetAlpha) {
		infoAlpha -= 30;
	}
		
	// Render title text
	if (elapsedFrame <= requiredFrames && titleAlpha > 0) {
		titleAlpha -= map(elapsedFrame, 0, requiredFrames, 1, 32);
		textAlign(CENTER, BOTTOM);
		textSize(size.five);
		fill(getColor(colors.accent, titleAlpha));
		stroke(0, titleAlpha);
		strokeWeight(size.one);
		strokeJoin(ROUND);
		textStyle(BOLD);
		text(nameOfPiece, 0, 0);
		textSize(size.three);
		textStyle(NORMAL);
		textAlign(CENTER, TOP);
		text(renderQuote, 0, 0, screenSize*0.75);
	}

	// Render information text
	if (infoAlpha > 0) {
		textSize(size.three);
		fill(360, infoAlpha);
		stroke(0, infoAlpha);
		strokeWeight(size.one);
		strokeJoin(ROUND);
		textAlign(RIGHT, TOP);
		text(instructionText, screenSize*0.45, screenSize*-0.45);
		textAlign(LEFT, TOP);
		text(infoText + "\n" + (renderProgress < 1 ? ("Rendering " + ~~(renderProgress*100) + '/100') : "Render complete"), screenSize*-0.45, screenSize*-0.45);
		textAlign(CENTER, CENTER);
		text(renderQuote, 0, screenSize*0.35, screenSize*0.5);
	}
	
	// Render message text
	if (messageAlpha > 0) {
		messageAlpha -= map(messageAlpha, 0, 360, 1, 8) * (elapsedFrame < requiredFrames ? 1 : 0.5);
		textAlign(CENTER, CENTER);
		textSize(size.three);
		textFont("monospace");
		fill(getColor(colors.accent, messageAlpha));
		stroke(0, messageAlpha);
		text(messageString, 0, screenSize*0.45);
	}
		
	// Check if render is complete for fxpreview();
	if (elapsedFrame == requiredFrames && !firstRenderComplete) {
		fxpreview();
		firstRenderComplete = true;
	}

}

// ********************************************************************
// Various interaction functions - key presses, clicking, window-sizing
// ********************************************************************

function keyPressed() {

	if (key == 's') {
		save(renderBuffer, "Eye" + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
		displayMessage("Render saved ");
	}
	
	if (key == 'c') {
		saveCanvas("Eye" + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
		displayMessage("Canvas saved ");
	}
	
	if (key == 'r') {
		createInfo();
		startRender();
		displayMessage("Re-rendering with same parameters.");
	}	
		
	if (key == 'p') {
		initiate();
		createInfo();
		startRender();
		displayMessage("Re-rendering with new parameters.");
	}	
		
	if (key == 'i') {
		if (infoTargetAlpha == 0) {
			infoTargetAlpha = 360;
		} else {
			infoTargetAlpha = 0;
		}
	}
	
	// Test mode
	if (key == 't') {
		showTestingGuides = !showTestingGuides;
		displayMessage("Testing guides toggled");
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

// ColorStructure: Name of palette, irisInner, irisMain, irisOuter, ???, accentColor
function pushColorStructures() {	
// 	colorStructures.push(["Red     ", "#ff0000", "#ee0000", "#dd0000", "#cc0000", "#bb0000"]);
// 	colorStructures.push(["Green   ", "#00ff00", "#00ee00", "#00dd00", "#00cc00", "#00bbaa"]);
// 	colorStructures.push(["Blue    ", "#0000ff", "#0000ee", "#0000dd", "#0000cc", "#0000bb"]);
// 	colorStructures.push(["Magenta ", "#ff00ff", "#ee00ee", "#dd00dd", "#cc00cc", "#bb00bb"]);
// 	colorStructures.push(["Yellow  ", "#00ffff", "#00eeee", "#00dddd", "#00cccc", "#00bbbb"]);
// 	colorStructures.push(["White   ", "#ffffff", "#eeeeee", "#dddddd", "#cccccc", "#bbbbbb"]);
	colorStructures.push(parseCoolors("https://coolors.co/ffffff-effffa-e5ecf4-c3bef7-8a4fff", "Blue"));
	colorStructures.push(parseCoolors("https://coolors.co/424b54-b38d97-d5aca9-ebcfb2-c5baaf", "Sand and Charcoal"));
	colorStructures.push(parseCoolors("https://coolors.co/540d6e-ee4266-ffd23f-3bceac-0ead69", "Violet, Pink, Yellow"));
	colorStructures.push(parseCoolors("https://coolors.co/423e3b-ff2e00-fea82f-fffecb-5448c8", "Black, Scarlet, Orange"));
}

function parseCoolors(paletteURL, paletteName) {
  const colorStructure = paletteURL.slice(paletteURL.lastIndexOf('/') + 1).split('-');
  for (var i=0; i < colorStructure.length; i++) {
    colorStructure[i] = `#${colorStructure[i]}`;
  }
  colorStructure.splice(0, 0, paletteName);
  return colorStructure;
}


function pushRenderQuotes() {
	renderQuotes.push("#WIP");
}

function pushInstructionText(textString, newLines) {
	instructionText += textString;
	instructionText += "\n";
}

function createInfo() {
	infoText = nameOfPiece;
	infoText += "\n";
	infoText += "\nColour palette: " + colorStructure[0];
	infoText += "\n";
	infoText += "\nIris radius   : " + nf(irisRadius, 0, 2);
	infoText += "\nIris diameter : " + nf(irisDiameter, 0, 2);
	infoText += "\n";
	infoText += "\nPupil radius  : " + nf(pupilRadius, 0, 2);;
	infoText += "\nPupil diameter: " + nf(pupilDiameter, 0, 2);
	infoText += "\n";
	infoText += "\nEccentricity: " + eccentricity;
	infoText += "\nStriation complexity: " + irisStriations;
	infoText += "\n";
}


