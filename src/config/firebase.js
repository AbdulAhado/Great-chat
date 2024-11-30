import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";

import { initializeApp } from "firebase/app";
import { toast } from "react-toastify";
const firebaseConfig = {
    apiKey: "AIzaSyBv0RiT9CvVpi85uT23j2oz17ICurBqEHg",
    authDomain: "chatcode-3cf78.firebaseapp.com",
    projectId: "chatcode-3cf78",
    storageBucket: "chatcode-3cf78.appspot.com",
    messagingSenderId: "949940341147",
    appId: "1:949940341147:web:504b3672ab1c2226fc393e"
  };
// const firebaseConfig = {
//     apiKey: "AIzaSyAnawKCjgqxL4ZRckGd_k6L2B9lOvNJ1oE",
//     authDomain: "good-667f3.firebaseapp.com",
//     projectId: "good-667f3",
//     storageBucket: "good-667f3.firebasestorage.app",
//     messagingSenderId: "656034685986",
//     appId: "1:656034685986:web:54dfef0b5e46d16877967b"
//   };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)
const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password)
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey , there i am using code_chat",
            lastSeen: Math.floor(Date.now() / 1000)
        })
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        })
    } catch (err) {
        console.error(err)
        toast.error(err.code.split("/")[1].split('-').join(" "))
    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.log(error)
        toast.error(error.code.split("/")[1].split('-').join(" "))
    }
}

const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.log(error)
    }
}
const resetPass = async (email) => {
    if (!email) {
        toast.error("Enter your email")
        return null
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef,where("email", "==" , email))
        const querySnap = await getDocs(q)
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth, email)
            toast.success("Reset email sent")
        }else{
            toast.error("Email doesn't not")
        }

    } catch (error) {
        console.error(error)
        toast.error(error.message)
    }
}


export { signup, login, logout, auth, db, resetPass }