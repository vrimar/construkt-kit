export type CommandHandler = () => boolean;

export class CommandRegistry {
  private readonly handlers = new Map<string, CommandHandler>();

  register(name: string, handler: CommandHandler): void {
    this.handlers.set(name, handler);
  }

  run(name: string): boolean {
    return this.handlers.get(name)?.() ?? false;
  }
}
