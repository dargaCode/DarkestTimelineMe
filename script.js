
//CONSTANTS

// CLASSES

// IMAGE DRAGGER
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
    oldPos: {
      x: null,
      y: null,
    },
    newPos: {
      x: null,
      y: null,
    },
  };
}

  // setters

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

ImageDragger.prototype.setOldBackgroundPos = function(x, y) {
  this.background.oldPos.x = x;
  this.background.oldPos.y = y;
}

ImageDragger.prototype.setNewBackgroundPos = function(x, y) {
  this.background.newPos.x = x;
  this.background.newPos.y = y;
}

ImageDragger.prototype.resetNewBackgroundPos = function() {
  this.background.newPos.x = null;
  this.background.newPos.y = null;
}

  // methods

ImageDragger.prototype.dragBegin = function(startX, startY) {
  this.dragging = true;
  this.setOldCursorPos(startX, startY);
}

ImageDragger.prototype.dragEnd = function() {
  this.dragging = false;

  // reset unneeded data
  this.resetOldCursorPos();
  this.resetNewCursorPos();

  // prepare background pos for next drag
  this.migrateBackgroundPos();
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

// allows the image to be repeatedly dragged
ImageDragger.prototype.migrateBackgroundPos = function() {
  const newPos = this.background.newPos;

  // move new pos to old pos
  this.setOldBackgroundPos(newPos.x, newPos.y);

  // reset new pos to nulls
  this.resetNewBackgroundPos();
}

// end ImageDragger Class

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const downloadLink = document.querySelector('#download-link');

//EVENT BINDINGS

canvas.addEventListener('mousedown', dragBegin);
canvas.addEventListener('mouseup', dragEnd);
canvas.addEventListener('mousemove', dragBackground);
downloadLink.addEventListener('click', saveImage);

//EVENT HANDLERS

function dragBegin(e) {
  const cursorX = e.offsetX;
  const cursorY = e.offsetY;

  // start dragging from the click location
  imageDragger.dragBegin(cursorX, cursorY);
}

function dragEnd() {
  imageDragger.dragEnd();
}

function dragBackground(e) {
  // set the new pos
  imageDragger.setNewCursorPos(e.offsetX, e.offsetY);

  if (imageDragger.dragging) {
    // use the cursor delta to generate a new background pos
    imageDragger.generateNewBackgroundPos();

    redrawBackground();
  }

}

//HELPER FUNCTIONS

function redrawBackground() {
  const newPos = imageDragger.background.newPos;

  // clear the background
  clearCanvas();

  // redraw the background
  ctx.drawImage(backgroundImg, newPos.x, newPos.y);
}

function clearCanvas() {
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
}

function saveImage() {
  this.href = canvas.toDataURL('image/png');
}

// MAIN

const backgroundImg = new Image();

backgroundImg.addEventListener("load", function() {
  ctx.drawImage(backgroundImg, 0, 0);
}, false);

backgroundImg.src = 'background.jpg';

// instantiate class
const imageDragger = new ImageDragger();
