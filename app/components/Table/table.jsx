import React                   from 'react';
import {}                      from 'prop-types';
import                              './style.scss';


const Table = ({ graphFragment, sheetMatrix }) => (
  <div
    className="table"
  >
    <pre>{JSON.stringify(graphFragment, null, 2)}</pre>
    <pre>{JSON.stringify(sheetMatrix, null, 2)}</pre>
  </div>
);


Table.propTypes = {};

export default Table;
