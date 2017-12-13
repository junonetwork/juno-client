import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import tables              from './modules/tables';
import focus               from './modules/focus';


export default combineReducers({
  sheets,
  tables,
  focus,
});
