import React                 from 'react';
import {}                    from 'prop-types';
import                            './style.scss';


const IndexInput = ({
  indicesRangeString, inputIsValid, hotKeys, onKeyPress
}) => (
  <div
    className="index-input"
    onKeyPress={onKeyPress}
    {...hotKeys}
  >
    <div className={`input ${inputIsValid ? '' : 'invalid'}`}>
      {indicesRangeString}
    </div>

  </div>
);

IndexInput.propTypes = {};


export default IndexInput;
