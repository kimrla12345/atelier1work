let img1, img2, currentImg;
let sliderY = 0;
let sliderHeight = 30;
let brightnessLevel = 0;
let isDraggingSlider = false;
let sliderMinY = 50;
let sliderMaxY = 0;
let savedBrightnessLevel = 0;

let toggleCount = 0;
let videoPlaying = false;
let video;

function preload() {
  img1 = loadImage('lighton.jpg');  
  img2 = loadImage('lightoff.jpg');
  video = createVideo(['lightbroke.mp4']);
  video.hide();
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
  
  video.onended(() => {
    videoPlaying = false;
    toggleCount = 0;
    video.time(0);
    video.hide();
  });
}


function getScaledDimensions(sourceWidth, sourceHeight) {
  let ar_source = sourceWidth / sourceHeight;
  let ar_win = width / height;
  let drawW, drawH;
  

  if (ar_source > ar_win) {
   
    drawH = height;
    drawW = height * ar_source;
  } else {
  
    drawW = width;
    drawH = width / ar_source;
  }
  
  return { w: drawW, h: drawH };
}

function draw() {
  background(0);
  
  if(videoPlaying) {
   
    if (video.width > 0 && video.height > 0) {
      let scaled = getScaledDimensions(video.width, video.height);
      imageMode(CENTER);
      image(video, width/2, height/2, scaled.w, scaled.h);
    }
    return;
  }
  

  let scaled = getScaledDimensions(currentImg.width, currentImg.height);
  imageMode(CENTER);
  image(currentImg, width/2, height/2, scaled.w, scaled.h);
  

  if(currentImg === img1 && brightnessLevel > 0) {
    let brightness = map(brightnessLevel, 0, 10, 0, 150);
    let radius = map(brightnessLevel, 0, 10, 50, 400);
    
    let lightX = width/2 + 100;
    let lightY = height/2;
    
    for(let r = radius; r > 0; r -= 10){
      let alpha = map(r, 0, radius, brightness, 0);
      noStroke();
      fill(255, 255, 100, alpha * 0.2);
      circle(lightX, lightY, r * 2);
    }
  }
  
  drawSlider();
  
  // 클릭 횟수 표시
  fill(255);
  textAlign(CENTER, TOP);
  textSize(14);
  text('Clicks: ' + toggleCount, width/2, 10);
}

function drawSlider(){
  stroke(100);
  strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);
  
  fill(255, 255, 100);
  noStroke();
  circle(25, sliderY + sliderHeight / 2, 16);
}

function updateBrightness(){
  let normalizedPos = 1 - ((sliderY - sliderMinY) / (sliderMaxY - sliderMinY));
  brightnessLevel = ceil(normalizedPos * 10);
  brightnessLevel = constrain(brightnessLevel, 0, 10);
  
  if(brightnessLevel > 0){
    currentImg = img1;
  } else {
    currentImg = img2;
  }
}

function mousePressed(){
  if(videoPlaying){
    return false;
  }
  
  let distToSlider = dist(mouseX, mouseY, 25, sliderY + sliderHeight / 2);
  if(distToSlider < 20){
    isDraggingSlider = true;
    return false;
  }
  
  toggleCount++;
  
  if(toggleCount > 50 && currentImg === img2){
    videoPlaying = true;
    video.show();
    video.play();
    savedBrightnessLevel = brightnessLevel;
    return false;
  }
  
  if(currentImg === img1){
    currentImg = img2;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 5;
    let normalizedBrightness = brightnessLevel / 10;
    sliderY = sliderMaxY - (normalizedBrightness * (sliderMaxY - sliderMinY));
  }
  return false;
}

function mouseDragged(){
  if(isDraggingSlider && !videoPlaying){
    sliderY += movedY;
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
    return false;
  }
}

function mouseReleased(){
  isDraggingSlider = false;
}

function touchStarted(){
  if(videoPlaying){
    return false;
  }
  
  if(touches.length > 0){
    let touchX = touches[0].x;
    let touchY = touches[0].y;
    let distToSlider = dist(touchX, touchY, 25, sliderY + sliderHeight / 2);
    if(distToSlider < 20){
      isDraggingSlider = true;
      return false;
    }
  }
  
  toggleCount++;
  
  if(toggleCount > 50 && currentImg === img2){
    videoPlaying = true;
    video.show();
    video.play();
    savedBrightnessLevel = brightnessLevel;
    return false;
  }
  
  if(currentImg === img1){
    currentImg = img2;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 5;
    let normalizedBrightness = brightnessLevel / 10;
    sliderY = sliderMaxY - (normalizedBrightness * (sliderMaxY - sliderMinY));
  }
  return false;
}

function touchMoved(){
  if(isDraggingSlider && touches.length > 0 && !videoPlaying){
    sliderY += (touches[0].y - touches[0].py);
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
    return false;
  }
}

function touchEnded(){
  isDraggingSlider = false;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
