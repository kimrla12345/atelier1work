let img1, img2, currentImg;
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

// ========== ALWAYS ALIVE 변수 ==========
let lastInteractionTime = 0;
let isIdle = false;
let nextBlinkTime = 0;
let idleTimeout = 2000;
// ======================================

// ========== SHAKE 감지 변수 ==========
let lastShakeTime = 0;
let shakeDebounce = 500;
let permissionGranted = false;
// ====================================

// ========== 카메라 변수 ==========
let capture;
let cameraReady = false;
let isDark = false;  // 현재 어두운지 여부
let darknessThreshold = 50;  // 어두움 판단 임계값 (0-255)
// ===============================

function preload() {
  img1 = loadImage('lighton.jpg');  
  img2 = loadImage('lightoff.jpg');
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');

  c.elt.style.touchAction = "none";

  videoElement = document.createElement('video');

  videoElement.setAttribute('playsinline', 'playsinline');     
  videoElement.setAttribute('webkit-playsinline', 'webkit-playsinline'); 
  videoElement.playsInline = true;                             

  videoElement.src = 'lightbroke.mp4';

  videoElement.style.display = 'none';
  videoElement.style.position = 'fixed';
  videoElement.style.top = '0';
  videoElement.style.left = '0';
  videoElement.style.width = '100vw';
  videoElement.style.height = '100vh';
  videoElement.style.objectFit = 'cover';
  videoElement.style.objectPosition = 'center';
  videoElement.style.zIndex = '1000';
  videoElement.style.backgroundColor = '#000';

  document.body.appendChild(videoElement);

  videoElement.addEventListener('ended', onVideoEnded);

  currentImg = img2;

  sliderMaxY = height - 50 - sliderHeight;
  sliderY = sliderMaxY;
  
  lastInteractionTime = millis();
  
  // ========== SHAKE 설정 ==========
  if (typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission !== 'function') {
    window.addEventListener('devicemotion', handleShake);
    permissionGranted = true;
  }
  // ===============================
  
  // ========== 카메라 설정 (후면 카메라) ==========
  let constraints = {
    video: {
      facingMode: { ideal: "environment" }  // 후면 카메라
    },
    audio: false
  };
  
  capture = createCapture(constraints);
  capture.size(160, 120);  // 작은 크기로 성능 최적화
  capture.hide();  // 화면에 안 보이게
  
  // 카메라 준비될 때까지 대기
  capture.elt.addEventListener('loadeddata', () => {
    cameraReady = true;
  });
  // ============================================
}

// ========== SHAKE 감지 함수 ==========
function handleShake(event) {
  if (!permissionGranted || isPlayingVideo) return;
  
  let accel = event.acceleration || event.accelerationIncludingGravity;
  if (!accel || accel.x === null) return;
  
  let x = accel.x || 0;
  let y = accel.y || 0;
  let z = accel.z || 0;
  let total = Math.sqrt(x*x + y*y + z*z);
  
  if (total > 15 && millis() - lastShakeTime > shakeDebounce) {
    lastInteractionTime = millis();
    isIdle = false;
    
    if (currentImg === img1) {
      currentImg = img2;
      savedBrightnessLevel = brightnessLevel;
      brightnessLevel = 0;
      sliderY = sliderMaxY;
    } else {
      currentImg = img1;
      brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 2.5;
      sliderY = sliderMaxY - ((brightnessLevel / 5) * (sliderMaxY - sliderMinY));
    }
    
    lastShakeTime = millis();
  }
}
// ===================================

// ========== 카메라 밝기 감지 함수 ==========
function checkCameraBrightness() {
  if (!cameraReady) return;
  
  capture.loadPixels();
  let totalBrightness = 0;
  let pixelCount = 0;
  
  // 모든 픽셀의 평균 밝기 계산
  for (let i = 0; i < capture.pixels.length; i += 4) {
    let r = capture.pixels[i];
    let g = capture.pixels[i + 1];
    let b = capture.pixels[i + 2];
    let brightness = (r + g + b) / 3;
    totalBrightness += brightness;
    pixelCount++;
  }
  
  let avgBrightness = totalBrightness / pixelCount;
  
  // ⭐ 어두우면 (손으로 가림) → 램프 켜기
  if (avgBrightness < darknessThreshold) {
    if (!isDark) {
      // 방금 어두워짐
      isDark = true;
      currentImg = img1;
      brightnessLevel = 3;
      lastInteractionTime = millis();  // Idle 타이머 리셋
    }
  } 
  // ⭐ 밝으면 (손 치움) → 램프 끄기
  else {
    if (isDark) {
      // 방금 밝아짐
      isDark = false;
      currentImg = img2;
      brightnessLevel = 0;
      isIdle = false;  // Idle 멈춤
    }
  }
}
// =========================================

