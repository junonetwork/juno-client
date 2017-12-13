import {
  Component,
  createFactory,
}                    from 'react';


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
  // TODO - add letters, numbers, symbols
};

const event2HandlerKey = ({ which, metaKey, altKey, shiftKey }) =>
  `${altKey ? 'alt+' : ''}${shiftKey ? 'shift+' : ''}${metaKey ? 'cmd+' : ''}${keyMap[which]}`;


const withHotKeys = (
  focus = () => true,
  hotKeyHandlers = {},
) => (BaseComponent) => {
  const factory = createFactory(BaseComponent);

  return class WithHotKeys extends Component {
    componentDidUpdate() {
      if (focus(this.props)) {
        this.node.focus();
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
    }

    render() {
      return factory({
        ...this.props,
        hotKeys: this.hotKeys,
      });
    }
  };
};


export default withHotKeys;
