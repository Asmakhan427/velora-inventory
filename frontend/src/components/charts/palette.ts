/**
 * Chart colors, validated with the dataviz skill's validate_palette.js against
 * the dark chart surface (#1a1a19 reference). These are chart-specific steps —
 * re-derived from the brown industrial brand tokens (rich brown / walnut /
 * sand / green / amber / red) but re-stepped where the raw brand hex fails
 * the lightness band, chroma floor, or adjacent-pair CVD/normal-vision checks
 * for a data mark on a dark surface. Brand tokens stay unchanged for UI
 * (buttons, badges, borders); only these values feed Recharts fills.
 *
 * "Gray" is deliberately NOT one of the rotating category colors — a true
 * neutral fails the categorical chroma floor by definition (it can't carry
 * hue identity), so per the skill's own guidance gray is reserved for chart
 * chrome instead: axis labels, gridlines, and muted text (CHART_TEXT_MUTED /
 * CHART_GRID below).
 *
 * Order matters — this exact sequence (brown, green, olive, red, amber)
 * clears every check (lightness/chroma/CVD/normal-vision/contrast) on the
 * dark surface; brown/amber/olive/red are all warm, mutually-close hues, so
 * reordering can reintroduce an adjacent-pair failure. Re-run the validator
 * before changing the order.
 */
export const CATEGORICAL_PALETTE = [
  '#A9662F', // brown
  '#158C68', // green
  '#9E9838', // olive
  '#C24A3E', // red
  '#BD8A28', // amber
]

/** Status triplet — validated standalone, all checks pass. */
export const STATUS_COLORS = {
  in_stock: '#158C68',
  low_stock: '#BD8A28',
  out_of_stock: '#C24A3E',
}

export const CHART_TEXT_MUTED = '#8A8A8A'
export const CHART_TEXT_SECONDARY = '#BDBDBD'
export const CHART_GRID = 'rgba(255,255,255,0.08)'
