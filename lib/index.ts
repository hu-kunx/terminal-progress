function print(char: string) {
  process.stdout.clearLine(-1);
  process.stdout.cursorTo(0);
  process.stdout.write(char);
}

const baseConf = {
  name: "Progress",
  emptyChar: "-",
  filledChar: "=",
};

class Progress {
  total: number;
  current: number;
  barLength: number;
  conf: typeof baseConf;
  lastTime: null | number;
  isEnd: boolean;

  constructor(total: number, conf = baseConf) {
    this.total = total;
    this.current = 0;
    this.barLength = process.stdout.columns - 50;
    this.conf = conf;
    this.lastTime = null;
    this.isEnd = false;
  }

  assembly(current: number) {
    if (this.lastTime === null) {
      this.lastTime = new Date().getTime();
    }
    const filled_bar_length = (current * this.barLength) >> 0;
    const empty_bar_length = this.barLength - filled_bar_length;
    const { name = "Progress", emptyChar = "-", filledChar = "=" } = this.conf;
    const empty = this.genChar(empty_bar_length, emptyChar);
    const filled = this.genChar(filled_bar_length, filledChar);
    const percentage = (current * 100).toFixed(2);
    const sec = ((new Date().getTime() - this.lastTime) / 10 / 60).toFixed(4);
    const output = `${name}: [ ${filled}${empty} ] ${percentage}% (${sec} seconds)`;
    return current * 100 >= 100 ? output + "\n" : output;
  }

  genChar(size: number, char: string, color = (a: unknown) => a) {
    let str = "";
    for (let i = 0; i < size; i++) {
      str += char;
    }
    return color(str);
  }

  reset() {
    this.isEnd = false;
    this.lastTime = null;
    this.current = 0;
  }

  update(num: number) {
    if (this.isEnd) {
      return;
    }
    this.current = Math.min(num, this.total) / this.total;
    print(this.assembly(this.current));
    if (this.current >= 1) {
      this.isEnd = true;
    }
  }

  printWithLinear(seconds = 3) {
    if (typeof seconds !== "number") {
      throw new TypeError("seconds is a number!");
    }
    let i = 0;
    const call = () => {
      setTimeout(() => {
        print(this.assembly(i / (seconds * 60)));
        if (i < seconds * 60) {
          call();
        }
        i += 2;
      }, 1000 / 60);
    };
    call();
  }
}
