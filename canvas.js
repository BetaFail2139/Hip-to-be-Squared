var canvas = document.querySelector("canvas");
var context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


context.fillStyle = "red";
context.arc(canvas.width/2, canvas.height/2, 50, 0, 360);
context.fill();

var mouseX;
var mouseY;
var mouseDown = false;
function xy(e) {
  var boundingBox = canvas.getBoundingClientRect();
  mouseX = e.clientX - boundingBox.left;
  mouseY = e.clientY - boundingBox.top;
}

setInterval(function() {
    
}, 30);