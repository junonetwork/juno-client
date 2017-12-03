import React                   from 'react';
import {}                      from 'prop-types';
import                              './style.scss';


const Table = ({ graphFragment }) => (
  <div
    className="table"
  >
    {JSON.stringify(graphFragment, null, 2)}
  </div>
);


Table.propTypes = {};

export default Table;
