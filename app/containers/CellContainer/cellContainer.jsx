import {
  compose,
  pure,
  setDisplayName,
  withHandlers,
  withState,
}                          from 'recompose';
import withHotKeys         from '../../hoc/withHotKeys';
import Cell                from '../../components/Cell';
import {
  shouldRenderPredicateInput,
  shouldRenderIndexInput,
}                          from '../../components/Cell/cell';


const FAST_STEP = 2;

export default compose(
  setDisplayName('CellContainer'),
  pure,
  withState('cellInput', 'setCellInput', ''),
  withHandlers({
    onClick: ({ sheetId, column, row, focusCell, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      focusCell(sheetId, column, row);
    },
    onMouseEnter: ({ sheetId, column, row, teaseCell, }) => () => {
      teaseCell(sheetId, column, row);
    },
    onKeyPress: ({ cellInput, setCellInput, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      setCellInput(cellInput + String.fromCharCode(e.which));
    },
  }),
  withHotKeys(
    ({ focusView, enhanceView, type, leftCellType, upCellType, }) => (
      focusView &&
      !shouldRenderPredicateInput(enhanceView, type, leftCellType) &&
      !shouldRenderIndexInput(enhanceView, type, upCellType)
    ),
    {
      up: ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'up', 1);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      'alt+up': ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'up', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      down: ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'down', 1);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      'alt+down': ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'down', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      left: ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'left', 1);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      'alt+left': ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'left', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      right: ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'right', 1);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      'alt+right': ({
        sheetId, tableId, type, column, row, cellInput, navigate, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'right', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      delete: ({
        sheetId, tableId, column, row, type, cellInput, setCellInput, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          setCellInput(cellInput.slice(0, -1));
        } else {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        }
      },
      enter: ({
        sheetId, tableId, column, row, type, enhanceView, enhanceCell, cellInput,
        removeEnhanceCell, setCellInput, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        setCellInput('');

        if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
        } else if (cellInput) {
          updateValue(sheetId, tableId, column, row, type, cellInput);
        } else {
          enhanceCell(sheetId, column, row);
        }
      },
      esc: ({
        sheetId, column, row, enhanceView, removeEnhanceCell, setCellInput,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        setCellInput('');

        if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
        }
      },
    },
    {
      onBlur: ({ setCellInput, }) => () => setCellInput(''),
    }
  )
)(Cell);
