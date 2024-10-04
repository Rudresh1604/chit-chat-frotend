import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Login from "../components/authentication/Login";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/rootSlice";
import Signup from "../components/authentication/Signup";

function HomePage() {
  const dispatch = useDispatch();
  const [islogin, setLogin] = useState(false);
  const { user } = useSelector((state) => state.root);
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("userInfo")) {
      let userInfo = localStorage.getItem("userInfo");
      setLogin(true);
      console.log(user);

      dispatch(setUser(JSON.parse(userInfo)));
      navigate("/chats");
    } else {
      setLogin(false);
    }
  }, [islogin]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default HomePage;
