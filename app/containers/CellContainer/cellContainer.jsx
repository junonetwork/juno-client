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
  shouldRenderPredicateEnhancedInput,
  shouldRenderPredicateInput,
  shouldRenderIndexInput,
}                          from '../../components/Cell/cell';


const FAST_STEP = 2;

// TODO - perhaps all of this should be stored in focus module, so focus logic is
// centralized in the store.  For cases where focus logic should be calculated on
// read, focus descriptor could be generated in a selector on the fly, combining
// active w/ other store modules
const shouldFocus = (focusView, enhanceView, type, cellInput, leftCellType, upCellType) => (
  focusView &&
  !shouldRenderPredicateEnhancedInput(enhanceView, type, leftCellType) &&
  !shouldRenderPredicateInput(focusView, cellInput, type) &&
  !shouldRenderIndexInput(enhanceView, type, upCellType)
);


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
    ({ focusView, enhanceView, type, cellInput, leftCellType, upCellType, }) => (
      shouldFocus(focusView, enhanceView, type, cellInput, leftCellType, upCellType)
    ),
    {
      up: ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'up', 1);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      'alt+up': ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'up', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      down: ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'down', 1);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      'alt+down': ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'down', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      left: ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'left', 1);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      'alt+left': ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'left', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      right: ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'right', 1);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      'alt+right': ({ sheetId, column, row, cellInput, navigate, updateValue, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'right', FAST_STEP);

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      delete: ({
        sheetId, column, row, cellInput, setCellInput, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          setCellInput(cellInput.slice(0, -1));
        } else {
          updateValue(sheetId, column, row, cellInput);
        }
      },
      enter: ({
        sheetId, column, row, enhanceView, enhanceCell, cellInput,
        removeEnhanceCell, setCellInput, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        setCellInput('');

        if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
        } else if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
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
      onBlur: ({ focusView, enhanceView, type, leftCellType, cellInput, setCellInput, }) => () => {
        if (
          !shouldRenderPredicateEnhancedInput(enhanceView, type, leftCellType) &&
          !shouldRenderPredicateInput(focusView, cellInput, type)
        ) {
          console.log('blur cell container');
          setCellInput('');
        }
      },
    }
  )
)(Cell);
