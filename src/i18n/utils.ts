export function getNestedValue(obj: any, path: string): string | undefined {
  let cur: any = obj;
  for (const k of path.split(".")) {
    if (cur && typeof cur === "object" && k in cur) cur = cur[k];
    else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

export function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value;
  return Object.entries(params).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, String(v)), value);
}
