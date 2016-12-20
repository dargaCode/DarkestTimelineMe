
'use strict';

//CONSTANTS

const SQUARE_WIDTH = 70;
const MIDPOINT = SQUARE_WIDTH / 2;

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const downloadLink = document.querySelector('#download-link');

//SETTINGS

ctx.fillStyle = '#D00';

//EVENTS

canvas.addEventListener('click', drawSquare);
downloadLink.addEventListener('click', saveImage);

//FUNCTIONS

function drawSquare(e) {

  const clickX = e.offsetX;
  const clickY = e.offsetY;
  const squareX = clickX - MIDPOINT;
  const squareY = clickY - MIDPOINT;

  console.log(clickX, clickY);

  // TODO don't actually need to clear canvas now that background is drawn
  // clearCanvas();
  // ctx.drawImage(background, 0, 0);
  ctx.fillRect(squareX, squareY, 70, 70);
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
