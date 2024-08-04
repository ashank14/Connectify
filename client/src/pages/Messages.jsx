import React, { useState } from "react";
import Chatsidebar from "../components/Chatsidebar";
import Chatwindow from "../components/Chatwindow";

function Messages(){
    const [active,setActive]=useState(null);
    return <div className="flex w-[100vw] h-[100vh] p-[3vw] bg-gradient-to-r from-black via-indigo-1000 to-indigo-900">
        <Chatsidebar setActive={setActive}/>
        <Chatwindow active={active}/>
  </div>
  
}

export default Messages;