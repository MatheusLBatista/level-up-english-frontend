import type { Paginated } from "@/lib/types";

/**
 * Pagina uma lista que já está inteira no front, devolvendo o mesmo formato
 * do mongoose-paginate — assim os mesmos controles servem para os dois casos.
 * Página fora do intervalo cai na mais próxima (ex.: depois de desativar o
 * último item da última página).
 */
export function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const totalDocs = items.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * limit;

  return {
    docs: items.slice(start, start + limit),
    totalDocs,
    limit,
    page: current,
    totalPages,
    hasPrevPage: current > 1,
    hasNextPage: current < totalPages,
    prevPage: current > 1 ? current - 1 : null,
    nextPage: current < totalPages ? current + 1 : null,
  };
}
