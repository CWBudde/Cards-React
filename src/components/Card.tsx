/**
 * Card component - renders a single playing card (front or back)
 */

import type React from "react";
import type { Card as CardType } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import "./Card.css";

interface CardProps {
  card: CardType;
  width: number;
  height: number;
  cardBackStyle?: CardBackStyle;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
}

export function Card({
  card,
  width,
  height,
  cardBackStyle = "legacy",
  className,
  style,
  onPointerDown,
}: CardProps) {
  if (!card.faceUp) {
    return (
      <CardBack
        width={width}
        height={height}
        cardBackStyle={cardBackStyle}
        className={className}
        style={style}
        onPointerDown={onPointerDown}
      />
    );
  }

  return (
    <CardFront
      rank={card.rank}
      suit={card.suit}
      width={width}
      height={height}
      className={className}
      style={style}
      onPointerDown={onPointerDown}
    />
  );
}
