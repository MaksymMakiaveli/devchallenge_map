import { getMeta, setMeta } from './_utils';

type ElementDecoratorProps = {
  tagName: string;
  template?: string;
  shadow?: boolean;
  styleUrl?: string;
};

export function element(props: ElementDecoratorProps): ClassDecorator {
  const { tagName, template, shadow = false, styleUrl } = props;
  return (target: any) => {
    if (window.customElements.get(tagName)) {
      throw new Error(`Already an element is registered with the name ${tagName}`);
    }

    if (styleUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = styleUrl;

      // target?.appendChild(link);
    }

    window.customElements.define(tagName, target);
    setMeta(target, Object.assign(getMeta(target), { tagName, template, shadow, styleUrl }));
  };
}
