import type { KrillionPrompt } from "@/lib/types";
import type { P5CanvasInstance } from "@p5-wrapper/react";

export default function sketch(p5: P5CanvasInstance) {
  let pan = 0;
  let panStart = 0;
  let panTarget = 0;
  let panStartTime = 0;
  const panDurationMs = 3000;

  let prompt: KrillionPrompt | null = null;
  let titleVisible = true;

  p5.setup = function () {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.frameRate(60);
    p5.angleMode(p5.DEGREES);
  };

  p5.windowResized = function () {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  function drawWave(
    startX: number,
    startY: number,
    period: number,
    frequency: number,
    amplitude: number,
    waveColor: string,
    speed: number = 0.5,
    offset: number = 0,
    lineOnly: boolean = false
  ) {
    let amp = p5.map(p5.sin(p5.frameCount * speed), -1, 1, -amplitude, amplitude);
    p5.fill(waveColor);
    p5.noStroke();
    if (lineOnly) {
      p5.noFill();
      p5.stroke(waveColor);
      p5.strokeWeight(2);
    }
    p5.beginShape();
    if (!lineOnly) p5.vertex(startX, p5.height);
    for (let t = 0; t < 360; t++) {
      let x = p5.map(t, 0, 360, startX, startX + period);
      let y = startY - amp * p5.cos(t * frequency + p5.frameCount * speed + offset);
      p5.vertex(x, y);
    }
    if (!lineOnly) p5.vertex(startX + period, p5.height);

    if (lineOnly) {
      p5.endShape();
    } else {
      p5.endShape(p5.CLOSE);
    }
  }

  function drawTitle() {
    let title = "KRILLION";
    let charWidth = 34;
    let totalWidth = charWidth * (title.length - 1);
    let startX = p5.width / 2 - totalWidth / 2;
    let textY = 100 - pan;

    p5.textSize(50);
    p5.textFont("monospace");
    p5.textAlign("center", "bottom");
    for (let i = 0; i < title.length; i++) {
      const letter = title.substring(i, i + 1);
      let yOffset = p5.map(p5.sin(p5.frameCount * 2.5 + i * 20), -1, 1, -4, 4);
      let charY = textY - yOffset;
      p5.fill("#aae5f3");
      p5.text(letter, startX + i * charWidth, charY);
      p5.fill("#0a4d77");
      p5.text(letter, startX + i * charWidth + 2, charY - 2);
    }

    p5.fill("#1085c7");
    p5.textSize(20);
    p5.text("THE DAILY DIVE", p5.width / 2, textY + 40);
    p5.textSize(12);
    let instructions = "7 prompts · 25 seconds each · rarer answers sink deeper";
    if (p5.width < 450) {
      instructions = "7 prompts · 25 seconds each \nrarer answers sink deeper";
    }
    p5.text(instructions, p5.width / 2, textY + 70);
  }

  function drawFish(x: number, y: number) {
    p5.fill("#01132b");
    p5.ellipse(x, y, 20, 10); // body
    p5.triangle(x - 8, y, x - 18, y - 5, x - 18, y + 5); // tail
  }

  function drawPrompt(y: number) {
    const boxWidth = p5.max(300, p5.width * 0.5);
    const padding = 16;

    if (!prompt) return;
    const promptText = prompt.text;
    const textX = p5.width / 2 - boxWidth / 2 + padding;
    const textY = y + padding;
    const textWidth = boxWidth - padding * 2;

    p5.textFont("monospace");
    p5.textSize(20);
    p5.textAlign("left", "top");
    const textBounds = p5.textBounds(promptText, textX, textY, textWidth);
    const boxHeight = textBounds.h + padding * 2;
    p5.fill("#04132B");
    p5.rect(p5.width / 2 - boxWidth / 2, y, boxWidth, boxHeight, 10);
    p5.fill("#f2fcfe");
    p5.text(promptText, textX, textY, textWidth);
  }

  function drawCountdown() {
    const remainingSeconds = Math.ceil((panDurationMs - (p5.millis() - panStartTime)) / 1000);
    if (remainingSeconds <= 0 || pan === panTarget) return;

    p5.textSize(30);
    p5.fill("#f2fcfe");
    p5.text(remainingSeconds, p5.width / 2, p5.height - 80);
  }

  p5.draw = () => {
    const progress = p5.constrain((p5.millis() - panStartTime) / panDurationMs, 0, 1);
    const easedProgress = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;
    pan = p5.lerp(panStart, panTarget, easedProgress);

    p5.background("#f2fcfe");
    let waveStart = p5.max(230, p5.height * 0.4) - pan;
    let wavePeriod = p5.max(p5.width + 5, 1000);
    drawWave(0, waveStart, wavePeriod, 2, 5, "#aae5f3", 0.3, 50); // bg wave
    drawWave(0, waveStart + 10, wavePeriod, 2, 10, "#0a4d77", 0.6); // surface wave
    drawWave(0, waveStart + 10, wavePeriod, 2, 10, "#f2fcfe", 0.6, 0, true); // surface wave stroke
    drawWave(0, waveStart + 90, wavePeriod, 2, 5, "#052948", 0.2);
    drawWave(0, waveStart + 240, wavePeriod, 2, 5, "#01132b", 0.1);

    if (titleVisible) drawTitle();

    drawFish(100, waveStart + 60);

    drawPrompt(p5.max(waveStart + 25, 25));

    drawCountdown();

    if (window.krillion) {
      window.krillion.setPan = (newPan: number) => {
        if (newPan === panTarget) return;
        panStart = pan;
        panTarget = newPan;
        panStartTime = p5.millis();
      };
      window.krillion.setPrompt = (newPrompt: KrillionPrompt | null) => {
        prompt = newPrompt;
      };
      window.krillion.setTitleVisible = (visible: boolean) => {
        titleVisible = visible;
      };
    }
  };
}
