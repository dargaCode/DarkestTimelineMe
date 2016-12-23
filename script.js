
//CONSTANTS

const SHAPE_WIDTH = 10;
const MIDPOINT = SHAPE_WIDTH / 2;

// CLASSES

  // BACKGROUND DRAGGER
function BackgroundDragger() {
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

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const downloadLink = document.querySelector('#download-link');

//SETTINGS

ctx.fillStyle = '#D00';

//EVENT BINDINGS

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mousemove', paint);
downloadLink.addEventListener('click', saveImage);

//EVENT HANDLERS

function startDrag(e) {
  backgroundDragger.dragging = true;

  // set drag start point to click location
  backgroundDragger.cursor.oldPos.x = e.offsetX;
  backgroundDragger.cursor.oldPos.y = e.offsetY;
}

function stopDrag(e) {
  dragBackground(e);

  backgroundDragger.dragging = false;

  // set drag start point to null
  backgroundDragger.cursor.oldPos.x = null;
  backgroundDragger.cursor.oldPos.y = null;
}

function dragBackground(e) {
  // set the new pos
  const newPos = {
    x: e.offsetX,
    y: e.offsetY,
  };

  // use the newpos to get the drag delta of the cursor
  const cursorDelta = getCursorDelta(newPos);

  // move the background by the same delta
  moveBackground(cursorDelta);
}

function getCursorDelta(newPos) {
  // get lastPos from constant
  const lastPos = backgroundDragger.cursor.oldPos;

  // subtract newpos from lastPos
  const delta = {
    x: newPos.x - lastPos.x,
    y: newPos.y - lastPos.y,
  }

  // return delta object
  return delta;
}

function paint(e) {
  const clickX = e.offsetX;
  const clickY = e.offsetY;
  const shapeX = clickX - MIDPOINT;
  const shapeY = clickY - MIDPOINT;

  if (backgroundDragger.dragging) {
    ctx.fillRect(shapeX, shapeY, SHAPE_WIDTH, SHAPE_WIDTH);
  }
}

function saveImage() {
  this.href = canvas.toDataURL('image/png');
}

//HELPER FUNCTIONS

function moveBackground(delta) {
  // get last position from constant
  const lastPos = backgroundDragger.background.oldPos;

  // add delta to those numbers
  const newX = lastPos.x + delta.x;
  const newY = lastPos.y + delta.y;

  // update background lastpos
  backgroundDragger.background.oldPos.x = newX;
  backgroundDragger.background.oldPos.y = newY;

  // clear the background
  clearCanvas();

  // redraw the background
  ctx.drawImage(backgroundImg, newX, newY);
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
const backgroundDragger = new BackgroundDragger();
