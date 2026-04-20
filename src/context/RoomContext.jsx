import React, { createContext, useState, useContext, useCallback } from 'react';

const RoomContext = createContext();

export const useRoomContext = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [resources, setResources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);

  const value = {
    currentRoom,
    setCurrentRoom,
    members,
    setMembers,
    resources,
    setResources,
    messages,
    setMessages,
    tasks,
    setTasks
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
