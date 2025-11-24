let img1, img2, currentImg;
let sliderY, sliderMinY = 50, sliderMaxY;
let brightnessLevel = 0, savedBrightnessLevel = 0;
let isDragging = false, lastTouchY = null, tapCandidate = false;
let touchCount = 0;
let video, isPlayingVideo = false;

function preload() {
  img1 = loadImage('lighton.jpg');
  img2 = loadImage('lightoff.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent('canvasWrap');
  
  video = createVideo('lightbroke.mp4');
  video.hide();
  video.onended(() => {
    video.hide();
    isPlayingVideo = false;
    touchCount = 0;
    currentImg = img2;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  });
  
  currentImg = img2;
  sliderMaxY = height - 80;
  sliderY = sliderMaxY;
}

function draw() {
  if (isPlayingVideo) return;
  
  background(0);
  
  // 이미지 비율 맞춰 그리기
  let ar = currentImg.width / currentImg.height;
  let [w, h] = ar > width/height ? [height * ar, height] : [width, width / ar];
  imageMode(CENTER);
  image(currentImg, width/2, height/2, w, h);
  
  // 밝기 효과
  if (currentImg === img1 && brightnessLevel > 0) {
    let b = map(brightnessLevel, 0.1, 5, 0, 150);
    let r = map(brightnessLevel, 0.1, 5, 50, 400);
    for (let i = r; i > 0; i -= 10) {
      noStroke();
      fill(255, 255, 100, map(i, 0, r, b, 0) * 0.2);
      circle(width/1.8 + 100, height/2, i * 2);
    }
  }
  
  // 슬라이더
  stroke(100); strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);
  fill(255, 255, 100); noStroke();
  circle(25, sliderY + 15, 16);
  
  fill(255); textAlign(CENTER); textSize(16);
  text('Click: ' + touchCount, width/2, 20);
}

function updateBrightness() {
  brightnessLevel = constrain((1 - (sliderY - sliderMinY) / (sliderMaxY - sliderMinY)) * 5, 0, 5);
  currentImg = brightnessLevel > 0.1 ? img1 : img2;
}

function mousePressed() {
  if (isPlayingVideo) return false;
  if (dist(mouseX, mouseY, 25, sliderY + 15) < 25) {
    isDragging = true;
    return false;
  }
  toggleImage();
  return false;
}

function mouseDragged() {
  if (isDragging && !isPlayingVideo) {
    sliderY = constrain(sliderY + movedY, sliderMinY, sliderMaxY);
    updateBrightness();
  }
  return false;
}

function mouseReleased() {
  isDragging = false;
  return false;
}

function touchStarted() {
  if (isPlayingVideo) return false;
  if (touches[0] && dist(touches[0].x, touches[0].y, 25, sliderY + 15) < 25) {
    isDragging = true;
    lastTouchY = touches[0].y;
    return false;
  }
  tapCandidate = true;
  return false;
}

function touchMoved() {
  if (isDragging && !isPlayingVideo && touches[0]) {
    if (lastTouchY) sliderY = constrain(sliderY + touches[0].y - lastTouchY, sliderMinY, sliderMaxY);
    lastTouchY = touches[0].y;
    updateBrightness();
  }
  tapCandidate = false;
  return false;
}

function touchEnded() {
  if (isPlayingVideo) return false;
  isDragging = false;
  lastTouchY = null;
  if (tapCandidate) toggleImage();
  tapCandidate = false;
  return false;
}

function toggleImage() {
  if (++touchCount === 100) {
    isPlayingVideo = true;
    video.show();
    video.volume(0);
    video.play();
    return;
  }
  
  if (currentImg === img1) {
    currentImg = img2;
    savedBrightnessLevel = brightnessLevel;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel || 2.5;
    sliderY = sliderMaxY - (brightnessLevel / 5) * (sliderMaxY - sliderMinY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 80;
}
