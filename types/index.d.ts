declare type ColorFn = (char: string) => string;
export interface ProgressOptions {
    title?: string;
    emptyChar?: string;
    showTime?: boolean;
    showTitle?: boolean;
    filledChar?: string;
    localSeconds?: string;
    showBrackets?: boolean;
    renderGapTime?: number;
    showColor?: boolean;
    filledCharColorFn?: ColorFn;
    emptyCharColorFn?: ColorFn;
    titleCharColorFn?: ColorFn;
    numericalCharColorFn?: ColorFn;
    timestampCharColorFn?: ColorFn;
    showNumerical?: boolean;
    numericalPosition?: "left" | "right";
}
export declare class ProgressBar {
    private total;
    private current;
    private readonly barLength;
    private readonly opts;
    private startTime;
    private isEnd;
    private isStart;
    constructor(opts?: ProgressOptions);
    private clear;
    private genChar;
    /**
     * 计算耗时
     */
    private getTimeConsuming;
    /**
     * 拼接进度字符串
     * @param current 一个百分比的数值
     */
    private assembly;
    /**
     * 不断递归渲染进度条, 直到已经进度已经终止
     */
    private startDrawThread;
    /**
     * 开始一个进度
     * @param total 表示 100% 进度的值
     */
    start(total: number): void;
    /**
     * 结束进度并开启一个新的进度条
     * @param total 表示 100% 进度的值
     */
    completeAndStart(total: number): void;
    /**
     * 更新进度
     * @param progress 进度
     */
    update(progress: number): void;
    /**
     * 进度已经终止
     */
    complete(): void;
}
export {};
