import React            from 'react';
import                        './style.scss';


const CellValue = ({ value, valueType, cellLength, }) => {
  if (valueType === 'error') {
    return (
      <span className="cell-value error" title={value && value.message}>ERR</span>
    );
  } else if (typeof value === 'undefined' || value === null) {
    return (
      <span className="cell-value non-existent" />
    );
  } else if (cellLength > 1) {
    return (
      <span className="cell-value multi">
        {value}
        <small>{`+${cellLength}`}</small>
      </span>
    );
  }

  return (
    <span className="cell-value single">{value}</span>
  );
};


export default CellValue;
