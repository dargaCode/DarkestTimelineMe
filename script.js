
//CONSTANTS

const DEFAULT_BACKGROUND_PATH = 'background.jpg'

// CLASSES

// Cursor class

function Cursor() {
  this.lastPosition = {
    x: null,
    y: null,
  };
  this.position = {
    x: null,
    y: null,
  };
}

Cursor.prototype.setLastPosition = function(x, y) {
  this.lastPosition.x = x;
  this.lastPosition.y = y;
}

Cursor.prototype.resetLastPosition = function() {
  this.setLastPosition(null, null);
}

Cursor.prototype.setPosition = function(x, y) {
  this.position.x = x;
  this.position.y = y;
}

Cursor.prototype.resetPosition = function() {
  this.setPosition(null, null);
}

Cursor.prototype.generatePositionDelta = function() {
  // subtract current position from last position
  const delta = {
    x: this.position.x - this.lastPosition.x,
    y: this.position.y - this.lastPosition.y,
  }

  // return delta object
  return delta;
}

// end Cursor class

// Background class

function Background(display) {
  this.display = display;
  this.image = null;
  this.dimensions = {
    width: null,
    height: null,
  };
  this.lastPosition = {
    x: null,
    y: null,
  };
  this.position = {
    x: null,
    y: null,
  };
  this.minPosition = {
    x: null,
    y: null,
  };
  this.maxPosition = {
    x: 0,
    y: 0,
  };
}

Background.prototype.setDimensions = function(width, height) {
  this.dimensions.width = width;
  this.dimensions.height = height;
}

Background.prototype.setLastPosition = function(x, y) {
  this.lastPosition.x = x;
  this.lastPosition.y = y;
}

Background.prototype.resetLastPosition = function() {
  this.setLastPosition(0, 0);
}

Background.prototype.setPosition = function(x, y) {
  // validate x and y to make sure whitespace doesn't show behind the background
  const validatedPos = this.validatePosition(x, y);

  this.position.x = validatedPos.x;
  this.position.y = validatedPos.y;
  this.display.drawBackground(this);
}

Background.prototype.resetPosition = function() {
  this.setPosition(0, 0);
}

Background.prototype.validatePosition = function(x, y) {
  const minPosition = this.minPosition;
  const maxPosition = this.maxPosition;

  const result = {};

  // validate x
  if (x > maxPosition.x) {
    x = maxPosition.x;
  }
  if (x < minPosition.x) {
    x = minPosition.x;
  }

  // validate y
  if (y > maxPosition.y) {
    y = maxPosition.y;
  }
  if (y < minPosition.y) {
    y = minPosition.y;
  }

  result.x = x;
  result.y = y;

  return result;
}

// allows the image to be repeatedly dragged
Background.prototype.propagatePosition = function() {
  const position = this.position;

  // copy pos to last pos
  this.setLastPosition(position.x, position.y);
}

// end Background class

// ImageDragger class

function ImageDragger(display) {
  this.display = display;
  this.dragging = false;
  this.cursor = new Cursor();
  this.background = new Background(display);
}

ImageDragger.prototype.setBackgroundImage = function(image) {
  this.background.image = image;

  this.background.setDimensions(image.width, image.height);
  this.setBackgroundMinPos();
  this.background.resetLastPosition();
  this.background.resetPosition();
}

// use the image dimensions to lock how far it can pan left/up without showing whitespace behind it
ImageDragger.prototype.setBackgroundMinPos = function() {
  const backgroundSize = this.background.dimensions;
  const backgroundWidth = backgroundSize.width;
  const backgroundHeight = backgroundSize.height;

  const canvasSize = this.display.getCanvasSize();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  this.background.minPosition.x = canvasWidth - backgroundWidth;
  this.background.minPosition.y = canvasHeight - backgroundHeight;
}

ImageDragger.prototype.loadBackgroundImage = function(path) {
  // need to have access to the ImageDragger and the loaded Image at the same time.
  const self = this;
  const backgroundImg = new Image();

  backgroundImg.addEventListener("load", function() {
    self.setBackgroundImage(this);
  });

  backgroundImg.src = path;
}

ImageDragger.prototype.dragBegin = function(startX, startY) {
  this.dragging = true;
  this.cursor.setLastPosition(startX, startY);
}

