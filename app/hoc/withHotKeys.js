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
  // TODO - add letters, symbols
};

const event2HandlerKey = ({ which, metaKey, altKey, shiftKey, }) =>
  `${altKey ? 'alt+' : ''}${shiftKey ? 'shift+' : ''}${metaKey ? 'cmd+' : ''}${keyMap[which]}`;

const higherOrderNoop = () => () => {};

const withHotKeys = (
  id,
  hotKeyHandlers = {},
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

        if (hotKeyHandlers[key]) {
          hotKeyHandlers[key](this.props)(e);
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


// export const rootHotKeys = (store) => (BaseComponent) => {
//   const onBlur = store.dispatch(clearFocus());

//   return (props) => (
//     <div onBlur={onBlur}>
//       <BaseComponent {...props} />
//     </div>
//   );
// };


export default withHotKeys;
