'use strict';

const SQUARE_WIDTH = 70;
const MIDPOINT = SQUARE_WIDTH / 2;

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#D00';
ctx.fillRect(20, 20, 70, 70);

canvas.addEventListener('click', drawSquare);

function drawSquare(e) {
  const clickX = e.offsetX;
  const clickY = e.offsetY;
  const squareX = clickX - MIDPOINT;
  const squareY = clickY - MIDPOINT;

  console.log(squareX, squareY);

  ctx.fillRect(squareX, squareY, 70, 70);
}
