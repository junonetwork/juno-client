import {
  path,
}                             from 'ramda';
import {
  add,
  subtract,
  from,
}                             from 'base26';
import {
  batchActions,
}                             from 'redux-batched-actions';
import {
  formatAddress,
}                             from '../../utils/cell';
import {
  getSheetMaxColumn,
  getSheetMaxRow,
  increaseSheetMaxColumn,
  increaseSheetMaxRow,
}                             from './sheets';


/**
 * selectors
 */
export const getFocusDescriptor = (state) => state.focus;
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
export const setFocus = (focusDescriptor) =>
  ({ type: SET_FOCUS, focusDescriptor });
export const focusCell = (sheetId, address) =>
  ({ type: SET_FOCUS, focusDescriptor: { sheet: { sheetId, address } } });


export const navigate = (column, row, sheetId, direction, steps) => (dispatch, getState) => {
  const state = getState();
  const maxColumn = getSheetMaxColumn(state, sheetId);
  const maxRow = getSheetMaxRow(state, sheetId);
  let newRow = row;
  let newColumn = column;

  if (direction === 'right') {
    if (column === maxColumn) {
      // navigated off right of table, create new column
      return dispatch(batchActions([
        increaseSheetMaxColumn(sheetId),
        setFocus({ sheet: { sheetId, address: formatAddress(newColumn, newRow) } }),
      ]));
    } else if (from(add(column, steps)) > from(maxColumn)) {
      // navigated off table when stepping by > 1, navigate to edge of table
      newColumn = maxColumn;
    } else {
      newColumn = add(column, steps);
    }
  } else if (direction === 'down') {
    if (row === maxRow) {
      // navigated off bottom of table, create new row
      return dispatch(batchActions([
        increaseSheetMaxRow(sheetId),
        setFocus({ sheet: { sheetId, address: formatAddress(newColumn, newRow) } }),
      ]));
    } else if (row + steps > maxRow) {
      // navigated off table when stepping by > 1, navigate to edge of table
      newRow = maxRow;
    } else {
      newRow += steps;
    }
  } else if (direction === 'left') {
    if (column === 'a') {
      // navigated off left of table, noop
      return null;
    } else if (from(subtract(column, steps)) < from('a')) {
      // navigated off table when stepping by > 1, navigate to edge of table
      newColumn = 'a';
    } else {
      newColumn = subtract(column, steps);
    }
  } else if (direction === 'up') {
    if (row === 1) {
      // navigated off top of table, noop
      return null;
    } else if (row - steps < 1) {
      // navigated off table when stepping by > 1, navigate to edge of table
      newRow = 1;
    } else {
      newRow -= steps;
    }
  }

  return dispatch(setFocus({ sheet: { sheetId, address: formatAddress(newColumn, newRow) } }));
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
