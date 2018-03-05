import {
  equals,
}                                    from 'ramda';
import {
  shallowEqual,
}                                    from 'recompose';
import {
  createSelectorCreator,
  defaultMemoize,
}                                    from 'reselect';


export const arraySingleDepthEqualitySelector = createSelectorCreator(
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


export const objectSingleDepthEqualitySelector = createSelectorCreator(
  defaultMemoize,
  shallowEqual
);


export const deepEqualitySelector = createSelectorCreator(
  defaultMemoize,
  equals
);
