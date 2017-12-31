import {
  prop,
}                          from 'ramda';
import {
  compose,
  pure,
  setDisplayName,
  withHandlers,
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
  withHotKeys(
    prop('focusView'),
    {
      up: ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'up', 1);
      },
      'alt+up': ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'up', FAST_STEP);
      },
      down: ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'down', 1);
      },
      'alt+down': ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'down', FAST_STEP);
      },
      left: ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'left', 1);
      },
      'alt+left': ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'left', FAST_STEP);
      },
      right: ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'right', 1);
      },
      'alt+right': ({ column, row, navigate, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigate(column, row, 'right', FAST_STEP);
      },
    }
  ),
  withHandlers({
    onClick: ({ column, row, focusCell, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      focusCell(column, row);
    },
  })
)(Cell);
