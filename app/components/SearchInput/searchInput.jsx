import React                   from 'react';
import {}                      from 'prop-types';
import SearchInputRepositoryContainer from '../../containers/SearchInputRepositoryContainer';
import SearchInputTypeContainer from '../../containers/SearchInputTypeContainer';
import                              './style.scss';


const lineHeight = '22px';


const SearchInput = ({
  tableId, sheetId, column, row, focus, repository, typeLabel,
  hotKeys, setRepository, create, update, setTypeLabel,
}) => (
  <div
    className="search-input"
    {...hotKeys}
  >
    <div
      className="search-line"
      style={{ lineHeight, }}
    >
      <span className="search-label">Search</span>
      <SearchInputRepositoryContainer
        repository={repository}
        sheetId={sheetId}
        column={column}
        row={row}
        focus={focus}
        lineHeight={lineHeight}
        setInput={setRepository}
      />
    </div>
    <div
      className="search-line"
      style={{ lineHeight, }}
    >
      <span className="search-label">For</span>
      <SearchInputTypeContainer
        repository={repository}
        typeLabel={typeLabel}
        tableId={tableId}
        sheetId={sheetId}
        column={column}
        row={row}
        focus={focus}
        lineHeight={lineHeight}
        setInput={setTypeLabel}
        create={create}
        update={update}
      />
    </div>
  </div>
);


SearchInput.propTypes = {};

export default SearchInput;
