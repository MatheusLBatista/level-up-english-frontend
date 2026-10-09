export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function matchesSearch(text: string, search: string) {
  const term = normalizeText(search.trim());

  return term === "" || normalizeText(text).includes(term);
}
