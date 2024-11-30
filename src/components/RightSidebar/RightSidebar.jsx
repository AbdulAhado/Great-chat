import React, { useContext, useEffect, useState } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
const RightSidebar = () => {
  const { chatUser, message } = useContext(AppContext)
  const [msgImages, setMsgImages] = useState([])
  useEffect(() => {
    let tempVar = [];
    message.map((msg)=>{
      if (msg.image) {
        tempVar.push(msg.image)
      }
    })
    setMsgImages(tempVar)
  }, [message])
  
  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.userdata.avatar} alt="" />
        <h3>{chatUser.userdata.name}{Date.now() - chatUser.userdata.lastSeen <= 70000 ? <img src={assets.green_dot}/>  : null }</h3>
        <p>{chatUser.userdata.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url,index)=>(<img onClick={()=>{window.open(url)}} key={index} src={url}/>))}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (<div className='rs'>
    <button onClick={() => logout()}>LogOut</button>
  </div>)
}

export default RightSidebar