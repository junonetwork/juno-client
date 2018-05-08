import {
  pipe,
  reduce,
  prop,
}                                    from 'ramda';
import {
  getFocus,
}                                    from './focus';
import {
  getSheetMatrix,
  withHints as sheetMatrixWithHints,
  getSheetCollections,
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
// TODO - do windows need an ID, or can we id by array index
export default (
  state = [
    { id: '0', type: 'sheet' },
  ],
  action
) => {
  if (action.type === CREATE_WINDOW) {
    return [{ id: '1', type: 'graph' }, ...state];
  } else if (action.type === DELETE_WINDOW) {
    return [state[1]];
  }

  return state;
};
