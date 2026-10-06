function tokenizeForCanvas(text: string, isThai: boolean): string[] {
  if (isThai && typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
      return Array.from(segmenter.segment(text), s => s.segment);
    } catch { /* fall through */ }
  }
  return text.split(' ').map((w, idx, arr) => (idx === arr.length - 1 ? w : w + ' '));
}

function drawWrappedTokens(ctx: CanvasRenderingContext2D, tokens: string[], x: number, y: number, maxWidth: number, lineHeight: number): number {
  let line = '';
  let curY = y;
  for (let n = 0; n < tokens.length; n++) {
    const testLine = line + tokens[n];
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = tokens[n];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
  return curY + lineHeight;
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, candidateId: string, nowStr: string) {
  const wmText = `ISC2 CC · ${candidateId} · ${nowStr}`;
  ctx.save();
  ctx.rotate(-16 * Math.PI / 180);
  ctx.fillStyle = 'rgba(15, 15, 15, 0.045)';
  ctx.font = "700 12.5px 'JetBrains Mono', monospace";
  for (let x = -width; x < width * 2; x += 220) {
    for (let y = -height; y < height * 2; y += 46) ctx.fillText(wmText, x, y);
  }
  ctx.restore();
}

function countLines(ctx: CanvasRenderingContext2D, tokens: string[], max: number): number {
  let cur = '';
  let lines = 1;
  tokens.forEach(t => {
    if (ctx.measureText(cur + t).width > max) { lines++; cur = t; } else cur += t;
  });
  return lines;
}

export function renderQuestionCanvas(
  canvas: HTMLCanvasElement,
  q: { q: string; qt?: string },
  opts: { showEn: boolean; showTh: boolean; candidateId: string },
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const container = canvas.parentElement;
  const width = container ? Math.min(container.clientWidth || 600, 750) : 600;
  const dpr = window.devicePixelRatio || 1;
  const testCtx = document.createElement('canvas').getContext('2d');
  if (!testCtx) return;
  const enLineHeight = 26;
  const thLineHeight = 28;
  const enTokens = opts.showEn ? tokenizeForCanvas(q.q, false) : [];
  const thTokens = opts.showTh && q.qt ? tokenizeForCanvas(q.qt, true) : [];

  let estHeight = 30;
  if (enTokens.length > 0) {
    testCtx.font = "600 16px 'Space Grotesk', 'IBM Plex Sans Thai', sans-serif";
    estHeight += countLines(testCtx, enTokens, width - 20) * enLineHeight + 6;
  }
  if (thTokens.length > 0) {
    testCtx.font = "400 15px 'IBM Plex Sans Thai', sans-serif";
    estHeight += countLines(testCtx, thTokens, width - 20) * thLineHeight + 14;
  }

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(estHeight * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = estHeight + 'px';

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, estHeight);
  drawWatermark(ctx, width, estHeight, opts.candidateId, new Date().toISOString().slice(0, 10));
  let curY = 22;
  if (enTokens.length > 0) {
    ctx.fillStyle = '#0F0F0F';
    ctx.font = "600 16px 'Space Grotesk', 'IBM Plex Sans Thai', sans-serif";
    curY = drawWrappedTokens(ctx, enTokens, 4, curY, width - 16, enLineHeight);
  }
  if (thTokens.length > 0) {
    curY += 6;
    ctx.fillStyle = '#2A2A2A';
    ctx.font = "400 15px 'IBM Plex Sans Thai', sans-serif";
    drawWrappedTokens(ctx, thTokens, 4, curY, width - 16, thLineHeight);
  }
  ctx.restore();
}
