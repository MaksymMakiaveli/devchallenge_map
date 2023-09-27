const BASE_PREFIX = 'ui';

export const getTagNameWithPrefix = (tagName: string) => `${BASE_PREFIX}-${tagName}`;
