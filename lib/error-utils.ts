/**
 * Reusable Supabase/Postgrest error extraction helper.
 * Extracts a human-readable message from Supabase error objects.
 */

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  error?: unknown;
};

export function getSupabaseErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    const errObj = error as Error & ErrorLike;

    if (errObj.error) {
      return getSupabaseErrorMessage(errObj.error);
    }

    const parts = [
      error.message,
      typeof errObj.details === 'string' && errObj.details.trim()
        ? `Details: ${errObj.details}`
        : null,
      typeof errObj.hint === 'string' && errObj.hint.trim()
        ? `Hint: ${errObj.hint}`
        : null,
    ].filter(Boolean) as string[];

    const message = parts.join('\n');

    if (typeof errObj.code === 'string' && errObj.code.trim()) {
      return `[Code: ${errObj.code}] ${message || 'An unknown error occurred'}`;
    }

    return message || 'An unknown error occurred';
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as ErrorLike;

    if (errObj.error) {
      return getSupabaseErrorMessage(errObj.error);
    }

    const parts = [
      typeof errObj.message === 'string' && errObj.message.trim()
        ? errObj.message
        : null,
      typeof errObj.details === 'string' && errObj.details.trim()
        ? `Details: ${errObj.details}`
        : null,
      typeof errObj.hint === 'string' && errObj.hint.trim()
        ? `Hint: ${errObj.hint}`
        : null,
    ].filter(Boolean) as string[];

    const message = parts.join('\n');

    if (typeof errObj.code === 'string' && errObj.code.trim()) {
      return `[Code: ${errObj.code}] ${message || 'An unknown error occurred'}`;
    }

    if (message) return message;

    try {
      return JSON.stringify(error);
    } catch {
      return 'An unparseable error occurred';
    }
  }

  return 'An unknown error occurred';
}

/**
 * Logs a detailed error to the console for debugging.
 */
export function logSupabaseError(context: string, error: unknown): string {
  const message = getSupabaseErrorMessage(error);

  let code: string | undefined;
  let details: string | undefined;
  let hint: string | undefined;

  if (error instanceof Error) {
    const errObj = error as Error & ErrorLike;
    code = typeof errObj.code === 'string' ? errObj.code : undefined;
    details = typeof errObj.details === 'string' ? errObj.details : undefined;
    hint = typeof errObj.hint === 'string' ? errObj.hint : undefined;
  } else if (typeof error === 'object' && error !== null) {
    const errObj = error as ErrorLike;
    code = typeof errObj.code === 'string' ? errObj.code : undefined;
    details = typeof errObj.details === 'string' ? errObj.details : undefined;
    hint = typeof errObj.hint === 'string' ? errObj.hint : undefined;
  }

  console.error(`[Supabase Error] ${context}:`, {
    message,
    originalError: error,
    code,
    details,
    hint,
  });

  return message;
}