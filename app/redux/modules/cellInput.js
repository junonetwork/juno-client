import {
  SET_FOCUS,
}                     from './focus';


/**
 * selectors
 */
export const getCellInput = (state) => state.cellInput;


/**
 * constants
 */
const SET_CELL_INPUT = 'SET_CELL_INPUT';
const CLEAR_CELL_INPUT = 'CLEAR_CELL_INPUT';


/**
 * action creators
 */
export const setCellInput = (sheetId, column, row, value) => ({
  type: SET_CELL_INPUT, sheetId, column, row, value,
});

export const clearCellInput = () => ({
  type: CLEAR_CELL_INPUT,
});


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === SET_CELL_INPUT) {
    if (action.value === '' || action.value === undefined) {
      return {};
    }

    return {
      sheetId: action.sheetId,
      column: action.column,
      row: action.row,
      value: action.value,
    };
  } else if (action.type === CLEAR_CELL_INPUT) {
    return {};
  } else if (action.type === SET_FOCUS) {
    // reset whenever focus context changes
    return {};
  }

  return state;
};
