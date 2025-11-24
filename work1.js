let permissionGranted = false;
let lastShakeTime = 0;
let shakeCooldown = 500; // 0.5초
let shakeThreshold = 8;  // 아주 약한 흔들림에도 반응함

let lightOnImg, lightOffImg;
let currentLight = "off";
let clickCount = 0;

function preload() {
  lightOnImg = loadImage("lighton.jpg");
  lightOffImg = loadImage("lightoff.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // iOS에서 반드시 필요한 버튼
  createMotionButton();
}

function draw() {
  background(255);

  if (currentLight === "on") {
    image(lightOnImg, 0, 0, width, height);
  } else {
    image(lightOffImg, 0, 0, width, height);
  }
}

// -----------------------------
// ★ iOS 권한 버튼 생성
// -----------------------------
function createMotionButton() {
  let btn = createButton("Enable Motion");
  btn.style("font-size", "20px");
  btn.style("padding", "12px 20px");
  btn.position(20, 20);

  btn.mousePressed(async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === "granted") {
          permissionGranted = true;
          window.addEventListener("devicemotion", handleShake);
          btn.remove(); // 버튼 제거
        }
      } catch (err) {
        console.log("Permission error:", err);
      }
    } else {
      // Android 등 iOS 이외 기기
      permissionGranted = true;
      window.addEventListener("devicemotion", handleShake);
      btn.remove();
    }
  });
}

// -----------------------------
// ★ 흔들림 감지
// -----------------------------
function handleShake(event) {
  if (!permissionGranted) return;

  let ax = event.accelerationIncludingGravity.x;
  let ay = event.accelerationIncludingGravity.y;
  let az = event.accelerationIncludingGravity.z;

  let total = abs(ax) + abs(ay) + abs(az);

  if (total > shakeThreshold) {
    let now = millis();
    if (now - lastShakeTime > shakeCooldown) {
      lastShakeTime = now;
      toggleLightByShake();
    }
  }
}

// -----------------------------
// ★ 흔들어서 켜고 끄기
// -----------------------------
function toggleLightByShake() {
  if (currentLight === "off") {
    currentLight = "on";
    // 흔들어서 켜졌을 때는 클릭 count 증가 없음
  } else {
    currentLight = "off";
  }
}

// -----------------------------
// ★ 기존의 클릭 방식 조명 켜기(너의 기존 로직 유지)
// -----------------------------
function mousePressed() {
  clickCount++;
}
