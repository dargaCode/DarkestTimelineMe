
'use strict';

//CONSTANTS

const SHAPE_WIDTH = 10;
const MIDPOINT = SHAPE_WIDTH / 2;

// GLOBALS

let dragging = false;

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const downloadLink = document.querySelector('#download-link');

//SETTINGS

ctx.fillStyle = '#D00';

//EVENTS

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mousemove', paint);
downloadLink.addEventListener('click', saveImage);

//FUNCTIONS

function startDrag() {
  dragging = true;
}

function stopDrag() {
  dragging = false;
}

function paint(e) {
  const clickX = e.offsetX;
  const clickY = e.offsetY;
  const shapeX = clickX - MIDPOINT;
  const shapeY = clickY - MIDPOINT;

  console.log(clickX, clickY);

  // TODO don't actually need to clear canvas now that background is drawn
  // clearCanvas();
  // ctx.drawImage(background, shapeX, shapeY);
  if (dragging) {
    ctx.fillRect(shapeX, shapeY, SHAPE_WIDTH, SHAPE_WIDTH);
  }
}

function saveImage() {
  this.href = canvas.toDataURL('image/png');
}

//HELPERS

function clearCanvas() {
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
}

// MAIN

const background = new Image();

background.addEventListener("load", function() {
  ctx.drawImage(background, 0, 0);
}, false);

background.src = 'background.jpg';
