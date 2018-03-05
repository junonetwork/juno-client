import {
  batchActions,
}                             from 'redux-batched-actions';
import {
  getSheetMaxColumn,
  getSheetMaxRow,
  increaseSheetMaxColumn,
  increaseSheetMaxRow,
}                             from './sheets';
import {
  setFocus,
}                             from './focus';


export const navigate = (sheetId, column, row, direction, steps) => (dispatch, getState) => {
  const state = getState();
  const maxColumn = getSheetMaxColumn(state, sheetId);
  const maxRow = getSheetMaxRow(state, sheetId);

  if (direction === 'right') {
    if (column === maxColumn) {
      // navigated off right of table, create new column
      return dispatch(batchActions([
        increaseSheetMaxColumn(sheetId),
        setFocus({ sheetId, column, row, }),
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
        setFocus({ sheetId, column, row, }),
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

  return dispatch(setFocus({ sheetId, column, row, }));
};
