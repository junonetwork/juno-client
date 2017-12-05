import React                   from 'react';
import {}                      from 'prop-types';
import Row                     from '../Row';
import                              './style.scss';


const Table = ({ graphFragment, sheetMatrix }) => (
  <div className="table">
    <table>
      <tbody>
        {sheetMatrix && sheetMatrix.map((row, idx) => (
          <Row
            key={idx} // eslint-disable-line react/no-array-index-key
            row={row}
          />
        ))}
      </tbody>
    </table>
  </div>
);


Table.propTypes = {};

export default Table;
