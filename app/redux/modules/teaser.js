import {
  path,
}                             from 'ramda';


/**
 * selectors
 */
export const getTeaserDescriptor = (state) => state.teaser;
export const getCellTeaserDescriptor = (state) => path(['teaser', 'sheet'], state);


/**
 * constants
 */
export const SET_TEASER = 'SET_TEASER';
export const CLEAR_TEASER = 'CLEAR_TEASER';


/**
 * actions
 */
export const setTeaser = (teaserDescriptor) => ({ type: SET_TEASER, teaserDescriptor, });
export const teaseCell = (sheetId, column, row) => ({
  type: SET_TEASER, teaserDescriptor: { sheet: { sheetId, column, row, }, },
});


/**
 * reducer
 */
export default (state = {}, action) => {
  if (action.type === SET_TEASER) {
    return action.teaserDescriptor;
  } else if (action.type === CLEAR_TEASER) {
    return {};
  }

  return state;
};
