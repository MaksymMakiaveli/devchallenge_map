import { AttributeValueDataType } from './_constants';

export class ElementMetadata {
  tagName: string = null!;

  template: string = null!;

  shadow: boolean = false;

  accessors = new Map<string, { selector: string; parent?: string; all?: boolean }>();

  handlers = new Map<string, Set<{ eventName: string; handler: string; all: boolean }>>();

  styleUrl: string = null!;

  inputs = new Set<{
    property: string;
    attribute: boolean;
    dataType: AttributeValueDataType;
  }>();
}
