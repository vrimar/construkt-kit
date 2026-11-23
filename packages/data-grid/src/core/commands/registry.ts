export type CommandHandler = () => boolean;

export type CommandInterceptor = (name: string) => boolean;

export class CommandRegistry {
  private readonly handlers = new Map<string, CommandHandler>();
  private interceptor: CommandInterceptor | null = null;

  register(name: string, handler: CommandHandler): void {
    this.handlers.set(name, handler);
  }

  intercept(interceptor: CommandInterceptor): () => void {
    this.interceptor = interceptor;
    return () => {
      if (this.interceptor === interceptor) this.interceptor = null;
    };
  }

  run(name: string): boolean {
    if (this.interceptor?.(name)) return true;
    return this.handlers.get(name)?.() ?? false;
  }
}
