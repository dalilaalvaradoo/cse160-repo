class Triangle {
  constructor() {
    this.type='triangle';
    this.position= [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }
  

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_Size, size);

    var delta = this.size/200.0;
  }
}

class PictureTriangle {
  constructor(vertices, color) {
    this.type = 'pictureTriangle';
    this.vertices = vertices;   
    this.color = color;
  }

  render() {
    let rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle(this.vertices);
  }
}


function drawTriangle(vertices) {

  var n = 3; // The number of vertices
  
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangles3D(vertices) {
  var n = vertices.length / 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initCubeBuffer() {
  g_cubeVertexBuffer = gl.createBuffer();

  if (!g_cubeVertexBuffer) {
    console.log('Failed to create cube buffer');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeVertices, gl.STATIC_DRAW);

  return 0;
}

// used assistance from LLM on guidance for cube buffer for optimization
var g_cubeVertexBuffer = null;
var g_cubeVertices = new Float32Array([
  // front face, z = 0
  0.0, 0.0, 0.0,
  1.0, 1.0, 0.0,
  1.0, 0.0, 0.0,

  0.0, 0.0, 0.0,
  0.0, 1.0, 0.0,
  1.0, 1.0, 0.0,

  // back face, z = 1
  0.0, 0.0, 1.0,
  1.0, 0.0, 1.0,
  1.0, 1.0, 1.0,

  0.0, 0.0, 1.0,
  1.0, 1.0, 1.0,
  0.0, 1.0, 1.0,

  // top face, y = 1
  0.0, 1.0, 0.0,
  0.0, 1.0, 1.0,
  1.0, 1.0, 1.0,

  0.0, 1.0, 0.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, 0.0,

  // bottom face, y = 0
  0.0, 0.0, 0.0,
  1.0, 0.0, 1.0,
  0.0, 0.0, 1.0,

  0.0, 0.0, 0.0,
  1.0, 0.0, 0.0,
  1.0, 0.0, 1.0,

  // right face, x = 1
  1.0, 0.0, 0.0,
  1.0, 1.0, 1.0,
  1.0, 0.0, 1.0,

  1.0, 0.0, 0.0,
  1.0, 1.0, 0.0,
  1.0, 1.0, 1.0,

  // left face, x = 0
  0.0, 0.0, 0.0,
  0.0, 0.0, 1.0,
  0.0, 1.0, 1.0,

  0.0, 0.0, 0.0,
  0.0, 1.0, 1.0,
  0.0, 1.0, 0.0
]);

function drawCube(M) {

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}