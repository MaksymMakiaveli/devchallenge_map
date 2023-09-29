import {ELEMENT_META_KEY, ElementMetadata} from '../../interfaces'; // eslint-disable-next-line @typescript-eslint/ban-types

// eslint-disable-next-line @typescript-eslint/ban-types
export function setMeta(target: Function, meta: ElementMetadata) {
  (target as any)[ELEMENT_META_KEY] = meta;
}
