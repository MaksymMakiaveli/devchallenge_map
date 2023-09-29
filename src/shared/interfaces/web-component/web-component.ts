import { AttributeValueDataType, ELEMENT_META_KEY } from './_constants';
import { ElementMetadata } from './element.metadata';
import { isVoid, readValue } from '../../utils';

export interface KeyValue {
  [key: string]: any;
}

export interface EventMap {
  [key: string]: (evt: any) => void;
}

export type EventHandler<K extends keyof HTMLElementEventMap> = (
  this: HTMLElement,
  ev: HTMLElementEventMap[K],
) => any;

export type ElementChanges = Map<string, { oldValue: any; newValue: any }>;

export type UIElement = string | WebComponent | HTMLElement;

export abstract class WebComponent extends HTMLElement {
  private readonly _metadata: ElementMetadata = null!;
  private _initialized: boolean = false;
  private _rendered: boolean = false;
  private _shadowRoot: ShadowRoot = null!;
  private _props = new Map<string, any>();
  private _changes = new Map<string, { oldValue: any; newValue: any }>();

  protected constructor() {
    super();
    this._metadata = (this.constructor as any)[ELEMENT_META_KEY];
  }

  get metadata() {
    return this._metadata;
  }

  $<T extends HTMLElement>(selector: string, element: UIElement = this): T | null {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return <any>this;
    }

    if (el === this) {
      return this._metadata.shadow
        ? this._shadowRoot.querySelector(selector)
        : this.querySelector(selector);
    }

    if (el instanceof WebComponent) {
      return el.$(selector);
    }

