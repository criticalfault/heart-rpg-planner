import { useDelveMapContext } from '../context/DelveMapContext';
import { Connection } from '../types';

export function useConnections() {
  const { state, dispatch } = useDelveMapContext();

  const addConnection = (connection: Connection) => {
    dispatch({ type: 'ADD_CONNECTION', payload: connection });
  };

  const updateConnection = (id: string, connection: Partial<Connection>) => {
    dispatch({ type: 'UPDATE_CONNECTION', payload: { id, connection } });
  };

  const deleteConnection = (id: string) => {
    dispatch({ type: 'DELETE_CONNECTION', payload: id });
  };

  const getConnectionById = (id: string) => {
    return state.connections.find(connection => connection.id === id);
  };

  const getConnectionsForCard = (cardId: string) => {
    return state.connections.filter(
      connection => connection.fromId === cardId || connection.toId === cardId
    );
  };

  const createConnection = (fromId: string, toId: string, type: Connection['type']) => {
    const connection: Connection = {
      id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromId,
      toId,
      type
    };
    addConnection(connection);
    return connection;
  };

  const deleteConnectionsBetween = (cardId1: string, cardId2: string) => {
    const connectionsToDelete = state.connections.filter(
      connection => 
        (connection.fromId === cardId1 && connection.toId === cardId2) ||
        (connection.fromId === cardId2 && connection.toId === cardId1)
    );
    
    connectionsToDelete.forEach(connection => {
      deleteConnection(connection.id);
    });
  };

  return {
    connections: state.connections,
    addConnection,
    updateConnection,
    deleteConnection,
    getConnectionById,
    getConnectionsForCard,
    createConnection,
    deleteConnectionsBetween
  };
}