import React, { useContext, useEffect, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
const LeftSidebar = () => {
  const navigate = useNavigate()
  const { userData, chatData, messagesId, setMessagesId, chatUser, setChatUser } = useContext(AppContext)
  const [user, setUser] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [userInfo, setUserInfo] = useState()


  const inputHandler = async (e) => {
    try {
      const input = e.target.value
      if (input) {
        setShowSearch(true)
        const userRef = collection(db, 'users')
        const q = query(userRef, where("username", "==", input.toLowerCase()))
        const querySnap = await getDocs(q)
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false
          userInfo.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true
            }
          })
          if (!userExist) {
            setUser(querySnap.docs[0].data())
          }
        } else {
          setUser(null)
        }
      }
      else {
        setShowSearch(false)
      }
    } catch (error) {
      console.error(error)
    }
  }


  const addChat = async () => {
    const messagesRef = collection(db, "messages")
    const chatsRef = collection(db, "chats")
    try {
      const newMessageRef = doc(messagesRef)
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: []
      })
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        })
      })
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        })
      })
    } catch (error) {
      toast.error(error.code)
      console.error(error)
    }
  }
  useEffect(() => {
    setUserInfo(chatData)
  }, [chatData])

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId)
      setChatUser(item)
      const userChatsRef = doc(db, 'chats', userData.id)
      const userChatsSnapshot = await getDoc(userChatsRef)
      const userchatsData = userChatsSnapshot.data();
      const chatIndex = userchatsData.chatsData.findIndex((c) => c.messageId === item.messageId)
      userchatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userchatsData.chatsData
      })
    } catch (error) {
      toast.error(error.message)
    }


  }


  return (
    <div className='ls'>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search Here...' />
        </div>
      </div>
      <div className="ls-list">

        {showSearch && user ? <div onClick={addChat} className='friends add-user'>
          <img src={user.avatar} alt="" />
          <p>{user.name}</p>
        </div> : userInfo ? (userInfo.map((item, index) => (

          <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
            <img src={item?.userdata?.avatar} alt="" />
            <div>
              <p>{item?.userdata?.name}</p>
              <span>{item?.lastMessage}</span>
            </div>
          </div>
        ))) : <></>
        }


      </div>
    </div>
  )
}

export default LeftSidebar