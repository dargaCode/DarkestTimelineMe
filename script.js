
//CONSTANTS

const DEFAULT_BACKGROUND_PATH = 'background.jpg'

// CLASSES

// ImageDragger class

function ImageDragger() {
  this.dragging = false;

  this.backgroundImage = new BackgroundImage(this);
  this.cursor = new Cursor();
  this.uiManager = new UiManager(this);
  this.display = new Display(this.uiManager.canvas);
}

ImageDragger.prototype.loadBackgroundImage = function(path) {
  // need to have access to the ImageDragger and the loaded Image at the same time.
  const self = this;
  const backgroundImg = new Image();

  backgroundImg.addEventListener("load", function() {
    self.backgroundImage.setImage(this);
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
    this.backgroundImage.propagatePosition();
  }
}

ImageDragger.prototype.generateNewBackgroundPos = function() {
  const lastPosition = this.backgroundImage.lastPosition;
  const delta = this.cursor.generatePositionDelta();

  const newX = lastPosition.x + delta.x;
  const newY = lastPosition.y + delta.y;

  this.backgroundImage.setPosition(newX, newY);
}

// end ImageDragger class

// BackgroundImage class

function BackgroundImage(imageDragger) {
  this.image = null;
  this.size = {
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

  this.imageDragger = imageDragger;
}

BackgroundImage.prototype.setImage = function(image) {
  this.image = image;

  this.setSize(image.width, image.height);
  this.setBackgroundMinPos();
  this.resetLastPosition();
  this.resetPosition();
}

BackgroundImage.prototype.setSize = function(width, height) {
  this.size.width = width;
  this.size.height = height;
}

// use the image size to lock how far it can pan left/up without showing whitespace behind it
BackgroundImage.prototype.setBackgroundMinPos = function() {
  const backgroundSize = this.size;
  const backgroundWidth = backgroundSize.width;
  const backgroundHeight = backgroundSize.height;

  const canvasSize = this.imageDragger.display.getCanvasSize();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  this.minPosition.x = canvasWidth - backgroundWidth;
  this.minPosition.y = canvasHeight - backgroundHeight;
}

BackgroundImage.prototype.setLastPosition = function(x, y) {
  this.lastPosition.x = x;
  this.lastPosition.y = y;
}

BackgroundImage.prototype.resetLastPosition = function() {
  this.setLastPosition(0, 0);
}

BackgroundImage.prototype.setPosition = function(x, y) {
  // validate x and y to make sure whitespace doesn't show behind the background
  const validatedPos = this.getValidPosition(x, y);

  this.position.x = validatedPos.x;
  this.position.y = validatedPos.y;
  this.imageDragger.display.drawBackground(this);
}

BackgroundImage.prototype.resetPosition = function() {
  this.setPosition(0, 0);
}

BackgroundImage.prototype.getValidPosition = function(x, y) {
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
BackgroundImage.prototype.propagatePosition = function() {
  const position = this.position;

  // copy pos to last pos
  this.setLastPosition(position.x, position.y);
}

// end BackgroundImage class


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

// UiManager class

function UiManager(imageDragger) {
  this.canvas = document.querySelector('#canvas');
  this.fileInput = document.querySelector('#file-input');
  this.browseLink = document.querySelector('#browse-link');
  this.downloadLink = document.querySelector('#download-link');

  this.imageDragger = imageDragger;

  this.init();
}

UiManager.prototype.init = function() {
  this.addEvents();
}

UiManager.prototype.addEvents = function() {
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
    self.handleBrowseClick(this.files);
  });

  this.browseLink.addEventListener('click', function(e) {
    self.transferClick(e);
  });

  this.downloadLink.addEventListener('click', function() {
    self.handleDownloadClick(this);
  });
}

UiManager.prototype.handleDragBegin = function(e) {
  const cursorX = e.offsetX;
  const cursorY = e.offsetY;

  // start dragging from the click location
  this.imageDragger.dragBegin(cursorX, cursorY);
}

UiManager.prototype.handleDrag = function(e) {
  const currentX = e.offsetX;
  const currentY = e.offsetY;

  this.imageDragger.drag(currentX, currentY);
}

UiManager.prototype.handleDragEnd = function() {
  this.imageDragger.dragEnd();
}

UiManager.prototype.handleBrowseClick = function(files) {
  // length check stops Chrome from throwing an error on cancelling the filebrowser
  if (files.length > 0) {
    const imageFile = files[0];
    const imageURL = URL.createObjectURL(imageFile);

    this.imageDragger.loadBackgroundImage(imageURL);
  }
}

UiManager.prototype.transferClick = function(e) {
  // transfer click from browse link to file input, so that ugly file input element can be hidden and replaced with button.
  if (this.fileInput) {
    this.fileInput.click();
  }
  // prevent navigation to "#"
  e.preventDefault();
}

UiManager.prototype.handleDownloadClick = function(link) {
  const imageURL = this.canvas.toDataURL('image/png');

  link.href = imageURL;
}

// end UiManager class

// Display class

function Display(canvas) {
  this.canvasSize = {
    width: canvas.width,
    height: canvas.height,
  };
  this.canvasContext = canvas.getContext('2d');
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
  this.canvasContext.drawImage(backgroundImage, x, y, imageWidth, imageHeight);
}

Display.prototype.clearCanvas = function() {
  const canvasSize = this.getCanvasSize();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  this.canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
}

Display.prototype.getCanvasSize = function() {
  return this.canvasSize;
}

// end Display class

//FUNCTIONS

function init() {
  const imageDragger = new ImageDragger();

  imageDragger.loadBackgroundImage(DEFAULT_BACKGROUND_PATH);
}

//MAIN

init();
