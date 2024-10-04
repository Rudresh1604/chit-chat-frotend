import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, useToast, Text } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat } from "../redux/rootSlice";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/chatLogics";
import GroupChatModal from "./miscallenous/GroupChatModal";

function MyChats({ fetchAgain }) {
  const [loggedUser, setLoggedUser] = useState();
  const { user, chats, selectedChat } = useSelector((state) => state.root);
  const dispatch = useDispatch();

  // !chakra  ui components
  const toast = useToast();
  const fetchChats = async () => {
    if (!user || !user.token) return; // Make sure user and token exist before making the request

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`, // Use user.token from Redux state
        },
      };

      const { data } = await axios.get("/api/chat", config); // Make the API call
      console.log("Data");
      console.log(data);

      dispatch(setChats(data));
      console.log("Chats are");
      console.log(chats);
    } catch (error) {
      console.log(error);

      toast({
        title: "Error Occured",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    // Get loggedUser from localStorage (if necessary)
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));

    fetchChats();
  }, [user]);
  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F80"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflow="hidden"
      >
        {chats ? (
          <Stack overflow="scroll">
            {chats?.map((chat) => (
              <Box
                onClick={() => {
                  dispatch(setSelectedChat(chat));
                  console.log(chats);
                }}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat?._id}
              >
                <Text>
                  {!chat?.isGroupChat
                    ? getSender(loggedUser, chat?.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
}

export default MyChats;
