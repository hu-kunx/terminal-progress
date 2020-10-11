import { Progress } from "./index.mjs";

const p = new Progress(100);

let num = 0;
const timer = setInterval(() => {
  if (num > 100) {
    clearInterval(timer);
  }
  p.update(num++);
}, 50);
