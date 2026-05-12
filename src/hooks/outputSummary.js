// Placeholder for future structured output summarization beyond line clipping.
export function summarizeIfLarge(text, lineBudget = 200) {
  if (typeof text !== 'string') return text;
  const lines = text.split('\n');
  if (lines.length <= lineBudget) return text;
  const head = lines.slice(0, Math.floor(lineBudget * 0.4)).join('\n');
  const tail = lines.slice(-Math.floor(lineBudget * 0.2)).join('\n');
  return `${head}\n\n... (truncated ${lines.length - lineBudget} lines) ...\n\n${tail}`;
}
