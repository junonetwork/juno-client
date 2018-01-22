import {
  path,
}                             from 'ramda';
import {
  batchActions,
}                             from 'redux-batched-actions';
import {
  getSheetMaxColumn,
  getSheetMaxRow,
  increaseSheetMaxColumn,
  increaseSheetMaxRow,
}                             from './sheets';


/**
 * selectors
 */
export const getActiveDescriptor = (state) => state.active;
export const getCellActiveDescriptor = (state) =>
  path(['active', 'sheet'], state);
export const cellIsActive = (state, sheetId, address) =>
  path(['active', 'sheet', 'sheetId'], state) === sheetId &&
  path(['active', 'sheet', 'address'], state) === address;


/**
 * constants
 */
const SET_ACTIVE = 'SET_ACTIVE';


/**
 * actions
 */
export const setActive = (activeDescriptor) => ({ type: SET_ACTIVE, activeDescriptor, });
export const makeCellActive = (sheetId, column, row) => ({
  type: SET_ACTIVE, activeDescriptor: { sheet: { sheetId, column, row, }, },
});


// TODO - convert to epic (does rxjs have throttleTime(raf)?)
export const navigate = (sheetId, column, row, direction, steps) => (dispatch, getState) => {
  const state = getState();
  const maxColumn = getSheetMaxColumn(state, sheetId);
  const maxRow = getSheetMaxRow(state, sheetId);

  if (direction === 'right') {
    if (column === maxColumn) {
      // navigated off right of table, create new column
      return dispatch(batchActions([
        increaseSheetMaxColumn(sheetId),
        makeCellActive(sheetId, column, row),
      ], 'CREATE_SHEET_COLUMN'));
    } else if (column + steps > maxColumn) {
      // navigated off table when stepping by > 1, navigate to edge of table
      column = maxColumn; // eslint-disable-line no-param-reassign
    } else {
      column += steps; // eslint-disable-line no-param-reassign
    }
  } else if (direction === 'down') {
    if (row === maxRow) {
      // navigated off bottom of table, create new row
      return dispatch(batchActions([
        increaseSheetMaxRow(sheetId),
        makeCellActive(sheetId, column, row),
      ], 'CREATE_SHEET_ROW'));
    } else if (row + steps > maxRow) {
      // navigated off table when stepping by > 1, navigate to edge of table
      row = maxRow; // eslint-disable-line no-param-reassign
    } else {
      row += steps; // eslint-disable-line no-param-reassign
    }
  } else if (direction === 'left') {
    if (column === 0) {
      // navigated off left of table, noop
      return null;
    } else if (column - steps < 0) {
      // navigated off table when stepping by > 1, navigate to edge of table
      column = 0; // eslint-disable-line no-param-reassign
    } else {
      column -= steps; // eslint-disable-line no-param-reassign
    }
  } else if (direction === 'up') {
    if (row === 0) {
      // navigated off top of table, noop
      return null;
    } else if (row - steps < 0) {
      // navigated off table when stepping by > 1, navigate to edge of table
      row = 1; // eslint-disable-line no-param-reassign
    } else {
      row -= steps; // eslint-disable-line no-param-reassign
    }
  }

  return dispatch(makeCellActive(sheetId, column, row));
};


/**
 * reducer
 */
export default (state = {}, action) => {
  if (action.type === SET_ACTIVE) {
    return action.activeDescriptor;
  }

  return state;
};


/**
 * epics
 */
