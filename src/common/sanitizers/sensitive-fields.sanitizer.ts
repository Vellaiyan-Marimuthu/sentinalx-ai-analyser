const SENSITIVE_KEY_PATTERN =
  /^(password|passwd|secret|token|authorization|cookie|cookies|rawbody|body|requestbody|credential|credentials|apikey|accessToken|refreshToken|set-cookie|setcookie)$/i;

export function isSensitiveFieldName(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function sanitizeRecord<T extends Record<string, unknown>>(
  input: T,
): Partial<T> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (isSensitiveFieldName(key) || value === undefined || value === null) {
      continue;
    }
    sanitized[key] = value;
  }

  return sanitized as Partial<T>;
}
