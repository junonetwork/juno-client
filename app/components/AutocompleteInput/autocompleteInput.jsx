import React                   from 'react';
import {}                      from 'prop-types';
import AutocompleteInputItem   from '../AutocompleteInputItem';
import                              './style.scss';


const AutocompleteInput = ({
  list, value, selectionIdx, status, hotKeys, click, lineHeight,
  onKeyPress,
}) => (
  <div
    className="autocomplete-input"
    onKeyPress={onKeyPress}
    {...hotKeys}
  >
    <div
      className="input-field"
      style={{
        lineHeight,
        height: lineHeight,
      }}
    >
      {
        selectionIdx === -1 ?
          value :
          list[selectionIdx].label
      }
    </div>

    {status === 'next' &&
      <div className="autocomplete-loading">
        <div className="spinner" />
      </div>
    }

    {
      // value &&
        <div className="autocomplete-content">
          {
            list.length > 0 ?
              <ul className="autocomplete-list">
                {list.map(({ uri, label, selected, }, idx) => (
                  <AutocompleteInputItem
                    key={uri}
                    uri={uri}
                    label={label}
                    idx={idx}
                    selectionIdx={selectionIdx}
                    selected={selected}
                    click={click}
                  />
                ))}
              </ul> :
              <ul className="autocomplete-empty-list">none</ul>
          }
        </div>
    }
  </div>
);


AutocompleteInput.propTypes = {};

export default AutocompleteInput;
