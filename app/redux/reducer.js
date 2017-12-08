import { combineReducers } from 'redux';
import sheets              from './modules/sheets';
import tables              from './modules/tables';


export default combineReducers({
  sheets,
  tables,
});
