import { setTimeout } from "timers/promises";
import { ProgressBar, ProgressOptions } from "../src";
import chalk from "chalk";
const { blue, red, yellow }= chalk

const v1: ProgressOptions = {
  showBrackets: true,
  showNumerical: true,
  showTime: false,
  showColor: true,
  showTitle: true,
  emptyChar: "-",
  filledChar: '#',
  emptyCharColorFn: blue,
  filledCharColorFn: yellow,
  numericalCharColorFn: red,
};

const progressBar: ProgressBar = new ProgressBar(v1);

(async () => {
  progressBar.start(100);

  async function* progressUpdate() {
    var i = 1;
    while (i < 100) {
      await setTimeout(100);
      i = i + Math.floor(Math.random() * 3) + 1;
      yield i;
    }
  }

  // setTimeout(1000).then(() => progressBar.complete())

  for await (const value of progressUpdate()) {
    progressBar.update(value);
  }
  progressBar.complete();
})();

