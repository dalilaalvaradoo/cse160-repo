class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([0, 0, 0]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 0.1;

    this.alpha = 3;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.updateViewMatrix();
    this.updateProjectionMatrix(canvas);
  }
    updateViewMatrix() {this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2],this.up.elements[0], this.up.elements[1], this.up.elements[2])}
    updateProjectionMatrix() {this.projectionMatrix.setPerspective(this.fov,canvas.width / canvas.height,0.1,1000)}
    
    // forward function : vector f = at - eye
    moveForward() {
        let f = new Vector3(); 
    
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];
        
        f.normalize();

        f.elements[0] *= this.speed;
        f.elements[1] *= this.speed;
        f.elements[2] *= this.speed;

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] += f.elements[i];
            this.at.elements[i] += f.elements[i];
        }
        this.updateViewMatrix();
    }

    moveBackwards() {
    let b = new Vector3();


    b.elements[0] = this.eye.elements[0] - this.at.elements[0];
    b.elements[1] = this.eye.elements[1] - this.at.elements[1];
    b.elements[2] = this.eye.elements[2] - this.at.elements[2];
    
    b.normalize();

    b.elements[0] *= this.speed;
    b.elements[1] *= this.speed;
    b.elements[2] *= this.speed;

    for (let i = 0; i < 3; i++) {
        this.eye.elements[i] += b.elements[i];
        this.at.elements[i] += b.elements[i];
    }
    
    this.updateViewMatrix();
    }

  moveRight() {
    //forward vector f 
        let f = new Vector3(); 
    
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        f.normalize;

        //side vector s
        let s = new Vector3;
          s.elements[0] = f.elements[1] * this.up.elements[2] - f.elements[2] * this.up.elements[1];
          s.elements[1] = f.elements[2] * this.up.elements[0] - f.elements[0] * this.up.elements[2];
          s.elements[2] = f.elements[0] * this.up.elements[1] - f.elements[1] * this.up.elements[0];
        
        s.normalize();

        //scaling s by desired value
        
        s.elements[0] *= this.speed;
        s.elements[1] *= this.speed;
        s.elements[2] *= this.speed;

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] += s.elements[i];
            this.at.elements[i] += s.elements[i];
        }
        
        this.updateViewMatrix();
  }
    
    moveLeft() {
        // forward vector f 
        let f = new Vector3(); 
    
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        f.normalize;

        // side vector s
        let s = new Vector3;

        s.elements[0] = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
        s.elements[1] = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
        s.elements[2] = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];
        
        s.normalize();
        
        //scaling s by desired value
        
        s.elements[0] *= this.speed;
        s.elements[1] *= this.speed;
        s.elements[2] *= this.speed;

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] += s.elements[i];
            this.at.elements[i] += s.elements[i];
        }
        
        this.updateViewMatrix();
    }


  panLeft() {

      let f = new Vector3(); 
      f.elements[0] = this.at.elements[0] - this.eye.elements[0];
      f.elements[1] = this.at.elements[1] - this.eye.elements[1];
      f.elements[2] = this.at.elements[2] - this.eye.elements[2];
      
      
      //rotation matrix
      let rotationMatrix = new Matrix4();

      rotationMatrix.setRotate(this.alpha,this.up.elements[0],this.up.elements[1],this.up.elements[2]);

      //compute f_prime using matrix multiplication
      let fPrime = rotationMatrix.multiplyVector3(f);

      this.at.elements[0] = this.eye.elements[0] + fPrime.elements[0];
      this.at.elements[1] = this.eye.elements[1] + fPrime.elements[1];
      this.at.elements[2] = this.eye.elements[2] + fPrime.elements[2];

    this.updateViewMatrix();
  }

  panRight() {

       let f = new Vector3(); 
      f.elements[0] = this.at.elements[0] - this.eye.elements[0];
      f.elements[1] = this.at.elements[1] - this.eye.elements[1];
      f.elements[2] = this.at.elements[2] - this.eye.elements[2];

       //rotation matrix
      let rotationMatrix = new Matrix4();

      rotationMatrix.setRotate(-this.alpha,this.up.elements[0],this.up.elements[1],this.up.elements[2]);

      //compute f_prime using matrix multiplication
      let fPrime = rotationMatrix.multiplyVector3(f);

      this.at.elements[0] = this.eye.elements[0] + fPrime.elements[0];
      this.at.elements[1] = this.eye.elements[1] + fPrime.elements[1];
      this.at.elements[2] = this.eye.elements[2] + fPrime.elements[2];

    this.updateViewMatrix();
  }

}