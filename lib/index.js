import readline from "readline";
function print(char) {
    readline.clearLine(process.stdout, -1);
    readline.cursorTo(process.stdout, 0);
    // process.stdout.clearLine(-1)
    // process.stdout.cursorTo(0)
    process.stdout.write(char);
}
export class ProgressBar {
    constructor(opts) {
        // 100%的值
        this.total = 0;
        // 当前进度
        this.current = 0;
        // 进度条开始时间
        this.startTime = null;
        // 是否已经结束
        this.isEnd = false;
        // 是否已经开始
        this.isStart = false;
        // 进度条的长度为终端的长度减 50
        this.barLength = process.stdout.columns - 50;
        const colorFn = (char) => char;
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
    clear() {
        this.total = 0;
        this.current = 0;
        this.isEnd = false;
        this.isStart = false;
        this.startTime = null;
    }
    genChar(size, char, color = (a) => a) {
        let str = "";
        for (let i = 0; i < size; i++) {
            str += char;
        }
        return color(str);
    }
    /**
     * 计算耗时
     */
    getTimeConsuming() {
        return ((Date.now() - this.startTime) / 10 / 60).toFixed(4);
    }
    /**
     * 拼接进度字符串
     * @param current 一个百分比的数值
     */
    assembly(current, isCompleted = false) {
        const { filledChar, filledCharColorFn, emptyChar, emptyCharColorFn, title, localSeconds, showTime, showTitle, showBrackets, showNumerical, numericalPosition, } = this.opts;
        // 计算不同状态的字符长度
        const filled_bar_length = (current * this.barLength) >> 0;
        const empty_bar_length = this.barLength - filled_bar_length;
        // 进行字符填充颜色处理等
        const empty = this.genChar(empty_bar_length, emptyChar, emptyCharColorFn);
        const filled = this.genChar(filled_bar_length, filledChar, filledCharColorFn);
        // 计算进度和百分比值
        const percentage = this.opts.numericalCharColorFn((current * 100).toFixed(2) + "%");
        const sec = this.getTimeConsuming();
        // 拼接输出字符串
        let baseStr = filled + empty;
        if (showBrackets)
            baseStr = `[${baseStr}]`;
        if (showNumerical)
            baseStr =
                numericalPosition === "left"
                    ? percentage + baseStr
                    : baseStr + percentage;
        if (showTitle)
            baseStr = this.opts.titleCharColorFn(title) + baseStr;
        if (showTime)
            baseStr += this.opts.timestampCharColorFn(`(${sec} ${localSeconds})`);
        return baseStr + (current * 100 >= 100 || isCompleted ? "\n" : "     ");
    }
    /**
     * 不断递归渲染进度条, 直到已经进度已经终止
     */
    startDrawThread(isCompleted = false) {
        if (this.isEnd)
            return;
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
    start(total) {
        // if (this.isStart) throw new Error("Don't call the start method repeatedly");
        // 不允许重复调用
        if (this.isStart)
            return;
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
    completeAndStart(total) {
        this.complete();
        this.start(total);
    }
    /**
     * 更新进度
     * @param progress 进度
     */
    update(progress) {
        // if (!this.isStart) throw new Error("Please call the start method first");
        // 进度已结束或者未开始则忽略调用
        if (this.isEnd || !this.isStart)
            return;
        this.current = Math.min(progress, this.total);
    }
    /**
     * 进度已经终止
     */
    complete() {
        // 进度已结束或者未开始则忽略调用
        if (this.isEnd || !this.start)
            return;
        // 因为绘制是相当于另开线程的, 所以此时需要立即绘制最后一次
        this.startDrawThread(true);
        this.clear();
        this.isEnd = true;
    }
}
