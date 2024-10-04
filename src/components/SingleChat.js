import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat, setNotifications } from "../redux/rootSlice";
import Typing from "./../resources/Typing Animation.json";
import Lottie from "lottie-react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/chatLogics";
import ProfileModal from "./miscallenous/ProfileModal";
import UpdateGroupChatModel from "./miscallenous/UpdateGroupChatModel";
import axios from "axios";
import ScrollableChats from "./ScrollableChats";
import io from "socket.io-client";
import "./style.css";

const ENDPOINT = process.env.ENDPOINT || "http://localhost:5000";
let socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();
  const { user, selectedChat, notification } = useSelector(
    (state) => state.root
  );

  // console.log("selected chat is");
  // console.log(selectedChat);

  // ! functions
  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat._id },
          config
        );

        socket.emit("new message", data);
        setNewMessage("");
        setMessages([...messages, data]);
      } catch (error) {
        console.log(error);
        toast({
          title: "Oops Error Occured !",
          description: error.message,
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        setNewMessage("");
      }
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    if (!user.token) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      console.log(data);

      setMessages(data);
      setLoading(false);
      // selected user will join the room using this
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
      toast({
        title: "Oops Error Occured !",
        description: error.message,
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 300;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // ! socket io functions
  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("setup", user);

    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [user]);
  useEffect(() => {
    // check for message
    socket.on("message recieved", (newMessageRecieved) => {
      // logic so that new msg recieved is showen to that chat only
      // else it will be given to notification
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // give notification
        if (!notification.includes(newMessageRecieved)) {
          dispatch(setNotifications([newMessageRecieved, ...notification]));
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  console.log(notification);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontFamily="Work sans"
            pb={3}
            px={2}
            w="100%"
            fontSize={{ base: "28px", md: "30px" }}
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => dispatch(setSelectedChat({}))}
            />
            {!selectedChat?.isGroupChat ? (
              <>
                {getSender(user, selectedChat?.users)}
                <ProfileModal user={getSenderFull(user, selectedChat?.users)} />
              </>
            ) : (
              <>
                {selectedChat?.chatName?.toUpperCase()}
                <UpdateGroupChatModel
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflow="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <>
                <div>
                  <ScrollableChats messages={messages} />{" "}
                </div>
              </>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <Lottie
                  animationData={Typing}
                  style={{
                    marginBottom: 15,
                    marginLeft: 0,
                    width: "70px",
                    height: "50px",
                  }}
                />
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message"
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
