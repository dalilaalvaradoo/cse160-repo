// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 20.0;
    gl_PointSize = u_Size;
  } `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  } `

// Global Variables
let canvas;
let gl;
let gl_Position;
let gl_FragColor;
let u_Size;


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl" , { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
  
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//UI global variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedSegements = 10;
let g_selectedType = POINT;


function addActionsForHTMLUI() {

  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  document.getElementById("pointButton").onclick = function() {g_selectedType=POINT; };
  document.getElementById("triButton").onclick = function() {g_selectedType=TRIANGLE; };
  document.getElementById("circleButton").onclick = function() {g_selectedType=CIRCLE; };
  


  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = Number(this.value); });

  document.getElementById("drawPictureButton").onclick = function() {  createFlowerPicture();  renderAllShapes();};
  
}


function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();
  

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click ;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
var g_pictureShapes = [];

function addPolygon(shapeList, points, color) {
  for (let i = 1; i < points.length - 1; i++) {
    shapeList.push(new PictureTriangle([points[0][0], points[0][1],points[i][0], points[i][1],points[i + 1][0], points[i + 1][1]], color));
  }
}

function addShapeGroup(shapeList, polygons, color) {
  for (let i = 0; i < polygons.length; i++) {
    addPolygon(shapeList, polygons[i], color);
  }
}

function createFlowerPicture() {
  g_pictureShapes = [];
  
  const petalColor = [1.0, 0.75, 0.85, 1.0];
  const centerColor = [1.0, 0.9, 0.3, 1.0];
  const stemColor = [0.2, 0.7, 0.2, 1.0];
  const leafColor = [0.15, 0.65, 0.2, 1.0];
  const center = [[-0.13, 0.28], [0.13, 0.28], [0.22, 0.12], [0.13, -0.02], [-0.13, -0.02], [-0.22, 0.12]];
  const topPetal = [[-0.10, 0.52], [0.10, 0.52], [0.18, 0.42], [0.12, 0.28], [-0.12, 0.28], [-0.18, 0.42]];
  const upperRightPetal = [[0.18, 0.42], [0.34, 0.44], [0.48, 0.34], [0.46, 0.18], [0.26, 0.16], [0.14, 0.28]];
  const rightPetal = [[0.24, 0.24], [0.42, 0.20], [0.52, 0.08], [0.50, -0.06], [0.32, -0.08], [0.18, 0.04]];
  const lowerRightPetal = [[0.16, 0.04], [0.32, 0.02], [0.46, -0.10], [0.40, -0.28], [0.20, -0.30], [0.08, -0.14]];
  const bottomPetal = [[-0.10, -0.18], [0.10, -0.18], [0.18, -0.30], [0.10, -0.44], [-0.10, -0.44], [-0.18, -0.30]]; 
  const lowerLeftPetal = [[-0.08, -0.14], [-0.20, -0.30], [-0.40, -0.28], [-0.46, -0.10], [-0.32, 0.02], [-0.16, 0.04]];
  const leftPetal = [[-0.18, 0.04], [-0.32, -0.08], [-0.50, -0.06], [-0.52, 0.08], [-0.42, 0.20], [-0.24, 0.24]];
  const upperLeftPetal = [[-0.14, 0.28], [-0.26, 0.16], [-0.46, 0.18], [-0.48, 0.34], [-0.34, 0.44], [-0.18, 0.42]];
  const stem = [[-0.06, -0.44], [0.06, -0.44], [0.06, -0.88], [-0.06, -0.88]];
  const leftLeaf = [[-0.06, -0.34], [-0.22, -0.26], [-0.38, -0.30], [-0.24, -0.42], [-0.06, -0.42]];
  const rightLeaf = [[0.06, -0.34], [0.22, -0.24], [0.44, -0.26], [0.58, -0.42], [0.18, -0.42]];
  
  const petals = [topPetal, upperRightPetal, rightPetal, lowerRightPetal, bottomPetal, lowerLeftPetal, leftPetal, upperLeftPetal];
  const leaves = [leftLeaf, rightLeaf];
  
  addShapeGroup(g_pictureShapes, [stem], stemColor);
  addShapeGroup(g_pictureShapes, leaves, leafColor);
  addShapeGroup(g_pictureShapes, petals, petalColor);
  addShapeGroup(g_pictureShapes, [center], centerColor);
}
  


function click(ev) {

  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } 
  else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } 
  else {
    point = new Circle();
  }
  point.position=[x,y];
  point.color = g_selectedColor.slice();
  point.size=g_selectedSize;
  

  if (g_selectedType == CIRCLE) {
    point.segments = g_selectedSegments; 
  }
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
  
}
  
 function renderAllShapes() { 

   var startTime = performance.now();
   
   
   // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var lenPicture = g_pictureShapes.length;
  for (var i = 0; i < lenPicture; i++) {
     g_pictureShapes[i].render();
  } 

  
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    
    g_shapesList[i].render();
    
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");


   function sendTextToHTML(text, htmlID) {
     var htmlElm =  document.getElementById(htmlID);

     if(!htmlElm) {
       console.log(" Failed to get " + htmlID + "from HTML");
       return;
     }
     htmlElm.innerHTML = text;
   }

  
}
