// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  void main() {
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotation;

//variables for poke feature
let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_pokeDuration = 1.0;
let g_pokeJawAngle = 0;

//variables for mouse feature
let g_mouseRotateX = 0;
let g_mouseRotateY = 0;
let g_isDragging = false;

// variables for animations
let g_bodyHead = 0;
let g_animation = false;

let g_lowerJawAngle = -5;
let g_tailAngle = -1;
let g_backLeftLegAngle = -25;
let g_backLeftLowerLegAngle = 50;
let g_backLeftFoot = 50;

let g_frontLeftLegAngle = -25;
let g_frontLeftLowerLegAngle = 50;

let g_backRightLegAngle = -25;
let g_backRightLowerLegAngle = 50;

let g_frontRightLegAngle = -25;
let g_frontRightLowerLegAngle = 50;

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

  gl.enable(gl.DEPTH_TEST);
  
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  if(!u_GlobalRotation) {
    console.log('Failed to get the storage location of u_GlobalRotation');
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
let g_AnimalGlobalRotation = 0;


function addActionsForHTMLUI() {

  document.getElementById('camAngleSlide').addEventListener('input', function() { g_AnimalGlobalRotation = Number(this.value); renderScene(); });

  document.getElementById('backLeftLegSlide').addEventListener('mousemove', function() {g_backLeftLegAngle = this.value;  renderScene();});
  document.getElementById('backLeftLowerLegSlide').addEventListener('mousemove', function() {g_backLeftLowerLegAngle = this.value;  renderScene();});
  document.getElementById('backLeftFoot').addEventListener('mousemove', function() {g_backLeftFoot = this.value;  renderScene();});

  document.getElementById('frontLeftLegSlide').addEventListener('mousemove', function() {g_frontLeftLegAngle = this.value;  renderScene();});
  document.getElementById('frontLeftLowerLegSlide').addEventListener('mousemove', function() {g_frontLeftLowerLegAngle = this.value;  renderScene();});

  document.getElementById('backRightLegSlide').addEventListener('mousemove', function() {g_backRightLegAngle = this.value;  renderScene();});
  document.getElementById('backRightLowerLegSlide').addEventListener('mousemove', function() {g_backRightLowerLegAngle = this.value;  renderScene();});

  document.getElementById('frontRightLegSlide').addEventListener('mousemove', function() {g_frontRightLegAngle = this.value;  renderScene();});
  document.getElementById('frontRightLowerLegSlide').addEventListener('mousemove', function() {g_frontRightLowerLegAngle = this.value;  renderScene();});

  document.getElementById('animationOnButton').onclick = function() { g_animation = true; };
  document.getElementById('animationOffButton').onclick = function() { g_animation = false; };
 
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  initCubeBuffer();
  addActionsForHTMLUI();

  canvas.onmousedown =  function(ev) {
    if(ev.shiftKey) {
      g_pokeAnimation = true;
      g_pokeStartTime = performance.now() / 1000.0;
    }
  }
  

  // Register function (event handler) to be called on a mouse press
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1 && !ev.shiftKey) {
      var rect = ev.target.getBoundingClientRect();
      
      var x = ev.clientX - rect.left;
      var y = ev.clientY - rect.top;
      g_mouseRotateY = (x / canvas.width) * 180 - 90;
      g_mouseRotateX = (y / canvas.height) * 180 - 90;
      
      renderScene();
    }
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderScene();

  requestAnimationFrame(tick);
  
  
}
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {


  g_seconds = performance.now()/1000.0 - g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();

  renderScene();

  requestAnimationFrame(tick);
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

  requestAnimationFrame(tick);
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
  
}
//used LLM for debugging & initial coordinates for body parts, 
//adjusted values on my own later
 function renderScene() { 

   var startTime = performance.now();
   
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   var globalRotMat = new Matrix4();
   globalRotMat.rotate(g_AnimalGlobalRotation, 0, 1, 0);

   globalRotMat.rotate(g_mouseRotateX, 1, 0, 0);
   globalRotMat.rotate(g_mouseRotateY, 0, 1, 0);
   
   gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

   //body
   var body = new Matrix4();
   body.translate(-0.55 , -0.25, -0.20);
   body.scale(0.7, 0.45, 0.45);
   body.scale(1.25, 0.50, 0.45);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(body);

   gl.uniform4f(u_FragColor, 1.0, 1.0, 0.6, 1.0);

   //left eye:
   var leftEye = new Matrix4();
   leftEye.translate(0.50, -0.19, -0.21);
   leftEye.scale(0.09, 0.09, 0.05);
   drawCube(leftEye);

   gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
   var leftPupil = new Matrix4();
   leftPupil.translate(0.55, -0.17, -0.235);
   leftPupil.scale(0.025, 0.025, 0.015);
   drawCube(leftPupil);


   //right eye:
   gl.uniform4f(u_FragColor, 1.0, 1.0, 0.6, 1.0);
   var rightEye = new Matrix4();
   rightEye.translate(0.50, -0.19, 0.16);
   rightEye.scale(0.09, 0.09, 0.05);
   drawCube(rightEye);

   gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
   var rightPupil = new Matrix4();
   rightPupil.translate(0.55, -0.17, 0.22);
   rightPupil.scale(0.025, 0.025, 0.015);
   drawCube(rightPupil);
   

   //head
   var head = new Matrix4();
   head.translate(0.25 + g_bodyHead, -0.29, -0.18);
   head.scale(0.35, 0.28, 0.36);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(head);


   gl.uniform4f(u_FragColor, 0.48, 0.88, 0.28, 1.0);
   var upperJaw = new Matrix4();
   upperJaw.translate(0.55, -.16, -0.14);
   upperJaw.scale(0.32, 0.07, 0.28);
   drawCube(upperJaw);


   gl.uniform4f(u_FragColor, 0.40, 0.78, 0.22, 1.0);
   var lowerJaw = new Matrix4();
   lowerJaw.translate(0.55, -0.25, -0.14);
   lowerJaw.rotate(g_pokeJawAngle, 0, 0, 1);
   lowerJaw.scale(0.32, 0.05, 0.28);
   drawCube(lowerJaw);

  //tails
   var tail2 = new Matrix4();
   tail2.translate(-0.70, -0.23, -0.05);
   tail2.rotate(-1, 0, 0, 4);
   tail2.scale(0.20, 0.20, 0.30);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(tail2);
   
   var tail = new Matrix4();
   tail.translate(-0.8, -0.20, -0.12);
   tail.rotate(-1, 0, 0, 4);
   tail.scale(0.13, 0.15, 0.30);
   //tail.scale(1.25, 0.50, 0.45);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(tail);

   var tail = new Matrix4();
   tail.translate(-0.8, -0.20, -0.12);
   tail.rotate(-1, 0, 0, 4);
   tail.scale(0.13, 0.15, 0.30);
   //tail.scale(1.25, 0.50, 0.45);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(tail);

   var tail = new Matrix4();
   tail.translate(-0.90, -0.19, -0.12);
   tail.rotate(-1, 0, 0, 4);
   tail.scale(0.10, 0.12, 0.30);
   //tail.scale(1.25, 0.50, 0.45);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(tail);

   var tail = new Matrix4();
   tail.translate(-0.95, -0.15, -0.12);
   tail.rotate(-1, 0, 0, 4);
   tail.scale(0.05, 0.05, 0.30);
   //tail.scale(1.25, 0.50, 0.45);
   gl.uniform4f(u_FragColor, 0.35, 0.85, 0.25, 1.0);
   drawCube(tail);

   gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
   
   var tooth1 = new Matrix4();
   tooth1.translate(0.62, -0.25, -0.10);
   tooth1.scale(0.03, 0.05, 0.03);
   drawCube(tooth1);

   var tooth1 = new Matrix4();
   tooth1.translate(0.7, -0.25, -0.10);
   tooth1.scale(0.03, 0.05, 0.03);
   drawCube(tooth1);

   var tooth1 = new Matrix4();
   tooth1.translate(0.8, -0.25, -0.10);
   tooth1.scale(0.03, 0.05, 0.03);
   drawCube(tooth1);

   var tooth1 = new Matrix4();
   tooth1.translate(0.62, -0.2, -0.10);
   tooth1.scale(0.03, 0.05, 0.03);
   drawCube(tooth1);

   var tooth1 = new Matrix4();
   tooth1.translate(0.70, -0.2, -0.10);
   tooth1.scale(0.03, 0.05, 0.03);
   drawCube(tooth1);


   var tooth1 = new Matrix4();
   tooth1.translate(0.8, -0.2, -0.10);
   tooth1.scale(0.03, 0.05, 0.03);
   drawCube(tooth1);

   //limbs for back left leg
   gl.uniform4f(u_FragColor, 0.40, 0.78, 0.22, 1.0);
   var backLeftLeg = new Matrix4();
   backLeftLeg.translate(-0.5, -0.3, -0.25);
   backLeftLeg.rotate(g_backLeftLegAngle, 0, 0, 1);

   var backLeftLegCoord = new Matrix4(backLeftLeg);
   backLeftLeg.scale(0.12, 0.28, 0.12);
   drawCube(backLeftLeg);

   var lowerLeg = new Matrix4(backLeftLegCoord);
   lowerLeg.translate(0.19, -0.02, 0.0);
   lowerLeg.rotate(g_backLeftLowerLegAngle, 0, 0, 1);


   var lowerLegCoordinates = new Matrix4(lowerLeg);
   lowerLeg.scale(0.10, 0.20, 0.10);
   drawCube(lowerLeg);

   var foot = new Matrix4(lowerLegCoordinates);
   foot.translate(0.0003, -0.05, -0.03);
   foot.rotate(g_backLeftFoot, 0, 0, 1);

   
   foot.scale(0.20, 0.06, 0.16);
   drawCube(foot);

   
  // limbs for back right leg

   gl.uniform4f(u_FragColor, 0.40, 0.78, 0.22, 1.0);
   var backRightLeg = new Matrix4();
   backRightLeg.translate(-0.5, -0.3, 0.22);
   backRightLeg.rotate(g_backRightLegAngle, 0, 0, 1);

   var backRightLegCoord = new Matrix4(backRightLeg);
   backRightLeg.scale(0.12, 0.28, 0.12);
   drawCube(backRightLeg);

   var lowerLeg = new Matrix4(backRightLegCoord);
   backLeftLeg.scale(0.15, 0.20, 0.10);
   drawCube(backRightLeg);

   lowerLeg.translate(0.05, -0.07, 0.0);
   lowerLeg.rotate(g_backRightLowerLegAngle, 0, 0, 1);
   
   var lowerLegCoordinates = new Matrix4(lowerLeg);
   lowerLeg.scale(0.10, 0.20, 0.10);
   drawCube(lowerLeg);

   var foot = new Matrix4(lowerLegCoordinates);
   foot.translate(0.02, -0.05, -0.03);
   foot.scale(0.20, 0.06, 0.16);
   drawCube(foot);

  // limbs for front right leg   

   var frontRightLeg = new Matrix4();
   frontRightLeg.translate(0.10, -0.3, 0.22);
   frontRightLeg.rotate(g_frontRightLegAngle, 0, 0, 1);

   var frontRightLegCoord = new Matrix4(frontRightLeg);
   frontRightLeg.scale(0.12, 0.28, 0.12);
   drawCube(frontRightLeg);

   var lowerLeg = new Matrix4(frontRightLegCoord);
   backLeftLeg.scale(0.15, 0.15, 0.10);
   drawCube(frontRightLeg);

   lowerLeg.translate(0.05, -0.02, 0.0);
   lowerLeg.rotate(g_frontRightLowerLegAngle, 0, 0, 1);
   
   var lowerLegCoordinates = new Matrix4(lowerLeg);
   lowerLeg.scale(0.10, 0.20, 0.10);
   drawCube(lowerLeg);

   var foot = new Matrix4(lowerLegCoordinates);
   foot.translate(0.02, -0.05, -0.03);
   foot.scale(0.20, 0.06, 0.16);
   drawCube(foot);


   gl.uniform4f(u_FragColor, 0.42, 0.80, 0.24, 1.0);

   //limbs for front left leg 
   var upperLeg = new Matrix4();
   upperLeg.translate(0.02, -0.3, -0.25); 
   upperLeg.rotate(g_frontLeftLegAngle, 0, 0, 1);

   var upperLegCoordinates = new Matrix4(upperLeg);
   upperLeg.scale(0.12, 0.28, 0.12);
   drawCube(upperLeg);

   
   var lowerLeg = new Matrix4(upperLegCoordinates);
   upperLeg.scale(0.15, 0.20, 0.10);
   drawCube(upperLeg);
   
   lowerLeg.translate(0.19, -0.02, 0.0);
   lowerLeg.rotate(g_frontLeftLowerLegAngle, 0, 0, 1);

   var lowerLegCoordinates = new Matrix4(lowerLeg);
   lowerLeg.scale(0.10, 0.20, 0.10);
   drawCube(lowerLeg);

   var foot = new Matrix4(lowerLegCoordinates);
   foot.translate(0.0003, -0.05, -0.03);
   foot.scale(0.20, 0.06, 0.16);
   drawCube(foot);

   gl.uniform4f(u_FragColor, 0.30, 0.65, 0.15, 1.0);

   // spike
   var spike1 = new Matrix4();
   spike1.translate(-0.35, -0.1, -0.03);
   spike1.rotate(45, 0, 0, 1);
   spike1.scale(0.09, 0.11, 0.06);
   drawCube(spike1);

   var spike1 = new Matrix4();
   spike1.translate(-0.20, -0.1, -0.03);
   spike1.rotate(45, 0, 0, 1);
   spike1.scale(0.09, 0.11, 0.06);
   drawCube(spike1);

   var spike1 = new Matrix4();
   spike1.translate(-0.10, -0.1, -0.03);
   spike1.rotate(45, 0, 0, 1);
   spike1.scale(0.09, 0.11, 0.06);
   drawCube(spike1);

   var spike1 = new Matrix4();
   spike1.translate(0, -0.1, -0.03);
   spike1.rotate(45, 0, 0, 1);
   spike1.scale(0.09, 0.11, 0.06);
   drawCube(spike1);


   var spike1 = new Matrix4();
   spike1.translate(0.10, -0.1, -0.03);
   spike1.rotate(45, 0, 0, 1);
   spike1.scale(0.09, 0.11, 0.06);
   drawCube(spike1);

    var duration = performance.now() - startTime;
    var fps;
    if (duration > 0) {
      fps = 1000 / duration;
    } else {
      fps = 0;
    }
    document.getElementById('numdot').innerHTML = 'ms: ' + duration.toFixed(2) + ' fps: ' + fps.toFixed(1);

 }

