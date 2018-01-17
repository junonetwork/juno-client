import {
  compose,
  pure,
  setDisplayName,
  withHandlers,
  withState,
}                          from 'recompose';
import withHotKeys         from '../../hoc/withHotKeys';
import {
  actionStreamDispatch,
}                          from '../../redux/store';
import {
  updateCellValue,
}                          from '../../redux/modules/tables';
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
  withHotKeys(
    ({ focusView, enhanceView, type, leftCellType, upCellType, }) => (
      focusView &&
      !shouldRenderPredicateInput(enhanceView, type, leftCellType) &&
      !shouldRenderIndexInput(enhanceView, type, upCellType)
    ),
    {
      up: ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'up', 1);
      },
      'alt+up': ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'up', FAST_STEP);
      },
      down: ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'down', 1);
      },
      'alt+down': ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'down', FAST_STEP);
      },
      left: ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'left', 1);
      },
      'alt+left': ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'left', FAST_STEP);
      },
      right: ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'right', 1);
      },
      'alt+right': ({ sheetId, column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(sheetId, column, row, 'right', FAST_STEP);
      },
      delete: ({ cellInput, setCellInput, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (cellInput) {
          setCellInput(cellInput.slice(0, -1));
        }
      },
      enter: ({
        sheetId, column, row, enhanceView, enhanceCell, removeEnhanceCell, setCellInput,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
          setCellInput('');
        } else {
          enhanceCell(sheetId, column, row);
        }
      },
      esc: ({
        sheetId, column, row, enhanceView, removeEnhanceCell, setCellInput,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (enhanceView) {
          removeEnhanceCell(sheetId, column, row);
        }

        setCellInput('');
      },
    }
  ),
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
  })
)(Cell);
