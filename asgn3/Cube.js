class Cube {
  constructor() {
    this.type='cube';
    //this.position= [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    //this.size = 5.0;
    this.matrix = new Matrix4();
    this.textureNum = -2;
    this.texColorWeight = 1.0;
  }

  render() {

    var rgba = this.color;

    //console.log("textureNum:", this.textureNum, "color:", rgba);

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform1f(u_texColorWeight, this.texColorWeight);
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //FRONT of Cube
    drawTriangle3DUV([0,0,0, 1,1,0,  1,0,0], [0,0,1,1,1,0]);
    drawTriangle3DUV([0,0,0,  0,1,0, 1,1,0], [0,0,0,1,1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // TOP of Cube
    drawTriangle3D([1,0,0,   1,1,1,   1,0,1], [0,0,    0,1,    1,1]);
    drawTriangle3D([1,0,0,   1,1,0,   1,1,1], [0,0,    1,1,    1,0]);

    gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

    // BACK of Cube
    drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0,    1,0,    1,1]);
    drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0,    1,1,    0,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

    // BOTTOM of Cube
    drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], [0,0,    1,1,    0,1]);
    drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], [0,0,    1,0,    1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

    // LEFT of Cube
    drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,    1,0,    1,1]);
    drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0,    1,1,    0,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.4, rgba[1]*.4, rgba[2]*.4, rgba[3]);

    // RIGHT of Cube
    drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], [0,0,    1,1,    1,0]);
    drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0,    0,1,    1,1]);
    

    //drawCube(this.matrix);
      
    }
    renderfast() {
        var rgba = this.color;

    //console.log("textureNum:", this.textureNum, "color:", rgba);

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform1f(u_texColorWeight, this.texColorWeight);
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [];
    var allUVs =[];
    

    allverts = allverts.concat([0,0,0, 1,1,0,  1,0,0]);
    allUVs   = allUVs.concat(  [0,0,    1,1,    1,0]);
        
    allverts = allverts.concat([0,0,0,  0,1,0, 1,1,0]);
    allUVs   = allUVs.concat(  [0,0,    0,1,    1,1]);


    allverts = allverts.concat([1,0,0,   1,1,1,   1,0,1]);
    allUVs   = allUVs.concat(  [0,0,    0,1,    1,1]);
    
    allverts = allverts.concat([1,0,0,   1,1,0,   1,1,1]);
    allUVs   = allUVs.concat(  [0,0,    1,1,    1,0]);

    allverts = allverts.concat([0,0,0,  1,0,1,  0,0,1]);
    allUVs   = allUVs.concat(  [0,0,    1,0,    1,1]);

        
    allverts = allverts.concat([0,0,0,  1,0,0,  1,0,1]);
    allUVs   = allUVs.concat(  [0,0,    1,1,    0,1]);


    allverts = allverts.concat([0,0,0,  0,0,1,  0,1,1]);
    allUVs   = allUVs.concat(  [0,0,    1,1,    0,1]);
    
    allverts = allverts.concat([0,0,0,  0,1,1,  0,1,0]);
    allUVs   = allUVs.concat(  [0,0,    1,0,    1,1]);


    allverts = allverts.concat([0,0,0,  0,1,0,  1,1,0]);
    allUVs   = allUVs.concat(  [0,0,    1,0,    1,1]);

        
    allverts = allverts.concat([0,0,0,  1,1,0,  1,0,0]);
    allUVs   = allUVs.concat(  [0,0,    1,1,    0,1]);


    allverts = allverts.concat([0,0,1,  1,1,1,  0,1,1]);
    allUVs   = allUVs.concat(  [0,0,    1,1,    1,0]);

    
    allverts = allverts.concat([0,0,1,  1,0,1,  1,1,1]);
    allUVs   = allUVs.concat(  [0,0,    0,1,    1,1]);

    drawTriangle3DUV(allverts, allUVs);




    //drawCube(this.matrix);
        
    }
  }
 