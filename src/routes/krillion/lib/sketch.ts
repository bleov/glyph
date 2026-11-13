import type { KrillionPrompt } from "@/lib/types";
import type { P5CanvasInstance } from "@p5-wrapper/react";
import { easeInOutBack, easeInOutQuad, easeInOutSine, easeInSine, easeOutBack, easeOutSine } from "./tween";
import Kelp1 from "../data/Kelp1.json";
import Kelp2 from "../data/Kelp2.json";

export default function sketch(p5: P5CanvasInstance) {
  function vw(percentage: number): number {
    return (p5.width || window.innerWidth) * (percentage / 100);
  }
  function vh(percentage: number): number {
    return (p5.height || window.innerHeight) * (percentage / 100);
  }
  function right(px: number): number {
    return (p5.width || window.innerWidth) - px;
  }
  function bottom(px: number): number {
    return (p5.height || window.innerHeight) - px;
  }

  let pan = 0;
  let panStart = 0;
  let panTarget = 0;
  let panStartTime = 0;
  const panDurationMs = 3000;

  let krillX = vw(80);
  let krillY = 360;
  let krillXStart = krillX;
  let krillYStart = krillY;
  let krillXTarget = vw(80);
  let krillYTarget = 360;
  let krillMoveStartTime = 0;
  let krillMoveDurationMs = 1000;
  let krillMoveEasing = easeInOutQuad;

  let prompt: KrillionPrompt | null = null;
  let titleVisible = true;
  let sinking = false;
  let diving = false;
  let answer = "";

  let krill: any = null;
  p5.loadImage("/assets/krillion/krill.png").then((img) => {
    krill = img;
  });

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
    let startX = vw(50) - totalWidth / 2;
    let textY = 100 - pan;

    p5.noStroke();
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
    p5.text("THE DAILY DIVE", vw(50), textY + 40);
    p5.textSize(12);
    let instructions = "7 prompts · 25 seconds each · rarer answers sink deeper";
    if (p5.width < 450) {
      instructions = "7 prompts · 25 seconds each \nrarer answers sink deeper";
    }
    p5.text(instructions, vw(50), textY + 70);
  }

  function drawFish(x: number, y: number) {
    p5.noStroke();
    p5.fill("#01132b");
    p5.ellipse(x, y, 20, 10); // body
    p5.triangle(x - 8, y, x - 18, y - 5, x - 18, y + 5); // tail
  }

  function drawPrompt(y: number): number {
    const boxWidth = p5.max(300, vw(50));
    const padding = 16;

    if (!prompt) return 0;
    const promptText = prompt.text;
    const textX = vw(50) - boxWidth / 2 + padding;
    const textY = y + padding;
    const textWidth = boxWidth - padding * 2;

    p5.textFont("monospace");
    p5.textSize(20);
    p5.textAlign("left", "top");
    const textBounds = p5.textBounds(promptText, textX, textY, textWidth);
    const boxHeight = textBounds.h + padding * 2;
    p5.fill("#04132B");
    p5.rect(vw(50) - boxWidth / 2, y, boxWidth, boxHeight, 10);
    p5.fill("#f2fcfe");
    p5.text(promptText, textX, textY, textWidth);

    return boxHeight;
  }

  function drawCountdown() {
    const remainingSeconds = Math.ceil((panDurationMs - (p5.millis() - panStartTime)) / 1000);
    if (remainingSeconds <= 0 || pan === panTarget) return;

    p5.textSize(30);
    p5.fill("#f2fcfe");
    p5.text(remainingSeconds, vw(50), bottom(50));
  }

  function drawDepthMarkers(startY: number) {
    const depths = [10, 15, 30, 60, 85, 100];
    const depthNames = ["Plankton", "Too Clever", "Schooler", "Rare", "Deep Cut", "One in a Krillion"];

    // @ts-ignore
    p5.drawingContext.setLineDash([10, 10]);

    p5.strokeWeight(1);
    depths.forEach((depth, i) => {
      const y = startY + (depth - 10) * 10;
      p5.stroke(170, 299, 243, 85);
      p5.fill(242, 252, 254, 100);
      if (y < vh(20) + 26) {
        // above middle of answer box
        p5.stroke(170, 299, 243, 255);
        p5.fill(242, 252, 254, 255);
      }
      p5.line(vw(15), y, right(vw(15)), y);
      p5.noStroke();
      p5.textSize(12);
      p5.textAlign("left", "center");
      const textWidth = p5.textWidth(depthNames[i]);
      p5.text(depthNames[i], right(textWidth + vw(15)), y - 15);
    });

    // @ts-ignore
    p5.drawingContext.setLineDash([]);
  }

  function drawAnswer(y: number) {
    if (!answer) return;
    const answerText = `"${answer}"`;
    p5.textFont("monospace");
    p5.textSize(20);
    p5.textAlign("left", "top");
    const textWidth = p5.textWidth(answerText);
    const padding = 16;
    const boxWidth = textWidth + padding * 2;

    const textX = vw(50) - boxWidth / 2 + padding;
    const textY = y + padding;

    const boxHeight = 20 + padding * 2;
    p5.fill("#04132B");
    p5.rect(vw(50) - boxWidth / 2, y, boxWidth, boxHeight, 10);
    p5.fill("#f2fcfe");
    p5.text(answerText, textX, textY, textWidth);

    return boxHeight;
  }

  function drawResult() {
    if (!answer) return;
    const line1 = answer;
  }

  function dive(enteredAnswer: string) {
    diving = true;
    answer = enteredAnswer;
    krillMoveEasing = easeInOutBack;
    moveKrill(vw(50) - 35, vh(20) - 35 - 35);
  }

  function moveKrill(x: number, y: number) {
    krillXStart = krillX;
    krillYStart = krillY;
    krillXTarget = x;
    krillYTarget = y;
    krillMoveStartTime = p5.millis();
  }

  function drawKrill() {
    if (!krill) return;

    const progress = p5.constrain((p5.millis() - krillMoveStartTime) / krillMoveDurationMs, 0, 1);
    const easedProgress = krillMoveEasing(progress);
    krillX = p5.lerp(krillXStart, krillXTarget, easedProgress);
    krillY = p5.lerp(krillYStart, krillYTarget, easedProgress);

    const krillWidth = 70;
    const krillHeight = 70;
    p5.image(krill, krillX, krillY, krillWidth, krillHeight);
  }

  function drawKelp(y: number, points: number[][], fromRight: boolean = false) {
    p5.beginShape();
    p5.noStroke();
    p5.fill("#01132B");
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const waveOffset = p5.map(p5.sin(p5.frameCount * 1.3 + i * point[1] * 4), -1, 1, -1.5, 1.5);
      if (!fromRight) p5.vertex(point[0] / 2 - 150 + waveOffset, y + point[1] / 2 + waveOffset);
      if (fromRight) p5.vertex(p5.width - point[0] / 2 + waveOffset, y + point[1] / 2 + waveOffset);
    }
    p5.endShape(p5.CLOSE);
  }

  p5.mouseWheel = (event) => {
    if (event && import.meta.env.DEV) {
      panTarget = pan + event.deltaY;
    }
  };

  p5.draw = () => {
    sinking = panTarget > pan;
    const progress = p5.constrain((p5.millis() - panStartTime) / panDurationMs, 0, 1);
    const easedProgress = easeInOutQuad(progress);
    pan = p5.lerp(panStart, panTarget, easedProgress);

    p5.background("#f2fcfe");
    const initalWaveStart = p5.max(230, vh(40));
    let waveStart = initalWaveStart - pan;
    let wavePeriod = p5.max(p5.width + 5, 1000);
    drawWave(0, waveStart, wavePeriod, 2, 5, "#aae5f3", 0.3, 50); // bg wave
    drawWave(0, waveStart + 10, wavePeriod, 2, 10, "#0a4d77", 0.6); // surface wave
    drawWave(0, waveStart + 10, wavePeriod, 2, 10, "#f2fcfe", 0.6, 0, true); // surface wave stroke
    drawFish(100, waveStart + 50);
    drawWave(0, waveStart + 800, wavePeriod, 2, 5, "#052948", 0.2); // depth 1
    drawKelp(waveStart + 990, Kelp1, false);
    drawKelp(waveStart + 980, Kelp2, true);
    drawWave(0, waveStart + 1450, wavePeriod, 2, 5, "#01132b", 0.1); // depth 2
    drawWave(0, waveStart + 2200, wavePeriod, 2, 5, "#010c1e", 0.1); // "sea floor"

    const promptY = p5.max(waveStart + 25, 25);
    let promptBoxHeight;
    if (prompt && !diving) promptBoxHeight = drawPrompt(promptY);
    if (diving) drawDepthMarkers(waveStart + 200);
    drawKrill();

    if (sinking) drawCountdown();
    if (diving) drawAnswer(vh(20));

    if (titleVisible) drawTitle();

    if (window.krillion) {
      window.krillion.setPan = (newPan: number) => {
        if (newPan === panTarget) return;
        panStart = pan;
        panTarget = newPan;
        panStartTime = p5.millis();
      };
      window.krillion.setPrompt = (newPrompt: KrillionPrompt | null) => {
        prompt = newPrompt;
        if (prompt && prompt.id === "p1") {
          // first prompt
          moveKrill(vw(80), krillY - 200);
          setTimeout(() => {
            moveKrill(vw(80), promptY - 150);
            setTimeout(() => {
              krillMoveEasing = easeInOutBack;
              moveKrill(vw(5), bottom(225));
            }, 1000);
          }, 1000);
        }
      };
      window.krillion.setTitleVisible = (visible: boolean) => {
        titleVisible = visible;
      };
      window.krillion.dive = dive;
    }
  };
}
