/* eslint-disable arrow-body-style */
import {
  nthArg,
  omit,
  range,
  assoc,
  pipe,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  getTablePathSets,
  getTableIds,
  getTableCells,
}                                    from './tables';
import {
  getCellFocusDescriptor,
}                                    from './focus';
import {
  getCellTeaserDescriptor,
}                                    from './teaser';
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
import { getEnhancedCells } from './enhanced';


/**
 * utils
 */
const createSheet = (maxColumn, maxRow) =>
  ({ maxColumn, maxRow, });


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
  (state, sheetId) => (
    getTableIds(state, sheetId).reduce((pathSets, tableId) => {
      pathSets.push(...getTablePathSets(state, tableId));
      return pathSets;
    }, [])
  ),
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
  (sheetId, maxColumn, maxRow) => (
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
            } else if (graphPathMap[materializedCell.absolutePath.join()]) {
              graphPathMap[materializedCell.absolutePath.join()]
                .push([
                  materializedCell.column,
                  materializedCell.row,
                ]);

              return materializedCell;
            }

            graphPathMap[materializedCell.absolutePath.join()] = [[
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

    return { graphPathMap, sheetMatrix: materializedSheetMatrix, };
  }
)(
  nthArg(0)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 * @param {Object} graphPathMap
 */
export const withFocus = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  getCellFocusDescriptor,
  (
    sheetId,
    matrix,
    graphPathMap,
    cellFocusDescriptor
  ) => {
    if (
      !cellFocusDescriptor
    ) {
      return matrix;
    }

    const { column: focusColumn, row: focusRow, } = cellFocusDescriptor;

    return pipe(
      (_matrix) => {
        if (cellFocusDescriptor.sheetId === sheetId) {
          return updateInMatrix(focusColumn, focusRow, assoc('focusView', true), _matrix);
        }

        return _matrix;
      },
      (_matrix) => {
        const focusCellAbsolutePath = matrix[focusRow][focusColumn].absolutePath;

        if (!focusCellAbsolutePath) {
          return _matrix;
        }

        return (graphPathMap[focusCellAbsolutePath.join()] || [])
          .reduce((__matrix, [column, row]) => (
            updateInMatrix(column, row, assoc('focusNodeView', true), __matrix)
          ), _matrix);
      }
    )(matrix);
  }
)(
  nthArg(1)
);


/**
 * @param {Object} state
 * @param {String} sheetId
 * @param {Object} sheetMatrix
 * @param {Object} graphPathMap
 */
export const withTeaser = createCachedSelector(
  nthArg(1),
  nthArg(2),
  nthArg(3),
  getCellTeaserDescriptor,
  (
    sheetId,
    matrix,
    graphPathMap,
    cellTeaserDescriptor
  ) => {
    if (
      !cellTeaserDescriptor ||
      !matrix[cellTeaserDescriptor.row][cellTeaserDescriptor.column].absolutePath
    ) {
      return matrix;
    }

    const { column: teaserColumn, row: teaserRow, } = cellTeaserDescriptor;

    const teaserCellAbsolutePath = matrix[teaserRow][teaserColumn].absolutePath;

    return (graphPathMap[teaserCellAbsolutePath.join()] || [])
      .reduce((_matrix, [column, row]) => {
        return updateInMatrix(column, row, assoc('teaserNodeView', true), _matrix);
      }, matrix);
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
    sheetMatrix: tables2SheetMatrix(state, sheetId, tables),
  }),
  ({ state, sheetId, graphFragment, sheetMatrix, }) => ({
    state,
    sheetId,
    ...materializeSheetMatrix(sheetId, graphFragment, sheetMatrix),
  }),
  ({ state, sheetId, graphPathMap, sheetMatrix, }) => ({
    state,
    sheetId,
    graphPathMap,
    sheetMatrix: withFocus(state, sheetId, sheetMatrix, graphPathMap),
  }),
  ({ state, sheetId, graphPathMap, sheetMatrix, }) => ({
    state,
    sheetId,
    sheetMatrix: withTeaser(state, sheetId, sheetMatrix, graphPathMap),
  }),
  ({ state, sheetId, sheetMatrix, }) => (
    withEnhanced(state, sheetId, sheetMatrix)
  )
);


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
    // TODO - remove nested sheets

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
  }

  return state;
};
