import {
  compose,
  defaultProps,
  withHandlers,
  withStateHandlers,
}                          from 'recompose';
import withHotKeys         from '../../hoc/withHotKeys';
import AutocompleteInput   from '../../components/AutocompleteInput';


const noop = () => {};

export default compose(
  defaultProps({
    blur: noop,
    enter: noop,
    exit: noop,
  }),
  withStateHandlers(
    { selectionIdx: -1, },
    {
      forwardSelect: ({ selectionIdx, }, { list, }) => () => {
        if (list.length === 0) {
          return { selectionIdx: -1, };
        } else if (selectionIdx < list.length - 1) {
          return { selectionIdx: selectionIdx + 1, };
        }

        return {};
      },
      backwardSelect: ({ selectionIdx, }, { list, }) => () => {
        if (list.length === 0) {
          return { selectionIdx: -1, };
        } else if (selectionIdx > -1) {
          return { selectionIdx: selectionIdx - 1, };
        }

        return {};
      },
    }
  ),
  withHandlers({
    onKeyPress: ({ value, onChange, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      onChange(value + String.fromCharCode(e.which));
    },
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
      enter: ({ list, selectionIdx, enter, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        enter(list[selectionIdx]);
      },
      'shift+enter': ({ list, selectionIdx, enter, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        enter(list[selectionIdx]);
      },
      esc: ({ exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        exit();
      },
      delete: ({ value, onChange, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (value.length > 0) {
          onChange(value.slice(0, -1));
        }
      },
    },
    {
      onBlur: ({ blur, }) => () => blur(),
    }
  )
)(AutocompleteInput);
