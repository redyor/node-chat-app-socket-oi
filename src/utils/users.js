const users = [];

// add, remove, getuser, getusers in room

const addUser = ({ id, username, room }) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // validate data
  if (!username || !room) {
    return { error: 'Username and room are required' };
  }
  // Checking if user already exist in the same room
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });
  // Validate Username
  if (existingUser) {
    return { error: 'Username already exist in this room' };
  }
  // store the user in the master array
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => {
    return user.id === id;
  });
};

const getUsersInRoom = room => {
  return users.filter(user => {
    return user.room === room.trim().toLowerCase();
  });
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
