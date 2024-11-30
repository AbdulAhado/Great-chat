import React, { useState } from 'react'
import './login.css'
import assets from '../../assets/assets'
import { signup , login , resetPass} from '../../config/firebase'
import { toast } from 'react-toastify'
const Login = () => {
  const [currState, setCurrState] = useState("Sign Up")
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === "Sign Up") {
      signup(userName, email, password)
    }else{
      login(email,password)
      
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className='logo' />
      <form className="login-form" onSubmit={onSubmitHandler}>
        <h2>{currState}</h2>
        {currState === "Sign Up" ? <input type='text' onChange={(e) => setUserName(e.target.value)} value={userName} placeholder='Username' className="form-input" required></input> : null}
        <input type='email' onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Email Addres' className="form-input" required></input>
        <input onChange={(e) => setPassword(e.target.value)} value={password} type='password' placeholder='Password' className="form-input" required></input>
        <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login Now"}</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use and privacy policy.</p>
        </div>
        <div className="login-forgot">
          {
            currState === "Sign Up"
              ? <p className="login-toggle">Already have an account <span onClick={() => { setCurrState("Login") }}>Login Here</span></p> : <p className="login-toggle">Create an account <span onClick={() => { setCurrState("Sign Up") }}>SignUp Here</span></p>
          }{
            currState === "Login" ? <p className="login-toggle">Forgot password ? <span onClick={() => resetPass(email)}>Reset Here</span></p> : null
          }


        </div>

      </form>
    </div>
  )
}

export default Login