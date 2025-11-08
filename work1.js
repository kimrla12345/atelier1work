let img1, img2, currentImg;

function preload() {
  img1 = loadImage('lighton.jpg');  
  img2 = loadImage('lightoff.jpg'); 
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');
  currentImg = img1;
//ios touch zoomin protect
  const wrap = document.getElementById('canvasWrap');
  wrap.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  wrap.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  }, { passive: false });
}

function draw() {
  background(0); 
  let ar_img = currentImg.width / currentImg.height;
  let ar_win = width / height;
  let drawW, drawH;
  if (ar_img > ar_win) {
    drawH = height;
    drawW = height * ar_img;
  } else {
    drawW = width;
    drawH = width / ar_img;
  }
  imageMode(CENTER);
  image(currentImg, width/2, height/2, drawW, drawH);
}

function mousePressed() {
  currentImg = (currentImg === img1) ? img2 : img1;
}
function touchStarted() {
  currentImg = (currentImg === img1) ? img2 : img1;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
