import { createElement } from 'react';
import {
  path,
  pathEq,
  prop,
  pathOr,
  last,
} from 'ramda';
import multimethod from './multimethod';
import {
  formatAddress,
  destructureAddress,
} from './cell';
import {
  serializeSearch,
} from '../redux/modules/tables';


// TODO - delete once not needed
export const getSearchCollectionPath = (type) => [
  'resource', type, 'skos:prefLabel', 0,
];

const getCollectionType = prop('type');

// TODO - consider creating simple types to make function dispatch easier
export const createSearchCollectionCell = multimethod(
  getCollectionType,
  [
    'search', (
      { search }, sheetId, tableId, column, row, type, graphFragment
    ) => ({
      type: 'searchCollection',
      sheetId,
      tableId,
      address: formatAddress(sheetId, column, row),
      column,
      row,
      search,
      cellInput: '',
      cellLength: path(
        ['json', 'collection', serializeSearch(search), 'length', 'value'],
        graphFragment
      ),
      value: path(['json', 'resource', type, 'skos:prefLabel', 0, 'value'], graphFragment),
      valueType: path(['json', 'resource', type, 'skos:prefLabel', 0, '$type'], graphFragment),
    }),
    'value', (
      { resourcePath }, sheetId, tableId, column, row, type, graphFragment
    ) => ({
      type: 'valueCollection',
      sheetId,
      tableId,
      address: formatAddress(sheetId, column, row),
      column,
      row,
      resourcePath,
      cellInput: '',
      cellLength: path(['json', ...resourcePath, 'length', 'value'], graphFragment),
      value: path(
        ['json', 'resource', last(resourcePath), 'skos:prefLabel', 0, 'value'],
        graphFragment
      ),
      valueType: path(
        ['json', 'resource', last(resourcePath), 'skos:prefLabel', 0, '$type'],
        graphFragment
      ),
    }),
  ]
);


export const createIndexCell = multimethod(
  getCollectionType,
  [
    'search', (
      { search }, sheetId, tableId, column, row, index, graphFragment
    ) => ({
      type: 'index',
      sheetId,
      tableId,
      address: formatAddress(sheetId, column, row),
      column,
      row,
      index,
      cellInput: '',
      value: index,
      valueType: path(
        ['json', 'collection', serializeSearch(search), index, '$type'],
        graphFragment
      ),
      absolutePath: path(
        ['json', 'collection', serializeSearch(search), index, '$__path'],
        graphFragment
      ),
    }),
    'value', (
      { resourcePath }, sheetId, tableId, column, row, index, graphFragment
    ) => {
      const valueLiteral = pathEq(['json', ...resourcePath, index, '$type'], 'atom', graphFragment);
      return {
        type: 'index',
        sheetId,
        tableId,
        address: formatAddress(sheetId, column, row),
        column,
        row,
        index,
        cellInput: '',
        value: valueLiteral ?
          // TODO - this can be a fragment element
          createElement(
            'div',
            { className: 'literal-value-collection' },
            createElement('span', null, index),
            createElement(
              'span',
              { className: 'value' },
              pathOr('', ['json', ...resourcePath, index, 'value'], graphFragment)
            )
          ) :
          index,
        // valueType: TODO
        absolutePath: valueLiteral ?
          [...resourcePath, index] :
          path(['json', ...resourcePath, index, '$__path'], graphFragment),
      };
    },
  ]
);


export const createPredicateCell = (
  sheetId, tableId, column, row, collectionAddress, uri, graphFragment
) => ({
  type: 'predicate',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  uri,
  // TODO - this is wonky - just store collectionAddress and derive predicateIdx when needed
  predicateIdx: column - destructureAddress(collectionAddress).column - 1,
  cellInput: '',
  value: path(['json', 'resource', uri, 'skos:prefLabel', 0, 'value'], graphFragment),
  valueType: path(['json', 'resource', uri, 'skos:prefLabel', 0, '$type'], graphFragment),
});


const getCellLength = (relativePath, graphFragment) => {
  const boxedCellLength = path([...relativePath, 'length'], graphFragment);
  if (
    !boxedCellLength ||
    boxedCellLength.$type === 'error' ||
    boxedCellLength.value === undefined
  ) {
    return 1;
  }
  return boxedCellLength.value;
};

const getBoxedValue = (relativePath, graphFragment) => {
  const boxValue = path([...relativePath, 0], graphFragment);
  if (!boxValue) {
    // TODO - shore up types: value + valueType should always be returned.
    return {};
  }

  // if boxValue points to an object, get its skos:prefLabel
  if (boxValue['skos:prefLabel']) {
    return {
      value: boxValue['skos:prefLabel'][0].value,
      valueType: boxValue['skos:prefLabel'][0].$type === 'error' ? 'error' : 'ref',
    };
  }

  return {
    value: boxValue.value,
    valueType: boxValue.$type,
  };
};

const getAbsolutePath = (cellLength, relativePath, graphFragment) => {
  let absolutePath;

  if (cellLength === 1 && path([...relativePath, 0, '$__path'], graphFragment)) {
    absolutePath = path([...relativePath, 0, '$__path'], graphFragment);
  } else if (path([...relativePath, '$__path'], graphFragment)) {
    absolutePath = path([...relativePath, '$__path'], graphFragment);
  } else {
    absolutePath = null;
  }

  return absolutePath;
};

export const createObjectCell = multimethod(
  getCollectionType,
  [
    'search', (
      { search }, sheetId, tableId, column, row, index, predicate, graphFragment
    ) => {
      const relativePath = ['json', 'collection', serializeSearch(search), index, predicate];
      const cellLength = getCellLength(relativePath, graphFragment);

      const { value, valueType } = getBoxedValue(relativePath, graphFragment);

      return {
        type: 'object',
        sheetId,
        tableId,
        address: formatAddress(sheetId, column, row),
        column,
        row,
        cellInput: '',
        absolutePath: getAbsolutePath(cellLength, relativePath, graphFragment),
        cellLength,
        value,
        valueType,
      };
    },
    'value', (
      { resourcePath }, sheetId, tableId, column, row, index, predicate, graphFragment
    ) => {
      const relativePath = ['json', ...resourcePath, index, predicate];
      const cellLength = getCellLength(relativePath, graphFragment);

      const { value, valueType } = getBoxedValue(relativePath, graphFragment);

      return {
        type: 'object',
        sheetId,
        tableId,
        address: formatAddress(sheetId, column, row),
        column,
        row,
        cellInput: '',
        absolutePath: getAbsolutePath(cellLength, relativePath, graphFragment),
        cellLength,
        value,
        valueType,
      };
    },
  ]
);


/**
 * @param {String} sheetId
 * @param {Number} column
 * @param {Number} row
 */
export const createEmptyCell = (
  sheetId, column, row
) => ({
  type: 'empty',
  sheetId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  cellInput: '',
});
