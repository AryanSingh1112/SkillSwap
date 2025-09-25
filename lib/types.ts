// Shared types for matchmaking UI

export interface PlayerCardProps {
  avatar?: string;
  name?: string;
  teach?: string;
  learn?: string;
  isWaiting: boolean;
}

export interface CenterStatusProps {
  status: "waiting" | "matched";
}

export interface Opponent {
  name: string;
  avatar: string;
  teach: string;
  learn: string;
}
