
import React                from 'react';
import SplitPane            from 'react-split-pane';
import Table                from '../../containers/TableContainer';
import Graph                from '../../containers/GraphContainer';
import                           './style.scss';


const renderWindow = ({ id, type, data, }) => {
  if (type === 'sheet') {
    return (
      <Table
        key={id}
        sheetId={id}
        sheetMatrix={data}
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


export default ({ windows, hotKeys, }) => (
  <div
    className="app-window"
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