ImageDragger.prototype.drag = function(currentX, currentY) {
  this.cursor.setPosition(currentX, currentY);

  // background only moves if a drag is in progress
  if (this.dragging) {
    this.generateNewBackgroundPos();
  }
}

ImageDragger.prototype.dragEnd = function() {
  // only end drag when a drag is in progress. This improves behavior when drag is ended by dragging beyond canvas border, but mouseup happens after cursor comes back in.
  if(this.dragging) {
    this.dragging = false;

    // reset unneeded data
    this.cursor.resetLastPosition();
    this.cursor.resetPosition();

    // prepare background pos for next drag
    this.background.propagatePosition();
  }
}

ImageDragger.prototype.generateNewBackgroundPos = function() {
  const lastPosition = this.background.lastPosition;
  const delta = this.cursor.generatePositionDelta();

  const newX = lastPosition.x + delta.x;
  const newY = lastPosition.y + delta.y;

  this.background.setPosition(newX, newY);
}

// end ImageDragger class

// Display class

function Display(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
}

Display.prototype.drawBackground = function(background) {
  const backgroundImage = background.image;
  const x = background.position.x;
  const y = background.position.y;
  const imageWidth = background.dimensions.width;
  const imageHeight = background.dimensions.height;

  // clear the background
  this.clearCanvas();

  // redraw the background
  this.context.drawImage(backgroundImage, x, y, imageWidth, imageHeight);
}

Display.prototype.clearCanvas = function() {
  const canvasSize = this.getCanvasSize();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  this.context.clearRect(0, 0, canvasWidth, canvasHeight);
}

Display.prototype.getCanvasSize = function() {
  return {
    width: this.canvas.width,
    height: this.canvas.height,
  };
}

// end Display class

// UserInterface class

function UserInterface(imageDragger) {
  this.imageDragger = imageDragger;

  this.canvas = document.querySelector('#canvas');
  this.fileInput = document.querySelector('#file-input');
  this.browseLink = document.querySelector('#browse-link');
  this.downloadLink = document.querySelector('#download-link');

  this.addEvents();
}

UserInterface.prototype.addEvents = function() {
  // all events need to know about the UI class
  const self = this;

  this.canvas.addEventListener('mousedown', function(e) {
    self.handleDragBegin(e);
  });

  this.canvas.addEventListener('mousemove', function(e) {
    self.handleDrag(e);
  });

  this.canvas.addEventListener('mouseup', function() {
    self.handleDragEnd();
  });

  this.canvas.addEventListener('mouseout', function() {
    self.handleDragEnd();
  });

  this.fileInput.addEventListener('change', function() {
    self.loadImage(this.files);
  });

  this.browseLink.addEventListener('click', function(e) {
    self.transferClick(e);
  });

  this.downloadLink.addEventListener('click', function() {
    self.saveImage(this);
  });
}

UserInterface.prototype.handleDragBegin = function(e) {
  const cursorX = e.offsetX;
  const cursorY = e.offsetY;

  // start dragging from the click location
  this.imageDragger.dragBegin(cursorX, cursorY);
}

UserInterface.prototype.handleDrag = function(e) {
  const currentX = e.offsetX;
  const currentY = e.offsetY;

  this.imageDragger.drag(currentX, currentY);
}

UserInterface.prototype.handleDragEnd = function() {
  this.imageDragger.dragEnd();
}

UserInterface.prototype.loadImage = function(files) {
  // length check stops Chrome from throwing an error on cancelling the filebrowser
  if (files.length > 0) {
    const imageFile = files[0];
    const imageURL = URL.createObjectURL(imageFile);

    this.imageDragger.loadBackgroundImage(imageURL);
  }
}

UserInterface.prototype.transferClick = function(e) {
  // transfer click from browse link to file input, so that ugly file input element can be hidden and replaced with button.
  if (this.fileInput) {
    this.fileInput.click();
  }
  // prevent navigation to "#"
  e.preventDefault();
}

UserInterface.prototype.saveImage = function(link) {
  const imageURL = this.canvas.toDataURL('image/png');

  link.href = imageURL;
}

// end UserInterface class

//FUNCTIONS

function init() {
  const display = new Display(window.canvas);
  const imageDragger = new ImageDragger(display);
  const userInterface = new UserInterface(imageDragger);

  imageDragger.loadBackgroundImage(DEFAULT_BACKGROUND_PATH);
}

//MAIN

init();
