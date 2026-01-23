/**
 * RankSymbol component - renders a rank symbol using vector paths
 * Ported from legacy Card.Drawer.pas
 */

import { RANK_PATHS, type RankName } from "./CardDrawers";

interface RankSymbolProps {
  rank: RankName;
  size: number;
  color: string;
  className?: string;
  flipped?: boolean;
}

const RANK_ORDER: RankName[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export function RankSymbol({
  rank,
  size,
  color,
  className,
  flipped,
}: RankSymbolProps) {
  const { width, height, path } = RANK_PATHS[rank];

  // Scale based on height to maintain consistent text height
  const scale = size / height;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={flipped ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d={path} fill={color} fillRule="evenodd" />
    </svg>
  );
}

interface RankSymbolByIndexProps {
  rankIndex: number;
  size: number;
  color: string;
  className?: string;
  flipped?: boolean;
}

export function RankSymbolByIndex({
  rankIndex,
  size,
  color,
  className,
  flipped,
}: RankSymbolByIndexProps) {
  const rank = RANK_ORDER[rankIndex];
  return (
    <RankSymbol
      rank={rank}
      size={size}
      color={color}
      className={className}
      flipped={flipped}
    />
  );
}
