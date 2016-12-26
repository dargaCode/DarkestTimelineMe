
//CONSTANTS

// CLASSES

// ImageDragger Class

function ImageDragger() {
  this.dragging = false;
  this.cursor = {
    oldPos: {
      x: null,
      y: null,
    },
    newPos: {
      x: null,
      y: null,
    },
  };
  this.background = {
    image: null,
    oldPos: {
      x: null,
      y: null,
    },
    newPos: {
      x: 0,
      y: 0,
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

ImageDragger.prototype.setBackgroundImage = function(image) {
  this.background.image = image;
  this.setBackgroundMinPos(image);
  this.resetNewBackgroundPos();
}

// use the image size to lock how far it can pan left/up without showing whitespace behind it
ImageDragger.prototype.setBackgroundMinPos = function(image) {
  this.background.minPos.x = canvas.width - image.width;
  this.background.minPos.y = canvas.height - image.height;
}

ImageDragger.prototype.setOldBackgroundPos = function(x, y) {
  this.background.oldPos.x = x;
  this.background.oldPos.y = y;
}

ImageDragger.prototype.setNewBackgroundPos = function(x, y) {
  // validate x and y to make sure whitespace doesn't show behind the background
  const validatedPos = this.validateBackgroundPos(x, y);

  this.background.newPos.x = validatedPos.x;
  this.background.newPos.y = validatedPos.y;
  display.drawBackground();
}

ImageDragger.prototype.resetNewBackgroundPos = function() {
  this.background.newPos.x = 0;
  this.background.newPos.y = 0;
  display.drawBackground();
}

ImageDragger.prototype.setOldCursorPos = function(x, y) {
  this.cursor.oldPos.x = x;
  this.cursor.oldPos.y = y;
}

ImageDragger.prototype.resetOldCursorPos = function() {
  this.cursor.oldPos.x = null;
  this.cursor.oldPos.y = null;
}

ImageDragger.prototype.setNewCursorPos = function(x, y) {
  this.cursor.newPos.x = x;
  this.cursor.newPos.y = y;
}

ImageDragger.prototype.resetNewCursorPos = function(x, y) {
  this.cursor.newPos.x = null;
  this.cursor.newPos.y = null;
}

  // methods

ImageDragger.prototype.dragBegin = function(startX, startY) {
  this.dragging = true;
  this.setOldCursorPos(startX, startY);
}

ImageDragger.prototype.drag = function(currentX, currentY) {
  // set the new pos
  this.setNewCursorPos(currentX, currentY);

  // background only moves if a drag is in progress
  if (this.dragging) {
    this.generateNewBackgroundPos();
    display.drawBackground();
  }
}

ImageDragger.prototype.dragEnd = function() {
  // only end drag when a drag is in progress. This improves behavior when drag is ended by dragging beyond canvas border, but mouseup happens after cursor comes back in.
  if(this.dragging) {
    this.dragging = false;

    // reset unneeded data
    this.resetOldCursorPos();
    this.resetNewCursorPos();

    // prepare background pos for next drag
    this.migrateBackgroundPos();
  }
}

  // helper methods

ImageDragger.prototype.generateNewBackgroundPos = function() {
  const oldPos = this.background.oldPos;
  const delta = this.generateCursorDelta();

  const newX = oldPos.x + delta.x;
  const newY = oldPos.y + delta.y;

  this.setNewBackgroundPos(newX, newY);
}

ImageDragger.prototype.generateCursorDelta = function() {
  // subtract newpos from lastPos
  const delta = {
    x: this.cursor.newPos.x - this.cursor.oldPos.x,
    y: this.cursor.newPos.y - this.cursor.oldPos.y,
  }

  // return delta object
  return delta;
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
ImageDragger.prototype.migrateBackgroundPos = function() {
  const newPos = this.background.newPos;

  // move new pos to old pos
  this.setOldBackgroundPos(newPos.x, newPos.y);

  // reset new pos to nulls
  this.resetNewBackgroundPos();
}

// end ImageDragger Class

// Display class

function Display(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
}

Display.prototype.drawBackground = function() {
  const newPos = imageDragger.background.newPos;

  // clear the background
  this.clearCanvas();

  // redraw the background
  this.context.drawImage(backgroundImg, newPos.x, newPos.y);
}

Display.prototype.clearCanvas = function() {
  const width = canvas.width;
  const height = canvas.height;

  this.context.clearRect(0, 0, width, height);
}

// end Display class

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const downloadLink = document.querySelector('#download-link');

//EVENT BINDINGS

canvas.addEventListener('mousedown', handleDragBegin);
canvas.addEventListener('mousemove', handleDrag);
canvas.addEventListener('mouseup', handleDragEnd);
canvas.addEventListener('mouseout', handleDragEnd);

downloadLink.addEventListener('click', saveImage);

//EVENT HANDLERS

function handleDragBegin(e) {
  const cursorX = e.offsetX;
  const cursorY = e.offsetY;

  // start dragging from the click location
  imageDragger.dragBegin(cursorX, cursorY);
}

function handleDrag(e) {
  const currentX = e.offsetX;
  const currentY = e.offsetY;

  imageDragger.drag(currentX, currentY);
}

function handleDragEnd() {
  imageDragger.dragEnd();
}

//HELPER FUNCTIONS

function saveImage() {
  this.href = canvas.toDataURL('image/png');
}

//MAIN

// instantiate class
const imageDragger = new ImageDragger();

const display = new Display(canvas);

const backgroundImg = new Image();

backgroundImg.addEventListener("load", function() {
  imageDragger.setBackgroundImage(this);
});

backgroundImg.src = 'background.jpg';
