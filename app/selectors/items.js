export const selectItems = state => (
  Object.keys(state.items).map(itemId => (
    { id: itemId, name: state.items[itemId].name, description: state.items[itemId].description }
  ))
);
