import { useDelveMapContext } from '../context/DelveMapContext';

export function useUI() {
  const { state, dispatch } = useDelveMapContext();

  const toggleConnections = (show?: boolean) => {
    dispatch({ type: 'TOGGLE_CONNECTIONS', payload: show });
  };

  const toggleGrid = (show?: boolean) => {
    dispatch({ type: 'TOGGLE_GRID', payload: show });
  };

  return {
    showConnections: state.showConnections,
    gridVisible: state.gridVisible,
    toggleConnections,
    toggleGrid
  };
}