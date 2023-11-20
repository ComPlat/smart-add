export interface EventEmitterOptions<EventPayload> {
  logger?: (log: string, payload?: EventPayload) => void
}

export type EventHandler<EventPayload> =
  | ((payload: EventPayload) => Promise<void> | void)
  | null
  | undefined

export class EventEmitter<EventPayload> {
  private handlerCount = 0

  private handlers: Array<EventHandler<EventPayload>> = []

  private options?: EventEmitterOptions<EventPayload>

  constructor(options?: EventEmitterOptions<EventPayload>) {
    this.options = options
  }

  public delete(handlerId: number) {
    this.options?.logger?.('off')
    delete this.handlers[handlerId]
  }

  public async emit(payload: EventPayload): Promise<void> {
    this.options?.logger?.('emit', payload)

    const promises = this.handlers
      .filter((handler) => handler)
      .map((handler) => handler?.(payload))
      .filter((res) => typeof res?.then === 'function')

    await Promise.all(promises)
  }

  public get numberOfHandlers() {
    return this.handlers.filter((h) => !!h).length
  }

  public off(handlerId: number) {
    this.delete(handlerId)
  }

  public on(handler: EventHandler<EventPayload>): number {
    this.options?.logger?.('on')
    this.handlers.push(handler)
    return this.handlerCount++
  }
}
