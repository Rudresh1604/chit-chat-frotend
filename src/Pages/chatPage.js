import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import SideDrawer from "../components/miscallenous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { Box } from "@chakra-ui/react";
import { setUser } from "../redux/rootSlice";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    let userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      console.log(userInfo);
      dispatch(setUser(userInfo));
    } else {
      navigate("/");
    }
  }, []);

  const { user } = useSelector((state) => state.root);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
