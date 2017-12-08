import {
  equals,
}                                    from 'ramda';
import {
  createSelectorCreator,
  defaultMemoize,
}                                    from 'reselect';


export const createSingleDepthEqualitySelector = createSelectorCreator(
  defaultMemoize,
  (prev, next) => {
    if (Array.isArray(prev) && Array.isArray(next) && prev.length === next.length) {
      for (let i = 0; i < prev.length; i++) { // eslint-disable-line no-plusplus
        if (prev[i] !== next[i]) {
          return false;
        }
      }

      return true;
    }

    return prev === next;
  }
);

export const createDeepEqualitySelector = createSelectorCreator(
  defaultMemoize,
  (prev, next) => equals(prev, next)
);
