import {
  compose,
  defaultProps,
}                            from 'recompose';
import withHotKeys           from '../../hoc/withHotKeys';
import CellTooltip           from '../../components/CellTooltip';

const noop = () => {};


export default compose(
  defaultProps({
    backwardsSelect: noop,
    forwardSelect: noop,
    arrowLeft: noop,
    arrowRight: noop,
    arrowAltLeft: noop,
    arrowAltRight: noop,
    arrowAltUp: noop,
    arrowAltDown: noop,
    enter: noop,
    shiftEnter: noop,
    exit: noop,
    blur: noop,
  }),
  withHotKeys(
    ({ id, }) => id,
    {
      up: ({ backwardSelect, }) => () => {
        backwardSelect();
      },
      down: ({ forwardSelect, }) => () => {
        forwardSelect();
      },
      'shift+up': ({ backwardSelect, }) => () => {
        backwardSelect();
      },
      'shift+down': ({ forwardSelect, }) => () => {
        forwardSelect();
      },
      left: ({ arrowLeft, }) => (e) => {
        arrowLeft(e);
      },
      right: ({ arrowRight, }) => (e) => {
        arrowRight(e);
      },
      'alt+left': ({ arrowAltLeft, }) => (e) => {
        arrowAltLeft(e);
      },
      'alt+right': ({ arrowAltRight, }) => (e) => {
        arrowAltRight(e);
      },
      'alt+up': ({ arrowAltUp, }) => (e) => {
        arrowAltUp(e);
      },
      'alt+down': ({ arrowAltDown, }) => (e) => {
        arrowAltDown(e);
      },
      enter: ({ enter, }) => () => {
        enter();
      },
      'shift+enter': ({ shiftEnter, }) => () => {
        shiftEnter();
      },
      esc: ({ exit, }) => () => {
        exit();
      },
      delete: ({ value, }) => (e) => {
        // if user presses delete when input is empty, don't delete column
        if (value === '') {
          e.preventDefault();
          e.stopPropagation();
        }

        return true;
      },
    },
    {
      onBlur: ({ blur, }) => () => blur(),
    }
  )
)(CellTooltip);
