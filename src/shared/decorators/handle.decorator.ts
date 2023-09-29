import { getMeta, setMeta } from './_utils';

export function handle<T extends keyof HTMLElementEventMap>(
  eventName: T,
  element = 'self',
  all = false,
) {
  return function (target: object, handler: string) {
    const metadata = getMeta(target.constructor),
      { handlers } = metadata;

    if (!handlers.has(element)) {
      handlers.set(element, new Set<{ eventName: string; handler: string; all: boolean }>());
    }

    handlers.get(element).add({ eventName, handler, all });
    setMeta(target.constructor, metadata);
  };
}
