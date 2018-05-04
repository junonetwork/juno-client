import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import graphs              from './modules/graphs';
import tables              from './modules/tables';
import teaser              from './modules/teaser';
import dragTable           from './modules/dragTable';
import focus               from './modules/focus';
import cellInput           from './modules/cellInput';
import windows             from './modules/windows';


export default combineReducers({
  sheets,
  graphs,
  tables,
  teaser,
  dragTable,
  focus,
  cellInput,
  windows,
});
