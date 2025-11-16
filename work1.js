let img1, img2, currentImg;
let sliderY = 0;
let sliderHeight = 30;
let brightnessLevel = 0;
let isDraggingSlider = false;
let sliderMinY = 50;
let sliderMaxY = 0;
let savedBrightnessLevel = 0;
let touchCount = 0;

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
}

function draw() {
  background(0);
  
  // 이미지 자동 비율 맞춤
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
  
  // 라이팅 효과 (lighton 상태 + brightness > 0일 때만)
  if (currentImg === img1 && brightnessLevel > 0) {
    let brightness = map(brightnessLevel, 0.1, 5, 0, 150);
    let radius = map(brightnessLevel, 0.1, 5, 50, 400);
    
    let lightX = width/1.75 + 100;
    let lightY = height/2;
    
    for (let r = radius; r > 0; r -= 10) {
      let alpha = map(r, 0, radius, brightness, 0);
      noStroke();
      fill(255, 255, 100, alpha * 0.2);
      circle(lightX, lightY, r * 2);
    }
  }
  
  // 슬라이더 그리기
  drawSlider();
  
  // 터치 횟수 표시 (중간 상단)
  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  text('Clicks: ' + touchCount, width/2, 20);
}

function drawSlider() {
  // 슬라이더 트랙
  stroke(100);
  strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);
  
  // 슬라이더 바 (원형)
  fill(255, 255, 100);
  noStroke();
  circle(25, sliderY + sliderHeight / 2, 16);
}

function updateBrightness() {
  // 슬라이더 위치 -> 밝기값 (0~5, 소수점 포함)
  let normalizedPos = 1 - ((sliderY - sliderMinY) / (sliderMaxY - sliderMinY));
  brightnessLevel = normalizedPos * 5;
  brightnessLevel = constrain(brightnessLevel, 0, 5);
  
  // 밝기 0이면 lightoff, 0보다 크면 lighton
  if (brightnessLevel > 0.1) {
    currentImg = img1;
  } else {
    currentImg = img2;
  }
}

function mousePressed() {
  // 슬라이더 터치 판정
  let distToSlider = dist(mouseX, mouseY, 25, sliderY + sliderHeight / 2);
  if (distToSlider < 25) {
    isDraggingSlider = true;
    return false;
  }
  
  // 슬라이더가 아닌 곳 터치: 이미지 토글
  touchCount++;
  
  if (currentImg === img1) {
    // lighton -> lightoff
    currentImg = img2;
    savedBrightnessLevel = brightnessLevel;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    // lightoff -> lighton
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 2.5;
    let normalizedBrightness = brightnessLevel / 5;
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
  // 슬라이더 터치 판정
  if (touches.length > 0) {
    let touchX = touches[0].x;
    let touchY = touches[0].y;
    let distToSlider = dist(touchX, touchY, 25, sliderY + sliderHeight / 2);
    
    if (distToSlider < 25) {
      isDraggingSlider = true;
      return false;
    }
  }
  
  // 슬라이더가 아닌 곳 터치: 이미지 토글
  touchCount++;
  
  if (currentImg === img1) {
    // lighton -> lightoff
    currentImg = img2;
    savedBrightnessLevel = brightnessLevel;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    // lightoff -> lighton
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 2.5;
    let normalizedBrightness = brightnessLevel / 5;
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