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
import throttle               from '../../utils/throttleAnimationFrame';


/**
 * selectors
 */
export const getFocusDescriptor = (state) => state.focus;
export const getCellFocusDescriptor = (state) =>
  path(['focus', 'sheet'], state);
export const cellIsFocused = (state, sheetId, address) =>
  path(['focus', 'sheet', 'sheetId'], state) === sheetId &&
  path(['focus', 'sheet', 'address'], state) === address;


/**
 * constants
 */
const SET_FOCUS = 'SET_FOCUS';


/**
 * actions
 */
export const setFocus = (focusDescriptor) => ({ type: SET_FOCUS, focusDescriptor, });
export const focusCell = (sheetId, column, row) => ({
  type: SET_FOCUS, focusDescriptor: { sheet: { sheetId, column, row, }, },
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
        focusCell(sheetId, column, row),
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
        focusCell(sheetId, column, row),
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

  return dispatch(focusCell(sheetId, column, row));
};


/**
 * reducer
 */
export default (state = {}, action) => {
  if (action.type === SET_FOCUS) {
    return action.focusDescriptor;
  }

  return state;
};


/**
 * epics
 */
