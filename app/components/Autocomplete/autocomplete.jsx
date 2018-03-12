import React                   from 'react';
import {}                      from 'prop-types';
import AutocompleteItem        from '../AutocompleteItem';
import                              './style.scss';


// TODO - loading state
const Autocomplete = ({
  list, value, placeholder, selectionIdx, isFocused, status, lineHeight,
  hotKeys, click, onKeyPress,
}) => (
  <div
    className="autocomplete"
    onKeyPress={onKeyPress}
    {...hotKeys}
  >
    {
      isFocused ?
        <div>
          <div
            className="input-field"
            style={{
              lineHeight,
              height: lineHeight,
            }}
          >
            {
              selectionIdx === -1 && value === '' ?
                <span className="placeholder">{placeholder}</span> :
              selectionIdx === -1 ?
                // TODO - highlight matching letters, otherwise input while selectionIdx > -1 doesn't visualize
                value :
                list[selectionIdx].label
            }
          </div>

          {status === 'next' &&
            <div className="autocomplete-loading">
              <div className="spinner" />
            </div>
          }

          <div className="autocomplete-content">
            {
              list.length > 0 ?
                <ul className="autocomplete-list">
                  {list.map(({ uri, label, selected, }, idx) => (
                    <AutocompleteItem
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
        </div> :
      value ?
        <div><span className="value">{value}</span></div> :
        <div><em className="placeholder">{placeholder}</em></div>
    }
  </div>
);


Autocomplete.propTypes = {};

export default Autocomplete;
