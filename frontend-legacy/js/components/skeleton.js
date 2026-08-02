export function tableSkeleton(columns = 5, rows = 6) {
  let out = '';
  for (let r = 0; r < rows; r += 1) {
    out += '<tr class="skeleton-row">';
    for (let c = 0; c < columns; c += 1) {
      const width = 40 + Math.round(Math.random() * 40);
      out += `<td><div class="skeleton skeleton-line" style="width:${width}%"></div></td>`;
    }
    out += '</tr>';
  }
  return out;
}

export function statCardSkeleton() {
  return `
    <div class="card stat-card">
      <div class="skeleton" style="width:38px;height:38px;border-radius:11px;"></div>
      <div class="skeleton skeleton-line mt-16" style="width:60%;"></div>
      <div class="skeleton skeleton-line mt-8" style="width:40%;height:22px;"></div>
    </div>
  `;
}
