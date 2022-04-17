// Eye
// 2022 Mandy Brigwell

let randomSeedValue = ~~(fxrand()*12345);
let noiseSeedValue = ~~(fxrand()*56789);
let screenSize;

// Graphics buffers, resolution, frames and rendering
var theCanvas, graphics, saveBuffer;
var fullRes = 2048;
var infoTargetAlpha = 180;
var infoAlpha = 0;
var titleAlpha = 360;
var messageAlpha = 360;
var messageString = "Press [I] for information";
var startFrame, endFrame, requiredFrames;
var instructionText = "Show/hide information: [I]";
var infoText;
var firstRenderComplete = false;

// Variables for test renders
// This mode is inaccessible in the final build
// During development it rendered and saved 64 images
var testRenderCount = 0;
var testRendersRequired = 64;
var testMode = false;

// Colours
var colorStructures = [];
pushColorStructures();
colorStructure = colorStructures[~~(fxrand()*colorStructures.length)];

var renderQuotes = [];
pushRenderQuotes();
var renderQuote = renderQuotes[~~(fxrand()*renderQuotes.length)];

var colorMapName, mainColor, backgroundColor;

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
	initiate();
	createInfo();
	startRender();
}

function createGraphicsBuffers() {
	// Graphics buffer
	graphics = createGraphics(fullRes, fullRes);
	graphics.colorMode(HSB, 360);
	
	// Save graphics buffer
	saveBuffer = createGraphics(fullRes, fullRes);
	graphics.colorMode(HSB, 360);
}

function startRender() {
	// Clear all canvases
	theCanvas.clear();
	graphics.clear();
	saveBuffer.clear();
	
	requiredFrames = 360;
	startFrame = frameCount;
	endFrame = startFrame + requiredFrames;
}

function initiate() {
	if (firstRenderComplete) {
		colorStructure = colorStructures[~~(fxrand()*colorStructures.length)];
	}
	mainColor = "#" + colorStructure[1];
}

function createInfo() {
	infoText = "Eye"
	infoText += "\n";
	infoText += "\nColour palette: " + colorMapName;
}

function displayMessage(message) {
	messageString = message;
	messageAlpha = 360;
}

function draw() {
	// Nuke it from orbit, just to be sure
	graphics.resetMatrix();
	graphics.translate(fullRes*0.5, fullRes*0.5);
	graphics.noFill();
	graphics.noStroke();
	graphics.strokeWeight(1);
	
	// Manage framecount and rendering process
	var elapsedFrame = frameCount-startFrame;
	var renderProgress = elapsedFrame/requiredFrames;
	var renderProgressRemaining = 1 - renderProgress;
	
	// If we're within the required frames, this loop renders multiple points
	if (elapsedFrame <= requiredFrames) {
	
		
		for (var i=0; i<256; i++) {
			var xPos = random();
			var yPos = random();
			var radius = random()*random()*random()*renderProgressRemaining*fullRes;
			graphics.stroke(random([0, 360]), 180);
			graphics.ellipse(0, 0, radius, radius);
			graphics.rotate(random(TAU));
			graphics.line(0, 0, xPos*radius*0.5, yPos*radius*0.5);
		}
		
	} // End elapsedFrame less than required frames loop
	
	// Render image to canvas
	translate(screenSize/2, screenSize/2);
	background(0);
	image(graphics, 0, 0, screenSize, screenSize);

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
		text("Eye #WIP", 0, 0);
		textSize(screenSize*0.025);
		textStyle(NORMAL);
		textAlign(CENTER, TOP);
		text("\"" + renderQuote + "\"", 0, 0, screenSize*0.75);
	}

	// Render information text
	if (infoAlpha > 0) {
		textSize(screenSize*0.02);
		fill(360, infoAlpha);
		stroke(0, infoAlpha);
		strokeWeight(6);
		strokeJoin(ROUND);
		textAlign(RIGHT, TOP);
		text(instructionText, screenSize*0.45, screenSize*-0.45);
		textAlign(LEFT, TOP);
		text(infoText + "\n" + (renderProgress < 1 ? ("Rendering " + ~~(renderProgress*100) + '/100') : "Render complete"), screenSize*-0.45, screenSize*-0.45);
		textAlign(CENTER, CENTER);
		text("\"" + renderQuote + "\"", 0, screenSize*0.35, screenSize*0.5);
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

function keyPressed() {

	if (key == 's') {
		saveBuffer.background(0);
		saveBuffer.image(graphics, 0, 0, fullRes, fullRes);
		save(saveBuffer, "Eye" + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
		displayMessage("Render saved ");
	}
	
	if (key == 'r') {
		initiate();
		createInfo();
		startRender();
		displayMessage(colorStructure);
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

function pushColorStructures() {	
	colorStructures.push(["ColorStructure 1", "ffffff", "eeeeee","dddddd","cccccc", "bbbbbb","aaaaaa"]);
	colorStructures.push(["ColorStructure 2", "ffffff", "eeeeee","dddddd","cccccc", "bbbbbb","aaaaaa"]);
}

function pushRenderQuotes() {
	renderQuotes.push("Quote 1");
	renderQuotes.push("Quote 2");
	renderQuotes.push("Quote 3");
	renderQuotes.push("Quote 4");
}