import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext } from "react";

import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();
const AppContextProvider = (props) => {
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [chatData, setChatData] = useState()
    const [messagesId, setMessagesId] = useState(null)
    const [message, setMessages] = useState([])
    const [chatUser, setChatUser] = useState(null)
    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, "users", uid)
            const userSnap = await getDoc(userRef)
            const userData = userSnap.data()
            setUserData(userData);
            if (userData.avatar && userData.name) {
                navigate('/chat')
            } else {
                navigate('/profile')
            }

            setInterval(async () => {
                if (auth.chatUser) {
                    await updateDoc(userRef, {
                        lastSeen: Math.floor(Date.now() / 1000)
                    });
                }
            }, 60000);
            
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatItem = res.data().chatsData
                const tempData = [];
                for (const item of chatItem) {
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef)
                    const userdata = userSnap.data()
                    tempData.push({ ...item, userdata })
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt))
            })
            return () => {
                unSub()
            }
        }
    }, [userData])

    const value = {
        userData, setUserData,
        chatData,
        setChatData,
        loadUserData,
        message,
        setMessages,
        messagesId,
        setMessagesId,
        chatUser,
        setChatUser,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider 