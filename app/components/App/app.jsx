import { hot }              from 'react-hot-loader';
import React                from 'react';
import SplitPane            from 'react-split-pane';
import                           './style.scss';


const App = ({ elements, hotKeys, onKeyUp }) => (
  <div
    className="app-window"
    onKeyUp={onKeyUp}
    {...hotKeys}
  >
    <div className="pane-window">
      {/* TODO - adding/removing panes unmounts all elements */}
      {elements.length === 2 ?
        <SplitPane
          split="horizontal"
          size={260}
        >
          {elements.map(({ element, id }) => (
            // TODO validate that all window elements have an id prop
            <div key={id}>
              {element}
            </div>
          ))}
        </SplitPane> :
        elements[0].element
      }
    </div>
  </div>
);

/* export default App;*/
export default hot(module)(App);
