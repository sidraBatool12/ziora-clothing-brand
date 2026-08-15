export function notifyLater(label: string, task: Promise<unknown>) {
  return task.catch((error) => {
    const message = error instanceof Error ? error.message : "Email delivery failed";
    console.error(`[email] ${label}:`, message);
  });
}
