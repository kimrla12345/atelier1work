let img1, img2, currentImg;
let videoElement;
let sliderY = 0;
let sliderHeight = 30;
let brightnessLevel = 0;
let isDraggingSlider = false;
let sliderMinY = 50;
let sliderMaxY = 0;
let savedBrightnessLevel = 0;
let touchCount = 0;
let lastTouchY = null;
let isPlayingVideo = false;
let videoStarted = false;

function preload() {
  img1 = loadImage('lighton.jpg');  
  img2 = loadImage('lightoff.jpg');
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');

  // 안드로이드/iOS 터치 처리 최적화
  c.elt.style.touchAction = "none";
  c.elt.style.WebkitUserSelect = "none";
  c.elt.style.userSelect = "none";

  // 비디오 요소 생성 (p5.js 외부에서 관리)
  videoElement = document.createElement('video');
  videoElement.src = 'lightbroke.mp4';
  videoElement.style.display = 'none';
  videoElement.style.width = '100vw';
  videoElement.style.height = '100vh';
  videoElement.style.objectFit = 'contain';
  videoElement.style.objectPosition = 'center';
  videoElement.style.position = 'fixed';
  videoElement.style.top = '0';
  videoElement.style.left = '0';
  videoElement.style.zIndex = '1000';
  videoElement.style.backgroundColor = '#000';
  document.body.appendChild(videoElement);

  videoElement.addEventListener('ended', onVideoEnded);

  currentImg = img2;
  sliderMaxY = height - 50 - sliderHeight;
  sliderY = sliderMaxY;
}

function draw() {
  if (isPlayingVideo) {
    return;
  }

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

  // 조명 효과
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

  // 클릭/터치 횟수
  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  text('Clicks: ' + touchCount, width/2, 20);
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

// ----------------------------
// PC 마우스 이벤트
// ----------------------------

function mousePressed() {
  if (isPlayingVideo) {
    return;
  }

  if (dist(mouseX, mouseY, 25, sliderY + sliderHeight / 2) < 25) {
    isDraggingSlider = true;
    return false;
  }

  toggleImage();
  return false;
}

function mouseDragged() {
  if (isPlayingVideo) {
    return false;
  }

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

// ----------------------------
// 모바일 터치 이벤트 (안드로이드 호환 버전)
// ----------------------------

function touchStarted() {
  if (isPlayingVideo) {
    return false;
  }

  if (touches.length > 0) {
    let t = touches[0];
    let distToSlider = dist(t.x, t.y, 25, sliderY + sliderHeight / 2);

    // 슬라이더 잡으면 드래그 모드
    if (distToSlider < 25) {
      isDraggingSlider = true;
      lastTouchY = t.y;
      return false;
    }
  }

  // 탭 후보 표시
  this._tapCandidate = true;
  this._touchStartTime = millis();

  return false;
}

function touchMoved() {
  if (isPlayingVideo) {
    return false;
  }

  // 슬라이더 드래그 중
  if (isDraggingSlider && touches.length > 0) {
    let t = touches[0];

    if (lastTouchY !== null) {
      let dy = t.y - lastTouchY;
      sliderY += dy;
      sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
      updateBrightness();
    }

    lastTouchY = t.y;
    this._tapCandidate = false;
  } else if (touches.length > 0) {
    // 슬라이더 아닌 곳에서 움직이면 탭 아님
    let t = touches[0];
    let moveDistance = dist(t.x, t.y, pmouseX, pmouseY);
    if (moveDistance > 5) {
      this._tapCandidate = false;
    }
  }

  return false;
}

function touchEnded() {
  if (isPlayingVideo) {
    return false;
  }

  isDraggingSlider = false;
  lastTouchY = null;

  // 움직임이 거의 없고 시간이 짧으면 탭으로 간주
  if (this._tapCandidate && millis() - this._touchStartTime < 300) {
    toggleImage();
  }

  this._tapCandidate = false;
  this._touchStartTime = null;

  return false;
}

// ----------------------------
// 이미지 토글 기능 + 비디오 재생
// ----------------------------

function toggleImage() {
  touchCount++;

  // 60번째 터치 후 61번째에 비디오 재생
  if (touchCount === 61) {
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
  
  // 초기 상태로 리셋
  touchCount = 0;
  currentImg = img2;
  brightnessLevel = 0;
  savedBrightnessLevel = 0;
  sliderY = sliderMaxY;
}

// ----------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}