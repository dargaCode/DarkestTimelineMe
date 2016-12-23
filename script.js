
//CONSTANTS

const SHAPE_WIDTH = 10;
const MIDPOINT = SHAPE_WIDTH / 2;

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

ImageDragger.prototype.setOldCursorPos = function(x, y) {
  this.cursor.oldPos.x = x;
  this.cursor.oldPos.y = y;
}

ImageDragger.prototype.resetOldCursorPos = function() {
  this.cursor.oldPos.x = null;
  this.cursor.oldPos.y = null;
}

ImageDragger.prototype.setNewCursorPos = function(x, y) {
  this.background.newPos.x = x;
  this.background.newPos.y = y;
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

// end ImageDragger Class

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const downloadLink = document.querySelector('#download-link');

//SETTINGS

ctx.fillStyle = '#D00';

//EVENT BINDINGS

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mousemove', paintSquare);
downloadLink.addEventListener('click', saveImage);

//EVENT HANDLERS

function startDrag(e) {
  imageDragger.dragging = true;

  // set drag start point to click location
  imageDragger.setOldCursorPos(e.offsetX, e.offsetY);
}

function stopDrag(e) {
  dragBackground(e);

  imageDragger.dragging = false;

  // set drag start point to null
  imageDragger.resetOldCursorPos();
}

function dragBackground(e) {
  // set the new pos
  imageDragger.setNewCursorPos(e.offsetX, e.offsetY);

  // use the newpos to get the drag delta of the cursor
  const cursorDelta = getCursorDelta(imageDragger.background.newPos);

  // move the background by the same delta
  moveBackground(cursorDelta);
}

function getCursorDelta(newPos) {
  // get lastPos from constant
  const lastPos = imageDragger.cursor.oldPos;

  // subtract newpos from lastPos
  const delta = {
    x: newPos.x - lastPos.x,
    y: newPos.y - lastPos.y,
  }

  // return delta object
  return delta;
}

function paintSquare(e) {
  const clickX = e.offsetX;
  const clickY = e.offsetY;
  const shapeX = clickX - MIDPOINT;
  const shapeY = clickY - MIDPOINT;

  if (imageDragger.dragging) {
    ctx.fillRect(shapeX, shapeY, SHAPE_WIDTH, SHAPE_WIDTH);
  }
}

function saveImage() {
  this.href = canvas.toDataURL('image/png');
}

//HELPER FUNCTIONS

function moveBackground(delta) {
  // get last position from constant
  const lastPos = imageDragger.background.oldPos;

  // add delta to those numbers
  const newX = lastPos.x + delta.x;
  const newY = lastPos.y + delta.y;

  // set new background pos
  imageDragger.setNewBackgroundPos(newX, newY);

  redrawBackground();

  // update background lastpos
  imageDragger.setOldBackgroundPos(newX, newY);

  // reset new pos to null
  imageDragger.resetNewBackgroundPos();
}

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

// MAIN

const backgroundImg = new Image();

backgroundImg.addEventListener("load", function() {
  ctx.drawImage(backgroundImg, 0, 0);
}, false);

backgroundImg.src = 'background.jpg';

// instantiate class
const imageDragger = new ImageDragger();
