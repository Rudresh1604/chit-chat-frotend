import { createSlice } from "@reduxjs/toolkit";

const rootSlice = createSlice({
  name: "root",
  initialState: {
    user: {
      // name: "John Doe",
      // pic: "https://media.istockphoto.com/id/1476170969/photo/portrait-of-young-man-ready-for-job-business-concept.jpg?s=612x612&w=is&k=20&c=6aYTwfOaqmcJSufJX5ZJNnI07GepPGZPSJ8hNmWPg8I=",
      // email: "test@test.com",
    },
    notification: [],
    selectedChat: null,
    chats: [],
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setNotifications: (state, action) => {
      state.notification = action.payload;
    },
  },
});

export const { setUser, setSelectedChat, setNotifications, setChats } =
  rootSlice.actions;
export default rootSlice.reducer;
