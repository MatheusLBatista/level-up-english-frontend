/**
 * Diz se o conteúdo do elemento foi cortado pelo CSS (`truncate` ou
 * `line-clamp-*`). A folga de 1px na altura evita falso positivo por
 * arredondamento de line-height.
 */
export function isTruncated(element: HTMLElement): boolean {
  return (
    element.scrollWidth > element.clientWidth ||
    element.scrollHeight - element.clientHeight > 1
  );
}
