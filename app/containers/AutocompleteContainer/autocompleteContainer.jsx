import React, {
  Component,
}                          from 'react';
import withHotKeys         from '../../hoc/withHotKeys';
import Autocomplete        from '../../components/Autocomplete';


const noop = () => {};


const AutocompleteWithHotKeys = withHotKeys(
  ({ id, }) => id,
  {
    up: ({ backwardSelect, }) => () => backwardSelect(),
    down: ({ forwardSelect, }) => () => forwardSelect(),
    enter: ({ value, list, selectionIdx, enter, }) => () => {
      if (selectionIdx === -1) {
        enter(value, selectionIdx);
      } else {
        enter(list[selectionIdx].uri, selectionIdx);
      }
    },
    'shift+enter': ({ value, list, selectionIdx, enter, }) => () => {
      if (selectionIdx === -1) {
        enter(value, selectionIdx);
      } else {
        enter(list[selectionIdx].uri, selectionIdx);
      }
    },
    esc: ({ exit, }) => () => exit(),
    delete: ({ value, onChange, }) => () => {
      if (value.length > 0) {
        onChange(value.slice(0, -1));
      }
    },
  },
  {
    onBlur: ({ blur, }) => () => blur(),
  }
)(Autocomplete);

export default class AutocompleteContainer extends Component {
  state = { selectionIdx: -1, }

  componentWillUpdate({ list, }, { selectionIdx, }) {
    if (selectionIdx >= list.length) {
      this.setState({ selectionIdx: list.length - 1, }); // eslint-disable-line react/no-will-update-set-state
    }
  }

  onKeyPress = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.onChange(this.props.value + String.fromCharCode(e.which));
  }

  click = (uri, idx) => {
    this.props.enter(uri, idx);
  }

  forwardSelect = () => {
    if (this.state.selectionIdx < this.props.list.length - 1) {
      this.setState({ selectionIdx: this.state.selectionIdx + 1, });
    }
  }

  backwardSelect = () => {
    if (this.state.selectionIdx > -1) {
      this.setState({ selectionIdx: this.state.selectionIdx - 1, });
    }
  }

  render() {
    return (
      <AutocompleteWithHotKeys
        {...this.props}
        forwardSelect={this.forwardSelect}
        backwardSelect={this.backwardSelect}
        click={this.click}
        onKeyPress={this.onKeyPress}
        selectionIdx={Math.min(this.state.selectionIdx, this.props.list.length - 1)}
      />
    );
  }
}

AutocompleteContainer.defaultProps = {
  value: '',
  placeholder: '',
  blur: noop,
  enter: noop,
  exit: noop,
  onChange: noop,
  lineHeight: '22px',
};

/*
 * export default compose(
 *   defaultProps({
 *     value: '',
 *     placeholder: '',
 *     blur: noop,
 *     enter: noop,
 *     exit: noop,
 *     onChange: noop,
 *     lineHeight: '22px',
 *   }),
 *   withStateHandlers(
 *     { selectionIdx: -1, },
 *     {
 *       forwardSelect: ({ selectionIdx, }, { list, }) => () => {
 *         if (list.length === 0) {
 *           return { selectionIdx: -1, };
 *         } else if (selectionIdx < list.length - 1) {
 *           return { selectionIdx: selectionIdx + 1, };
 *         }
 *
 *         return {};
 *       },
 *       backwardSelect: ({ selectionIdx, }, { list, }) => () => {
 *         if (list.length === 0) {
 *           return { selectionIdx: -1, };
 *         } else if (selectionIdx > -1) {
 *           return { selectionIdx: selectionIdx - 1, };
 *         }
 *
 *         return {};
 *       },
 *       setSelectionIdx: () => (selectionIdx) => ({ selectionIdx, }),
 *     }
 *   ),
 *   // TODO - come up w/ better pattern for resetting selectionIdx
 *   // might be more useful/efficient to use a single component for this and above hocs
 *   withProps(({ selectionIdx, list, setSelectionIdx, }) => {
 *     if (selectionIdx >= list.length) {
 *       setSelectionIdx(list.length - 1);
 *       return { selectionIdx: list.length - 1, };
 *     }
 *     return {};
 *   }),
 *   withHandlers({
 *     onKeyPress: ({ value, onChange, }) => (e) => {
 *       e.preventDefault();
 *       e.stopPropagation();
 *
 *       onChange(value + String.fromCharCode(e.which));
 *     },
 *     click: ({ enter, }) => (uri, idx) => {
 *       enter(uri, idx);
 *     },
 *   }),
 *   withHotKeys(
 *    ({ id, }) => id,
 *    {
 *      up: ({ backwardSelect, }) => () => backwardSelect(),
 *      down: ({ forwardSelect, }) => () => forwardSelect(),
 *      enter: ({ value, list, selectionIdx, enter, }) => () => {
 *        if (selectionIdx === -1) {
 *          enter(value, selectionIdx);
 *        } else {
 *          enter(list[selectionIdx].uri, selectionIdx);
 *        }
 *      },
 *      'shift+enter': ({ value, list, selectionIdx, enter, }) => () => {
 *        if (selectionIdx === -1) {
 *          enter(value, selectionIdx);
 *        } else {
 *          enter(list[selectionIdx].uri, selectionIdx);
 *        }
 *      },
 *      esc: ({ exit, }) => () => exit(),
 *      delete: ({ value, onChange, }) => () => {
 *        if (value.length > 0) {
 *          onChange(value.slice(0, -1));
 *        }
 *      },
 *    },
 *    {
 *      onBlur: ({ blur, }) => () => blur(),
 *    }
 * )(Autocomplete);
 */
