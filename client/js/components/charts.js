/**
 * Lightweight Canvas Charts
 * Renders donut charts and bar charts using the Canvas API.
 */
const Charts = {
  /**
   * Donut chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - [{ label, value, color }]
   */
  donut(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth || 240;
    const H = canvas.height = canvas.parentElement.clientHeight || 240;
    const size = Math.min(W, H);
    const cx = W / 2;
    const cy = H / 2;
    const radius = size * 0.35;
    const innerRadius = radius * 0.6;
    const total = data.reduce((s, d) => s + d.value, 0);

    ctx.clearRect(0, 0, W, H);

    if (total === 0) {
      // Draw empty ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = '#e1e3e5';
      ctx.fill();
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#6d7175';
      ctx.textAlign = 'center';
      ctx.fillText('No data', cx, cy + 5);
      return;
    }

    let startAngle = -Math.PI / 2;
    data.forEach(d => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Inner circle (donut hole)
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#202223';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), cx, cy - 6);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#6d7175';
    ctx.fillText('Total', cx, cy + 12);

    // Legend
    const legendY = cy + radius + 16;
    const legendItemWidth = W / data.length;
    data.forEach((d, i) => {
      const lx = legendItemWidth * i + legendItemWidth / 2;
      ctx.fillStyle = d.color;
      ctx.fillRect(lx - 20, legendY, 8, 8);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#6d7175';
      ctx.textAlign = 'left';
      ctx.fillText(`${d.label} (${d.value})`, lx - 8, legendY + 8);
    });
  },

  /**
   * Bar chart
   * @param {string} canvasId
   * @param {Array} data - [{ label, value, color }]
   */
  bar(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth || 400;
    const H = canvas.height = canvas.parentElement.clientHeight || 240;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    ctx.clearRect(0, 0, W, H);

    if (data.length === 0) return;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barWidth = Math.min(chartW / data.length * 0.6, 40);
    const gap = (chartW - barWidth * data.length) / (data.length + 1);

    // Y-axis grid lines
    const gridLines = 4;
    ctx.strokeStyle = '#edeeef';
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#6d7175';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const val = Math.round(maxVal * (1 - i / gridLines));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();
      ctx.fillText(val.toString(), padding.left - 8, y);
    }

    // Bars
    data.forEach((d, i) => {
      const x = padding.left + gap + (barWidth + gap) * i;
      const barH = (d.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      // Bar with rounded top
      ctx.fillStyle = d.color || '#5c6ac4';
      ctx.beginPath();
      const r = Math.min(4, barWidth / 2);
      ctx.moveTo(x, y + r);
      ctx.arcTo(x, y, x + barWidth, y, r);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + barH, r);
      ctx.lineTo(x + barWidth, padding.top + chartH);
      ctx.lineTo(x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = '#6d7175';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(d.label, x + barWidth / 2, padding.top + chartH + 8);
    });
  },
};

window.Charts = Charts;
