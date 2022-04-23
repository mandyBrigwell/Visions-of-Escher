// Eye
// 2022 Mandy Brigwell

var nameOfPiece = "Eye";

let randomSeedValue = ~~(fxrand()*12345);
let noiseSeedValue = ~~(fxrand()*56789);

// Graphics buffers, resolution, frames and rendering
var theCanvas, graphicsBuffer, renderBuffer;
const buffer = {background: 0, sclera: 1, iris: 2, pupil: 3, specular: 4, shading: 5, eyelid: 6};
var graphicsBuffers = [];

var screenSize;

// Resolution independence
var fullRes = 2048;
const size = {half: fullRes/1024, one: fullRes/512, two: fullRes/256, three: fullRes/128, four: fullRes/64, five: fullRes/32, six: fullRes/16, seven: fullRes/8, eight: fullRes/2};

// HUD Variables
var infoTargetAlpha = 180;
var infoAlpha = 0;
var titleAlpha = 360;
var messageAlpha = 360;
var messageString = "Press [I] for information";
var startFrame, endFrame, requiredFrames;
var infoText;
var firstRenderComplete = false;

// Variables for test renders
// This mode is inaccessible in the final build
var testRenderCount = 0;
var testRendersRequired = 64;
var testMode = false;

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
pushInstructionText("Display test message: [T]");
pushInstructionText("\n");
pushInstructionText("Re-render with same parameters: [R]");
pushInstructionText("Re-render with new parameters: [P]");

var radiusIris, radiusPupil, irisStriations;
initiate();

window.$fxhashFeatures = {
	"radiusIris": radiusIris,
	"irisStriations": irisStriations,
	"radiusPupil": radiusPupil
}

