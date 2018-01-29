import {
  path,
}                             from 'ramda';
import {
  START_DRAG_TABLE,
}                             from './dragTable';


/**
 * selectors
 */
export const getTeaserDescriptor = (state) => state.teaser;
export const getCellTeaserDescriptor = (state) => path(['teaser', 'sheet'], state);
export const getGraphTeaserDescriptor = (state) => path(['teaser', 'graph'], state);


/**
 * constants
 */
export const SET_TEASER = 'SET_TEASER';
export const CLEAR_TEASER = 'CLEAR_TEASER';


/**
 * actions
 */
export const setTeaser = (teaserDescriptor) => ({ type: SET_TEASER, teaserDescriptor, });
export const clearTeaser = () => ({ type: CLEAR_TEASER, });
export const teaseCell = (sheetId, column, row) => ({
  type: SET_TEASER, teaserDescriptor: { sheet: { sheetId, column, row, }, },
});
export const teaseGraphNode = (graphId, absolutePath) => ({
  type: SET_TEASER, teaserDescriptor: { graph: { graphId, path: absolutePath, }, },
});


/**
 * reducer
 */
export default (state = {}, action) => {
  if (action.type === SET_TEASER) {
    return action.teaserDescriptor;
  } else if (action.type === CLEAR_TEASER) {
    return {};
  } else if (action.type === START_DRAG_TABLE) {
    return {};
  }

  return state;
};
