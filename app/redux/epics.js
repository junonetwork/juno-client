import {
  editCellEpic,
}                        from './modules/tables';
import {
  updateGraphValueEpic,
  deleteGraphValueEpic,
}                        from './modules/falcor';


export default [
  editCellEpic,
  updateGraphValueEpic,
  deleteGraphValueEpic,
];
