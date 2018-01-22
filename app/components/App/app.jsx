
import React                from 'react';
import SplitPane            from 'react-split-pane';
import Table                from '../../containers/TableContainer';
import                           './style.scss';


const renderWindow = ({ id, type, matrix, }) => {
  if (type === 'sheet') {
    return (
      <Table
        key={id}
        sheetId={id}
        sheetMatrix={matrix}
      />
    );
  } else if (type === 'graph') {
    throw new Error('not implemented');
    // return (
    //   <div
    //     className="graph-window"
    //     tabIndex="0"
    //     >
    //     <ContainerDimensions>
    //     <GraphContainer sheetId="1" />
    //     </ContainerDimensions>
    //   </div>
    // );
  }

  throw new Error(`Unknown window type ${type}`);
};


export default ({ windows, }) => (
  <div
    className="app-window"
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
