// Input sanitization helpers

/**
 * Sanitize user comment text:
 * - Trim whitespace
 * - Collapse internal whitespace to single spaces
 * - Remove control characters
 * - Optionally truncate to a maximum length
 */
export const sanitizeCommentText = (
  text: string,
  maxLength?: number
): string => {
  // Remove non-printable control characters (code < 32) and DEL (127)
  const noControls = Array.from(text)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 32 && code !== 127) || ch === '\n' || ch === '\t';
    })
    .join('');
  // Trim and collapse whitespace
  const collapsed = noControls.trim().replace(/\s+/g, ' ');
  if (maxLength && collapsed.length > maxLength) {
    return collapsed.slice(0, maxLength);
  }
  return collapsed;
};
