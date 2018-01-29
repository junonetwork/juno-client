import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import graphs              from './modules/graphs';
import tables              from './modules/tables';
import active              from './modules/active';
import teaser              from './modules/teaser';
import enhanced            from './modules/enhanced';
import dragTable           from './modules/dragTable';
import cellInput           from './modules/cellInput';
import windows             from './modules/windows';


export default combineReducers({
  sheets,
  graphs,
  tables,
  active,
  teaser,
  enhanced,
  dragTable,
  cellInput,
  windows,
});
