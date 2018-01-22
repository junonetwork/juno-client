import {
  pipe,
  reduce,
}                                    from 'ramda';
import {
  getSheetPathSets,
  getSheetMatrix,
  withHints,
}                                    from './sheets';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';


/**
 * selectors
 */
export const getWindows = () => ([
  { id: '0', type: 'sheet', },
  { id: '1', type: 'sheet', },
]);


/**
 * @param {Object} state
 */
export const getPathSets = arraySingleDepthEqualitySelector(
  (state) => (
    getWindows(state)
      .reduce((pathSets, { id, type, }) => {
        if (type === 'sheet') {
          pathSets.push(...getSheetPathSets(state, id));
          return pathSets;
        } else if (type === 'graph') {
          throw new Error('Not Implemented');
        }

        throw new Error(`Unknown window type ${type}`);
      }, [])
  ),
  (windowPathSets) => windowPathSets
);


/**
 * @param {Object} state
 * @param {Object} graphFragment
 * @param {Array} windows
 */
export const getDataForWindows = (state, graphFragment, windows) =>
  reduce((windowData, { id, type, }) => {
    if (type === 'sheet') {
      // TODO - just pass graphFragment
      const {
        graphPathMap, hints, matrix,
      } = getSheetMatrix(state, id, graphFragment.json || {});

      windowData.windows.push({ id, type, graphPathMap, matrix, });
      Object.assign(windowData.hints, hints);

      return windowData;
    } else if (type === 'graph') {
      throw new Error('Not Implemented');
    }

    throw new Error(`Unknown window type ${type}`);
  }, { windows: [], hints: {}, }, windows);


export const windowsWithHints = (windows, hints) => (
  windows.map(({ id, type, graphPathMap, matrix, }) => {
    if (type === 'sheet') {
      return {
        id,
        type,
        matrix: withHints(id, graphPathMap, hints, matrix),
      };
    } else if (type === 'graph') {
      throw new Error('Not Implemented');
    }

    throw new Error(`Unknown window type ${type}`);
  })
);


/**
 * @param {Object} state
 * @param {Object} graphFragment
 */
export const getMaterializedWindows = arraySingleDepthEqualitySelector(
  pipe(
    (state, graphFragment) => ({
      state,
      graphFragment,
      windows: getWindows(state),
    }),
    ({ state, graphFragment, windows, }) => (
      getDataForWindows(state, graphFragment, windows)
    ),
    ({ windows, hints, }) => (
      windowsWithHints(windows, hints)
    )
  ),
  (windows) => windows
);
