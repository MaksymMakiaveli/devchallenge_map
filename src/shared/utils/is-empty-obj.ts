export const isEmptyObj = (value: Record<string, unknown>) => {
  return Reflect.ownKeys(value).length === 0 && value.constructor === Object;
};
