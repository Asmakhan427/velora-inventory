const PALETTE = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

export function donutChart(data, { size = 180, thickness = 26 } = {}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data
    .map((d, i) => {
      const fraction = d.value / total;
      const dash = fraction * circumference;
      const seg = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none"
        stroke="${d.color || PALETTE[i % PALETTE.length]}" stroke-width="${thickness}"
        stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round"
        style="transition: stroke-dasharray 600ms cubic-bezier(0.16,1,0.3,1);" />`;
      offset += dash;
      return seg;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--surface-2)" stroke-width="${thickness}" />
      ${segments}
    </svg>
  `;
}

export function legendFor(data) {
  return `
    <div class="chart-legend">
      ${data
        .map(
          (d, i) => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${d.color || PALETTE[i % PALETTE.length]}"></span>
          ${d.label} <span class="cell-muted">(${d.value})</span>
        </div>`
        )
        .join('')}
    </div>
  `;
}

export function horizontalBars(data, formatValue = (v) => v) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return `
    <div class="flex" style="flex-direction:column; gap:14px;">
      ${data
        .map(
          (d) => `
        <div>
          <div class="flex justify-between" style="font-size:12.5px; margin-bottom:6px;">
            <span style="color:var(--text-secondary); font-weight:500;">${d.label}</span>
            <span class="cell-mono">${formatValue(d.value)}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${(d.value / max) * 100}%"></div></div>
        </div>`
        )
        .join('')}
    </div>
  `;
}

export { PALETTE };
