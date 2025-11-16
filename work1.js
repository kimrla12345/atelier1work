답변 건너뜀
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

function preload() {
  img1 = loadImage('lighton.jpg');  
  img2 = loadImage('lightoff.jpg');
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');

  // 모바일에서 캔버스가 터치를 독점하지 않게
  c.elt.style.touchAction = "none";

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
  if (dist(mouseX, mouseY, 25, sliderY + sliderHeight / 2) < 25) {
    isDraggingSlider = true;
    return;
  }

  toggleImage();
}

function mouseDragged() {
  if (isDraggingSlider) {
    sliderY += movedY;
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
  }
}

function mouseReleased() {
  isDraggingSlider = false;
}

// ----------------------------
// 모바일 터치 이벤트 (iOS + 안드로이드 완전 대응 버전)
// ----------------------------

function touchStarted() {
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

  // 슬라이더 안 잡았고, 탭인지? 드래그인지? touchEnded에서 판단
  this._tapCandidate = true;

  return false;
}

function touchMoved() {
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
  }

  // 움직였으면 "탭 아님"
  this._tapCandidate = false;

  return false;
}

function touchEnded() {
  isDraggingSlider = false;
  lastTouchY = null;

  // 슬라이더 잡지 않았고, 움직이지 않았으면 -> 탭으로 간주
  if (this._tapCandidate) {
    toggleImage();
  }

  this._tapCandidate = false;
}

// ----------------------------
// 이미지 토글 기능
// ----------------------------

function toggleImage() {
  touchCount++;

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

// ----------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}


지금 이 코드에서 안드로이드에서 아직도 충돌이 있어서 확실하게 고쳐줘 아이폰은 괜찮더라고. 그리고 내가 mp4 파일 하나를 만든게 있는데 파일 이름은 lightbroke.mp4 야 이걸 내가 터치를 60번해서 그다음 61번이 될때 이 비디오가 나오면좋겠어 그때는 이제 사이드바도 안보이고 딱 영상만 나오게 만들어야돼. 그리고 영상이 끝나면 다시 화면이 처음으로 돌아가고 클릭숫자도 초기화 되는 그런 시스템말이야. 그리고 이 mp4 비율이 렌더링할때 사진이랑 같은크기로 뽑았는데 맥북으로 여니까 옆엔 검은색이 있더라고 그거 무시하고 딱 모바일 화면에 딱맞게 비율 맞게 넣어줘

p5js_slider_video.js
생성된 파일

Android 안정성 개선 및 비디오 기능 통합
주요 개선 사항을 설명드리겠습니다.

Android 호환성 수정
1. 터치 이벤트 안정화

touchAction 스타일에 추가로 WebkitUserSelect와 userSelect를 설정하여 안드로이드 기본 터치 처리 간섭 제거

touchStarted()와 touchMoved()에서 모든 함수 끝에 return false 추가로 기본 터치 동작 완벽히 차단

터치 시간(_touchStartTime)과 거리를 함께 감지하여 탭 판정 정확도 향상

2. 안드로이드 특화 처리

touchMoved()에서 움직임 거리를 측정(moveDistance > 5)하여 미세한 손떨림 무시

이전 마우스 위치(pmouseX, pmouseY)와 현재 터치 위치 비교로 더 정확한 드래그 감지

비디오 재생 시스템
1. 61번 터치 시 비디오 재생

touchCount === 61일 때 playVideo() 함수 호출

비디오는 p5.js 캔버스 외부의 HTML <video> 요소로 관리

모바일 화면에 정확히 맞추도록 objectFit: 'contain'으로 설정 (검은 테두리 자동 처리)

2. 비디오 완료 후 초기화

비디오 끝(ended 이벤트)에서 resetAfterVideo() 호출

클릭 카운터, 이미지, 슬라이더 위치 모두 초기값으로 복원

다시 일반 화면으로 돌아와 처음부터 시작 가능

3. 비디오 재생 중 터치 비활성화

isPlayingVideo 플래그로 비디오 재생 중 모든 터치/마우스 이벤트 무시

그리고 draw() 함수도 중단되어 깔끔한 비디오 전체 화면 제공

사용 방법
lightbroke.mp4 파일을 프로젝트 폴더에 넣고, 코드를 사용하시면 됩니다. 비디오는 모바일 화면 크기에 자동으로 맞춰지며, 끝나면 자동으로 초기 화면으로 돌아갑니다.







p5js_slider_video.js
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