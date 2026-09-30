import type { Mission } from "@/lib/types";
import {
  MIN_QUIZ_QUESTIONS,
  type MissionFormInput,
  type QuestionFormInput,
} from "@/schemas/mission";
import type { CreateMissionBody, UpdateMissionBody } from "@/services/missions";

export function createEmptyQuestion(): QuestionFormInput {
  return {
    question: "",
    options: { a: "", b: "", c: "", d: "" },
    correct_answer: "a",
  };
}

export function getMissionFormDefaults(
  mission: Mission | null,
  classId: string | null,
): MissionFormInput {
  return {
    type: mission?.type ?? "quiz",
    title: mission?.title ?? "",
    description: mission?.description ?? "",
    xp_reward: mission?.xp_reward ?? 100,
    class_id: mission?.class_id?._id ?? classId ?? "",
    active: mission?.active ?? true,
    content: mission?.content ?? "",
    content_url: mission?.content_url ?? "",
    questions: mission
      ? (mission.questions ?? []).map((question) => ({
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer ?? "a",
        }))
      : Array.from({ length: MIN_QUIZ_QUESTIONS }, createEmptyQuestion),
  };
}

function commonFields(values: MissionFormInput) {
  return {
    title: values.title,
    description: values.description,
    xp_reward: values.xp_reward,
    class_id: values.class_id,
  };
}

function contentFields(values: MissionFormInput) {
  switch (values.type) {
    case "quiz":
      return { questions: values.questions };
    case "vocabulary":
      return { content: values.content };
    case "audio":
      return { content_url: values.content_url, content: values.content };
  }
}

export function toCreateMissionBody(values: MissionFormInput): CreateMissionBody {
  return { type: values.type, ...commonFields(values), ...contentFields(values) };
}

export function toUpdateMissionBody(values: MissionFormInput): UpdateMissionBody {
  return { ...commonFields(values), active: values.active, ...contentFields(values) };
}
