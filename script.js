// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore,  doc, setDoc , getDoc, getDocs, collection} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKox6ZIHuaOiR9j4kgpvHFU5bk2casczg",
  authDomain: "training-schedule-94b87.firebaseapp.com",
  projectId: "training-schedule-94b87",
  storageBucket: "training-schedule-94b87.firebasestorage.app",
  messagingSenderId: "748042326978",
  appId: "1:748042326978:web:27cd02656db73e4b44fc5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const db = getFirestore(app);

let status = document.getElementById('status')
let id = "";

webpushr('getUserID', function(userId) {
    console.log('Webpushr Subscriber ID:', userId);
});


onAuthStateChanged(auth, (user) => {
    //var notLoggedIn = document.getElementById('not-logged-in')
    //var loggedIn = document.getElementById('logged-in')
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        status.innerHTML = "User: " + uid;
        window.location.href = "dashboard.html"
        //loggedIn.style.display = 'block'
        //notLoggedIn.style.display = 'none'
        //allowContentChange()
        console.log('logged in')
    } else {
        status.innerHTML = "No user."
        console.log('not logged in')
        document.getElementById('playerLoginButton').addEventListener('click', (e)=>{
            e.preventDefault();
            const inputUsername = document.getElementById('playerUsernameInput').value;
            const inputPassword = document.getElementById('playerPasswordInput').value;
            let passedUsernameCheck = false;
            getDocs(collection(db, 'users'))
                .then((querySnapshot1)=> {
                    querySnapshot1.forEach((doc) => {
                        const username = doc.data().publicUsername;
                        const userid = doc.id;
                        if (username == inputUsername){
                            passedUsernameCheck = true;
                            console.log("id " + userid);
                            if (doc.data().publicPassword == inputPassword){
                                //Successful login!
                                console.log("+++");
                                id = userid;
                                status.innerHTML = "User: Players(" + id + ")";
                                sessionStorage.setItem('id', id)
                                console.log('changePage')
                                window.location.href = 'player.html'
                                /*loadAllSessionsPlayers("All");
                                loadPlayers();
                                document.getElementById('playerSelect').addEventListener('change', (e)=>{
                                    const filter = document.getElementById('playerSelect').value
                                    loadAllSessionsPlayers(filter);
                                })*/
                            }
                            else alert("Incorrect password.")
                        }
                    });
                    if (!passedUsernameCheck) alert("Incorrect username.")
                })
                .catch(error => {
                    console.log("Error getting document:", error);
                });
        })
    }
});

function login(event){
    event.preventDefault();
    var email = document.getElementById('usernameInput').value
    var password = document.getElementById('passwordInput').value
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
        console.log('Logged in!')
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('fail')
        console.log(errorMessage)
        console.log(errorCode)
        console.log('')
    });
}

window.login = login