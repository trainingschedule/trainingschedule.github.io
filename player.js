// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore,  doc, setDoc , getDoc, getDocs, collection} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getMillisecondsFromDateTime, convertDateTimeToHumanFormat } from "./generalFunctions.js";

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
let filter = "All";
let number = 4;

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
        if (sessionStorage.getItem('id') == null) window.location.href = "index.html";
        id = sessionStorage.getItem('id');
        if (id == "") window.location.href = "index.html"
        status.innerHTML = "Player display: " + id;
        console.log('not logged in')
        loadAllSessionsPlayers(filter, number);
        loadPlayers();
        document.getElementById('playerSelect').addEventListener('change', (e)=>{
            filter = document.getElementById('playerSelect').value
            loadAllSessionsPlayers(filter, number);
        })
        document.getElementById('loadSessionsButton').addEventListener('click', (e)=>{
            let x = document.getElementById('numberOfSessions').value;
            if (x < 3) x = 3;
            if (x > 50) x = 50;
            number = x;
            loadAllSessionsPlayers(filter, number);
        })

        webpushr('fetch_id', function(webpushrId) {
            if (webpushrId) {
                console.log('Webpushr ID:', webpushrId);
                // You can now send this webpushrId to your server
                //sendWebpushrIdToServer(webpushrId);
            } else {
                console.error('Webpushr ID could not be fetched.');
            }
        });
        
    }
});

function loadAllSessionsPlayers(playerName, sessionNumber){
    if (playerName == "All")
        console.log("No filter.")
    else console.log("Filter: " + playerName)
    document.getElementById('scheduledList').innerHTML = "";
    let sessions = []
    let k = 0;
    getDocs(collection(db, id, "defaultCentre", "scheduled"))
    .then((querySnapshot1)=> {
        querySnapshot1.forEach((doc) => {
            const sessionData = {
                player1: doc.data().player1,
                player2: doc.data().player2,
                player3: doc.data().player3,
                player4: doc.data().player4,
                coach: doc.data().coach,
                court: doc.data().court,
                info: doc.data().info,
                startTime: doc.data().startTime,
                endTime: doc.data().endTime
            }
            if (playerName == "All")
                sessions.push(sessionData);
            else if (sessionData.player1 == playerName || 
                sessionData.player2 == playerName || 
                sessionData.player3 == playerName || 
                sessionData.player4 == playerName) 
                sessions.push(sessionData);
            
        });
        sessions.sort((a, b) => {
            let d1 = a.startTime;
            let d2 = b.startTime;
            if (getMillisecondsFromDateTime(d1) > getMillisecondsFromDateTime(d2)) return -1;
            else return 1;
        })
        sessions.forEach((e)=>{
            k=k+1;
            if (k <= sessionNumber){
                const div = document.createElement('div');
                div.classList.add('session');
                const p1 = document.createElement('p');
                const p2 = document.createElement('p');
                const p3 = document.createElement('p');
                const p4 = document.createElement('p');
                const p5 = document.createElement('p');

                p1.innerHTML = e.player1 + ", " + e.player2 + ", " + e.player3 + ", " + e.player4;
                p2.innerHTML = e.coach;
                p3.innerHTML = e.court;
                p4.innerHTML = convertDateTimeToHumanFormat(e.startTime) + " - " + convertDateTimeToHumanFormat(e.endTime);
                p5.innerHTML = e.info;

                div.appendChild(p1);
                div.appendChild(p2);
                div.appendChild(p3);
                div.appendChild(p4);
                div.appendChild(p5);
                document.getElementById('scheduledList').appendChild(div);
            }  
        })
    })
    .catch(error => {
        console.log("Error getting document:", error);
    });
}

function loadPlayers(){
let players = []
getDocs(collection(db, id, "defaultCentre", "players"))
    .then((querySnapshot1)=> {
        querySnapshot1.forEach((doc) => {
            players.push(doc.data().name);
        });
        players.forEach((e)=>{

            const op1 = document.createElement('option');
            op1.value = e;
            op1.innerHTML = e;
            document.getElementById('playerSelect').appendChild(op1);
        })
    })
    .catch(error => {
        console.log("Error getting document:", error);
    });
}



