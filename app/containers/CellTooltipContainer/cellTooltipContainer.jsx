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
      up: ({ backwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        backwardSelect();
      },
      down: ({ forwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        forwardSelect();
      },
      'shift+up': ({ backwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        backwardSelect();
      },
      'shift+down': ({ forwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        forwardSelect();
      },
      left: ({ arrowLeft, }) => (e) => arrowLeft(e),
      right: ({ arrowRight, }) => (e) => arrowRight(e),
      'alt+left': ({ arrowAltLeft, }) => (e) => arrowAltLeft(e),
      'alt+right': ({ arrowAltRight, }) => (e) => arrowAltRight(e),
      'alt+up': ({ arrowAltUp, }) => (e) => arrowAltUp(e),
      'alt+down': ({ arrowAltDown, }) => (e) => arrowAltDown(e),
      enter: ({ enter, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        enter();
      },
      'shift+enter': ({ shiftEnter, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        shiftEnter();
      },
      esc: ({ exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        exit();
      },
      delete: ({ value, }) => (e) => {
        // if user presses delete when input is empty, don't delete column
        if (value === '') {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    },
    {
      onBlur: ({ blur, }) => () => blur(),
    }
  )
)(CellTooltip);
