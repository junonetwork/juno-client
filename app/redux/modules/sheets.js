/* eslint-disable arrow-body-style */
import {
  nthArg,
  omit,
  range,
  assoc,
  pipe,
  map,
  contains,
  reject,
  equals,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  getTablePathSets,
  getTableIds,
  getTableCells,
  ADD_SEARCH_COLLECTION_TABLE,
  REMOVE_TABLE,
}                                    from './tables';
import {
  getCellFocusDescriptor,
}                                    from './focus';
import {
  getCellTeaserDescriptor,
}                                    from './teaser';
import {
  getCellInput,
}                                    from './cellInput';
import {
  materializeSearchCollection,
  materializeIndex,
  materializePredicate,
  materializeObject,
  createEmpty,
}                                    from '../../utils/cell';
import {
  setRowInMatrix,
  updateInMatrix,
}                                    from '../../utils/table';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';
import {
  getEnhancedCells,
}                                     from './enhanced';


/**
 * utils
 */
const createSheet = (maxColumn, maxRow) =>
  ({ maxColumn, maxRow, tables: [], });

const path2Key = (path) => path.join();


/**
 * selectors
 */
export const getSheet = (state, sheetId) => state.sheets[sheetId];
export const getSheetMaxColumn = (state, sheetId) => state.sheets[sheetId].maxColumn;
export const getSheetMaxRow = (state, sheetId) => state.sheets[sheetId].maxRow;


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetPathSets = createCachedSelector(
  (state, sheetId) => {
    const tableIds = getTableIds(state, sheetId);

    if (tableIds.length > 0) {
      return tableIds.reduce((pathSets, tableId) => {
        pathSets.push(...getTablePathSets(state, tableId));
        return pathSets;
      }, []);
    }

    return [[]];
  },
  (pathSets) => pathSets
)(
  nthArg(1),
  {
    selectorCreator: arraySingleDepthEqualitySelector,
  }
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const createEmptySheet = createCachedSelector(
  nthArg(1),
  getSheetMaxColumn,
  getSheetMaxRow,
  (sheetId, maxColumn = 0, maxRow = 0) => (
    // TODO - b/c is 0-indexed, should be maxRow, not maxRow + 1
    range(0, maxRow + 1)
      .map((row) =>
        range(0, maxColumn + 1)
          .map((column) =>
            createEmpty(sheetId, column, row)
          )
      )
  )
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 */
export const getSheetTables = createCachedSelector(
  (state, sheetId) => (
    getTableIds(state, sheetId)
      .map((tableId) => getTableCells(state, sheetId, tableId))
  ),
  (tables) => {
    // console.log('getSheetTables');

    return tables;
  }
)(
  nthArg(1),
  {
    selectorCreator: arraySingleDepthEqualitySelector,
  }
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} tables
 */
export const tables2SheetMatrix = createCachedSelector(
  nthArg(1),
  nthArg(2),
  createEmptySheet,
  (sheetId, tables, emptySheetMatrix) => {
    // console.log('tables2SheetMatrix');

    return tables
      .reduce(
        (sheetMatrix, { column, row, table, }) => (
          table
            .slice(0, Math.max(sheetMatrix.length - row, 0))
            .reduce((_sheetMatrix, tableRow, idx) => (
              setRowInMatrix(column, row + idx, tableRow, _sheetMatrix)
            ), sheetMatrix)
        ),
        emptySheetMatrix
      );
  }
)(
  nthArg(1)
);


/**
 * @param {String} sheetId
 * @param {Object} graphFragment
 * @param {Object} sheetMatrix
 */
export const materializeSheetMatrix = createCachedSelector(
  nthArg(1),
  nthArg(2),
  (graphFragment, sheetMatrix) => {
    // console.log('materializeSheetMatrix');

    // TODO - use a Set
    const graphPathMap = {};
    const materializedSheetMatrix = sheetMatrix
      .map((row) => (
        row.map((cell) => {
          if (cell.type === 'searchCollection') {
            return materializeSearchCollection(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'index') {
            return materializeIndex(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'predicate') {
            return materializePredicate(cell, graphFragment, sheetMatrix);
          } else if (cell.type === 'object') {
            const materializedCell = materializeObject(cell, graphFragment, sheetMatrix);

            if (!materializedCell.absolutePath) {
              return materializedCell;
            } else if (graphPathMap[path2Key(materializedCell.absolutePath)]) {
              graphPathMap[path2Key(materializedCell.absolutePath)]
                .push([
                  materializedCell.column,
                  materializedCell.row,
                ]);

              return materializedCell;
            }

            graphPathMap[path2Key(materializedCell.absolutePath)] = [[
              materializedCell.column,
              materializedCell.row,
            ]];

            return materializedCell;
          } else if (cell.type === 'empty') {
            return cell;
          }

          throw new Error('tried to get path for unknown cell type', cell.type);
        })
      ));

    return { graphPathMap, matrix: materializedSheetMatrix, hints: {}, };
  }
)(
  nthArg(0)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 */
export const withCellInput = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getCellInput,
  (
    sheetId,
    matrix,
    { sheetId: inputSheetId, column, row, value, },
  ) => {
    if (value === undefined || sheetId !== inputSheetId) {
      return matrix;
    }

    return updateInMatrix(
      column,
      row,
      assoc('cellInput', value),
      matrix
    );
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} hints
 * @param {Object} sheetMatrix
 */
export const withFocus = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  getCellFocusDescriptor,
  (
    sheetId,
    hints,
    matrix,
    cellFocusDescriptor
  ) => {
    if (
      !cellFocusDescriptor ||
      cellFocusDescriptor.sheetId !== sheetId
    ) {
      return { matrix, hints, };
    }

    const { column: focusColumn, row: focusRow, } = cellFocusDescriptor;

    return {
      matrix: updateInMatrix(focusColumn, focusRow, assoc('focusView', true), matrix),
      hints: {
        ...hints,
        focusCellAbsolutePath: matrix[focusRow][focusColumn].absolutePath,
      },
    };
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} hints
 * @param {Object} sheetMatrix
 */
export const withTeaser = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  getCellTeaserDescriptor,
  (
    sheetId,
    hints,
    matrix,
    cellTeaserDescriptor
  ) => {
    if (
      !cellTeaserDescriptor ||
      cellTeaserDescriptor.sheetId !== sheetId
    ) {
      return { matrix, hints, };
    }

    const { column: teaserColumn, row: teaserRow, } = cellTeaserDescriptor;

    return {
      matrix: updateInMatrix(teaserColumn, teaserRow, assoc('teaserView', true), matrix),
      hints: {
        ...hints,
        teaserCellAbsolutePath: matrix[teaserRow][teaserColumn].absolutePath,
      },
    };
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 */
export const withEnhanced = createCachedSelector(
  nthArg(1),
  nthArg(2),
  getEnhancedCells,
  (
    sheetId,
    matrix,
    enhancedCells,
  ) => {
    // TODO - if sheetId doesn't match, just skip
    return enhancedCells
      .reduce((matrixWithEnhancedCells, { sheetId: enhancedSheetId, column, row, }) => (
        enhancedSheetId === sheetId ?
          updateInMatrix(column, row, assoc('enhanceView', true), matrixWithEnhancedCells) :
          matrixWithEnhancedCells
      ), matrix);
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} graphFragment
 * TODO - use a closure rather than pipe all args through
 */
export const getSheetMatrix = pipe(
  (state, sheetId, graphFragment) => ({
    state,
    sheetId,
    graphFragment,
    tables: getSheetTables(state, sheetId),
  }),
  ({ state, sheetId, graphFragment, tables, }) => ({
    state,
    sheetId,
    graphFragment,
    matrix: tables2SheetMatrix(state, sheetId, tables),
  }),
  ({ state, sheetId, graphFragment, matrix, }) => ({
    state,
    sheetId,
    ...materializeSheetMatrix(sheetId, graphFragment, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    ...withFocus(state, sheetId, hints, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    ...withTeaser(state, sheetId, hints, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    hints,
    matrix: withEnhanced(state, sheetId, matrix),
  }),
  ({ state, sheetId, graphPathMap, hints, matrix, }) => ({
    graphPathMap,
    hints,
    matrix: withCellInput(state, sheetId, matrix),
  })
);


/**
 * @param {String} sheetId
 * @param {String} focusCellAbsolutePath
 * @param {Object} graphPathMap
 * @param {Object} sheetMatrix
 */
export const withFocusHint = createCachedSelector(
  nthArg(0),
  nthArg(1),
  nthArg(2),
  nthArg(3),
  (sheetId, focusCellAbsolutePath, graphPathMap, matrix) => {
    if (!focusCellAbsolutePath) {
      return matrix;
    }

    // TODO - use pathOr
    return (graphPathMap[path2Key(focusCellAbsolutePath)] || [])
      .reduce((_matrix, [column, row]) => (
        updateInMatrix(column, row, assoc('focusNodeView', true), _matrix)
      ), matrix);
  }
)(
  nthArg(0)
);


/**
 * @param {String} sheetId
 * @param {String} teaserCellAbsolutePath
 * @param {Object} graphPathMap
 * @param {Object} sheetMatrix
 */
export const withTeaserHint = createCachedSelector(
  nthArg(0),
  nthArg(1),
  nthArg(2),
  nthArg(3),
  (sheetId, teaserCellAbsolutePath, graphPathMap, matrix) => {
    if (!teaserCellAbsolutePath) {
      return matrix;
    }

    // TODO use pathOr
    return (graphPathMap[path2Key(teaserCellAbsolutePath)] || [])
      .reduce((_matrix, [column, row]) => (
        updateInMatrix(column, row, assoc('teaserNodeView', true), _matrix)
      ), matrix);
  }
)(
  nthArg(0)
);


export const withHints = (
  sheetId,
  graphPathMap,
  { focusCellAbsolutePath, teaserCellAbsolutePath, },
  matrix
) => pipe(
  (_matrix) => withFocusHint(sheetId, focusCellAbsolutePath, graphPathMap, _matrix),
  (_matrix) => withTeaserHint(sheetId, teaserCellAbsolutePath, graphPathMap, _matrix)
)(matrix);


/**
 * constants
 */
export const ADD_SHEET = 'ADD_SHEET';
export const REMOVE_SHEET = 'REMOVE_SHEET';
export const INCREASE_SHEET_MAX_COLUMN = 'INCREASE_SHEET_MAX_COLUMN';
export const INCREASE_SHEET_MAX_ROW = 'INCREASE_SHEET_MAX_ROW';


/**
 * action creators
 */
export const addSheet = (sheetId, maxColumn, maxRow) =>
  ({ type: ADD_SHEET, sheetId, maxColumn, maxRow, });
export const removeSheet = (sheetId) =>
  ({ type: REMOVE_SHEET, sheetId, });
export const increaseSheetMaxColumn = (sheetId) =>
  ({ type: INCREASE_SHEET_MAX_COLUMN, sheetId, });
export const increaseSheetMaxRow = (sheetId) =>
  ({ type: INCREASE_SHEET_MAX_ROW, sheetId, });


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_SHEET) {
    const { maxColumn, maxRow, } = action;

    return {
      ...state,
      [action.sheetId]: createSheet(maxColumn, maxRow),
    };
  } else if (action.type === REMOVE_SHEET) {
    return omit([action.sheetId], state);
  } else if (action.type === INCREASE_SHEET_MAX_COLUMN) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        maxColumn: state[action.sheetId].maxColumn + 1,
      },
    };
  } else if (action.type === INCREASE_SHEET_MAX_ROW) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        maxRow: state[action.sheetId].maxRow + 1,
      },
    };
  } else if (action.type === ADD_SEARCH_COLLECTION_TABLE) {
    return {
      ...state,
      [action.sheetId]: {
        ...state[action.sheetId],
        tables: [...state[action.sheetId].tables, action.tableId],
      },
    };
  } else if (action.type === REMOVE_TABLE) {
    // TODO - remove nested tables
    return map((sheet) => ({
      ...sheet,
      tables: contains(action.tableId, sheet.tables) ?
        reject(equals(action.tableId), sheet.tables) :
        sheet.tables,
    }), state);
  }

  return state;
};
