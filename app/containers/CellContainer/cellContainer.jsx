import {
  prop,
}                          from 'ramda';
import {
  compose,
  pure,
  setDisplayName,
  withHandlers,
  withState,
  // shouldUpdate,
}                          from 'recompose';
import withHotKeys         from '../../hoc/withHotKeys';
import Cell                from '../../components/Cell';


const FAST_STEP = 2;

export default compose(
  setDisplayName('CellContainer'),
  // shouldUpdate((current, next) => {
  //   // Object.keys(current).forEach((prop) => {
  //   //   if (current[prop] !== next[prop]) {
  //   //     console.log('not memoized', prop);
  //   //   }
  //   // });

  //   return true;
  // }),
  pure,
  withState('cellInput', 'setCellInput', ''),
  withHotKeys(
    prop('focusView'),
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
      enter: ({ sheetId, column, row, enhanceView, enhanceCell, removeEnhanceCell, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (enhanceView) {
          console.log('remove')
          removeEnhanceCell(sheetId, column, row);
        } else {
          enhanceCell(sheetId, column, row);
        }
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
