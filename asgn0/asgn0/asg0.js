// DrawTriangle.js (c) 2012 matsuda
let ctx;
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  //black canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //instantiate vector v1
  var v1 = new Vector3([2.25, 2.25, 0.0]);

  //call drawVector
  drawVector(v1, "red");

}

function drawVector(v, color) {

  var origin_x = 200;
  var origin_y = 200;

  var x = v.elements[0] * 20;
  var y = v.elements[1] * 20;

  ctx.beginPath();
  ctx.moveTo(origin_x, origin_y);
  ctx.lineTo(origin_x + x, origin_y - y );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

}

function handleDrawEvent() {

  var canvas = document.getElementById('example');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x = parseFloat(document.getElementById('xCoord').value);
  let y = parseFloat(document.getElementById('yCoord').value);

  //vector v1
  let v1 = new Vector3([x, y, 0]);

  let x2 = parseFloat(document.getElementById('xCoord2').value);
  let y2 = parseFloat(document.getElementById('yCoord2').value);

  //vector v2
  let v2 = new Vector3([x2, y2, 0]);

  drawVector(v2, "blue");
  drawVector(v1, "red");

}

function handleDrawOperationEvent() {

  var canvas = document.getElementById('example');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x1 = parseFloat(document.getElementById('xCoord').value);
  let y1 = parseFloat(document.getElementById('yCoord').value);
  let v1 = new Vector3([x1, y1, 0]);
  drawVector(v1, "red");

  let x2 = parseFloat(document.getElementById('xCoord2').value);
  let y2 = parseFloat(document.getElementById('yCoord2').value);
  let v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, "blue");

  let op = document.getElementById('operation').value;
  let scalar = parseFloat(document.getElementById('scalar').value);

  if (op === "add") {
    let v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3, "green");
  } 
  else if (op === "sub") {
    let v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, "green");
  } 
  else if (op === "mul") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } 
  else if (op === "div") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  }

  else if (op === "magnitude") {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  }


  else if (op === "normalize") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.normalize();
    v4.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  }

  else if (op === "angle") {
    console.log("Angle:", angleBetween(v1, v2));
  }

  else if (op === "area") {
    console.log("Area of the triangle:", areaTriangle(v1, v2));
  }

}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();

  let cosAlpha = dot / (mag1 * mag2);

  cosAlpha = Math.max(-1, Math.min(1, cosAlpha));

  let alpha = Math.acos(cosAlpha);
  let angleDegrees = alpha * 180 / Math.PI;

  return angleDegrees;
}

function areaTriangle(v1, v2) {
  let crossProduct = Vector3.cross(v1, v2);
  let area = crossProduct.magnitude() / 2;
  return area;
}
