import {
  pipe,
  reduce,
}                                    from 'ramda';
import {
  getFocus,
}                                    from './focus';
import {
  getSheetMatrix,
  withHints as sheetMatrixWithHints,
  getSheetTableIds,
}                                    from './sheets';
import {
  getGraphJGF,
  getGraphTableIds,
  getGraphTeaserHint,
  graphWithHints,
}                                    from './graphs';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';
import {
  getTablePathSets,
}                                    from './tables';


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
      .reduce((tableIds, { id, type, }) => {
        if (type === 'sheet') {
          tableIds.push(...getSheetTableIds(state, id));
          return tableIds;
        } else if (type === 'graph') {
          tableIds.push(...getGraphTableIds(state, id));
          return tableIds;
        }

        throw new Error(`Unknown window type ${type}`);
      }, [])
      .reduce((pathSets, tableId) => {
        pathSets.push(...getTablePathSets(state, tableId));
        return pathSets;
      }, [])
  ),
  (windowPathSets) => windowPathSets
);


/**
 * @param {Object} state
 * @param {Object} graphFragment
 * @param {Array} windows
 */
export const windowsWithData = (state, graphFragment, windows) => {
  const focus = getFocus(state);

  return reduce((windowData, { id, type, }) => {
    // TODO - every window type should implement it's own get<WindowType>DataForWindow
    // that follows a single interface: (state, windowId, graphFragment) -> { windowWithData, hints }
    if (type === 'sheet') {
      const {
        graphPathMap, hints, matrix, canDrop,
      } = getSheetMatrix(state, id, graphFragment);

      windowData.windows.push({
        id,
        type,
        graphPathMap,
        data: matrix,
        canDrop,
        focus,
      });
      Object.assign(windowData.hints, hints);

      return windowData;
    } else if (type === 'graph') {
      windowData.windows.push({
        id,
        type,
        graphPathMap: {},
        data: getGraphJGF(state, id, graphFragment),
        focus,
      });
      Object.assign(
        windowData.hints,
        getGraphTeaserHint(state, id)
      );

      return windowData;
    }

    throw new Error(`Unknown window type ${type}`);
  }, { windows: [], hints: {}, }, windows);
};


export const windowsWithHints = (windows, hints) => (
  windows.map(({ id, type, graphPathMap, data, ...rest }) => {
    if (type === 'sheet') {
      return {
        ...rest,
        id,
        type,
        data: sheetMatrixWithHints(id, graphPathMap, hints, data),
      };
    } else if (type === 'graph') {
      return {
        ...rest,
        id,
        type,
        data: graphWithHints(id, hints, data),
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
      windowsWithData(state, graphFragment, windows)
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
