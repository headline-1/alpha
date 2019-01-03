import { Logger } from './utils';

export type RevertFunction = () => Promise<void>;

export class RevertStack {
  private revertCommands: RevertFunction[] = [];
  private didRevert = false;

  add(fn: RevertFunction) {
    if (this.didRevert) {
      throw new Error('The command was already reverted. The stack can be reverted only once.');
    }
    this.revertCommands.push(fn);
  }

  async revert() {
    if (!this.didRevert) {
      if (!this.revertCommands.length) {
        Logger.log('RevertStack', `An error occurred during command execution.\n` +
          `It doesn't provide revert mechanism, so you may need to undo performed actions manually.`);
        return;
      }
      Logger.log('RevertStack', `Reverting all actions, because an error occurred during command execution.`);
      for (let i = this.revertCommands.length - 1; i >= 0; i--) {
        await this.revertCommands[i]();
      }
      this.didRevert = true;
    }
  }
}