// The initiate function sets variables for the render,
function initiate() {
	colorStructure = colorStructures[~~(fxrand()*colorStructures.length)];
	radiusIris = 0.5*fxrandbetween(0.5, 0.8);
	radiusPupil = 0.5*fxrandbetween(0.2, radiusIris*0.9);
	irisStriations = ~~(fxrandbetween(3, 8));
	mainColor = colorStructure[1];
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
	return new p5.Vector(cos(theta)*sqrt(radius), sin(theta)*sqrt(radius));
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
		graphicsBuffers[buffer.sclera].background(300);
		graphicsBuffers[buffer.sclera].fill(0);
		graphicsBuffers[buffer.sclera].noStroke();
		graphicsBuffers[buffer.sclera].ellipse(0, 0, fullRes*radiusIris*2, fullRes*radiusIris*2)
	}
	
	// If we're within the required frames, this loop renders multiple points
	if (elapsedFrame <= requiredFrames) {
	
		// Sclera
		for (var i=0; i<512; i++) {
			var xPos = 0.5-random()*random()*random()*random();
			var yPos = 0.5-random()*random()*random()*random();
// 			xPos = 1/512*~~(xPos*512);
// 			yPos = 1/256*~~(yPos*256);
			graphicsBuffers[buffer.sclera].stroke(0, map(dist(xPos, yPos, 0, 0), 0, 0.5, 0, 30));
			graphicsBuffers[buffer.sclera].strokeWeight(size.half);
			graphicsBuffers[buffer.sclera].point( xPos*fullRes, yPos*fullRes);
			graphicsBuffers[buffer.sclera].point(-xPos*fullRes, -yPos*fullRes);
			graphicsBuffers[buffer.sclera].point(-xPos*fullRes,  yPos*fullRes);
			graphicsBuffers[buffer.sclera].point( xPos*fullRes, -yPos*fullRes);
		}
	
		// Iris points
		for (var i=0; i<1024; i++) {
			var theta = renderProgress*TAU + map(i%irisStriations, 0, irisStriations-1, 0, TAU) + random(-1, 1)*random();
			var radius = random()*random()*radiusIris*0.25;
			var newPoint = randomPointInCircle(theta, radius);
			var colorIris = color(colorStructure[0]);
			colorIris.setAlpha(30);
			graphicsBuffers[buffer.iris].stroke(colorIris);
			graphicsBuffers[buffer.iris].strokeWeight(size.one);
			graphicsBuffers[buffer.iris].point(newPoint.x*fullRes, newPoint.y*fullRes);
		}
		
		// Iris striations inner
		for (var i=0; i<32; i++) {
			var theta = map(i%(irisStriations*4), 0, (irisStriations*4)-1, -PI*i, PI*i)+(random(-PI, PI)*random()*random());
			var radius = radiusIris;
			var innerPoint = randomPointInCircle(theta, radiusPupil*radiusPupil);
			var outerPoint = randomPointInCircle(theta, radiusIris*radiusIris*random()*random());
			var colorIris = color(colorStructure[0]);
			colorIris.setAlpha(30);
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].stroke(colorIris);
			graphicsBuffers[buffer.iris].line(innerPoint.x*fullRes, innerPoint.y*fullRes, outerPoint.x*fullRes, outerPoint.y*fullRes);
		}
		
		// Iris striations outer
		for (var i=0; i<32; i++) {
			var theta = map(i%(irisStriations*4), 0, (irisStriations*4)-1, -PI*i, PI*i)+(random(-PI, PI)*random()*random());
			var radius = radiusIris;
			var innerPoint = randomPointInCircle(theta, radiusIris*radiusIris-(radiusIris*random()*random()*random()*random()*random()*random()));
			var outerPoint = randomPointInCircle(theta, radiusIris*radiusIris);
			var colorIris = color(colorStructure[0]);
			colorIris.setAlpha(15);
			graphicsBuffers[buffer.iris].strokeWeight(size.half);
			graphicsBuffers[buffer.iris].stroke(colorIris);
			graphicsBuffers[buffer.iris].line(innerPoint.x*fullRes, innerPoint.y*fullRes, outerPoint.x*fullRes, outerPoint.y*fullRes);
		}
		
		// Eyelid
		for (var i=0; i<4096; i++) {
			var theta = random(TAU);
			var radius = (fullRes*radiusIris*1.2)+ random()*fullRes;
			var xPos = sin(theta);
			var yPos = cos(theta);
			graphicsBuffers[buffer.eyelid].strokeWeight(size.one);
			graphicsBuffers[buffer.eyelid].stroke(0, 90);
			graphicsBuffers[buffer.eyelid].point(xPos*radius, yPos*radius);
			graphicsBuffers[buffer.eyelid].point(xPos*radius*2, yPos*radius*2);
		}
		
		// Reflection - Arc
		graphicsBuffers[buffer.shading].fill(360, renderProgressRemaining > 0.5 ? renderProgress*3 : renderProgressRemaining*1);
		graphicsBuffers[buffer.shading].arc(0, 0, fullRes*radiusIris*2, fullRes*radiusIris*2, renderProgress*TAU*13/16, renderProgressRemaining*TAU*15/16);

		// Pupil
		for (var i=0; i<4096; i++) {
			var theta = random(TAU);
			var radius = (1-pow(random(), 8))*radiusPupil*fullRes;
			var xPos = sin(theta);
			var yPos = cos(theta);
			graphicsBuffers[buffer.pupil].strokeWeight(size.one);
			graphicsBuffers[buffer.pupil].stroke(0, 90);
			graphicsBuffers[buffer.pupil].point(xPos*radius, yPos*radius);
			graphicsBuffers[buffer.pupil].point(xPos*radius*1.05, yPos*radius*1.05);
		}
		
		// Reflection - Specular
		for (var i=0; i<2048; i++) {
			var theta=random(TAU);
			var radius = random()*random()*random()*random();
			var xPos = sin(theta)*sqrt(radius);
			var yPos = cos(theta)*sqrt(radius);
			
			// Brighter reflection in top right
			graphicsBuffers[buffer.specular].push();
			graphicsBuffers[buffer.specular].translate(fullRes*radiusIris*0.5, fullRes*radiusIris*-0.5);
			graphicsBuffers[buffer.specular].rotate(PI/4);
			graphicsBuffers[buffer.specular].stroke(360, map(dist(xPos, yPos, 0, 0.5)%2, 0, 2, 8, 0));
			
			// This gives an interesting striated effect	
// 			graphicsBuffers[buffer.specular].stroke(360, map((dist(xPos, yPos, 0, 0.5)*size.four)%2, 0, 2, 8, 0));

			graphicsBuffers[buffer.specular].strokeWeight(size.one);
			graphicsBuffers[buffer.specular].point(xPos*fullRes*0.225, yPos*fullRes*0.125)
			graphicsBuffers[buffer.specular].pop();
			
			// Lighter reflection in lower left
			graphicsBuffers[buffer.specular].push();
			graphicsBuffers[buffer.specular].translate(-fullRes*radiusIris*0.5, -fullRes*radiusIris*-0.5);
			graphicsBuffers[buffer.specular].rotate(PI/4);
			graphicsBuffers[buffer.specular].stroke(360, 1);
			graphicsBuffers[buffer.specular].strokeWeight(size.one);
			graphicsBuffers[buffer.specular].point(xPos*fullRes*0.225, yPos*fullRes*0.125)
			graphicsBuffers[buffer.specular].pop();
		}
		
	} // End elapsedFrame less than required frames loop
	
	// Render image to canvas
	translate(screenSize*0.5, screenSize*0.5);
	background(0);
	
	// Render everything to the renderBuffer in this order:
	renderLayers(renderBuffer,
		graphicsBuffers[buffer.sclera],
		graphicsBuffers[buffer.iris],
		graphicsBuffers[buffer.shading],
		graphicsBuffers[buffer.pupil],
		graphicsBuffers[buffer.specular],
		graphicsBuffers[buffer.eyelid]);
		
	image(renderBuffer, 0, 0, screenSize, screenSize);

	// Handle information text visibility
	if (infoAlpha < infoTargetAlpha) {
		infoAlpha += 30;
	} else if (infoAlpha > infoTargetAlpha) {
		infoAlpha -= 30;
	}
		
	// Render title text
	if (elapsedFrame <= requiredFrames && titleAlpha > 0) {
		titleAlpha -= map(elapsedFrame, 0, requiredFrames, 1, 8);
		textAlign(CENTER, BOTTOM);
		textSize(size.five);
		var chosenColor = color(mainColor);
		chosenColor.setAlpha(titleAlpha);
		fill(chosenColor);
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
		var chosenColor = color(mainColor);
		chosenColor.setAlpha(messageAlpha);
		fill(chosenColor);
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
		displayMessage("This is a test message.");
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

function pushColorStructures() {	
	colorStructures.push(["Red", "#ff0000", "#ee0000","#dd0000","#cc0000", "#bb0000","#aa0000"]);
	colorStructures.push(["Green", "#00ff00", "#00ee00", "#00dd00", "#00cc00", "#00bb00","00aa00"]);
	colorStructures.push(["Blue", "#0000ff", "#0000ee", "#0000dd", "#0000cc", "#0000bb", "#0000aa"]);
	colorStructures.push(["Magenta", "#ff00ff", "#ee00ee", "#dd00dd", "#cc00cc", "#bb00bb", "#aa00aa"]);
	colorStructures.push(["Yellow", "#00ffff", "#00eeee", "#00dddd", "#00cccc", "#00bbbb", "#00aaaa"]);
	colorStructures.push(["White", "#ffffff", "#eeeeee", "#dddddd", "#cccccc", "#bbbbbb", "#aaaaaa"]);
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
	infoText += "\nIris radius: " + radiusIris;
	infoText += "\nIris striations: " + irisStriations;
	infoText += "\nPupil radius: " + radiusPupil;
}


