import React                   from 'react';
import {}                      from 'prop-types';
import SearchInputRepositoryContainer from '../../containers/SearchInputRepositoryContainer';
import SearchInputTypeContainer from '../../containers/SearchInputTypeContainer';
import                              './style.scss';


const lineHeight = '22px';


const SearchInput = ({
  searchIsValid, tableId, sheetId, column, row, focus, repository, typeLabel,
  hotKeys, setRepository, create, update, setType,
}) => (
  <div
    className={`search-input ${searchIsValid ? '' : 'invalid'}`}
    style={{
      lineHeight,
      gridTemplateRows: lineHeight,
    }}
    {...hotKeys}
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
      setInput={setType}
      create={create}
      update={update}
    />
  </div>
);


SearchInput.propTypes = {};

export default SearchInput;
