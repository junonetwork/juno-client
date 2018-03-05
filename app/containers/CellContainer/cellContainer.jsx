import {
  compose,
  setDisplayName,
  withHandlers,
}                          from 'recompose';
import {
  batchActions,
}                          from 'redux-batched-actions';
import withHotKeys         from '../../hoc/withHotKeys';
import {
  pureCellWithFocus,
}                          from '../../hoc/pureWithFocus';
import {
  addEnhancedCell,
  removeEnhancedCell,
}                          from '../../redux/modules/enhanced';
import {
  setCellInput,
  clearCellInput,
}                          from '../../redux/modules/cellInput';
import {
  cellId,
  predicateInputId,
  indexInputId,
  setFocus,
}                          from '../../redux/modules/focus';
import Cell                from '../../components/Cell';
import store               from '../../redux/store';

const { dispatch, } = store;
const FAST_STEP = 2;


const arrowKeyNavHandler = (direction, steps) =>
  ({ sheetId, column, row, navigate, }) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(sheetId, column, row, direction, steps);
  };


export default compose(
  setDisplayName('CellContainer'),
  pureCellWithFocus,
  withHandlers({
    onMouseEnter: ({ sheetId, column, row, teaseCell, }) => () => {
      teaseCell(sheetId, column, row);
    },
    onDragStart: ({ sheetId, tableId, column, row, startDragTable, }) => () => {
      startDragTable(sheetId, tableId, column, row);
    },
    onDragEnter: ({ sheetId, column, row, dragTable, }) => () => {
      dragTable(sheetId, column, row);
    },
    onDragEnd: ({ endDragTable, }) => () => {
      endDragTable();
    },
    onKeyPress: ({ sheetId, column, row, type, leftCellType, cellInput, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        type === 'predicate' ||
        leftCellType === 'predicate' ||
        leftCellType === 'searchCollection' ||
        leftCellType === 'objectCollection'
      ) {
        dispatch(batchActions([
          setFocus(predicateInputId(sheetId, column, row)),
          setCellInput(sheetId, column, row, cellInput + String.fromCharCode(e.which)),
        ], 'SET_CELL_INPUT'));
      } else {
        dispatch(setCellInput(sheetId, column, row, cellInput + String.fromCharCode(e.which)));
      }
    },
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => cellId(sheetId, column, row),
    {
      up: arrowKeyNavHandler('up', 1),
      'alt+up': arrowKeyNavHandler('up', FAST_STEP),
      down: arrowKeyNavHandler('down', 1),
      'alt+down': arrowKeyNavHandler('down', FAST_STEP),
      left: arrowKeyNavHandler('left', 1),
      'alt+left': arrowKeyNavHandler('left', FAST_STEP),
      right: arrowKeyNavHandler('right', 1),
      'alt+right': arrowKeyNavHandler('right', FAST_STEP),
      delete: ({
        sheetId, column, row, cellInput, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          dispatch(setCellInput(sheetId, column, row, cellInput.slice(0, -1)));
        } else {
          updateValue(sheetId, column, row, '');
        }
      },
      enter: ({
        sheetId, column, row, enhanceView, cellInput, type, leftCellType, upCellType,
        updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        } else if (enhanceView) {
          dispatch(removeEnhancedCell(sheetId, column, row));
        } else if (
          type === 'predicate' ||
          leftCellType === 'predicate' ||
          leftCellType === 'searchCollection' ||
          leftCellType === 'objectCollection'
        ) {
          dispatch(batchActions([
            addEnhancedCell(sheetId, column, row),
            setFocus(predicateInputId(sheetId, column, row)),
          ], 'SHOW_PREDICATE_INPUT'));
        } else if (
          type === 'index' ||
          upCellType === 'index' ||
          upCellType === 'searchCollection' ||
          upCellType === 'objectCollection'
        ) {
          dispatch(batchActions([
            addEnhancedCell(sheetId, column, row),
            setFocus(indexInputId(sheetId, column, row)),
          ], 'SHOW_INDEX_INPUT'));
        } else {
          dispatch(addEnhancedCell(sheetId, column, row));
        }
      },
      esc: ({
        sheetId, column, row, enhanceView,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (enhanceView) {
          dispatch(batchActions([
            clearCellInput(sheetId, column, row),
            removeEnhancedCell(sheetId, column, row),
          ]));
        } else {
          dispatch(clearCellInput(sheetId, column, row));
        }
      },
    },
  )
)(Cell);
