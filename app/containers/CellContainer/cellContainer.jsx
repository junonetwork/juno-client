import {
  compose,
  pure,
  setDisplayName,
  withHandlers,
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
const shouldFocus = (activeView, enhanceView, type, cellInput, leftCellType, upCellType) => (
  activeView &&
  !shouldRenderPredicateEnhancedInput(enhanceView, type, leftCellType) &&
  !shouldRenderPredicateInput(activeView, cellInput, type, leftCellType) &&
  !shouldRenderIndexInput(enhanceView, type, upCellType)
);

const arrowKeyNavHandler = (direction, steps) =>
  ({ sheetId, column, row, cellInput, updateValue, navigate, }) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cellInput) {
      updateValue(sheetId, column, row, cellInput);
      navigate(sheetId, column, row, direction, steps);
    } else {
      navigate(sheetId, column, row, direction, steps);
    }
  };


export default compose(
  setDisplayName('CellContainer'),
  pure,
  withHandlers({
    onClick: ({ sheetId, column, row, makeCellActive, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      makeCellActive(sheetId, column, row);
    },
    onMouseEnter: ({ sheetId, column, row, teaseCell, }) => () => {
      teaseCell(sheetId, column, row);
    },
    onKeyPress: ({ sheetId, column, row, cellInput, setCellInput, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      setCellInput(sheetId, column, row, cellInput + String.fromCharCode(e.which));
    },
  }),
  withHotKeys(
    ({ activeView, enhanceView, type, cellInput, leftCellType, upCellType, }) => (
      shouldFocus(activeView, enhanceView, type, cellInput, leftCellType, upCellType)
    ),
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
        sheetId, column, row, cellInput, setCellInput, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          setCellInput(sheetId, column, row, cellInput.slice(0, -1));
        } else {
          updateValue(sheetId, column, row, '');
        }
      },
      enter: ({
        sheetId, column, row, enhanceView, enhanceCell, cellInput,
        removeEnhanceCell, updateValue,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          updateValue(sheetId, column, row, cellInput);
        } else if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
        } else {
          enhanceCell(sheetId, column, row);
        }
      },
      esc: ({
        sheetId, column, row, enhanceView, removeEnhanceCell, clearCellInput,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        clearCellInput(sheetId, column, row);

        if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
        }
      },
    }
  )
)(Cell);
