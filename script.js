
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
  // subtract pos from lastPos
  const delta = {
    x: this.position.x - this.lastPosition.x,
    y: this.position.y - this.lastPosition.y,
  }

  // return delta object
  return delta;
}

// end Cursor class

// ImageDragger class

function ImageDragger(display) {
  this.display = display;
  this.dragging = false;
  this.cursor = new Cursor();
  this.background = {
    image: null,
    size: {
      width: null,
      height: null,
    },
    position: {
      x: 0,
      y: 0,
    },
    lastPosition: {
      x: null,
      y: null,
    },
    minPos: {
      x: null,
      y: null,
    },
    maxPos: {
      x: 0,
      y: 0,
    }
  };
}

  // setters

ImageDragger.prototype.loadBackgroundImage = function(path) {
  // need to have access to the ImageDragger and the loaded Image at the same time.
  const self = this;
  const backgroundImg = new Image();

  backgroundImg.addEventListener("load", function() {
    self.setBackgroundImage(this);
  });

  backgroundImg.src = path;
}

ImageDragger.prototype.setBackgroundImage = function(image) {
  this.background.image = image;

  this.setBackgroundSize(image.width, image.height);
  this.setBackgroundMinPos();
  this.resetBackgroundLastPos();
  this.resetBackgroundPos();
}

ImageDragger.prototype.setBackgroundSize = function(width, height) {
  this.background.size.width = width;
  this.background.size.height = height;
}

// use the image size to lock how far it can pan left/up without showing whitespace behind it
ImageDragger.prototype.setBackgroundMinPos = function() {
  const backgroundSize = this.background.size;
  const backgroundWidth = backgroundSize.width;
  const backgroundHeight = backgroundSize.height;

  const canvasSize = this.display.getCanvasSize();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  this.background.minPos.x = canvasWidth - backgroundWidth;
  this.background.minPos.y = canvasHeight - backgroundHeight;
}

ImageDragger.prototype.setBackgroundLastPos = function(x, y) {
  this.background.lastPosition.x = x;
  this.background.lastPosition.y = y;
}

ImageDragger.prototype.setBackgroundPos = function(x, y) {
  // validate x and y to make sure whitespace doesn't show behind the background
  const validatedPos = this.validateBackgroundPos(x, y);

  this.background.position.x = validatedPos.x;
  this.background.position.y = validatedPos.y;
  this.display.drawBackground(this.background);
}

ImageDragger.prototype.resetBackgroundLastPos = function() {
  this.setBackgroundLastPos(0, 0);
}

ImageDragger.prototype.resetBackgroundPos = function() {
  this.setBackgroundPos(0, 0);
}

  // methods

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
    this.propagateBackgroundPos();
  }
}

  // helper methods

ImageDragger.prototype.generateNewBackgroundPos = function() {
  const lastPosition = this.background.lastPosition;
  const delta = this.cursor.generatePositionDelta();

  const newX = lastPosition.x + delta.x;
  const newY = lastPosition.y + delta.y;

  this.setBackgroundPos(newX, newY);
}

ImageDragger.prototype.validateBackgroundPos = function(x, y) {
  const minPos = this.background.minPos;
  const maxPos = this.background.maxPos;

  const result = {};

  // validate x
  if (x > maxPos.x) {
    x = maxPos.x;
  }
  if (x < minPos.x) {
    x = minPos.x;
  }

  // validate y
  if (y > maxPos.y) {
    y = maxPos.y;
  }
  if (y < minPos.y) {
    y = minPos.y;
  }

  result.x = x;
  result.y = y;

  return result;
}

// allows the image to be repeatedly dragged
ImageDragger.prototype.propagateBackgroundPos = function() {
  const position = this.background.position;

  // copy pos to last pos
  this.setBackgroundLastPos(position.x, position.y);
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
  const imageWidth = background.size.width;
  const imageHeight = background.size.height;

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
