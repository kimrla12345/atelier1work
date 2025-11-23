let lightonImg, lightoffImg, currentImg;
let sliderY = 0;
let sliderHeight = 30;
let brightnessLevel = 0;
let isDraggingSlider = false;
let sliderMinY = 50;
let sliderMaxY = 0;
let savedBrightnessLevel = 0;
let touchCount = 0;
let lastTouchY = null;
let videoElement;
let isPlayingVideo = false;
let lastShakeTime = 0;
let lastAcc = { x: 0, y: 0, z: 0 };

function preload() {
  lightonImg = loadImage('lighton.jpg');  
  lightoffImg = loadImage('lightoff.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent('canvasWrap');
  
  videoElement = document.createElement('video');
  videoElement.setAttribute('playsinline', '');
  videoElement.src = 'lightbroke.mp4';
  videoElement.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:1000;background:#000';
  videoElement.addEventListener('ended', () => {
    videoElement.style.display = 'none';
    videoElement.pause();
    isPlayingVideo = false;
    touchCount = 0;
    currentImg = lightoffImg;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  });
  document.body.appendChild(videoElement);

  currentImg = lightoffImg;
  sliderMaxY = height - 50 - sliderHeight;
  sliderY = sliderMaxY;
  
  const requestPermission = () => {
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(r => {
        if (r === 'granted') window.addEventListener('devicemotion', handleShake);
      }).catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleShake);
    }
  };
  
  document.body.addEventListener('touchstart', requestPermission, { once: true });
  document.body.addEventListener('click', requestPermission, { once: true });
}

function handleShake(e) {
  if (isPlayingVideo) return;
  const c = e.accelerationIncludingGravity;
  if (!c?.x) return;
  
  const delta = Math.abs(c.x - lastAcc.x) + Math.abs(c.y - lastAcc.y) + Math.abs(c.z - lastAcc.z);
  const now = Date.now();
  
  if (delta > 12 && now - lastShakeTime > 250) {
    lastShakeTime = now;
    if (currentImg === lightoffImg) {
      currentImg = lightonImg;
    } else {
      currentImg = lightoffImg;
      savedBrightnessLevel = brightnessLevel;
      brightnessLevel = 0;
      sliderY = sliderMaxY;
    }
  }
  
  lastAcc = { x: c.x, y: c.y, z: c.z };
}

function draw() {
  if (isPlayingVideo) return;
  
  background(0);
  
  let ar = currentImg.width / currentImg.height;
  let drawW = ar > width/height ? height * ar : width;
  let drawH = ar > width/height ? height : width / ar;
  
  imageMode(CENTER);
  image(currentImg, width/2, height/2, drawW, drawH);
  
  if (currentImg === lightonImg && brightnessLevel > 0) {
    let b = map(brightnessLevel, 0.1, 5, 0, 150);
    let r = map(brightnessLevel, 0.1, 5, 50, 400);
    let x = width/1.8 + 100, y = height/2;
    for (let i = r; i > 0; i -= 10) {
      noStroke();
      fill(255, 255, 100, map(i, 0, r, b, 0) * 0.2);
      circle(x, y, i * 2);
    }
  }
  
  stroke(100); strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);
  fill(255, 255, 100); noStroke();
  circle(25, sliderY + 15, 16);
  
  fill(255); textAlign(CENTER, TOP); textSize(16);
  text('Click: ' + touchCount, width/2, 20);
}

function mousePressed() {
  if (isPlayingVideo) return false;
  if (dist(mouseX, mouseY, 25, sliderY + 15) < 25) {
    isDraggingSlider = true;
    return false;
  }
  toggleImage();
  return false;
}

function mouseDragged() {
  if (isDraggingSlider && !isPlayingVideo) {
    sliderY = constrain(sliderY + movedY, sliderMinY, sliderMaxY);
    brightnessLevel = constrain((1 - (sliderY - sliderMinY) / (sliderMaxY - sliderMinY)) * 5, 0, 5);
    currentImg = brightnessLevel > 0.1 ? lightonImg : lightoffImg;
  }
  return false;
}

function mouseReleased() {
  isDraggingSlider = false;
  return false;
}

function touchStarted() {
  if (isPlayingVideo) return false;
  if (touches[0] && dist(touches[0].x, touches[0].y, 25, sliderY + 15) < 25) {
    isDraggingSlider = true;
    lastTouchY = touches[0].y;
    return false;
  }
  this._tap = true;
  return false;
}

function touchMoved() {
  if (isDraggingSlider && !isPlayingVideo && touches[0]) {
    if (lastTouchY) {
      sliderY = constrain(sliderY + touches[0].y - lastTouchY, sliderMinY, sliderMaxY);
      brightnessLevel = constrain((1 - (sliderY - sliderMinY) / (sliderMaxY - sliderMinY)) * 5, 0, 5);
      currentImg = brightnessLevel > 0.1 ? lightonImg : lightoffImg;
    }
    lastTouchY = touches[0].y;
  }
  this._tap = false;
  return false;
}

function touchEnded() {
  if (isPlayingVideo) return false;
  isDraggingSlider = false;
  lastTouchY = null;
  if (this._tap) toggleImage();
  this._tap = false;
  return false;
}

function toggleImage() {
  if (++touchCount === 100) {
    isPlayingVideo = true;
    videoElement.style.display = 'block';
    videoElement.currentTime = 0;
    videoElement.play().catch(() => {
      isPlayingVideo = false;
      videoElement.style.display = 'none';
    });
    return;
  }
  
  if (currentImg === lightonImg) {
    currentImg = lightoffImg;
    savedBrightnessLevel = brightnessLevel;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    currentImg = lightonImg;
    brightnessLevel = savedBrightnessLevel || 2.5;
    sliderY = sliderMaxY - (brightnessLevel / 5) * (sliderMaxY - sliderMinY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
