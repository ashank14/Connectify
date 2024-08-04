import React, { useEffect } from "react";
import Bottombar from "../components/Bottombar";
import "../assets/styles/black.css";
import Sidebar from "../components/Sidebar";
import Addfriend from "../components/Addfriend";
import Post from "../components/Post";
import Sentrequests from "../components/Sentrequests";
import Pendingrequests from "../components/Pendingrequests";
import Myfriends from "../components/Myfriends";
import { useState } from "react";
import axios from "axios";
function Home() {
  const [active, setActive] = useState("home");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          throw new Error("Missing token or userId");
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/getprofile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        });

        setUser(response.data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching user profile:", error);
      }
    })();
  }, []);

  let ActiveComponent;
  switch (active) {
    case "Home":
      ActiveComponent = Post;
      break;
    case "Add Friends":
      ActiveComponent = Addfriend;
      break;
    case "Sent Requests":
      ActiveComponent = Sentrequests;
      break;
    case "Pending Requests":
      ActiveComponent = Pendingrequests;
      break;
    case "My Friends":
      ActiveComponent = Myfriends;
      break;
    default:
      ActiveComponent = Post;
  }

  return (
    <>
      <div className="flex w-[100vw]">
        <Sidebar setActive={setActive} />
        <Bottombar setActive={setActive} />
        <div className="ml-0 w-[100vw] custom-950:ml-[25vw] custom-950:p-[1vw] custom-950:w-[50vw]">
          <ActiveComponent />
        </div>
        <div className="w-[0vw] hidden custom-950:flex custom-950:w-[30%]">
          <div className="p-[2vw]">
            <div className="w-[100%] text-3xl font-bold py-[1vw]">Logged In as:</div>
            {user ? <div className="flex align-center items-center"><img src={user.pfp} alt="unable to load post" className="rounded-full w-16 h-16 mr-2" /><div className="text-xl">{user.username}</div></div> : <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;