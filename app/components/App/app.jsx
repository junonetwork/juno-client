
import React                from 'react';
import SplitPane            from 'react-split-pane';
// import ContainerDimensions  from 'react-container-dimensions';
import Table                from '../../containers/TableContainer';
import                           './style.scss';


export default ({ panelCount = 2, }) => (
  <div
    className="app-window"
  >
    <div className="pane-window">
      {panelCount === 2 ?
        <SplitPane
          split="horizontal"
          size={260}
        >
          {/*
            <div
              className="graph-window"
              tabIndex="0"
              >
              <ContainerDimensions>
              <GraphContainer sheetId="1" />
              </ContainerDimensions>
            </div>
          */}

          <Table sheetId="0" />

          <Table sheetId="0" />
        </SplitPane> :
        <Table sheetId="1" />
      }
    </div>
  </div>
);
