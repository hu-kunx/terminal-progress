import readline from "readline";

function print(char: string) {
  readline.clearLine(process.stdout, -1);
  readline.cursorTo(process.stdout, 0);
  // process.stdout.clearLine(-1)
  // process.stdout.cursorTo(0)
  process.stdout.write(char);
}

type ColorFn = (char: string) => string;

export interface ProgressOptions {
  // 标题
  title?: string;
  // 表示空的字符
  emptyChar?: string;
  // 是否显示耗时
  showTime?: boolean;
  // 是否显示标题
  showTitle?: boolean;
  // 表示填充的字符
  filledChar?: string;
  // 本地表示"秒"的字符
  localSeconds?: string;
  // 是否显示中括号
  showBrackets?: boolean;
  // 进度条的渲染间隔时间(毫秒)
  renderGapTime?: number;
  // 是否输出颜色
  showColor?: boolean;
  // 填充字符的颜色函数(需要支持多个字符)
  filledCharColorFn?: ColorFn;
  // 表示空字符的颜色函数(需要支持多个字符)
  emptyCharColorFn?: ColorFn;
  // 标题颜色函数
  titleCharColorFn?: ColorFn;
  // 百分比数值颜色
  numericalCharColorFn?: ColorFn;
  // 时间显示颜色
  timestampCharColorFn?: ColorFn;
  // 是否显示百分比数值
  showNumerical?: boolean;
  // 百分比数值的位置
  numericalPosition?: "left" | "right";
}

export class ProgressBar {
  // 100%的值
  private total: number = 0;
  // 当前进度
  private current: number = 0;
  // 进度条的长度
  private readonly barLength: number;
  // 一些可配置的选项
  private readonly opts: Required<ProgressOptions>;
  // 进度条开始时间
  private startTime: null | number = null;
  // 是否已经结束
  private isEnd: boolean = false;
  // 是否已经开始
  private isStart: boolean = false;
  constructor(opts?: ProgressOptions) {
    // 进度条的长度为终端的长度减 50
    this.barLength = process.stdout.columns - 50;
    const colorFn = (char: string) => char;
    this.opts = {
      title: opts?.title ?? "",
      showTime: opts?.showTime ?? true,
      showTitle: opts?.showTitle ?? false,
      showBrackets: opts?.showBrackets ?? true,
      emptyChar: opts?.emptyChar ?? "-",
      filledChar: opts?.filledChar ?? "=",
      showColor: opts?.showColor ?? false,
      renderGapTime: opts?.renderGapTime ?? 16,
      localSeconds: opts?.localSeconds ?? "seconds",
      showNumerical: opts?.showNumerical ?? true,
      numericalPosition: opts?.numericalPosition ?? "right",
      emptyCharColorFn: opts?.emptyCharColorFn ?? colorFn,
      filledCharColorFn: opts?.filledCharColorFn ?? colorFn,
      titleCharColorFn: opts?.titleCharColorFn ?? colorFn,
      numericalCharColorFn: opts?.numericalCharColorFn ?? colorFn,
      timestampCharColorFn: opts?.timestampCharColorFn ?? colorFn,
    };
    if (!this.opts.showColor) {
      this.opts.filledCharColorFn = colorFn;
      this.opts.emptyCharColorFn = colorFn;
      this.opts.titleCharColorFn = colorFn;
      this.opts.numericalCharColorFn = colorFn;
      this.opts.timestampCharColorFn = colorFn;
    }
  }

  // 清除内部状态
  private clear(): void {
    this.total = 0;
    this.current = 0;
    this.isEnd = false;
    this.isStart = false;
    this.startTime = null;
  }

  private genChar(size: number, char: string, color = (a: string) => a) {
    let str = "";
    for (let i = 0; i < size; i++) {
      str += char;
    }
    return color(str);
  }

  /**
   * 计算耗时
   */
  private getTimeConsuming(): string {
    return ((Date.now() - (this.startTime as number)) / 10 / 60).toFixed(4);
  }

  /**
   * 拼接进度字符串
   * @param current 一个百分比的数值
   */
  private assembly(current: number, isCompleted: boolean = false) {
    const {
      filledChar,
      filledCharColorFn,
      emptyChar,
      emptyCharColorFn,
      title,
      localSeconds,
      showTime,
      showTitle,
      showBrackets,
      showNumerical,
      numericalPosition,
    } = this.opts;

    // 计算不同状态的字符长度
    const filled_bar_length = (current * this.barLength) >> 0;
    const empty_bar_length = this.barLength - filled_bar_length;

    // 进行字符填充颜色处理等
    const empty = this.genChar(empty_bar_length, emptyChar, emptyCharColorFn);
    const filled = this.genChar(
      filled_bar_length,
      filledChar,
      filledCharColorFn
    );

    // 计算进度和百分比值
    const percentage = this.opts.numericalCharColorFn(
      (current * 100).toFixed(2) + "%"
    );
    const sec = this.getTimeConsuming();

    // 拼接输出字符串

    let baseStr = filled + empty;
    if (showBrackets) baseStr = `[${baseStr}]`;
    if (showNumerical)
      baseStr =
        numericalPosition === "left"
          ? percentage + baseStr
          : baseStr + percentage;
    if (showTitle) baseStr = this.opts.titleCharColorFn(title) + baseStr;
    if (showTime)
      baseStr += this.opts.timestampCharColorFn(`(${sec} ${localSeconds})`);
    return baseStr + (current * 100 >= 100 || isCompleted ? "\n" : "     ");
  }

  /**
   * 不断递归渲染进度条, 直到已经进度已经终止
   */
  private startDrawThread(isCompleted = false) {
    if (this.isEnd) return;
    // 绘制的时候也需要判断进度条已经走完, 如果走完了进度条但是没有调用 complete 方法则自动标记已结束
    this.isEnd = this.current >= this.total;
    // 更新终端上的进度状态
    print(this.assembly(this.current / this.total, isCompleted));
    const ms = this.opts.renderGapTime;
    setTimeout(() => this.startDrawThread(), ms);
  }

  /**
   * 开始一个进度
   * @param total 表示 100% 进度的值
   */
  start(total: number): void {
    // if (this.isStart) throw new Error("Don't call the start method repeatedly");
    // 不允许重复调用
    if (this.isStart) return;
    this.clear();
    this.total = total;
    this.isStart = true;
    this.startTime = Date.now();
    this.startDrawThread();
  }

  /**
   * 结束进度并开启一个新的进度条
   * @param total 表示 100% 进度的值
   */
  completeAndStart(total: number): void {
    this.complete();
    this.start(total);
  }

  /**
   * 更新进度
   * @param progress 进度
   */
  update(progress: number): void {
    // if (!this.isStart) throw new Error("Please call the start method first");
    // 进度已结束或者未开始则忽略调用
    if (this.isEnd || !this.isStart) return;
    this.current = Math.min(progress, this.total);
  }

  /**
   * 进度已经终止
   */
  complete(): void {
    // 进度已结束或者未开始则忽略调用
    if (this.isEnd || !this.start) return;
    // 因为绘制是相当于另开线程的, 所以此时需要立即绘制最后一次
    this.startDrawThread(true);
    this.clear();
    this.isEnd = true;
  }
}
