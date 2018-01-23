import {
  pipe,
  reduce,
}                                    from 'ramda';
import {
  getSheetPathSets,
  getSheetMatrix,
  withHints as sheetMatrixWithHints,
}                                    from './sheets';
import {
  getGraphJGF,
}                                    from './graphs';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';


/**
 * selectors
 */
export const getWindows = (state) => state.windows;


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
          return pathSets;
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
      const {
        graphPathMap, hints, matrix,
      } = getSheetMatrix(state, id, graphFragment);

      windowData.windows.push({
        id,
        type,
        graphPathMap,
        data: matrix,
      });
      Object.assign(windowData.hints, hints);

      return windowData;
    } else if (type === 'graph') {
      windowData.windows.push({
        id,
        type,
        graphPathMap: {},
        data: getGraphJGF(state, id, graphFragment),
      });

      return windowData;
    }

    throw new Error(`Unknown window type ${type}`);
  }, { windows: [], hints: {}, }, windows);


export const windowsWithHints = (windows, hints) => (
  windows.map(({ id, type, graphPathMap, data, }) => {
    if (type === 'sheet') {
      return {
        id,
        type,
        data: sheetMatrixWithHints(id, graphPathMap, hints, data),
      };
    } else if (type === 'graph') {
      return {
        id,
        type,
        data,
      };
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


/**
 * constants
 */
export const CREATE_WINDOW = 'CREATE_WINDOW';

export const DELETE_WINDOW = 'DELETE_WINDOW';


/**
 * action creators
 */
export const createWindow = () => ({
  type: CREATE_WINDOW,
});

export const deleteWindow = () => ({
  type: DELETE_WINDOW,
});


/**
 * reducer
 */
export default (
  state = [
    { id: '1', type: 'graph', },
    { id: '0', type: 'sheet', },
  ],
  action
) => {
  if (action.type === CREATE_WINDOW) {
    return [{ id: '1', type: 'graph', }, ...state];
  } else if (action.type === DELETE_WINDOW) {
    return [state[1]];
  }

  return state;
};
