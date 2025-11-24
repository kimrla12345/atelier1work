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
  // 안드로이드 자동 활성화
  if (typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission !== 'function') {
    window.addEventListener('devicemotion', handleShake);
    permissionGranted = true;
  }
  // ===============================
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
    // ⭐ 흔들기 = 상호작용 (Idle 멈춤)
    lastInteractionTime = millis();
    isIdle = false;
    
    // ⭐ 이미지 토글 (touchCount는 증가 안 함!)
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

function draw() {
  if (isPlayingVideo) {
    return;
  }

  background(0);

  // ========== ALWAYS ALIVE: Idle 깜빡임 ==========
  let currentTime = millis();
  
  // ⭐ 조건: 2초 동안 터치 없음 AND 슬라이더 조작 중이 아님
  if (currentTime - lastInteractionTime > idleTimeout && !isDraggingSlider) {
    isIdle = true;
    
    if (currentTime > nextBlinkTime) {
      // 랜덤하게 on/off (touchCount는 절대 증가 안 함!)
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
    isIdle = false;
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

  // ========== 상호작용 시간 업데이트 ==========
  lastInteractionTime = millis();
  isIdle = false;
  // =========================================

  // ========== iOS 권한 요청 (첫 클릭 시) ==========
  if (!permissionGranted && typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(res => {
      if (res === 'granted') {
        window.addEventListener('devicemotion', handleShake);
        permissionGranted = true;
      }
    });
  }
  // =============================================

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

  // ========== iOS 권한 요청 (첫 터치 시) ==========
  if (!permissionGranted && typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(res => {
      if (res === 'granted') {
        window.addEventListener('devicemotion', handleShake);
        permissionGranted = true;
      }
    });
  }
  // =============================================

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
  touchCount++;  // ← 사용자 클릭만 카운트!

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
