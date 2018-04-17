import { hot }              from 'react-hot-loader';
import React                from 'react';
import SplitPane            from 'react-split-pane';
import Table                from '../../containers/TableContainer';
import Graph                from '../../containers/GraphContainer';
import                           './style.scss';


const renderWindow = ({ id, type, data, canDrop, focus, }) => {
  if (type === 'sheet') {
    return (
      <Table
        key={id}
        sheetId={id}
        sheetMatrix={data}
        canDrop={canDrop}
        focus={focus}
      />
    );
  } else if (type === 'graph') {
    return (
      <Graph
        key={id}
        graphId={id}
        graph={data}
      />
    );
  }

  throw new Error(`Unknown window type ${type}`);
};


const App = ({ windows, hotKeys, onKeyUp }) => (
  <div
    className="app-window"
    onKeyUp={onKeyUp}
    {...hotKeys}
  >
    <div className="pane-window">
      {windows.length === 2 ?
        <SplitPane
          split="horizontal"
          size={260}
        >
          {
            windows.map(renderWindow)
          }
        </SplitPane> :
        renderWindow(windows[0])
      }
    </div>
  </div>
);

/* export default App;*/
export default hot(module)(App);
