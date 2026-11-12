export type Role = "admin" | "student" | "teacher";

export type MissionType = "quiz" | "vocabulary" | "audio";

export type QuizAnswer = "a" | "b" | "c" | "d";

export type MissionQuestion = {
  question: string;
  options: Record<QuizAnswer, string>;
  correct_answer?: QuizAnswer;
};

export type Paginated<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type Ref = {
  _id: string;
  name: string;
};

export type TeacherRef = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

export type StudentRef = {
  _id: string;
  name: string;
  role: Role;
};

export type MissionRef = {
  _id: string;
  title: string;
  type: MissionType;
  active: boolean;
};

export type SchoolClass = {
  _id: string;
  name: string;
  active: boolean;
  /**
   * Se os alunos veem o ranking da turma. Turmas antigas vêm sem o campo e
   * contam como visível.
   */
  class_ranking_visible?: boolean;
  teacher: TeacherRef | null;
  students: StudentRef[];
  missions: MissionRef[];
  createdAt?: string;
  updatedAt?: string;
};

export type Mission = {
  _id: string;
  title: string;
  description: string | null;
  type: MissionType;
  xp_reward: number;
  class_id: Ref | null;
  active: boolean;
  createdBy: Ref | null;
  content: string | null;
  content_url: string | null;
  questions?: MissionQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type MissionProgressResult = {
  mission: string;
  student: string;
  done: boolean;
  score: number;
  /** Melhor nota do aluno nesta missão; é a que fica salva no progresso. */
  best_score: number;
  correct_answers: number | null;
  total_questions: number | null;
  xp_earned: number;
  credited_so_far: number;
  already_rewarded: boolean;
  progression: {
    previous_level: number;
    leveled_up: boolean;
    leveled_down: boolean;
    level: number;
    xp: number;
  } | null;
};

export type MissionWriteResult = Omit<Mission, "class_id" | "createdBy"> & {
  class_id: string;
  createdBy: string;
};

export type LevelProgress = {
  current_level_xp: number;
  next_level_xp: number | null;
  xp_to_next_level: number;
  percentage: number;
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
  badges: string[];
  /** Caminho relativo à API (`/uploads/...`); `null` sem foto. */
  avatar_url?: string | null;
  /** Ausente em usuários antigos: vale como `true`. */
  show_in_global_ranking?: boolean;
  active: boolean;
  /** Quando a conta foi desativada; conta o prazo de retenção. */
  deactivated_at?: string | null;
  /** Quando os dados pessoais foram eliminados (anonimização). */
  anonymized_at?: string | null;
  /**
   * Quando a escola registrou o termo assinado pelos responsáveis. Todo aluno
   * é criado com ele; `null` só para professor e admin.
   */
  guardian_consent_at?: string | null;
  /** Id do professor ou admin que registrou o termo. */
  guardian_consent_recorded_by?: string | null;
  /** Quando o consentimento foi revogado; a revogação desativa a conta. */
  guardian_consent_revoked_at?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TypePerformance = {
  /** 0 a 100. `null` sem missão concluída do tipo, diferente de nota 0. */
  score: number | null;
  missions: number;
};

export type ClassTypePerformance = {
  score: number | null;
  students: number;
};

export type Performance = {
  student: Record<MissionType, TypePerformance>;
  /** Média dos alunos ativos da turma; `null` quando o aluno não tem turma. */
  class: Record<MissionType, ClassTypePerformance> | null;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RankingScope = "global" | "class";

export type RankingUser = {
  _id: string;
  name: string;
  xp: number;
  level: number;
  avatar_url?: string | null;
};

export type RankingEntry = {
  user: RankingUser;
  xp: number;
  level: number;
};

export type Ranking = {
  _id: string;
  type: RankingScope;
  class: Ref | null;
  entries: RankingEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ClassSummary = Omit<SchoolClass, "students" | "missions"> & {
  students: string[];
  missions: string[];
};

export type AttitudeType = "positive" | "negative";

export type Attitude = {
  _id: string;
  name: string;
  description: string | null;
  xp_value: number;
  type: AttitudeType;
  active: boolean;
};

export type AttitudeLogResult = {
  _id: string;
  student: string;
  attitude: string;
  xp_applied: number;
};

export type ContactRef = {
  _id: string;
  name: string;
  email: string;
};

export type AttitudeLog = {
  _id: string;
  student: ContactRef | null;
  teacher: ContactRef | null;
  attitude: Pick<Attitude, "_id" | "name" | "type" | "xp_value"> | null;
  xp_applied: number;
  applied_at: string;
  createdAt: string;
  updatedAt: string;
};

export type XpAdjustmentResult = {
  _id: string;
  student: string;
  teacher: string;
  amount: number;
  xp_applied: number;
  reason?: string | null;
  applied_at: string;
};

export type XpHistoryKind = "attitude" | "adjustment" | "mission";

export type XpHistoryItem = {
  id: string;
  kind: XpHistoryKind;
  xp: number;
  title: string;
  detail: string | null;
  teacher?: string | null;
  date: string | null;
};

export type NotificationType = "attitude" | "xp_adjustment" | "new_mission";

type NotificationBase = {
  _id: string;
  user: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserNotification = NotificationBase &
  (
    | {
        type: "attitude";
        data: { xp: number; attitude: string; attitude_log?: string };
      }
    | { type: "xp_adjustment"; data: { xp: number; xp_adjustment: string } }
    | { type: "new_mission"; data: { mission: string } }
  );

/**
 * Resposta de `GET /users/:id/data-export`. A tela só lê `exported_at` e
 * `student._id`; o resto vai inteiro para o arquivo baixado.
 */
export type DataExport = {
  exported_at: string;
  student: { _id: string; name: string } & Record<string, unknown>;
} & Record<string, unknown>;
