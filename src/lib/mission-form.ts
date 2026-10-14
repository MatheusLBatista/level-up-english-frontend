import type { Mission, MissionType } from "@/lib/types";
import {
  answerKeys,
  questionLimits,
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

function hasContent(question: QuestionFormInput) {
  return (
    question.question.trim() !== "" ||
    answerKeys.some((key) => question.options[key].trim() !== "")
  );
}

/**
 * Ajusta a lista ao limite do tipo: corta o que passa do máximo e completa o
 * mínimo com perguntas em branco. Com `dropEmpty`, descarta antes os rascunhos
 * vazios — usado na troca de tipo, para as 5 perguntas em branco do quiz não
 * virarem 3 checagens obrigatórias.
 */
export function fitQuestionsToType(
  questions: QuestionFormInput[],
  type: MissionType,
  { dropEmpty = false } = {},
): QuestionFormInput[] {
  const { min, max } = questionLimits[type];
  const base = dropEmpty ? questions.filter(hasContent) : questions;
  const kept = max === null ? base : base.slice(0, max);
  const missing = Math.max(min - kept.length, 0);

  return [...kept, ...Array.from({ length: missing }, createEmptyQuestion)];
}

export function getMissionFormDefaults(
  mission: Mission | null,
  classId: string | null,
): MissionFormInput {
  const type = mission?.type ?? "quiz";
  const saved = (mission?.questions ?? []).map((question) => ({
    question: question.question,
    options: question.options,
    correct_answer: question.correct_answer ?? "a",
  }));

  return {
    type,
    title: mission?.title ?? "",
    description: mission?.description ?? "",
    xp_reward: mission?.xp_reward ?? 100,
    class_id: mission?.class_id?._id ?? classId ?? "",
    active: mission?.active ?? true,
    content: mission?.content ?? "",
    content_url: mission?.content_url ?? "",
    // Missão nova: 5 em branco (quiz). Vocabulário/áudio antigo, sem
    // perguntas: 1 em branco, porque o backend exige ao editar.
    questions: fitQuestionsToType(saved, type),
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
      return { content: values.content, questions: values.questions };
    case "audio":
      return {
        content_url: values.content_url,
        content: values.content,
        questions: values.questions,
      };
  }
}

export function toCreateMissionBody(
  values: MissionFormInput,
): CreateMissionBody {
  return {
    type: values.type,
    ...commonFields(values),
    ...contentFields(values),
  };
}

export function toUpdateMissionBody(
  values: MissionFormInput,
): UpdateMissionBody {
  return {
    ...commonFields(values),
    active: values.active,
    ...contentFields(values),
  };
}
