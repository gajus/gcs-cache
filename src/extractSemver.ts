export const extractSemver = (subject: string): string | null => {
  return /v(\d+.\d+\.\d+)/u.exec(subject)?.[1] ?? null;
};
