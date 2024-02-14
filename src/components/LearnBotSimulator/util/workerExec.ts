export type WorkerExec = (code: string) => Worker;

export const workerExec: WorkerExec = (code) => {
  const file = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(file);
  return new Worker(url);
};
