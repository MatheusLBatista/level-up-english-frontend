export type Role = "admin" | "student" | "teacher";

export type LevelProgress = {
  current_level_xp: number;
  next_level_xp: number | null;
  xp_to_next_level: number;
  porcentage: number;
};

export type MissionProgressEntry = {
  mission_id: string;
  done: boolean;
  score: number;
  xp_earned: number;
  completed_at: string | null;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  xp: number;
  level: number;
  progress: LevelProgress;
  class: string | null;
  mission_progress: MissionProgressEntry[];
  streak: number;
  badges: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
