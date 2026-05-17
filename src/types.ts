
export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector;
  size: Vector;
  type: 'mouse' | 'platform' | 'hole' | 'obstacle' | 'cheese';
}

export interface MouseCustomization {
  bodyColor: string;
  earColor: string;
  noseColor: string;
}

export interface Player extends Entity {
  vel: Vector;
  onGround: boolean;
  facingRight: boolean;
  customization: MouseCustomization;
}

export interface GameState {
  player: Player;
  entities: Entity[];
  level: number;
  gameOver: boolean;
  gameWon: boolean;
}
