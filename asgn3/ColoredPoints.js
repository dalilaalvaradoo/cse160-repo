// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotation;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotation * u_ModelMatrix * a_Position;
  v_UV = a_UV;
} `


// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform float u_texColorWeight;

void main() {
  vec4 baseColor = u_FragColor;
  vec4 texColor = texture2D(u_Sampler0, v_UV);
  float t = u_texColorWeight;
  
  if (u_whichTexture == -2) {
    gl_FragColor = u_FragColor;
    
  } else if (u_whichTexture == 0) {
     gl_FragColor = (1.0 - t) * baseColor + t * texColor;
    
  } else if(u_whichTexture == 1) {
      vec4 texColor = texture2D(u_Sampler1, v_UV);
      gl_FragColor = (1.0 - t) * baseColor + t * texColor;
  
  } else {
    gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
  }

}`;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotation;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_texColorWeight;
let camera;

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



function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl");
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
    return false;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if(!a_UV)  {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
 u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

 // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  //if (!u_Size) {
  //  console.log('Failed to get the storage location of u_Size');
    //return;
 // }

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

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
   console.log('Failed to get the storage location of u_ProjectionMatrix');
   return;
  }
  
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }  

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  } 

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_texColorWeight) {
    console.log('Failed to get the storage location of u_texColorWeight');
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
  document.getElementById('animationOnButton').onclick = function() { g_animation = true; };
  document.getElementById('animationOffButton').onclick = function() { g_animation = false; };
 
}

function initTextures(gl, n) {
  var wallImage = new Image();
  var skyImage = new Image();
  
  if(!wallImage || !skyImage) {
    console.log("Failed to create image object");
    return false;
  }

  wallImage.onload = function() {
    sendImageToTexture0(wallImage);
    renderScene();
  }

  skyImage.onload = function() {
    sendImageToTexture1(skyImage);
    renderScene();
  }

  wallImage.src = "wall_texture.jpg";

  skyImage.src = "sky_texture160.jpg";

  return true;
}

function sendImageToTexture0(image) {
  //wall texture
  var texture = gl.createTexture();
  if(!texture) {
    console.log("Failed to create texture object");
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image );

  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture');
}
  function sendImageToTexture1(image) {
    
    // sky texture
    var texture = gl.createTexture();
    if(!texture) {
      console.log("Failed to create texture object");
      return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  
    gl.activeTexture(gl.TEXTURE1);
  
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image );
  
    gl.uniform1i(u_Sampler1, 1);
  
    console.log('finished loadTexture');
}


function main() {

  setupWebGL();
  camera = new Camera();
  connectVariablesToGLSL();
  addActionsForHTMLUI();
  buildWorldFromMap();

  document.onkeydown = keydown;
  
  initTextures(gl,0);

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

  //requestAnimationFrame(tick);
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
  
}

function keydown(ev) {
  if ( ev.key === 'W') {
    camera.moveForward();
  } 
  else if (ev.key === 'S') {
    camera.moveBackwards();
  } 
  else if (ev.key === 'A') {
    camera.moveLeft();
  } 
  else if (ev.key === 'D') {
    camera.moveRight();
  } 
  else if (ev.key === 'Q') {
    camera.panLeft();
  } 
  else if (ev.key === 'E') {
    camera.panRight(); 
  }
  renderScene();
  console.log(ev.keyCode);

}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];


// used LLM for assistance on the 32x32 map for walls in world
let g_map=[];

for (let z = 0; z < 32; z++) {
  g_map[z] = [];
  for (let x = 0; x < 32; x++) {
    // outer border walls
    if (x === 0 || x === 31 || z === 0 || z === 31) {
      g_map[z][x] = 4;
    }
    
    else if (x === 8 && z > 4 && z < 25) {
      g_map[z][x] = 2;
    }
      
      // another interior wall
    else if (z === 14 && x > 10 && x < 28) {
      g_map[z][x] = 3;
    }
      
      // empty space
    else {
      g_map[z][x] = 0;
    }
  }
}

let g_walls;


function buildWorldFromMap() {
  g_walls = [];
  let mapWidth = g_map[0].length;
  let mapDepth = g_map.length;


  let frontRow = mapDepth - 1; // front of the map
  let entranceWidth = 2;
  let entranceStart = Math.floor(mapWidth / 2) - Math.floor(entranceWidth / 2);
  let entranceEnd = entranceStart + entranceWidth - 1;
  
  for (let z = 0; z < g_map.length; z++) {
    for (let x = 0; x < g_map[z].length; x++) {
      let height = g_map[z][x];

      if (z === frontRow && x >= entranceStart && x <= entranceEnd) {
        height = 0;
      }
      

      for (let y = 0; y < height; y++) {
        let wall = new Cube();
      
        
        let worldX = x - mapWidth / 2;
        let worldY = y - 0.75;

        let frontZ = -2;
        let worldZ = frontZ - (mapDepth - 1 - z);

        wall.textureNum = 0;       
        wall.texColorWeight = 1.0;  
        wall.color = [1, 1, 1, 1];
        
        wall.matrix.translate(worldX, worldY, worldZ);
        
        g_walls.push(wall);
      }
    }
  }
}

function drawMap() {
  for (let i = 0; i < g_walls.length; i++) {
    g_walls[i].renderfast();
  }
}

//used LLM for debugging & initial coordinates for body parts, 
//adjusted values on my own later
 function renderScene() { 

   var startTime = performance.now();

   camera.updateProjectionMatrix();
   camera.updateViewMatrix();
   gl.uniformMatrix4fv(u_ProjectionMatrix,false,camera.projectionMatrix.elements);
   gl.uniformMatrix4fv(u_ViewMatrix,false,camera.viewMatrix.elements);

   var globalRotMat = new Matrix4();
   globalRotMat.rotate(g_AnimalGlobalRotation, 0, 1, 0);
   globalRotMat.rotate(g_mouseRotateX, 1, 0, 0);
   globalRotMat.rotate(g_mouseRotateY, 0, 1, 0);
   gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

   var modelMat = new Matrix4();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // DRAWING MY WORLD

   //draw the floor
   var body = new Cube();
   body.color = [0.60, 0.98, 0.60, 1.0];
   body.textureNum=-2;
   body.matrix.translate(0, -.5, -.5);
   body.matrix.scale(10,0,10);
   body.matrix.translate(-.5,0, -1);
   body.render();

   //drawing the sky
   var sky = new Cube;
   sky.color = [1.0, 0.0, 0.0, 1.0];
   sky.textureNum = 1;
   sky.matrix.scale(50,50,50);
   sky.matrix.translate(-.5, -.5, -.5);
   sky.render();

   
  // walls 
 // var wall = new Cube();
  //wall.textureNum = 0;
  //wall.texColorWeight = 1.0;
 // wall.color = [1, 1, 1, 1]; 
//  wall.matrix.translate(-0.5, -0.5, -3);
 // wall.matrix.scale(1.0, 1.0, 1.0);
  //wall.render();

   drawMap();


   

  // var sky = new Cube();
  // sky.textureNum = 0;
  // sky.texColorWeight = 0.0;
  // sky.color = [0.3, 0.6, 1.0, 1.0];
  // sky.matrix.translate(0.2, -0.5, 0.0);
  // sky.matrix.scale(1.0, 1.0, 1.0);
  // sky.render();

  // var mixedCube = new Cube();
  // mixedCube.textureNum = 0;
  // mixedCube.texColorWeight = 0.5; 
  // mixedCube.color = [1.0, 0.0, 0.0, 1.0];
  // mixedCube.matrix.translate(-0.5, -0.5, 0.0);
  // mixedCube.render();

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
