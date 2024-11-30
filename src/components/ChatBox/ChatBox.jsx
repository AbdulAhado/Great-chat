import React, { useContext } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { useState, useEffect } from 'react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/Upload'
import moment from 'moment';

const ChatBox = () => {
  const { userData, messagesId, chatUser, message, setMessages } = useContext(AppContext)
  const [input, setInput] = useState("")

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          })
        })
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapShot = await getDoc(userChatsRef)

          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId)
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false
            }
            await updateDoc(userChatsRef, { chatsData: userChatData.chatsData })
          }
        });
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
    setInput("")
  }

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0])
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          })
        })

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapShot = await getDoc(userChatsRef)

          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId)
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false
            }
            await updateDoc(userChatsRef, { chatsData: userChatData.chatsData })
          }
        });


      }
    } catch (error) {
      toast.error(error.msg)
    }
  }
  const convertTimeStamp = (timeStamp) => {
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minutes + "PM"
    }
    else {
      return hour + ":" + minutes + "AM"
    }
  }

  // worng useeffect----------------------------------------------
  // useEffect(() => {
  //   try {
  //     if (messagesId) {
  //       const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
  //         setMessages(res.data().messages.reverse())
  //         console.log(res.data().messages.reverse())
  //       })
  //       return () => {
  //         unSub()
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }

  // }, [messagesId])


  // -------------------------------------correct useeffect-------------------------
  useEffect(() => {
    try {
      if (messagesId) {
        const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
          if (res.data() && res.data().messages) {
            setMessages(res.data().messages.reverse())
          } else {
            console.log("No messages found")
          }
        })
        return () => {
          unSub()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [messagesId])


  const lastSeenThreshold = 70;

  return chatUser ? (
    <div className='chat-box'>
      <div className="chat-user">
        <img src={chatUser.userdata.avatar} alt="" />
        <p>
          {chatUser.userdata.name}
          {Date.now() - chatUser.userdata.lastSeen <= lastSeenThreshold ? 
            <img className='dot' src={assets.green_dot} />
         : null}
        </p>
        <img src={assets.help_icon} className='help' alt="" />
      </div>

      <div className="chat-msg">
        {message.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"] ? <img className='msg-img' src={msg.image} /> : <p className='msg'>{msg.text}</p>}

            <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userdata.avatar} alt="" />
              <p className='time'>{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}


      </div>



      <div className="chat-input">
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a massage' />
        <input onChange={sendImage} type="file" id='image' accept='.png, .jpg, jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
        {/* <img  src={assets.send_button} alt="" /> */}
      </div>
    </div>
  ) : <div className='chat-welcome'>
    <img src={assets.logo_icon} alt="" />
    <p>Chat any time, anywhere</p>
  </div>
}

export default ChatBox