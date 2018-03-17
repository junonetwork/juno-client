import React                   from 'react';
import {}                      from 'prop-types';
import AutocompleteItem        from '../AutocompleteItem';
import                              './style.scss';


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
              status === 'next' ?
                <div className="autocomplete-loading">
                  <div className="spinner" />
                </div> :
              status === 'error' ?
                <div className="autocomplete-error">Error</div> :
              selectionIdx === -1 && value === '' ?
                <span className="placeholder">{placeholder}</span> :
              selectionIdx === -1 ?
                // TODO - highlight matching letters, otherwise input while selectionIdx > -1 doesn't visualize
                value :
                list[selectionIdx].label
            }
          </div>
          {
            status === 'complete' &&
              <div className="autocomplete-content scroll-styled">
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
          }
        </div> :
      value ?
        <div><span className="value">{value}</span></div> :
        <div><em className="value placeholder">{placeholder}</em></div>
    }
  </div>
);


Autocomplete.propTypes = {};

export default Autocomplete;
