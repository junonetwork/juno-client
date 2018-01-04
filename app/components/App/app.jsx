import React       from 'react';
import Table       from '../../containers/TableContainer';
import                  './style.scss';


export default () => (
  <div
    className="app-window"
  >
    <div className="pane-window">
      <div
        className="scroll-styled table-window"
      >
        <Table sheetId="0" />
      </div>
    </div>
  </div>
);