function draw() {
  if (isPlayingVideo) {
    return;
  }

  background(0);
  
  // ========== 카메라 밝기 체크 (매 프레임) ==========
  checkCameraBrightness();
  // ==============================================

  // ========== ALWAYS ALIVE: Idle 깜빡임 ==========
  let currentTime = millis();
  
  // ⭐ 조건: 어두울 때만(isDark) AND 2초 경과 AND 슬라이더 조작 안 함
  if (isDark && currentTime - lastInteractionTime > idleTimeout && !isDraggingSlider) {
    isIdle = true;
    
    if (currentTime > nextBlinkTime) {
      // 랜덤하게 on/off
      if (random() > 0.5) {
        currentImg = img1;
        brightnessLevel = random(1, 3);
      } else {
        currentImg = img2;
        brightnessLevel = 0;
      }
      
      nextBlinkTime = currentTime + random(300, 800);
    }
  } else {
    if (!isDark) {
      isIdle = false;  // 밝을 때는 Idle 없음
    }
  }
  // ===============================================

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
    let brightness = map(brightnessLevel, 0.1, 5, 0, 150);
    let radius = map(brightnessLevel, 0.1, 5, 50, 400);

    let lightX = width / 1.8 + 100;
    let lightY = height / 2;

    for (let r = radius; r > 0; r -= 10) {
      let alpha = map(r, 0, radius, brightness, 0);
      noStroke();
      fill(255, 255, 100, alpha * 0.2);
      circle(lightX, lightY, r * 2);
    }
  }

  drawSlider();

  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  text('Click: ' + touchCount, width/2, 20);
  
  // ========== 디버깅용 (밝기 표시) ==========
  fill(255, 200);
  textSize(12);
  text(isDark ? 'Dark (Lamp ON)' : 'Bright (Lamp OFF)', width/2, 60);
  // ======================================
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
  brightnessLevel = constrain(normalizedPos * 5, 0, 5);

  if (brightnessLevel > 0.1) {
    currentImg = img1;
  } else {
    currentImg = img2;
  }
}

function mousePressed() {
  if (isPlayingVideo) return false;

  lastInteractionTime = millis();
  isIdle = false;

  if (!permissionGranted && typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(res => {
      if (res === 'granted') {
        window.addEventListener('devicemotion', handleShake);
        permissionGranted = true;
      }
    });
  }

  if (dist(mouseX, mouseY, 25, sliderY + sliderHeight / 2) < 25) {
    isDraggingSlider = true;
    return false;
  }

  toggleImage();
  return false;
}

function mouseDragged() {
  if (isPlayingVideo) return false;

  if (isDraggingSlider) {
    lastInteractionTime = millis();
    isIdle = false;
    
    sliderY += movedY;
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
  }
  return false;
}

function mouseReleased() {
  isDraggingSlider = false;
  lastInteractionTime = millis();
  return false;
}

function touchStarted() {
  if (isPlayingVideo) return false;

  lastInteractionTime = millis();
  isIdle = false;

  if (!permissionGranted && typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(res => {
      if (res === 'granted') {
        window.addEventListener('devicemotion', handleShake);
        permissionGranted = true;
      }
    });
  }

  if (touches.length > 0) {
    let t = touches[0];
    let distToSlider = dist(t.x, t.y, 25, sliderY + sliderHeight / 2);

    if (distToSlider < 25) {
      isDraggingSlider = true;
      lastTouchY = t.y;
      return false;
    }
  }

  this._tapCandidate = true;

  return false;
}

function touchMoved() {
  if (isPlayingVideo) return false;

  if (isDraggingSlider && touches.length > 0) {
    lastInteractionTime = millis();
    isIdle = false;
    
    let t = touches[0];

    if (lastTouchY !== null) {
      let dy = t.y - lastTouchY;
      sliderY += dy;
      sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
      updateBrightness();
    }

    lastTouchY = t.y;
  }

  this._tapCandidate = false;

  return false;
}

function touchEnded() {
  if (isPlayingVideo) return false;

  isDraggingSlider = false;
  lastTouchY = null;

  lastInteractionTime = millis();

  if (this._tapCandidate) {
    toggleImage();
  }

  this._tapCandidate = false;

  return false;
}

function toggleImage() {
  touchCount++;

  if (touchCount === 100) {
    playVideo();
    return;
  }

  if (currentImg === img1) {
    currentImg = img2;
    savedBrightnessLevel = brightnessLevel;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    currentImg = img1;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 2.5;
    let normalizedBrightness = brightnessLevel / 5;
    sliderY = sliderMaxY - (normalizedBrightness * (sliderMaxY - sliderMinY));
  }
}

function playVideo() {
  isPlayingVideo = true;
  videoElement.style.display = 'block';
  videoElement.currentTime = 0;

  videoElement.play().catch(err => {
    console.error('Video playback failed:', err);
    resetAfterVideo();
  });
}

function onVideoEnded() {
  resetAfterVideo();
}

function resetAfterVideo() {
  isPlayingVideo = false;
  videoElement.style.display = 'none';
  videoElement.pause();
  videoElement.currentTime = 0;

  touchCount = 0;
  currentImg = img2;
  brightnessLevel = 0;
  savedBrightnessLevel = 0;
  sliderY = sliderMaxY;
  
  lastInteractionTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
