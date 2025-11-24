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

let permissionButton;

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

  // iOS 모션 권한 요청 버튼 생성 (필요시만)
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    permissionButton = createButton('Enable Motion Sensor');
    permissionButton.style('position', 'fixed');
    permissionButton.style('top', '10px');
    permissionButton.style('right', '10px');
    permissionButton.style('z-index', '9999');
    permissionButton.style('padding', '12px 20px');
    permissionButton.style('font-size', '18px');
    permissionButton.style('background', '#ffcc00');
    permissionButton.style('border', 'none');
    permissionButton.style('border-radius', '8px');
    permissionButton.style('box-shadow', '0 2px 6px rgba(0,0,0,0.3)');
    permissionButton.style('cursor', 'pointer');
    permissionButton.elt.style.userSelect = 'none';

    permissionButton.mousePressed((event) => {
      // 버튼 클릭 시 이벤트 캔슬링으로 뒤 터치 방지
      event.preventDefault();
      event.stopPropagation();

      requestMotionPermission();
    });
  }
}

function requestMotionPermission() {
  DeviceMotionEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        if (permissionButton) {
          permissionButton.remove();
          permissionButton = null;
        }
        window.addEventListener('devicemotion', detectShake);
      } else {
        alert('Motion sensor permission denied. Shake feature disabled.');
      }
    })
    .catch(err => {
      console.error('Permission request error:', err);
      alert('Motion sensor permission error.');
    });
}

let shakeThreshold = 15;
let lastShakeTime = 0;
let shakeCooldown = 1000;

function detectShake(event) {
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;

  const accX = acc.x || 0;
  const accY = acc.y || 0;
  const accZ = acc.z || 0;

  const totalAcc = Math.sqrt(accX*accX + accY*accY + accZ*accZ);

  const currentTime = millis();
  if (totalAcc > shakeThreshold && currentTime - lastShakeTime > shakeCooldown) {
    lastShakeTime = currentTime;

    // 모션으로 이미지 토글하되 터치 카운트는 증가시키지 않음
    if (currentImg === img2) {
      currentImg = img1;
      brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 2.5;
      let normalizedBrightness = brightnessLevel / 5;
      sliderY = sliderMaxY - normalizedBrightness * (sliderMaxY - sliderMinY);
    } else if (currentImg === img1) {
      currentImg = img2;
      savedBrightnessLevel = brightnessLevel;
      brightnessLevel = 0;
      sliderY = sliderMaxY;
    }
  }
}

function draw() {
  if (isPlayingVideo) return;

  background(0);

  const ar_img = currentImg.width / currentImg.height;
  const ar_win = width / height;
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

    const lightX = width / 1.8 + 100;
    const lightY = height / 2;

    for (let r = radius; r > 0; r -= 10) {
      const alpha = map(r, 0, radius, brightness, 0);
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
    sliderY += movedY;
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
  }
  return false;
}

function mouseReleased() {
  isDraggingSlider = false;
  return false;
}

function touchStarted() {
  if (isPlayingVideo) return false;

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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
