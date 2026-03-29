
/**
 * Reusable Supabase/Postgrest error extraction helper.
 * Extracts a human-readable message from Supabase error objects.
 */
export function getSupabaseErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // If it's a string, return it
  if (typeof error === 'string') return error;

  // If it's a standard Error object
  if (error instanceof Error) {
    // Check if it's a Postgrest error wrapped in an Error object
    const errObj = error as unknown as Record<string, unknown>;
    const postgrestError = errObj.error || errObj.details;
    if (postgrestError) return getSupabaseErrorMessage(postgrestError);
    return error.message;
  }

  // Handle Supabase/Postgrest error object
  // { code: '...', message: '...', details: '...', hint: '...' }
  const errObj = error as unknown as Record<string, unknown>;
  if (errObj.message && typeof errObj.message === 'string') {
    let msg = errObj.message;
    if (errObj.details && typeof errObj.details === 'string') msg += `\nDetails: ${errObj.details}`;
    if (errObj.hint && typeof errObj.hint === 'string') msg += `\nHint: ${errObj.hint}`;
    if (errObj.code && typeof errObj.code === 'string') msg = `[Code: ${errObj.code}] ${msg}`;
    return msg;
  }

  // Fallback for other objects
  try {
    return JSON.stringify(error);
  } catch {
    return 'An unparseable error occurred';
  }
}

/**
 * Logs a detailed error to the console for debugging.
 */
export function logSupabaseError(context: string, error: unknown) {
  const message = getSupabaseErrorMessage(error);
  const errObj = error as unknown as Record<string, unknown>;
  console.error(`[Supabase Error] ${context}:`, {
    message,
    originalError: error,
    code: errObj?.code,
    details: errObj?.details,
    hint: errObj?.hint
  });
  return message;
}
