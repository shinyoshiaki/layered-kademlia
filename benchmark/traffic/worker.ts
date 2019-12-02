import { parentPort } from "worker_threads";

function factorial(n: number): number {
  if (n === 1 || n === 0) {
    return 1;
  }
  return factorial(n - 1) * n;
}

parentPort!.on("message", data => {
  const { port } = data;
  port.postMessage(factorial(data.value));
});
