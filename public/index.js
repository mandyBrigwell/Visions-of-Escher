// Mapped Orbits for Unbound Electrons
// 2022 Mandy Brigwell
// Fonts from Google Fonts, released under open source licenses and usable in any non-commercial or commercial project.

var nameOfPiece = "Mapped Orbits for Unbound Electrons";
var shortNameOfPiece = "MappedOrbitsForUnboundElectrons";
var descriptionOfPiece;

var randomSeedValue = ~~(fxrand() * 12345);
var noiseSeedValue = ~~(fxrand() * 56789);

// Graphics buffers, resolution, frames and rendering
var theCanvas, linesBuffer, renderBuffer, saveBuffer;
var graphicsBuffers = [];
var renderFlags = [];
var instructionText;
var displayVariantNames = ["Single", "Dual segmented", "Thirds", "Quartered", "Central overlap", "Corners", "Fourfold"];
var displayTransmission = false;
var transmissionArray = [];
var transmissionPosition = 0;
var nextTransmissionDelay = Date.now()/1000;

// Gradients
var gradientsArray = [];
var linesArray = [];
var circlesArray = [];
var numberOfGradients;
var sharedBackgroundHue;
var sharedRotation;
var variableStroke;
var lineStrokeWeight;
var darkMode;
var mainHue;
var instanceRange;
var instanceTexturedBackground;
var requiredFrames;
var pointsPerFrame;

var screenSize;

// Testing
TESTMODE = false;
RENDERCOUNT = 0;
RENDERSREQUIRED = 16;

// Resolution independence
var fullRes = 2048;

// Sizes for the rendering canvases
const size = {
	zero: 0,
	half: fullRes / 4096,
	one: fullRes / 2048,
	two: fullRes / 1024,
	three: fullRes / 768,
	four: fullRes / 256,
	five: fullRes / 32
};

// Prepare fonts for preloading
var titleFont;

// HUD Variables
var infoTargetAlpha = 0;
var infoAlpha = 0;
var titleTargetAlpha = 0;
var titleAlpha = 360;
var messageAlpha = 360;
var messageString = "A generative artwork by Mandy Brigwell\nPress 'I' for information";
var startFrame, endFrame, requiredFrames;
var infoText;

// Flags
var firstRenderComplete = false;
var currentlyRendering = false;

// Define hash-value-dependent parameters
initiate();

window.$fxhashFeatures = {
	"Background": instanceTexturedBackground ? "Textured" : "Plain",
	"Orbit count": numberOfGradients,
	"Render variant": displayVariantNames[displayVariant],
	"Render density": variableStroke ? "Variable" : "Fine",
	"Palette": hueDescriptor(mainHue) + "-based, " + (darkMode ? "dark" : "light"),
	"Palette range": instanceRange == 0 ? "Monochrome" : instanceRange > 180 ? "High" : "Low"
}

