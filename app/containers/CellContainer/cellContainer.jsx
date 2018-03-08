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
  setCellInput,
  clearCellInput,
}                          from '../../redux/modules/cellInput';
import {
  cellId,
  searchInputRepositoryId,
  predicateInputId,
  indexInputId,
  setFocus,
}                          from '../../redux/modules/focus';
import Cell                from '../../components/Cell';
import store               from '../../redux/store';
import {
  FAST_STEP,
}                          from '../../preferences';

const { dispatch, } = store;


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
      } else if (type === 'searchCollection') {
        // input for searchCollection is handled in SearchInputContainer
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
        sheetId, column, row, cellInput, type, leftCellType, upCellType,
        updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        } else if (
          type === 'searchCollection' ||
          type === 'objectCollection' ||
          type === 'empty'
        ) {
          /* dispatch(setFocus(searchInputRepositoryId(sheetId, column, row))); */
        } else if (
          type === 'predicate' ||
          leftCellType === 'predicate' ||
          leftCellType === 'searchCollection' ||
          leftCellType === 'objectCollection'
        ) {
          dispatch(setFocus(predicateInputId(sheetId, column, row)));
        } else if (
          type === 'index' ||
          upCellType === 'index' ||
          upCellType === 'searchCollection' ||
          upCellType === 'objectCollection'
        ) {
          dispatch(setFocus(indexInputId(sheetId, column, row)));
        }
      },
      esc: ({
        sheetId, column, row,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(clearCellInput(sheetId, column, row));
      },
    },
    /* TODO - enter value when navigating away from cell
     *
     * {
     *   onBlur: ({
     *     sheetId, column, row, cellInput, updateValue,
     *   }) => () => {
     *     console.log('blur', cellInput)
     *     if (cellInput) {
     *       updateValue(sheetId, column, row, cellInput);
     *     } else {
     *       dispatch({ type: 'NO_OP' });
     *     }
     *   },
     * },
     */
  )
)(Cell);
