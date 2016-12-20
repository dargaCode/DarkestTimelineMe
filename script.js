
'use strict';

//CONSTANTS

const SQUARE_WIDTH = 70;
const MIDPOINT = SQUARE_WIDTH / 2;

//DOM HANDLES

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

//SETTINGS

ctx.fillStyle = '#D00';

//EVENTS

canvas.addEventListener('click', drawSquare);

//FUNCTIONS

function drawSquare(e) {
  const clickX = e.offsetX;
  const clickY = e.offsetY;
  const squareX = clickX - MIDPOINT;
  const squareY = clickY - MIDPOINT;

  console.log(clickX, clickY);

  ctx.fillRect(squareX, squareY, 70, 70);
}

//HELPERS

// MAIN
