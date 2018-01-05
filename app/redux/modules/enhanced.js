import {
  reject,
  equals,
}                         from 'ramda';
import {
  formatSheetAddress,
}                         from '../../utils/cell';

/**
 * selectors
 */
export const getEnhancedCells = (state) => state.enhanced;


/**
 * constants
 */
export const ADD_ENHANCED_CELL = 'ADD_ENHANCED_CELL';
export const REMOVE_ENHANCED_CELL = 'REMOVE_ENHANCED_CELL';


/**
 * actions
 */
export const addEnhancedCell = (sheetId, column, row) => ({
  type: ADD_ENHANCED_CELL, sheetId, column, row,
});
export const removeEnhancedCell = (sheetId, column, row) => ({
  type: REMOVE_ENHANCED_CELL, sheetId, column, row,
});


/**
 * reducer
 */
export default (state = [], { type, sheetId, column, row, }) => {
  if (type === ADD_ENHANCED_CELL) {
    return [...state, { sheetId, column, row, }];
  } else if (type === REMOVE_ENHANCED_CELL) {
    return reject(equals({ sheetId, column, row, }), state);
  }

  return state;
};
