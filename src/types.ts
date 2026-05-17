
export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector;
  size: Vector;
  type: 'mouse' | 'platform' | 'hole' | 'obstacle' | 'cheese' | 'hazard' | 'moving_platform';
  vel?: Vector; // For moving platforms/hazards
  range?: { min: number; max: number };
}

export interface MouseCustomization {
  bodyColor: string;
  earColor: string;
  noseColor: string;
}

export interface PlayerState {
  id: string;
  username: string;
  pos: Vector;
  facingRight: boolean;
  customization: MouseCustomization;
  level: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface ScoreEntry {
  username: string;
  cheese_count: number;
  level: number;
  time: string;
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
  cheeseCount: number;
  totalCheese: number;
  startTime: number;
}
