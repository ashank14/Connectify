import React, { useState, useEffect, useRef } from "react";
import Messagebubble from "./Messagebubble";
import axios from "axios";
import { io } from "socket.io-client";

function Chatwindow({ active }) {
  const [messages, setMessages] = useState([]);
  const [sendmsg, setSendmsg] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_API_BASE_URL}`);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (active) {
      fetchMessages(active.userId);
      const userId = localStorage.getItem("userId");
      socketRef.current.emit('joinRoom', { userId, friendId: active.userId });
    }
  }, [active]);

  useEffect(() => {
    const messageContainer = document.getElementById("messages-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  const sendmessage = () => {
    const trimmedMessage = sendmsg.trim();
    if (!trimmedMessage) {
      console.log('Cannot send an empty message');
      return;
    }

    const userId = localStorage.getItem("userId");
    const friendId = active.userId;

    socketRef.current.emit('sendMessage', {
      sender: userId,
      receiver: friendId,
      message: sendmsg
    });

    setSendmsg("");
  };

  const fetchMessages = async (friendId) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          userId: userId
        },
        params: {
          friendId: friendId
        }
      });

      if (response.status === 200) {
        const messages = response.data;
        setMessages(messages);
      } else {
        console.error('Failed to fetch messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 w-[100%] text-3xl font-bold">
        <div className="text-6xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 text-purple p-[1vw] bg-clip-text text-transparent">Connectify</div>
        <div className="flex flex-col items-center">
          <div>Your Messages</div>
          <div>Send a message to start a chat</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex p-[2vw] text-4xl font-bold border-b-2 border-gray-800">
        <div>
          <img src={active.pfp} alt="Profile" className="rounded-full w-12 h-12" />
        </div>
        <div className="ml-[2vw]">{active.username}</div>
      </div>
      <div id="messages-container" className="flex flex-col gap-5 h-[90%] px-[2vw] overflow-y-auto">
        {messages.length === 0 ? (
          <div>No messages found</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex w-[100%] ${msg.sender === localStorage.getItem("userId") ? 'justify-end' : 'justify-start'}`}>
              <Messagebubble username={msg.sender === localStorage.getItem("userId") ? 'You' : 'Friend'} message={msg.message} time={msg.timestamp} />
            </div>
          ))
        )}
      </div>
      <div className="px-[2vw] pt-2 flex items-center">
        <input
          className="w-[80%] h-[8vh] rounded-xl bg-transparent border-2 border-gray-500 p-[1vw]"
          placeholder="Message...."
          value={sendmsg}
          onChange={e => setSendmsg(e.target.value)}
        />
        <button className='ml-6' onClick={sendmessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chatwindow;
