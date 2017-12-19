import React            from 'react';
import {
  string,
  number,
  bool,
  shape,
}                        from 'prop-types';
// import {
//   VALUE,
// }                        from '../../constants/typeDefs';
import                        './style.scss';


const CellValue = ({ type, value, cellLength, pending }) => {
  if (type === 'error') {
    return (
      <div className="cell-value error" title={value}>ERR</div>
    );
  } else if (pending) {
    return (
      <div className="cell-value pending"><div className="spinner" /></div>
    );
  } else if (typeof value === 'undefined' || value === null) {
    return (
      // <div className="cell-value non-existent">-</div>
      <div className="cell-value non-existent" />
    );
  } else if (cellLength > 1) {
    return (
      <div className="cell-value multi">
        {value}
        <small>{`+${cellLength}`}</small>
      </div>
    );
  }
  return (
    <div className="cell-value single">{value}</div>
  );
};

CellValue.propTypes = {
  type: string.isRequired,
  value: string,
  cellLength: number.isRequired,
  pending: bool.isRequired,
};


export default CellValue;