// The initiate function sets variables for the render,
function initiate() {
	sharedBackgroundHue = fxrand()*360;
	sharedRotation = ~~(fxrand()*4) * Math.PI/2;
	displayVariant = fxIntBetween(0, 6);
	variableStroke = fxrand()<0.75;
	darkMode = fxrand()<0.95;
	lineStrokeWeight = fullRes/384;
	
	// Hue choices
	mainHue = fxIntBetween(0, 360);
	instanceRange = fxIntBetween(30, 360);
	if (fxrand() < 0.1) {
		// Monochrome
		instanceRange = 0;
	}
	backgroundDarkness = fxrand() < 0.25 ? 0 : 1;
	
	// This is currently disabled below for variants 2 and 6
	instanceTexturedBackground = fxrand() < 0.1;
	
	circlesArray = [];
	linesArray = [];
	
	linesArray.push([new p5.Vector(0, 0), new p5.Vector(0, 1)] );
	linesArray.push([new p5.Vector(0, 0), new p5.Vector(1, 0)] );
	linesArray.push([new p5.Vector(1, 1), new p5.Vector(1, 0)] );
	linesArray.push([new p5.Vector(1, 1), new p5.Vector(0, 1)] );
	var variationChance = fxrand();
	switch (displayVariant) {
		case 0: // Single render space, with between 2 and 9 layers in the centre
			numberOfGradients = 2+~~(fxrand()*8);
			if (variationChance < 0.1) {
				linesArray.push([new p5.Vector(0.25, 0.25), new p5.Vector(0.25, 0.50)] );
				linesArray.push([new p5.Vector(0.25, 0.25), new p5.Vector(0.50, 0.25)] );
				linesArray.push([new p5.Vector(0.75, 0.75), new p5.Vector(0.75, 0.50)] );
				linesArray.push([new p5.Vector(0.75, 0.75), new p5.Vector(0.50, 0.75)] );
			} else if (variationChance < 0.2) {
				linesArray.push([new p5.Vector(0.25, 0.75), new p5.Vector(0.25, 0.25)] );
				linesArray.push([new p5.Vector(0.75, 0.25), new p5.Vector(0.75, 0.75)] );
			} else if (variationChance < 0.3) {
				circlesArray.push([new p5.Vector(1/4, 1/4), 1/6, 2, 0/3, 3/3]);
				circlesArray.push([new p5.Vector(2/4, 1/4), 1/6, 2, 1/3, 4/3]);
				circlesArray.push([new p5.Vector(3/4, 1/4), 1/6, 2, 2/3, 5/3]);
			} else if (variationChance < 0.4) {
				if (fxrand() < 0.3) {
					circlesArray.push([new p5.Vector(1/4, 3/4), 1/9, 2, 0/3, 2/3]);
					circlesArray.push([new p5.Vector(3/4, 1/4), 1/9, 2, 0/3, 2/3]);
				} else if (fxrand() < 0.6) {
					var start = fxIntBetween(0, 2);
					var end = fxIntBetween(1, 3);
					if (start == end) {
						end += 1;
					}
					circlesArray.push([new p5.Vector(1/4, 1/4), 1/4, 1, (start+1)/3, (end+1)/3]);
					circlesArray.push([new p5.Vector(1/4, 1/4), 1/3, 1, end/3, start/3]);
				}
			}
		break;
		case 1:
			numberOfGradients = 4;
			linesArray.push([new p5.Vector(1, 1), new p5.Vector(0, 1)] );
			linesArray.push([new p5.Vector(0.5, 0), new p5.Vector(0.5, 0.55)] );
			linesArray.push([new p5.Vector(0.5, 1), new p5.Vector(0.5, 0.45)] );
			if (fxrand() < 0.75) {
				for (var k=0; k < fxIntBetween(2, 8); k++) {
					var yPos = (~~(fxrand()*9))/9;
					if (k%2 == 0) {
						if (fxrand() < 0.5) {
							linesArray.push([new p5.Vector(0.5, yPos), new p5.Vector(0, yPos)] );
						} else {
							linesArray.push([new p5.Vector(0, yPos), new p5.Vector(0.5, yPos)] );
						}
					} else {
						if (fxrand() < 0.5) {
							linesArray.push([new p5.Vector(0.5, yPos), new p5.Vector(1, yPos)] );
						} else {
							linesArray.push([new p5.Vector(1, yPos), new p5.Vector(0.5, yPos)] );
						}
					}
				}
			}
		break;
		case 2:
			numberOfGradients = 6;
			linesArray.push([new p5.Vector(1/3, 0/3), new p5.Vector(1/3, 1/3)] );
			linesArray.push([new p5.Vector(1/3, 3/3), new p5.Vector(1/3, 2/3)] );
			linesArray.push([new p5.Vector(2/3, 0/3), new p5.Vector(2/3, 1/3)] );
			linesArray.push([new p5.Vector(2/3, 3/3), new p5.Vector(2/3, 2/3)] );
			linesArray.push([new p5.Vector(1, 1/3), new p5.Vector(0, 1/3)] );
			linesArray.push([new p5.Vector(0, 2/3), new p5.Vector(1, 2/3)] );
			instanceTexturedBackground = false;
		break;
		case 3:
			numberOfGradients = 6;
			linesArray.push([new p5.Vector(1/3, 1/3), new p5.Vector(1/3, 0)] );
			linesArray.push([new p5.Vector(1/3, 1/3), new p5.Vector(1/3, 1)] );
			linesArray.push([new p5.Vector(1/3, 1/3), new p5.Vector(0, 1/3)] );
			linesArray.push([new p5.Vector(1/3, 1/3), new p5.Vector(1, 1/3)] );
			linesArray.push([new p5.Vector(2/3, 0), new p5.Vector(2/3, 1/3)] );
			linesArray.push([new p5.Vector(0, 2/3), new p5.Vector(1/3, 2/3)] );
			if (variationChance < 0.1) {
				linesArray.push([new p5.Vector(3/6, 3/6), new p5.Vector(3/6, 4/6)] );
				linesArray.push([new p5.Vector(3/6, 3/6), new p5.Vector(4/6, 3/6)] );
				linesArray.push([new p5.Vector(5/6, 5/6), new p5.Vector(4/6, 5/6)] );
				linesArray.push([new p5.Vector(5/6, 5/6), new p5.Vector(5/6, 4/6)] );
			} else if (variationChance < 0.2) {
				linesArray.push([new p5.Vector(3/6, 3/6), new p5.Vector(3/6, 5/6)] );
				linesArray.push([new p5.Vector(3/6, 3/6), new p5.Vector(5/6, 3/6)] );
				linesArray.push([new p5.Vector(5/6, 5/6), new p5.Vector(3/6, 5/6)] );
				linesArray.push([new p5.Vector(5/6, 5/6), new p5.Vector(5/6, 3/6)] );
			} else if (variationChance < 0.3) {
				circlesArray.push([new p5.Vector(2/3, 2/3), 3/6, 1, 1/6, 6/6]);
			} else if (variationChance < 0.4) {
				var startPos = fxIntBetween(3, 6);
				circlesArray.push([new p5.Vector(2/3, 2/3), 3/6, 1, ((startPos+0)%6)/6, ((startPos+2)%6)/6]);
				circlesArray.push([new p5.Vector(2/3, 2/3), 2/6, 1, ((startPos+2)%6)/6, ((startPos+4)%6)/6]);
				circlesArray.push([new p5.Vector(2/3, 2/3), 1/6, 1, ((startPos+4)%6)/6, ((startPos+6)%6)/6]);
			}
		break;
		case 4:
			numberOfGradients = 5;
			var endPos = (~~(fxrand()*6))/6;
			var startPos = fxrand() < 0.25 ? (~~(fxrand()*6))/6 : 0;
				linesArray.push([new p5.Vector(1/3, 1-startPos), new p5.Vector(1/3, endPos)] );
				linesArray.push([new p5.Vector(2/3, startPos), new p5.Vector(2/3, 1-endPos)] );
		break;
		case 5:
			numberOfGradients = 4;
			if (fxrand() < 0.5) {
				linesArray.push([new p5.Vector(1/4, 1), new p5.Vector(1/4, 1/8)] );
				linesArray.push([new p5.Vector(3/4, 0), new p5.Vector(3/4, 7/8)] );
			}
			if (fxrand() < 0.5) {
				linesArray.push([new p5.Vector(1/2, 1/2), new p5.Vector(1/2, 1)] );
				linesArray.push([new p5.Vector(1/2, 1/2), new p5.Vector(1/2, 0)] );
			}
			if (fxrand() < 0.5) {
				linesArray.push([new p5.Vector(1/2, 1/2), new p5.Vector(7/8, 1/2)] );
				linesArray.push([new p5.Vector(1/2, 1/2), new p5.Vector(1/8, 1/2)] );
			}
			if (fxrand() < 0.5) {
				if (fxrand() < 0.5) {
					circlesArray.push([new p5.Vector(1/8, (1+fxIntBetween(0, 3)*2)/8), 1/8, 1, 0/4, 4/4]);
				}
				if (fxrand() < 0.5) {
					circlesArray.push([new p5.Vector(3/8, (1+fxIntBetween(0, 3)*2)/8), 1/8, 2, 5/4, 1/4]);
				}
				if (fxrand() < 0.5) {
					circlesArray.push([new p5.Vector(5/8, (1+fxIntBetween(0, 3)*2)/8), 1/8, 1, 2/4, 6/4]);
				}
				if (fxrand() < 0.5) {
					circlesArray.push([new p5.Vector(7/8, (1+fxIntBetween(0, 3)*2)/8), 1/8, 2, 7/4, 3/4]);
				}
			}
		break;
		case 6:
			numberOfGradients = 4;
				linesArray.push([new p5.Vector(1/2, 1/2), new p5.Vector(1, 1/2)] );
				linesArray.push([new p5.Vector(1/2, 1/2), new p5.Vector(0, 1/2)] );
				linesArray.push([new p5.Vector(1/4, 1), new p5.Vector(1/4, 1/2)] );
				linesArray.push([new p5.Vector(2/4, 1/2), new p5.Vector(2/4, 1)] );
				linesArray.push([new p5.Vector(3/4, 1), new p5.Vector(3/4, 1/2)] );
				instanceTexturedBackground = false;
		break;
	}
}

