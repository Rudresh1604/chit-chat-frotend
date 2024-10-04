import { ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Box,
  FormControl,
  Input,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserBadgeItem from "../User Avatar/UserBadgeItem";
import axios from "axios";
import { setSelectedChat } from "../../redux/rootSlice";
import UserListItem from "../User Avatar/UserListItem";

function UpdateGroupChatModel({ fetchAgain, setFetchAgain, fetchMessages }) {
  // ! all states are listed down
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const dispatch = useDispatch();

  const { user, selectedChat } = useSelector((state) => state.root);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();

  //   ! functions

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/removefromgroup",
        {
          groupId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      toast({
        title: "User successfully removed from group !",
        duration: 5000,
        status: "success",
        position: "top",
        isClosable: true,
      });
      console.log(data);

      //   optional if admin has left the group then no chats of that group will displayed
      if (user1._id === user._id) {
        dispatch(setSelectedChat()); // If admin removes themselves, clear the chat
      } else {
        const updatedChat = {
          ...selectedChat,
          users: selectedChat.users.filter((u) => u._id !== user1._id), // Filter out removed user
        };

        dispatch(setSelectedChat(updatedChat)); // Update chat with the new user list
      }
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured !",
        description: error.message,
        duration: 5000,
        status: "error",
        position: "top",
        isClosable: true,
      });
      setLoading(false);
    }
  };
  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group !",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/addtogroup",
        {
          groupId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      toast({
        title: "User added successfully to the group",
        duration: 5000,
        status: "success",
        position: "top",
        isClosable: true,
      });
      console.log(data);
      dispatch(setSelectedChat(data));
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured !",
        description: error.message,
        duration: 5000,
        status: "error",
        position: "top",
        isClosable: true,
      });
      setLoading(false);
    }
  };
  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/rename",
        {
          groupId: selectedChat?._id,
          chatName: groupChatName,
        },
        config
      );
      dispatch(setSelectedChat(data));
      toast({
        title: "Renamed Group successfully !",
        duration: 5000,
        status: "success",
        position: "top",
        isClosable: true,
      });
      setGroupChatName("");
      setRenameLoading(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured !",
        description: error.message,
        duration: 5000,
        status: "error",
        isClosable: true,
        position: "top",
      });
      setGroupChatName("");
      setRenameLoading(false);
    }
  };
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      console.log(data);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured !",
        description: "Failed to load the search results",
        status: error,
        isClosable: true,
        duration: 5000,
        position: "bottom-left",
      });
      setLoading(false);
      setSearchResult([]);
    }
  };

  return (
    <>
      <IconButton
        icon={<ViewIcon />}
        display={{ base: "flex" }}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName} </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" w="100%">
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add users eg: John, elon"
                mb={3}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box>
              {loading ? (
                <div>loading</div>
              ) : (
                searchResult?.map((u) => (
                  <UserListItem
                    key={u?._id}
                    user={u}
                    handleFunction={() => handleAddUser(u)}
                  />
                ))
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdateGroupChatModel;
