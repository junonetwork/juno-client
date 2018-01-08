import React                   from 'react';
import {}                      from 'prop-types';
import Row                     from '../Row';
import                              './style.scss';


const Table = ({ sheetMatrix, ...functions }) => (
  <table
    className="table"
    role="grid"
  >
    <tbody>
      {sheetMatrix.map((row, idx) => (
        <Row
          key={idx} // eslint-disable-line react/no-array-index-key
          row={row}
          upperRow={sheetMatrix[idx - 1]}
          {...functions}
        />
      ))}
    </tbody>
  </table>
);


Table.propTypes = {};

export default Table;