    return el.querySelector(selector) as T;
  }

  $$<T extends HTMLElement>(selector: string, element: UIElement = this): NodeListOf<T> | null {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return null;
    }

    if (el === this) {
      return this._metadata.shadow
        ? this._shadowRoot.querySelectorAll(selector)
        : this.querySelectorAll(selector);
    }

    if (el instanceof WebComponent) {
      return el.$$(selector);
    }

    return el.querySelectorAll(selector);
  }

  getAttr(name: string, element: UIElement = this): string {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return '';
    }

    return el.getAttribute(name) as string;
  }

  setAttr(obj: KeyValue, element: UIElement = this): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    Object.entries(obj).forEach(([key, value]) =>
      isVoid(value) ? this.removeAttr(key) : el.setAttribute(key, value),
    );
    return this;
  }

  removeAttr(attrs: string | Array<string>, element: UIElement = this): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    (Array.isArray(attrs) ? attrs : [attrs]).forEach((attr) => el.removeAttribute(attr));

    return this;
  }

  addStyle(styles: KeyValue, element: UIElement = this): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    Object.entries(styles).forEach(([k, v]) => {
      if (k.startsWith('--')) {
        el.style.setProperty(k, v);
      } else if (v === null) {
        this.removeStyles(k, el);
      } else {
        (el.style as any)[k] = v;
      }
    });
    return this;
  }

  /**
   * Clears the styles of an element.
   * @param [element] The element.
   */
  clearStyles(element: UIElement = this): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    el.style.cssText = '';
    return this;
  }

  removeStyles(styles: string | Array<string>, element: UIElement = this): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    (Array.isArray(styles) ? styles : [styles]).forEach(
      (style) => ((el.style as any)[style] = null),
    );
    return this;
  }

  hide(element: UIElement = this): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    this.addStyle({ display: 'none' }, el);
    return this;
  }

  enable(element: UIElement = this, enable = true): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    if (enable) {
      this.removeAttr('disabled', el);
    } else {
      this.setAttr({ disabled: true }, el);
    }

    return this;
  }

  on<K extends keyof HTMLElementEventMap>(
    eventName: K,
    handler: EventHandler<K>,
    element: UIElement | Window = this,
  ): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    const elEventHandlers = ((el as any)['__event_handlers__'] =
      (el as any)['__event_handlers__'] || new Map());
    if (!elEventHandlers.has(eventName)) {
      elEventHandlers.set(eventName, new Set());
    }

    if (elEventHandlers.get(eventName).has(handler)) {
      return this;
    }

    el.addEventListener(eventName, handler);
    elEventHandlers.get(eventName).add(handler);

    return this;
  }

  off<K extends keyof HTMLElementEventMap>(
    eventName: K,
    handler: EventHandler<K>,
    element: UIElement | Window = this,
  ): WebComponent {
    const el = this._element(element) as HTMLElement;

    if (!el) {
      return this;
    }

    el.removeEventListener(eventName, handler);

    const elEventHandlers = ((el as any)['__event_handlers__'] =
      (el as any)['__event_handlers__'] || new Map());
    if (!elEventHandlers.has(eventName)) {
      return this;
    }

    elEventHandlers.get(eventName).delete(handler);

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onChanges(changes: ElementChanges) {
    console.log('CHANGES', changes);
  }

  protected refresh() {
    this.onChanges(this._changes);
    this._changes.clear();
  }

  protected connectedCallback() {
    if (!this._rendered) {
      this.render();
      this._rendered = true;
    }

    if (!this._initialized) {
      this._applyAccessors();
      this._applyInputs();
      this._setHandlersScope();
      this._applyNonWindowHandlers();
      this._initialized = true;
    }

    this._applyWindowHandlers();
    this.onConnected();
    this.refresh();
  }

  protected render() {
    console.log(this._metadata);
    if (!this._metadata.template) {
      return;
    }

    const template = document.createElement('template');
    template.innerHTML = this._metadata.template;

    const { shadow } = this._metadata;

    if (shadow) {
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
    } else {
      this.appendChild(template.content.cloneNode(true));
    }
  }

  protected disconnectedCallback() {
    [...this._metadata.handlers]
      .filter(([element]) => element === 'window')
      .forEach(([, handlers]) =>
        handlers.forEach(({ eventName, handler }) =>
          this.off(
            eventName as keyof HTMLElementEventMap,
            (this as any)[handler].bind(this),
            window,
          ),
        ),
      );

    this.onDisconnected();
  }

  protected onConnected() {}

  protected onDisconnected() {}

  /**
   * Sets event handlers scope to `this`.
   */
  private _setHandlersScope() {
    [...this._metadata.handlers].forEach(([, handlers]) =>
      [...handlers].forEach(
        (handler) => ((this as any)[handler.handler] = (this as any)[handler.handler].bind(this)),
      ),
    );
  }

  /**
   * Reads non-window event handlers from metadata and subscribe to events.
   */
  private _applyNonWindowHandlers() {
    [...this._metadata.handlers]
      .filter(([element]) => element !== 'window')
      .forEach(([element, handlers]) => {
        [...handlers].forEach(({ eventName, all, handler }) => {
          let els;

          if (element === 'self') {
            els = [this];
          } else if (all) {
            els = this.$$(element);
          } else {
            els = [this.$(element)];
          }

          els?.forEach((el) =>
            this.on(eventName as keyof HTMLElementEventMap, (this as any)[handler], el),
          );
        });
      });
  }

  private _applyWindowHandlers() {
    [...this._metadata.handlers]
      .filter(([element]) => element === 'window')
      .forEach(([, handlers]) =>
        handlers.forEach(({ eventName, handler }) =>
          this.on(eventName as keyof HTMLElementEventMap, (this as any)[handler], window),
        ),
      );
  }

  private _element(el: UIElement | Window): UIElement | Window | null {
    if (el === 'window' || el === window) {
      return el;
    }

    if (arguments.length === 0 || el === 'self') {
      return this;
    }

    if (el === '$$body') {
      return document.body;
    }

    if (typeof el === 'string' && el.startsWith('$$this.')) {
      return <HTMLElement>readValue(this, el.substr('$$this.'.length));
    }

    if (el instanceof HTMLElement) {
      return el;
    }

    return this.$(el as string);
  }

  private _applyAccessors() {
    [...this._metadata.accessors].forEach(([prop, { selector, parent, all }]) => {
      Object.defineProperty(this, prop, {
        get() {
          return all ? this.$$(selector, parent) : this.$(selector, parent);
        },
      });
    });
  }

  private _pushChange(prop: string, value: any) {
    if (!this._changes.has(prop)) {
      this._changes.set(prop, { oldValue: (this as any)[prop], newValue: value });
      return;
    }

    const { oldValue, newValue } = this._changes.get(prop) as any;
    if (oldValue === newValue && this._initialized) {
      this._changes.delete(prop);
      return;
    }

    this._changes.set(prop, { oldValue, newValue: value });
  }

  private _applyInputs() {
    [...this._metadata.inputs].forEach(({ property, attribute, dataType }) => {
      let value;

      // If attribute flag is passed as `true` then read the initial value from the DOM
      // and parse it based on the data type before pushing it to the `_changes`
      // and storing it in `_props`.
      if (attribute) {
        let attrValue: any = this.getAttr(property);

        if (attrValue !== null) {
          if (dataType === AttributeValueDataType.NUMBER && !isNaN(parseFloat(attrValue))) {
            attrValue = parseFloat(attrValue);
          } else if (dataType === AttributeValueDataType.BOOLEAN) {
            attrValue = attrValue === 'true' || attrValue === '';
          }

          value = attrValue;
        } else {
          value = (this as any)[property];
        }

        if (!isVoid(value) && value !== attrValue) {
          this.setAttr({ [property]: value });
        }
      } else {
        value = (this as any)[property];
      }

      this._pushChange(property, value);
      this._props.set(property, value);

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const target = this;
      Object.defineProperty(this, property, {
        get() {
          return target._props.get(property);
        },
        set(value) {
          if (attribute) {
            if (value) {
              target.setAttr({
                [property]: !isVoid(value) ? value.toString() : value,
              });
            } else {
              target.removeAttr(property);
            }
          }

          target._pushChange(property, value);
          target._props.set(property, value);
        },
      });
    });
  }
}
