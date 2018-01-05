import React                   from 'react';
import {}                      from 'prop-types';
import {
  pure,
}                              from 'recompose';
import Cell                    from '../../containers/CellContainer';


const Row = ({
  row, focusCell, teaseCell, enhanceCell, removeEnhanceCell, navigate
}) => (
  <tr
    className="row"
  >
    {row.map((cell) => (
      <Cell
        key={cell.address}
        {...cell}
        focusCell={focusCell}
        teaseCell={teaseCell}
        enhanceCell={enhanceCell}
        removeEnhanceCell={removeEnhanceCell}
        navigate={navigate}
      />
    ))}
  </tr>
);


Row.propTypes = {};

export default pure(Row);