function preload() {
	titleFont = loadFont("SpecialElite-Regular.ttf");
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

	// Set up
	createGraphicsBuffers();
	createNewGradients();
	createInfo();
	startRender();
	
	noSmooth();
	
	pushDescription();
}

function createNewGradients() {
	gradientsArray = [];
  for (var i = 0; i < numberOfGradients; i++) {
    gradientsArray.push(new circularGradient);
  }
}

function createGraphicsBuffers() {
	// Reset arrays
	graphicsBuffers = [];
	renderFlags = [];

	// Render buffer
	renderBuffer = createGraphics(fullRes, fullRes);
	renderBuffer.colorMode(HSB, 360);

	// Save buffer
	saveBuffer = createGraphics(fullRes, fullRes);
	saveBuffer.colorMode(HSB, 360);
	saveBuffer.rectMode(CENTER);
	saveBuffer.imageMode(CENTER);

	// Lines buffer
	linesBuffer = createGraphics(fullRes, fullRes);
	linesBuffer.colorMode(HSB, 360);

	for (var i = 0; i < numberOfGradients; i++) {
		graphicsBuffers[i] = createGraphics(fullRes, fullRes);
		graphicsBuffers[i].colorMode(HSB, 360);
		graphicsBuffers[i].rectMode(CENTER);
		renderFlags[i] = true;
	}
}

function startRender() {

	// Reset seed
	randomSeed(randomSeedValue);
	noiseSeed(noiseSeedValue);
	
	// Clear main canvas and render buffer
	theCanvas.clear();
	renderBuffer.clear();
	
	// Clear all graphics buffers
	for (var eachBuffer of graphicsBuffers) {
		eachBuffer.clear();
	}

  requiredFrames = 360;
  pointsPerFrame = 131072/requiredFrames/numberOfGradients;
	startFrame = frameCount;
	endFrame = startFrame + requiredFrames;
	instructionText = "";
	pushInstructionTexts();
	
	currentlyRendering = true;
}

