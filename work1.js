let img1, img2, currentImg;
let sliderY = 0;
let sliderHeight = 30;
let brightnessLevel = 0;
let isDraggingSlider = false;
let sliderMinY = 50;
let sliderMaxY = 0;
let savedBrightnessLevel = 0;

function preload() {
  img1 = loadImage('lighton.jpg');  
  img2 = loadImage('lightoff.jpg'); 
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');
  currentImg = img2;
  
  sliderMaxY = height - 50 - sliderHeight;
  sliderY = sliderMaxY;
  
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
  
  if (currentImg === img1 && brightnessLevel > 0) {
    let brightness = map(brightnessLevel, 0, 10, 0, 150);
    let radius = map(brightnessLevel, 0, 10, 50, 400);
    
    let lightX = width/1.95 + 100;
    let lightY = height/2;
    
    for (let r = radius; r > 0; r -= 10) {
      let alpha = map(r, 0, radius, brightness, 0);
      noStroke();
      fill(255, 255, 100, alpha * 0.2);
      circle(lightX, lightY, r * 2);
    }
  }
  
  drawSlider();
}

function drawSlider() {
  stroke(100);
  strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);
  
  fill(255, 255, 100);
  noStroke();
  circle(25, sliderY + sliderHeight / 2, 16);
}

function updateBrightness() {
  let normalizedPos = 1 - ((sliderY - sliderMinY) / (sliderMaxY - sliderMinY));
  brightnessLevel = ceil(normalizedPos * 10);
  brightnessLevel = constrain(brightnessLevel, 0, 10);
  
  if (brightnessLevel > 0) {
    currentImg = img1;
  } else {
    currentImg = img2;
  }
}

function isSliderTouched(touchX, touchY) {
  let distToSlider = dist(touchX, touchY, 25, sliderY + sliderHeight / 2);
  return distToSlider < 25; // 터치 범위 조금 더 넓게
}

function mousePressed() {
  let distToSlider = dist(mouseX, mouseY, 25, sliderY + sliderHeight / 2);
  if (distToSlider < 25) { 
    isDraggingSlider = true;
    return false;
  }
  
  // 슬라이더 아닌 곳 클릭: 이미지 토글
  if (currentImg === img1) {
    currentImg = img2;
    savedBrightnessLevel = brightnessLevel; 
    brightnessLevel = 0;
    sliderY = height - 50 - sliderHeight;
  } else {
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 5; 
    let normalizedBrightness = brightnessLevel / 10; 
    sliderY = sliderMaxY - (normalizedBrightness * (sliderMaxY - sliderMinY));
  }
  return false;
}

function mouseDragged() {
  if (isDraggingSlider) {
    sliderY += movedY;
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
    return false;
  }
}

function mouseReleased() {
  isDraggingSlider = false;
}

function touchStarted() {
  // 슬라이더 터치 감지
  if (touches.length > 0) {
    let touchX = touches[0].x;
    let touchY = touches[0].y;
    
    if (isSliderTouched(touchX, touchY)) {
      isDraggingSlider = true;
      return false; // 슬라이더 드래그 시작
    }
  }
  
  // 슬라이더가 아닌 곳: 이미지 토글
  if (currentImg === img1) {
    currentImg = img2;
    savedBrightnessLevel = brightnessLevel; 
    brightnessLevel = 0;
    sliderY = height - 50 - sliderHeight;
  } else {
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 5; 
    let normalizedBrightness = brightnessLevel / 10; 
    sliderY = sliderMaxY - (normalizedBrightness * (sliderMaxY - sliderMinY));
  }
  
  return false;
}

function touchMoved() {
  if (isDraggingSlider && touches.length > 0) {
    sliderY += (touches[0].y - touches[0].py);
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
    return false;
  }
}

function touchEnded() {
  isDraggingSlider = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
