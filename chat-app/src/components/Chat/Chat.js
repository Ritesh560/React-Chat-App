import React, { useState, useEffect } from "react"
import queryString from "query-string"
import io from "socket.io-client"
import { useLocation } from "react-router-dom"

import "./Chat.css"

import InfoBar from "../InfoBar/infoBar"
import Input from "../Input/Input"
import Messages from "../Messages/Messages"
import TextContainer from "../TextContainer/TextContainer"

let socket

const Chat = () => {
  const location = useLocation()
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [users, setUsers] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const ENDPOINT = process.env.REACT_APP_BACKEND_URL

  useEffect(() => {
    const { name, room } = queryString.parse(location.search)

    socket = io(ENDPOINT, { transports: ["websocket", "polling", "flashsocket"] })

    setName(name)
    setRoom(room)

    socket.emit("join", { name, room }, (error) => {
      if (error) alert(error)
    })

    return () => {
      socket.emit("disconnect")

      socket.off()
    }
  }, [ENDPOINT, location.search])

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message])
    })

    socket.on("roomData", ({ users }) => {
      setUsers(users)
    })
  })

  const sendMessage = (event) => {
    event.preventDefault()

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""))
    }
  }

  console.log(message, messages)

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
        {/* <input value={message} onChange={(event) => setMessage(event.target.value)} onKeyPress={(event) => (event.key === "Enter" ? sendMessage(event) : null)} /> */}
      </div>
      <TextContainer users={users} />
    </div>
  )
}

export default Chat