function renderLayers(toCanvas, layers) {
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

function fxRandBetween(from, to) {
	return from + (to - from) * fxrand();
}

function fxIntBetween(from, to) {
	return ~~fxRandBetween(from, to+1);
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
	
	// First frame; set background
	if (instanceTexturedBackground && elapsedFrame == 1) {
		for (eachGradient in gradientsArray) {
			if (gradientsArray[eachGradient].texturedBackground) {
				for (var i=fullRes; i>0; i-=0.5) {
					graphicsBuffers[eachGradient].stroke(random(90), 90);
					graphicsBuffers[eachGradient].rotate(random());
					let xPos = random()*random()*random(-1,1)*fullRes;
					let yPos = random()*random()*random(-1,1)*fullRes;
					graphicsBuffers[eachGradient].line(-xPos, yPos, xPos+random(-64, 64), yPos);
					graphicsBuffers[eachGradient].line(xPos, -yPos, xPos, yPos+random(-64, 64));
				}
			}
		}
	}
	
	// If we're within the required frames, this loop renders multiple points
	if (elapsedFrame <= requiredFrames) {
	
		// Render points for each gradient in turn
    for (eachGradient in gradientsArray) {
			var cGrad = gradientsArray[eachGradient];
      var p;
      for (var j = 0; j < cGrad.segmentCount; j++) {
        var innerRadius = cGrad.startRadius + (cGrad.radiusIncrement * j);
        var outerRadius = innerRadius + (cGrad.stripWidth * j);
        var angleOffset = cGrad.angleIncrement * j;
        for (var i = 0; i < j * pointsPerFrame; i++) {
          var randomDistance = random(outerRadius - innerRadius) + innerRadius;
          var randomAngle = random() * random() * cGrad.randomAngleRange;
          p = p5.Vector.fromAngle(angleOffset + randomAngle);
          p.mult(randomDistance);
          if (random() < 0.9) {
            graphicsBuffers[eachGradient].stroke(
            map(randomDistance, outerRadius, innerRadius, cGrad.hueInk, (cGrad.hueInk + cGrad.hueRange) % 360), 360, cGrad.hueBrightness, 180);
          } else {
            graphicsBuffers[eachGradient].stroke(0, 0, map(cGrad.hueBrightness, 0, 360, 300, 60), 30);
          }
          if (variableStroke) {
          	graphicsBuffers[eachGradient].strokeWeight(map(randomDistance, innerRadius, outerRadius, size.three, size.zero));
          } else {
           	graphicsBuffers[eachGradient].strokeWeight(map(dist(p.x, p.y, 0, 0), 0, fullRes/2, size.half, size.two));
         }
          graphicsBuffers[eachGradient].point(p.x, p.y);
        }
      }
    }
   
		// Render lines
		for (eachPair in linesArray) {
			var startLocation = linesArray[eachPair][0];
			var endLocation = linesArray[eachPair][1];
			var xPos = lerp(startLocation.x, endLocation.x, renderProgress);
			var yPos = lerp(startLocation.y, endLocation.y, renderProgress);
			var adjustedX = map(xPos, 0, 1, fullRes*0.0125, fullRes*0.9875);
			var adjustedY = map(yPos, 0, 1, fullRes*0.0125, fullRes*0.9875);
			if (darkMode) {
				linesBuffer.stroke(0, map(renderProgress, 0, 1, 180, 0));
			} else {
				linesBuffer.stroke(360, map(renderProgress, 0, 1, 180, 0));
			}
			for (var k=0; k<64; k++) {
				var splatterAmount = random(-1, 1)*random()*random()*random()*random()*random()*random()*random()*random();
				var splatter = size.five * splatterAmount;
				linesBuffer.strokeWeight(abs(lineStrokeWeight * 2 * (1-splatterAmount)));
				linesBuffer.point(adjustedX+splatter, adjustedY+splatter);
			}
		}
		
		// Render circles
		for (eachCircle in circlesArray) {
			var xPos = map(circlesArray[eachCircle][0].x, 0, 1, fullRes*0.0125, fullRes*0.9875);
			var yPos = map(circlesArray[eachCircle][0].y, 0, 1, fullRes*0.0125, fullRes*0.9875);
			var radius = circlesArray[eachCircle][1]*fullRes*0.4875;
			var circleStyle = circlesArray[eachCircle][2];
			var startPos = circlesArray[eachCircle][3];
			var endPos = circlesArray[eachCircle][4];
			var theta = map(renderProgress, 0, 1, startPos*TAU, endPos*TAU);
			if (darkMode) {
				linesBuffer.stroke(0, map(renderProgress, 0, 1, 180, 0));
			} else {
				linesBuffer.stroke(360, map(renderProgress, 0, 1, 180, 0));
			}
			for (var k=0; k<64; k++) {
				var splatterAmount = random(-1, 1)*random()*random()*random()*random()*random()*random()*random()*random();
				var splatterTheta = random(TAU);
				var splatterX = size.five * splatterAmount * cos(splatterTheta);
				var splatterY = size.five * splatterAmount * sin(splatterTheta);
				linesBuffer.strokeWeight(abs(lineStrokeWeight * 2 * (1-splatterAmount)));
				linesBuffer.point((xPos+splatterX)+radius*cos(theta), (yPos+splatterY)+radius*sin(theta));
				if (circleStyle == 2) {
					linesBuffer.point((xPos+splatterX)+radius*cos(theta+PI), (yPos+splatterY)+radius*sin(theta+PI));
				}
				if (circleStyle == 3) {
					var randomPoint = (~~random(TAU)*8)/8;
					linesBuffer.point((xPos+splatterX)+radius*cos(theta+randomPoint), (yPos+splatterY)+radius*sin(theta+randomPoint));
				}
			}
		}
  
  
	} // End elapsedFrame less than required frames loop

	// Display variants
	renderBuffer.clear();
	if (darkMode) {
		renderBuffer.background(sharedBackgroundHue, 300, 30*backgroundDarkness);
	} else {
		renderBuffer.background(sharedBackgroundHue, 15, 345);
	}
	switch (displayVariant) {
		case 0: // All layers overlaid in centre of canvas
			var bufferList = [];
			for (var i = 0; i < graphicsBuffers.length; i++) {
				if (renderFlags[i]) {
					bufferList.push(graphicsBuffers[i]);
				}
			}
			renderLayers(renderBuffer, bufferList);
		break;
		case 1:
			if (renderFlags[0]) {
				renderBuffer.image(graphicsBuffers[0], 0, 0, fullRes*0.5, fullRes, fullRes*0.25, 0, fullRes*0.5, fullRes);
			}
			if (renderFlags[1]) {
				renderBuffer.image(graphicsBuffers[1], 0, 0, fullRes*0.5, fullRes, fullRes*0.25, 0, fullRes*0.5, fullRes);
			}
			if (renderFlags[2]) {
				renderBuffer.image(graphicsBuffers[2], fullRes*0.5, 0, fullRes*0.5, fullRes, fullRes*0.25, 0, fullRes*0.5, fullRes);
			}
			if (renderFlags[3]) {
				renderBuffer.image(graphicsBuffers[3], fullRes*0.5, 0, fullRes*0.5, fullRes, fullRes*0.25, 0, fullRes*0.5, fullRes);
			}
		break;
		case 2:
			if (renderFlags[0]) {
				renderBuffer.image(graphicsBuffers[0], fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[0], fullRes*0/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[1]) {
				renderBuffer.image(graphicsBuffers[1], fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[1], fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[2]) {
				renderBuffer.image(graphicsBuffers[2], fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[2], fullRes*2/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[3]) {
				renderBuffer.image(graphicsBuffers[3], fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[3], fullRes*0/3, fullRes*2/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[4]) {
				renderBuffer.image(graphicsBuffers[4], fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[4], fullRes*1/3, fullRes*2/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[5]) {
				renderBuffer.image(graphicsBuffers[5], fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*3/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[5], fullRes*2/3, fullRes*2/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
		break;
		case 3:
			if (renderFlags[0]) {
				renderBuffer.image(graphicsBuffers[0], fullRes*0/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[0], fullRes*0/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[1]) {
				renderBuffer.image(graphicsBuffers[1], fullRes*1/3, fullRes*1/3, fullRes*2/3, fullRes*2/3, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[1], fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*0/3, fullRes*0/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[2]) {
				renderBuffer.image(graphicsBuffers[2], fullRes*1/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*0/3, fullRes*0/3, fullRes*1/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[2], fullRes*0/3, fullRes*2/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[3]) {
				renderBuffer.image(graphicsBuffers[3], fullRes*1/3, fullRes*1/3, fullRes*2/3, fullRes*2/3, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[3], fullRes*2/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
			}
			if (renderFlags[4]) {
				renderBuffer.image(graphicsBuffers[2], fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[2], fullRes*1/3, fullRes*1/3, fullRes*2/3, fullRes*2/3, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2);
			}
			if (renderFlags[5]) {
				renderBuffer.image(graphicsBuffers[5], fullRes*0/3, fullRes*2/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3, fullRes*1/3);
				renderBuffer.image(graphicsBuffers[5], fullRes*2/3, fullRes*0/3, fullRes*1/3, fullRes*1/3, fullRes*1/2, fullRes*1/2, fullRes*1/3, fullRes*1/3);
			}
		break;
		case 4:
			if (renderFlags[0]) {
				renderBuffer.image(graphicsBuffers[0], 0, 0, fullRes*2/3, fullRes, 0, 0, fullRes*2/3, fullRes);
			}
			if (renderFlags[1]) {
				renderBuffer.image(graphicsBuffers[1], 0, 0, fullRes*2/3, fullRes, 0, 0, fullRes*2/3, fullRes);
			}
			if (renderFlags[2]) {
				renderBuffer.image(graphicsBuffers[2], fullRes*1/3, 0, fullRes*2/3, fullRes, fullRes*1/3, 0, fullRes*2/3, fullRes);
			}
			if (renderFlags[3]) {
				renderBuffer.image(graphicsBuffers[3], fullRes*1/3, 0, fullRes*2/3, fullRes, fullRes*1/3, 0, fullRes*2/3, fullRes);
			}
			if (renderFlags[4]) {
				renderBuffer.image(graphicsBuffers[4], 0, 0, fullRes, fullRes);
			}
		break;
		case 5:
			if (renderFlags[0]) {
				renderBuffer.image(graphicsBuffers[0], 0, 0, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[0], fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2, 0, 0, fullRes*1/2, fullRes*1/2);
			}
			if (renderFlags[1]) {
				renderBuffer.image(graphicsBuffers[1], 0, 0, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[1], fullRes*1/2, fullRes*1/2, fullRes*1/2, fullRes*1/2, 0, 0, fullRes*1/2, fullRes*1/2);
			}
			if (renderFlags[2]) {
				renderBuffer.image(graphicsBuffers[2], fullRes*1/4, fullRes*0/4, fullRes*1/4, fullRes, fullRes*1/4, 0, fullRes*1/4, fullRes);
			}
			if (renderFlags[3]) {
				renderBuffer.image(graphicsBuffers[3], fullRes*1/2, fullRes*0/4, fullRes*1/4, fullRes, fullRes*1/2, 0, fullRes*1/4, fullRes);
			}
		break;
		case 6:
			if (renderFlags[0]) {
				renderBuffer.image(graphicsBuffers[0], 0, 0, fullRes, fullRes*1/2, 0, fullRes*1/4, fullRes, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[0], fullRes*3/4, fullRes*1/2, fullRes*1/4, fullRes*1/2, fullRes*3/8, fullRes*1/4, fullRes*1/4, fullRes*1/2);
			}
			if (renderFlags[1]) {
				renderBuffer.image(graphicsBuffers[1], 0, 0, fullRes, fullRes*1/2, 0, fullRes*1/4, fullRes, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[1], fullRes*2/4, fullRes*1/2, fullRes*1/4, fullRes*1/2, fullRes*3/8, fullRes*1/4, fullRes*1/4, fullRes*1/2);
			}
			if (renderFlags[2]) {
				renderBuffer.image(graphicsBuffers[2], 0, 0, fullRes, fullRes*1/2, 0, fullRes*1/4, fullRes, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[2], fullRes*1/4, fullRes*1/2, fullRes*1/4, fullRes*1/2, fullRes*3/8, fullRes*1/4, fullRes*1/4, fullRes*1/2);
			}
			if (renderFlags[3]) {
				renderBuffer.image(graphicsBuffers[3], 0, 0, fullRes, fullRes*1/2, 0, fullRes*1/4, fullRes, fullRes*1/2);
				renderBuffer.image(graphicsBuffers[3], 0, fullRes*1/2, fullRes*1/4, fullRes*1/2, fullRes*3/8, fullRes*1/4, fullRes*1/4, fullRes*1/2);
			}
		break;
	}
	
	translate(screenSize * 0.5, screenSize * 0.5);
	rotate(sharedRotation);
	saveBuffer.clear();
	saveBuffer.resetMatrix();
	saveBuffer.translate(fullRes * 0.5, fullRes * 0.5);
	saveBuffer.rotate(sharedRotation);
	if (darkMode) {
		saveBuffer.background(sharedBackgroundHue, 360, map(renderProgress, 0, 1, 0, 60));
		background(sharedBackgroundHue, 360, map(renderProgress, 0, 1, 0, 60));
	} else {
		saveBuffer.background(sharedBackgroundHue, 60, map(renderProgress, 0, 1, 360, 300));
		background(sharedBackgroundHue, 60, map(renderProgress, 0, 1, 360, 300));
	}
	
	saveBuffer.image(renderBuffer, 0, 0, fullRes*0.975, fullRes*0.975);
	saveBuffer.image(linesBuffer, 0, 0, fullRes, fullRes);
	image(renderBuffer, 0, 0, screenSize*0.975, screenSize*0.975);
	image(linesBuffer, 0, 0, screenSize, screenSize);
	rotate(-sharedRotation);

	// Handle information text visibility
	if (infoAlpha < infoTargetAlpha) {
		infoAlpha += 30;
	} else if (infoAlpha > infoTargetAlpha) {
		infoAlpha -= 30;
	}
	
	// Transmission mode
	var currentTime = Date.now()/1000;
	if (displayTransmission && transmissionPosition < transmissionArray.length && currentTime > nextTransmissionDelay) {
		displayMessage(transmissionArray[transmissionPosition]);
		nextTransmissionDelay = (Date.now()/1000) + 1 + (transmissionArray[transmissionPosition].length/15);
		transmissionPosition += 1;
	}
	
	// Render title text
	if (titleAlpha > 0) {
		titleAlpha -= map(elapsedFrame, 0, requiredFrames, 2, 8);
		textSize(screenSize * 0.04);
		textAlign(LEFT, BOTTOM);
		textFont(titleFont);
		if (darkMode) {
			fill(360, titleAlpha);
			stroke(0, titleAlpha);
		} else {
			fill(0, titleAlpha);
			stroke(360, titleAlpha);
		}
		strokeWeight(screenSize*0.001);
		strokeJoin(ROUND);
		text(nameOfPiece, screenSize*-0.475, screenSize*0.425);
	}

	// Render information text
	if (infoAlpha > 0) {
		textFont("sans-serif")
		textSize(screenSize * 0.02);
		if (darkMode) {
			fill(360, infoAlpha);
			stroke(0, infoAlpha);
		} else {
			fill(0, infoAlpha);
			stroke(360, infoAlpha);
		}
		strokeWeight(screenSize * 0.005);
		strokeJoin(ROUND);
		textAlign(RIGHT, TOP);
		text(instructionText, screenSize * 0.45, screenSize * -0.45);
		textAlign(LEFT, TOP);
		text(infoText + "\n\n" + (renderProgress < 1 ? ("Rendering progress: " + ~~(renderProgress * 100) + '%') : "Render complete") + "\n", screenSize * -0.45, screenSize * -0.45);
		textSize(screenSize * 0.025);
	}

	// Render message text
	if (messageAlpha > 0) {
		textFont("sans-serif")
		rectMode(CORNER);
		if (displayTransmission) {
			textFont("monospace");
			messageAlpha -= map(messageAlpha, 0, 360, 1, 2) * (elapsedFrame < requiredFrames ? 1 : 0.5);
		} else {
			messageAlpha -= map(messageAlpha, 0, 360, 1, 8) * (elapsedFrame < requiredFrames ? 1 : 0.5);
		}
		textAlign(LEFT, BOTTOM);
		textSize(screenSize * 0.02);
		strokeWeight(screenSize * 0.005);
		if (darkMode) {
			fill(360, messageAlpha);
			stroke(0, messageAlpha);
		} else {
			fill(0, messageAlpha);
			stroke(360, messageAlpha);
		}
		text(messageString, screenSize*-0.475, screenSize * 0.45, screenSize*0.9);
		rectMode(CENTER);
	}

	// Check if render is complete for fxpreview(), and set related flags;
	if (elapsedFrame == requiredFrames) {
		if (!firstRenderComplete) {
			fxpreview();
			currentlyRendering = false;
			firstRenderComplete = true;
		}
		if (TESTMODE && RENDERCOUNT < RENDERSREQUIRED) {
			RENDERCOUNT += 1;
			save(saveBuffer, shortNameOfPiece + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
			initiate();
			createNewGradients();
			createGraphicsBuffers();
			createInfo();
			startRender();
		}
	}
	

}

// ********************************************************************
// Various interaction functions - key presses, clicking, window-sizing
// ********************************************************************

function keyPressed() {

	if (key == 'c') {
		saveCanvas(shortNameOfPiece + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2), "png");
		displayMessage("Canvas saved ");
	}

	if (key == 's') {
		save(saveBuffer, shortNameOfPiece + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2) + ".png");
		displayMessage("Render saved at " + fullRes + "x" + fullRes);
	}
	
	if (key == "S") {
		saveBuffer.rotate(-sharedRotation);
		saveBuffer.textAlign(LEFT, TOP);
		saveBuffer.textFont("monospace");
		saveBuffer.textSize(fullRes * 0.0125);
		saveBuffer.strokeWeight(fullRes * 0.00125);
		if (darkMode) {
			saveBuffer.fill(360);
			saveBuffer.stroke(0);
		} else {
			saveBuffer.fill(0);
			saveBuffer.stroke(360);
		}
		saveBuffer.text(descriptionOfPiece, fullRes*0.0125, fullRes*-0.45, fullRes*0.9);
		saveBuffer.rotate(sharedRotation);
		save(saveBuffer, shortNameOfPiece + nf(hour(), 2, 0) + nf(minute(), 2, 0) + nf(second(), 2) + ".png");
		displayMessage("Render saved at " + fullRes + "x" + fullRes);
	}
	
	if (key == 't') {
		displayTransmission = true;
	}
	


	if (key == 'r') {
		createInfo();
		createGraphicsBuffers();
		startRender();
		displayMessage("Re-rendering with same parameters.");
	}

	if (key == 'p') {
		displayMessage("Re-rendering with new parameters.");
		initiate();
		createNewGradients();
		createGraphicsBuffers();
		createInfo();
		startRender();
	}

	if (key == 'i') {
		if (infoTargetAlpha == 0) {
			infoTargetAlpha = 360;
		} else {
			infoTargetAlpha = 0;
		}
	}

	if (!isNaN(key)) {
		var keyNumber = int(key);
		if (keyNumber > 0 && keyNumber <= graphicsBuffers.length) {
			renderFlags[keyNumber-1] = !renderFlags[keyNumber-1];
			displayMessage("Layer " + keyNumber + " rendering is " + (renderFlags[keyNumber-1] ? "active." : "not active."));
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
	
function pushInstructionText(textString, newLines) {
	instructionText += textString;
	instructionText += "\n";
}

function createInfo() {
	infoText = nameOfPiece;
	infoText += "\nA generative artwork by Mandy Brigwell";
	infoText += "\n";
	infoText += "\nOrbits rendered: " + numberOfGradients;
	infoText += "\nDisplay variant: " + displayVariantNames[displayVariant];
	infoText += "\nRender density: " + (variableStroke == true ? "Variable" : "Fine");
	infoText += "\nColour mode: " + (darkMode == true ? "Dark" : "Light");
	infoText += "\nPalette: " + hueDescriptor(mainHue) + "-based, " + (instanceRange == 0 ? "monochrome" : (instanceRange > 180 ? "with high range" : "with low range"));
	infoText += "\nBackground: " + (instanceTexturedBackground == true ? "Textured" : "Plain");
}

function hueDescriptor(hueValue) {
	hueValue = (~~(hueValue/30))*30;
	switch(hueValue) {
		case 0:
			return "Red";
		break;
		case 30:
			return "Orange";
		break;
		case 60:
			return "Yellow";
		break;
		case 90:
		case 120:
		case 150:
			return "Green";
		break;
		case 180:
		case 210:
		case 240:
			return "Blue";
		break;
		case 270:
			return "Violet";
		break;
		case 300:
			return "Magenta";
		break;
		case 330:
			return "Red";
		break;
		case 360:
			return "Red";
		break;
	}
	return(hueValue);
}

function pushInstructionTexts() {
	pushInstructionText("Show/hide information: [I]");
	pushInstructionText("\nSave " + fullRes + "x" + fullRes + " png: [S]");
	pushInstructionText("Save canvas: [C]");
	pushInstructionText("\nRe-render image: [R]");
	pushInstructionText("Generate new image: [P]");
	pushInstructionText("\nToggle render layers:");
	for (var i = 0; i < numberOfGradients; i++) {
		pushInstructionText("Layer " + (i+1) + ": [" + (i+1) + "]");
	}
}

function capitalise(string) {
	return (string[0].toUpperCase() + string.substring(1));
}

function pushDescription() {
	var person1 = random(["sir", "ma'am"]);
	var transmissionHour = fxIntBetween(1,9);
	var transmissionStart = fxIntBetween(10,45);
	var transmissionNumber = fxIntBetween(10000,99999);
	descriptionOfPiece = transmissionNumber + " Transmission: 0" + transmissionHour + ":" + transmissionStart + " INITIATE";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n- " + capitalise(person1) + random([", I think ", ", ", ", looks like "]) + "we have a problem. " + random(["Resonance", "Potential resonance cascade", "Overload cascade", "Electron surge", "Power fade", "Anomaly", "Anomalous material event", "Dark matter event", "Singularity fracture"]) + " detected in " + random(["main", "primary", "initial", "combination", "recombinant", "transmission"]) + " sector.";
	descriptionOfPiece += "\n- " + random(["How serious? ", "How serious is it?", "Is this it?", "As we feared, then.", "Not good.", "That's it, then.", "We've failed, then.", "Then we've failed."])+ " Do we need to " + random(["abort?", "shut down?", "isolate?", "exit?", "end the experiment?"]) + " " + random(["Can we end the experiment?", "Are we too far in?", "What are our options?", ""]);

	if (random() < 0.25) {
		descriptionOfPiece += "\n- I can try shutting down the " + random(["main grid", "main emitters", "electron guides", "waveguides", "power unit"]) + ", " + person1 + ".";
		descriptionOfPiece += "\n- Do it."
		descriptionOfPiece += "\n- " + random(["It's not ", "Nothing's ", "Functions are not ", "Controls not "]) + "responding. Effects are intensifying" + random([" if anything", " I'm afraid", " exponentially", ""])+ ". There's...";
		descriptionOfPiece += "\n- Revert. Take it back up again.";
	} else {
		descriptionOfPiece += "\n- " + random(["It's not ", "Nothing's ", "Functions are not ", "Controls not "]) + "responding. The effects are " + random(["intensifying", "increasing", "escalating"])+ ". I'm " + random(["getting", "seeing", "reading", "experiencing"]) + " some sort of distortion.";
		descriptionOfPiece += "\n- Can we shut it down?" + random([" Is there still time?", ""]);
	}

	descriptionOfPiece += "\n- It's... there's too much. The " + random(["readings", "meters", "values", "parameters"])+ " are " + random(["way over acceptable limits.", "well into the red.", "showing code black.", "showing catastrophic failure.", "unrecoverable.", "out of manageable limits."]);
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n" + (transmissionNumber+=1) + " Logged event: 0" + transmissionHour + ":" + (transmissionStart) + " QUARANTINE INITIATED";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n- That's it, then. " + random(["Activate quarantine.", "Has quarantine kicked in?", "Is quarantine oparational?", "Has the quarantine deployed?", "Are we quarantined?"]);
	descriptionOfPiece += "\n- Quarantine" + random([" is", ""]) + " active, " + person1 + ". " + random(["We're on our own.", "We're sealed in.", "We're locked out."]);
	descriptionOfPiece += "\n- Is it holding? Are they safe?" + random(["", "", " Don't tell me we've gone and done it. Is the world still out there?"]);
	descriptionOfPiece += "\n- Waiting for " + random(["information", "data", "data points", "readings"])+ ". Quarantine is... secure, " + person1 + ". Our own numbers are " + random(["fluctuating", "unstable", "looking grim", "not good"]) + ", though.";
	descriptionOfPiece += "\n- But it's " + random(["stable", "safe out there", "holding", "only inside the facility"])+ "?" + random(["", " We've not blown it all apart quite yet?"]);
	descriptionOfPiece += "\n- It's holding, but " + random(["internal dimensions are reducing rapidly.", "it's not good news for us in here.", "I don't think we're going to make it in here.", "it looks like we're going to..."]);
	if (random() < 0.5) {
		descriptionOfPiece += "\n- I see. " + random(["So how", "How", "Just how"])+ " long do we have?";
		descriptionOfPiece += "\n- Not long, " + person1 + ". Less than a minute" + random([", maybe only seconds", ", not long at all", ""]) + ". Dimensions are reduced " + random(["by half", "considerably", "drastically"])+ " already.";
	} else {
		descriptionOfPiece += "\n- Yes, I know. That's it, then. " + random(["For us, at least.", "I'd hoped it wouldn't come to this.", "I'd hoped it would be different."]) + " Did you... do you have family? Someone who'll..."
		if (random() < 0.5) {
			descriptionOfPiece += "\n- A " + random(["cat, actually.", "dog, actually."]);
			descriptionOfPiece += "\n- I'm a " + random(["cat", "dog"]) + " person, myself.";
		} else if (random() < 0.5) {
			descriptionOfPiece += "\n- I live alone. Part of the job, I guess.";
			descriptionOfPiece += "\n- Simpler, in many ways. Not that it matters now.";
		} else {
			descriptionOfPiece += "\n- Some family, yeah. Don't see them much.";
			descriptionOfPiece += "\n- Part of the job. At least they'll be safe.";
		}
	}
	descriptionOfPiece += "\n- I'm getting an alert, " + person1 + ". It's breaking " + random(["out", "through", "through quarantine", "out of the shielding", "in"]) + ".";
	descriptionOfPiece += "\n- Transmit " + random(["all", "collected", "current", "existing"]) + " data - get it sent out. Perhaps they can salvage something from it before it all goes up. Can we do that?";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n" + (transmissionNumber+=1) + " Logged Event: 0" + transmissionHour + ":" + (transmissionStart+1) + random([" BRK", " BKK", " TRK", " FFX"]) + " COMMS FAILURE. RETRYING IN 00:05";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n- Comms are down, then. That's it. It's coming in fast.";
	descriptionOfPiece += "\n- Can we do anything?";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n" + (transmissionNumber+=1) + " Logged Event: 0" + transmissionHour + ":" + (transmissionStart+1) + " QUARANTINE FAILURE IMMINENT";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n- " + capitalise(person1) + ", looks like quarantine's failing, too. It's going to " + random(["break out.", "go.", "end it all.", "go critical.", "overload."]);
	descriptionOfPiece += "\n- They were right, then. " + random(["We've failed after all.", "A bitter end to the whole mess.", "You know, I really thought we'd done it.", "Inevitable, perhaps."]) + " Here it comes, ensign.";
	if (random() < 0.25) {
		descriptionOfPiece += "\n- At least we tried.";
		descriptionOfPiece += "\n- Yes, at least we tried.";
	}
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n" + (transmissionNumber+=1) + " Logged Event: 0" + transmissionHour + ":" + (transmissionStart+2) + " QUARANTINE FAILURE";
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n- It's " + random(["unexpectedly", "strangely", "oddly"]) + " " + random(["breathtaking", "calm", "terrifying", "beautiful", "peaceful"]) + ". The " + random(["destruction", "singularity", "power surge", "electrons"]) + ", like a " + random(["sweeping", "boiling", "searing", "rippling", "shimmering"]) + " " + random(["wave", "lake", "expanse", "void", "cloud"]) + " of " + random(["translucent", "glowing", "endless", "glittering"]) + " " + random(["fire", "light", "blackness", "darkness", "sparks"])+ "...";
	descriptionOfPiece += "\n- Ensign... it's been " + random(["a pleasure", "a privilege", "quite a journey", "quite a trip"]) + "." + random([" Sorry we didn't make it.", " A shame it didn't work. Thank you...", " Maybe something good will come of it all.", " Perhaps this is as it should be.", " I wonder if it should have ended any other way."]);

	if (random() < 0.25) {
		descriptionOfPiece += "\n- Quarantine has failed, " + person1 + ".";
		descriptionOfPiece += "\n- It's just us now, then, for as long as it lasts.";
		if (random() < 0.5) {
			descriptionOfPiece += "\n- " + random(["I thought I'd always-", "I never went-", "They didn't tell us-", "Is that-", "What's that light-", "It's so bright, like there's-"]);
		} else if (random() < 0.5) {
			descriptionOfPiece += "\n- Do you think it will hurt?";
			descriptionOfPiece += "\n- I don't know. Ensign... I guess... I guess perhaps I'll see you on the other side.";
		} else if (random() < 0.5) {
			descriptionOfPiece += "\n- I never...";
		} else {
			descriptionOfPiece += "\n- Maybe it's better this way. For the planet, if not us.";
			descriptionOfPiece += "\n- A little defeatist?";
			descriptionOfPiece += "\n- Glass half full.";
		}
	}
	descriptionOfPiece += "\n";
	descriptionOfPiece += "\n" + (transmissionNumber+=1) + " Transmission: 0" + transmissionHour + ":" + (transmissionStart+2) + " FATAL ERROR IN TRANSMISSION";
	
	console.log(descriptionOfPiece);
	
	// Convert transmission text to array for display as messages
	transmissionArray = descriptionOfPiece.split(/\r?\n/);
	transmissionArray = transmissionArray.filter(function(el) { return el; });
}

class circularGradient {
  constructor() {
    this.startRadius = fxrand() < 0.125 ? max(fullRes*0.125, fxrand()*fxrand()*fullRes*0.25) : fullRes*0.01; 
    this.segmentCount = fxrand() < 0.25 ? fxIntBetween(6, 12) : fxIntBetween(3, 8);
    this.stripWidth = random(fullRes / this.segmentCount);
    this.radiusIncrement = random(fullRes / this.segmentCount * 0.5);
    this.randomAngleRange = random([-1, 1]) * random(TAU * 0.25, TAU * 1.25);
    this.angleIncrement = TAU / random(TAU);
    this.hueInk = fxIntBetween(mainHue, mainHue+instanceRange)%360;
    this.hueRange = fxrand()*instanceRange;
    this.hueBrightness = fxIntBetween(300, 360);
    this.texturedBackground = instanceTexturedBackground && fxrand()<0.95;
  }
}