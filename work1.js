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
let permissionButton;
let permissionGranted = false;

function preload() {
  lightonImg = loadImage('lighton.jpg');  
  lightoffImg = loadImage('lightoff.jpg');
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');

  c.elt.style.touchAction = "none";

  videoElement = document.createElement('video');
  videoElement.setAttribute('playsinline', ''); 
  videoElement.setAttribute('webkit-playsinline', '');
  videoElement.playsInline = true;
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

  // iOS 모션 권한 요청 버튼 생성
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    permissionButton = createButton('Enable Shake Permission');
    permissionButton.position(width / 2 - 90, height / 2);
    permissionButton.size(180, 50);
    permissionButton.style('font-size', '16px');
    permissionButton.style('background-color', '#32B8C6');
    permissionButton.style('color', 'white');
    permissionButton.style('border', 'none');
    permissionButton.style('border-radius', '8px');
    permissionButton.style('cursor', 'pointer');
    permissionButton.style('z-index', '1000');
    permissionButton.mousePressed(() => {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            permissionGranted = true;
            window.addEventListener('devicemotion', handleShake);
            permissionButton.remove();
          } else {
            alert('Shake permission is required for this feature.');
          }
        })
        .catch(() => alert('Permission request failed.'));
    });
  } else {
    // iOS 미지원, 일반 브라우저용
    permissionGranted = true;
    window.addEventListener('devicemotion', handleShake);
  }
}

function handleShake(event) {
  if (!permissionGranted || isPlayingVideo) return;

  const accel = event.accelerationIncludingGravity;
  if (!accel || accel.x === null) return;

  const deltaX = Math.abs(accel.x - lastAcc.x);
  const deltaY = Math.abs(accel.y - lastAcc.y);
  const deltaZ = Math.abs(accel.z - lastAcc.z);
  const totalDelta = deltaX + deltaY + deltaZ;
  const now = Date.now();

  if (totalDelta > 12 && now - lastShakeTime > 250) {
    lastShakeTime = now;

    // 이미지 토글
    if (currentImg === lightoffImg) {
      currentImg = lightonImg;
    } else {
      currentImg = lightoffImg;
      savedBrightnessLevel = brightnessLevel;
      brightnessLevel = 0;
      sliderY = sliderMaxY;
    }
  }

  lastAcc = { x: accel.x, y: accel.y, z: accel.z };
}

function draw() {
  if (isPlayingVideo) return;

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

  if (currentImg === lightonImg && brightnessLevel > 0) {
    let brightness = map(brightnessLevel, 0.1, 5, 0, 150);
    let radius = map(brightnessLevel, 0.1, 5, 50, 400);
    let lightX = width / 1.8 + 100;
    let lightY = height / 2;

    for (let r = radius; r > 0; r -= 10) {
      noStroke();
      fill(255, 255, 100, brightness * 0.2 * (r / radius));
      circle(lightX, lightY, r * 2);
    }
  }

  stroke(100); strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);
  fill(255, 255, 100);
  noStroke();
  circle(25, sliderY + sliderHeight / 2, 16);

  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  text('Click: ' + touchCount, width / 2, 20);
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

  if (touches.length > 0) {
    let t = touches[0];
    if (dist(t.x, t.y, 25, sliderY + sliderHeight / 2) < 25) {
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
      sliderY = constrain(sliderY + dy, sliderMinY, sliderMaxY);
      brightnessLevel = constrain((1 - (sliderY - sliderMinY) / (sliderMaxY - sliderMinY)) * 5, 0, 5);
      currentImg = brightnessLevel > 0.1 ? lightonImg : lightoffImg;
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

  if (currentImg === lightonImg) {
    currentImg = lightoffImg;
    savedBrightnessLevel = brightnessLevel;
    brightnessLevel = 0;
    sliderY = sliderMaxY;
  } else {
    currentImg = lightonImg;
    brightnessLevel = savedBrightnessLevel > 0 ? savedBrightnessLevel : 2.5;
    sliderY = sliderMaxY - (brightnessLevel / 5) * (sliderMaxY - sliderMinY);
  }
}

function playVideo() {
  isPlayingVideo = true;
  videoElement.style.display = 'block';
  videoElement.currentTime = 0;

  videoElement.play().catch(() => {
    isPlayingVideo = false;
    videoElement.style.display = 'none';
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
