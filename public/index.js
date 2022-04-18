// Eye
// 2022 Mandy Brigwell

var nameOfPiece = "Eye";

let randomSeedValue = ~~(fxrand()*12345);
let noiseSeedValue = ~~(fxrand()*56789);


// Graphics buffers, resolution, frames and rendering
var theCanvas, graphicsBuffer, renderBuffer;
var screenSize;

// Resolution independence
var fullRes = 2048;
const size = {half: fullRes/1024, one: fullRes/512, two: fullRes/256, three: fullRes/128};

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

var radiusIris, radiusPupil;
initiate();

window.$fxhashFeatures = {
	"radiusIris": radiusIris,
	"radiusPupil": radiusPupil
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
}

function startRender() {
	// Clear all canvases
	theCanvas.clear();
	graphicsBuffer.clear();
	renderBuffer.clear();
	
	requiredFrames = 360;
	startFrame = frameCount;
	endFrame = startFrame + requiredFrames;
}

function renderLayers(toCanvas, ...layers) {
	toCanvas.clear();
	var toCanvasSize = min(toCanvas.width, toCanvas.height);
	for (layer in layers) {
		var thisLayer = layers[layer];
		toCanvas.image(thisLayer, 0, 0, toCanvasSize, toCanvasSize);
	}
}

// The initiate function sets variables for the render,
function initiate() {
	colorStructure = colorStructures[~~(fxrand()*colorStructures.length)];
	radiusIris = 0.5*fxrandbetween(0.8, 0.9);
	radiusPupil = 0.5*fxrandbetween(0.2, 0.4);
	mainColor = colorStructure[1];
}

function fxrandbetween(from, to) {
  return from + (to - from) * fxrand();
}

function displayMessage(message) {
	messageString = message;
	messageAlpha = 360;
}

function draw() {
	// Nuke it from orbit, just to be sure
	graphicsBuffer.resetMatrix();
	graphicsBuffer.translate(fullRes*0.5, fullRes*0.5);
	graphicsBuffer.noFill();
	graphicsBuffer.noStroke();
	graphicsBuffer.strokeWeight(size.one);
	
	// Manage framecount and rendering process
	var elapsedFrame = frameCount-startFrame;
	var renderProgress = elapsedFrame/requiredFrames;
	var renderProgressRemaining = 1 - renderProgress;
	
	// If we're within the required frames, this loop renders multiple points
	if (elapsedFrame <= requiredFrames) {
	
		// Iris
		for (var i=0; i<1024; i++) {
			var theta = random(TAU);
			var radius = (1-pow(random(), 4))*radiusIris*fullRes;
			var xPos = sin(theta);
			var yPos = cos(theta);
			var colorIris = color(colorStructure[0]);
			colorIris.setAlpha(30);
			graphicsBuffer.stroke(colorIris);
			graphicsBuffer.strokeWeight(size.three);
			graphicsBuffer.point(xPos*radius, yPos*radius);
			if (random() < 0.25) {
				graphicsBuffer.stroke(0, 8);
			} else {
				colorIris.setAlpha(8);
				graphicsBuffer.stroke(colorIris);
				graphicsBuffer.strokeWeight(size.half);
			}
			graphicsBuffer.line(xPos*radiusIris*fullRes, yPos*radiusIris*fullRes, 0, 0);
		}
		
		// Pupil
		for (var i=0; i<4096; i++) {
			var theta = random(TAU);
			var radius = (1-pow(random(), 8))*radiusPupil*fullRes;
			var xPos = sin(theta);
			var yPos = cos(theta);
			graphicsBuffer.strokeWeight(size.three);
			graphicsBuffer.stroke(0, 30);
			graphicsBuffer.point(xPos*radius, yPos*radius);
		}
		
	} // End elapsedFrame less than required frames loop
	
	// Render image to canvas
	translate(screenSize/2, screenSize/2);
	background(0);
	renderLayers(renderBuffer, graphicsBuffer);
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
		textSize(screenSize*0.05);
		var chosenColor = color(mainColor);
		chosenColor.setAlpha(titleAlpha);
		fill(chosenColor);
		stroke(0, titleAlpha);
		strokeWeight(6);
		strokeJoin(ROUND);
		textStyle(BOLD);
		text(nameOfPiece, 0, 0);
		textSize(screenSize*0.025);
		textStyle(NORMAL);
		textAlign(CENTER, TOP);
		text(renderQuote, 0, 0, screenSize*0.75);
	}

	// Render information text
	if (infoAlpha > 0) {
		textSize(screenSize*0.015);
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
		textSize(screenSize*0.02);
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
	infoText += "\nPupil radius: " + radiusPupil;
}