//used LLM for help on animation logic
function updateAnimationAngles() {
  if (g_animation) {
    g_backLeftLegAngle = -25 + 20 * Math.sin(g_seconds);
    g_backLeftLowerLegAngle = 50 + 15 * Math.sin(g_seconds);


    g_frontLeftLegAngle = -25 + 20 * Math.sin(g_seconds);
    g_frontLeftLowerLegAngle = 50 + 15 * Math.sin(g_seconds);

    g_backRightLegAngle = -25 - 20 * Math.sin(g_seconds);
    g_backRightLowerLegAngle = 50 - 15 * Math.sin(g_seconds);

    g_frontRightLegAngle = -25 - 20 * Math.sin(g_seconds);
    g_frontRightLowerLegAngle = 50 - 15 * Math.sin(g_seconds);

    g_bodyHead = 0.03 * Math.sin(g_seconds * 3);
    
  }

  if (g_pokeAnimation) {
    var now = performance.now() / 1000.0;
    var pokeTime = now - g_pokeStartTime;
    
    if (pokeTime < g_pokeDuration) {
      g_pokeJawAngle = -35 * Math.sin(Math.PI * pokeTime / g_pokeDuration);
    } else {
      g_pokeAnimation = false;
      g_pokeJawAngle = 0;
    }
  }
}

   function sendTextToHTML(text, htmlID) {
     var htmlElm =  document.getElementById(htmlID);

     if(!htmlElm) {
       console.log(" Failed to get " + htmlID + "from HTML");
       return;
     }
     htmlElm.innerHTML = text;
   }
