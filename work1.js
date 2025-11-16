let img1, img2, currentImg;
let vid;
let showVideo = false;

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
  vid = createVideo(['lightbroke.mp4']);
  vid.hide(); 
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrap');
  currentImg = img2;

  sliderMaxY = height - 50 - sliderHeight;
  sliderY = sliderMaxY;

  // 안드로이드 터치 중복 방지
  isDraggingSlider = false;
}

function draw() {
  background(0);

  // 🔥 60회 이후 -> 영상 화면 전환 모드
  if (showVideo) {
    drawVideo();
    return;
  }

  // 이미지 렌더링
  drawFittedImage(currentImg);

  // Light 효과
  if (currentImg === img1 && brightnessLevel > 0) {
    drawLightEffect();
  }

  // 슬라이더
  drawSlider();

  // 클릭 카운트
  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  text('Clicks: ' + touchCount, width / 2, 20);
}

/* ----------------------------- */
/* 화면 비율에 맞게 이미지 렌더링 */
/* ----------------------------- */
function drawFittedImage(pic) {
  let ar_img = pic.width / pic.height;
  let ar_win = width / height;
  let w, h;

  if (ar_img > ar_win) {
    h = height;
    w = h * ar_img;
  } else {
    w = width;
    h = w / ar_img;
  }
  imageMode(CENTER);
  image(pic, width / 2, height / 2, w, h);
}

/* ------------------------- */
/* 영상 화면 전체 렌더링 기능 */
/* ------------------------- */
function drawVideo() {
  let ar_vid = vid.width / vid.height;
  let ar_win = width / height;

  let w, h;
  if (ar_vid > ar_win) {
    h = height;
    w = h * ar_vid;
  } else {
    w = width;
    h = w / ar_vid;
  }

  imageMode(CENTER);
  image(vid, width / 2, height / 2, w, h);
}

/* ------------------------- */
function drawLightEffect() {
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

/* ------------------------- */
function drawSlider() {
  stroke(100);
  strokeWeight(2);
  line(25, sliderMinY, 25, height - 50);

  fill(255, 255, 100);
  noStroke();
  circle(25, sliderY + sliderHeight / 2, 16);
}

/* ----------------------------- */
/* 밝기 업데이트                 */
/* ----------------------------- */
function updateBrightness() {
  let normalizedPos = 1 - ((sliderY - sliderMinY) / (sliderMaxY - sliderMinY));
  brightnessLevel = normalizedPos * 5;
  brightnessLevel = constrain(brightnessLevel, 0, 5);

  if (brightnessLevel > 0.1) currentImg = img1;
  else currentImg = img2;
}

/* ----------------------------- */
/* 공통 클릭 처리 함수          */
/* ----------------------------- */
function handleToggle() {
  touchCount++;

  // 🎬 61번째에서 영상 실행
  if (touchCount === 61) {
    startVideo();
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

/* ----------------------------- */
/* 영상 실행 + 종료 후 초기화    */
/* ----------------------------- */
function startVideo() {
  showVideo = true;
  vid.show();
  vid.loop();
  vid.volume(0);

  // 영상 끝 확인 → 초기화
  vid.onended(() => {
    resetSystem();
  });
}

function resetSystem() {
  vid.stop();
  vid.hide();
  showVideo = false;

  touchCount = 0;
  currentImg = img2;
  brightnessLevel = 0;
  sliderY = sliderMaxY;
}

/* ----------------------------- */
/* 마우스 + 터치 입력 통합 처리 */
/* ----------------------------- */

function mousePressed() {
  return commonPress(mouseX, mouseY);
}
function touchStarted() {
  if (touches.length > 0) return commonPress(touches[0].x, touches[0].y);
  return false;
}

function commonPress(x, y) {
  if (showVideo) return false;

  let distToSlider = dist(x, y, 25, sliderY + sliderHeight / 2);

  if (distToSlider < 25) {
    isDraggingSlider = true;
    return false;
  }

  handleToggle();
  return false;
}

function mouseDragged() {
  return commonDrag(mouseY - pmouseY);
}
function touchMoved() {
  if (touches.length > 0)
    return commonDrag(touches[0].y - touches[0].py);
}

function commonDrag(deltaY) {
  if (showVideo) return false;

  if (isDraggingSlider) {
    sliderY += deltaY;
    sliderY = constrain(sliderY, sliderMinY, sliderMaxY);
    updateBrightness();
  }
  return false;
}

function mouseReleased() {
  isDraggingSlider = false;
}
function touchEnded() {
  isDraggingSlider = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderMaxY = height - 50 - sliderHeight;
}
