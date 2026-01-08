const GOLDEN_ANGLE = 137.508; // 色分散に最適

export const generateUniqueLabelColor = (index: number): string => {
  const hue = (index * GOLDEN_ANGLE) % 360;
  const saturation = 65; // 見やすさ重視
  const lightness = 55;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
