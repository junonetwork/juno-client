import React                 from 'react';
import {}                    from 'prop-types';
import                            './style.scss';


const IndexInput = ({
  collapsedIndices, inputIsValid, hotKeys
}) => (
  <div
    className="index-input"
    {...hotKeys}
  >
    <div className={`input ${inputIsValid ? '' : 'invalid'}`}>
      {collapsedIndices}
    </div>

  </div>
);

IndexInput.propTypes = {};


export default IndexInput;
