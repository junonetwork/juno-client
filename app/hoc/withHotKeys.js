/* global document */
import {
  Component,
  createFactory,
}                    from 'react';
import {
  equals,
}                    from 'ramda';
import {
  shape,
}                    from 'prop-types';
import {
  setFocus,
  clearFocus,
}                    from '../redux/modules/focus';


// TODO - allow (e.g.) 'shift+a' to be specified as 'A', though keys that can't be capitalized should still be keyed using the shift keyword (e.g.) 'shift+left'
const keyMap = {
  8: 'delete',
  9: 'tab',
  13: 'enter',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  219: '[',
  220: '\\',
  221: ']',
  222: '\'',
};

const event2HandlerKey = ({ which, metaKey, altKey, ctrlKey, shiftKey }) => {
  const keys = [];

  if (altKey) {
    keys.push('alt');
  }
  if (shiftKey) {
    keys.push('shift');
  }
  if (metaKey) {
    keys.push('cmd');
  }
  if (ctrlKey) {
    keys.push('ctrl');
  }
  if (keyMap[which]) {
    keys.push(keyMap[which]);
  }

  return keys.join('+');
};

const higherOrderNoop = () => () => {};

const withHotKeys = (
  id,
  keyDown = {},
  options = {},
) => (BaseComponent) => {
  if (id === undefined) {
    throw new Error('withHotKeys must be passed a value or a function as the first argument');
  }

  const _id = typeof id === 'function' ?
    id :
    () => id;

  const {
    onFocus,
    onBlur,
  } = Object.assign({
    onFocus: higherOrderNoop,
    onBlur: higherOrderNoop,
  }, options);

  const factory = createFactory(BaseComponent);

  class WithHotKeys extends Component {
    componentDidMount() {
      if (
        equals(this.context.store.getState().focus, _id(this.props)) &&
        this.node !== document.activeElement
      ) {
        this.node.focus();
      }
    }

    componentDidUpdate() {
      if (
        equals(this.context.store.getState().focus, _id(this.props)) &&
        this.node !== document.activeElement
      ) {
        this.node.focus();
      }
    }

    componentWillUnmount() {
      if (equals(this.context.store.getState().focus, _id(this.props))) {
        this.context.store.dispatch(clearFocus());
      }
    }

    hotKeys = {
      tabIndex: 0,
      onKeyDown: (e) => {
        const key = event2HandlerKey(e);

        if (keyDown[key]) {
          const shouldAllowPropagation = keyDown[key](this.props)(e);
          if (!shouldAllowPropagation) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      },
      ref: (node) => {
        this.node = node;
      },
      onFocus: (e) => {
        e.stopPropagation();

        if (!equals(this.context.store.getState().focus, _id(this.props))) {
          this.context.store.dispatch(setFocus(_id(this.props)));
        }

        onFocus(this.props)(e);
      },
      onBlur: (e) => {
        onBlur(this.props)(e);
      },
    }

    render() {
      return factory({
        ...this.props,
        hotKeys: this.hotKeys,
        isFocused: equals(_id(this.props), this.context.store.getState().focus),
      });
    }
  }

  WithHotKeys.contextTypes = {
    store: shape(),
  };

  return WithHotKeys;
};


export default withHotKeys;
