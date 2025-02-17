// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore,  doc, setDoc , getDoc , getDocs, collection, query, deleteDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getMillisecondsFromDateTime, convertDateTimeToHumanFormat } from "./generalFunctions.js";
import { passesFilter } from "./generalFunctions.js";

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
let welcome = document.getElementById('welcome')
let newPlayer = document.getElementById('newPlayer')
let newCoach = document.getElementById('newCoach')
let newCourt = document.getElementById('newCourt')
let createSession = document.getElementById('createSession')
let uid = "";
let coachName = "";
let number = 4;
let filters = {
    player: "All",
    coach: "All",
    court: "All",
    date: "All"
}

let elementCounter = {
    players: 0,
    coaches: 0,
    courts: 0,
    scheduled: 0
}


onAuthStateChanged(auth, (user) => {
    //var notLoggedIn = document.getElementById('not-logged-in')
    //var loggedIn = document.getElementById('logged-in')
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        uid = user.uid;
        status.innerHTML = "User: " + uid;



        // Get admin coach name
        coachName = "name"
        const docRef = doc(db, uid, "defaultCentre" ,"coaches", "adminCoach");
        getDoc(docRef)
        .then(doc => {
        if (doc.exists) {
            coachName = doc.data().name;
            welcome.innerHTML = "Welcome " + coachName;
        } else {
            console.log("No such document!");
        }
        })
        .catch(error => {
            console.log("Error getting document:", error);
        });

        // Get public name and password
        const docRef2 = doc(db, 'users', uid);
        getDoc(docRef2)
        .then(doc => {
        if (doc.exists) {
            document.getElementById('publicInfo').innerHTML = "Public username: " + doc.data().publicUsername + "; Public password: " + doc.data().publicPassword;
        } else {
            console.log("No such document!");
        }
        })
        .catch(error => {
            console.log("Error getting document:", error);
        });

        console.log('logged in')

        loadCoaches();
        loadPlayers();
        loadCourts();
        setDateTimePicker();

        document.getElementById('dashboardFilterButton').addEventListener('click', (e)=>{
            let playerFilter = document.getElementById('playerFilter').value;
            let coachFilter = document.getElementById('coachFilter').value;
            let courtFilter = document.getElementById('courtFilter').value;
            let dateFilter = "All";
            if(document.getElementById('doDateFilter').checked == true) dateFilter = document.getElementById('dateFilter').value;
            else dateFilter = "All";
            filters.player = playerFilter;
            filters.coach = coachFilter;
            filters.court = courtFilter;
            filters.date = dateFilter;

            let x = document.getElementById('numberOfSessions').value;
            if (x < 3) x = 3;
            if (x > 20) x = 20;
            number = x;
            
            resetScheduledList(number, filters);
        })

        loadAllSessions(number, filters)
        console.log(elementCounter.players + " " + elementCounter.coaches + " " + elementCounter.courts + " " + elementCounter.scheduled);

        programLoaded();
    } else {
        status.innerHTML = "No user."
        window.location.href = "index.html"
        // User is signed out
        // ...
        //loggedIn.style.display = 'none'
        //notLoggedIn.style.display = 'block'
        //applySavedData()
        console.log('not logged in')
    }
});


//Load coaches and players

function loadCoaches(){
    document.getElementById('coachList').innerHTML = "<h4>Coach list</h4>"
    document.getElementById('coach').innerHTML = "";
    document.getElementById('coachFilter').innerHTML = "<option value=\"All\">All</option>"
    let coaches = []
    elementCounter.coaches = 0;
    getDocs(collection(db, uid, "defaultCentre", "coaches"))
        .then((querySnapshot1)=> {
            querySnapshot1.forEach((doc) => {
                if (doc.data().name != coachName) {
                    coaches.push(doc.data().name);
                    elementCounter.coaches += 1;
                }
            });
            coaches.forEach((e)=>{

                const op = document.createElement('option');
                op.value = e;
                op.innerHTML = e;
                document.getElementById('coach').appendChild(op);

                const op1 = document.createElement('option');
                op1.value = e;
                op1.innerHTML = e;
                document.getElementById('coachFilter').appendChild(op1);


                const div = document.createElement('div');
                div.classList.add('coach');
                const p = document.createElement('p');
                p.innerHTML = e;
                const b2 = document.createElement('button')
                b2.innerHTML = 'Delete'
                div.appendChild(p);
                div.appendChild(b2);
                document.getElementById('coachList').appendChild(div);

                b2.addEventListener('click', ()=>{
                    if (elementCounter.coaches > 1){
                        deleteDoc(doc(db, uid, 'defaultCentre','coaches', e))
                    .then(() => {
                        console.log("Document deleted successfully!");
                        elementCounter.coaches--;
                        loadCoaches();
                        
                    })
                    .catch((error) => {
                        console.error("Error deleting document: ", error);
                    });
                    }
                    else alert('There has to be at least one coach!');
                })
            })
            console.log(elementCounter.players + " " + elementCounter.coaches + " " + elementCounter.courts + " " + elementCounter.scheduled);
        })
        .catch(error => {
            console.log("Error getting document:", error);
        });
}

function loadPlayers(){
    document.getElementById('playerList').innerHTML = "<h4>Player list</h4>"
    document.getElementById('player1').innerHTML = "<option value=\"noPlayer\">No player</option>";
    document.getElementById('player2').innerHTML = "<option value=\"noPlayer\">No player</option>";
    document.getElementById('player3').innerHTML = "<option value=\"noPlayer\">No player</option>";
    document.getElementById('player4').innerHTML = "<option value=\"noPlayer\">No player</option>";
    document.getElementById('playerFilter').innerHTML = "<option value=\"All\">All</option>"
    let players = []
    elementCounter.players = 0;
    getDocs(collection(db, uid, "defaultCentre", "players"))
        .then((querySnapshot1)=> {
            querySnapshot1.forEach((doc) => {
                players.push(doc.data().name);
                elementCounter.players+=1;
            });
            players.forEach((e)=>{
                for(let i = 0; i < 4; i++){
                    const op = document.createElement('option');
                    op.value = e;
                    op.innerHTML = e;
                    document.getElementById('player' + (i+1)).appendChild(op);
                }
                const op1 = document.createElement('option');
                op1.value = e;
                op1.innerHTML = e;
                document.getElementById('playerFilter').appendChild(op1);


                const div = document.createElement('div');
                div.classList.add('player');
                const p = document.createElement('p');
                p.innerHTML = e;
                const b2 = document.createElement('button')
                b2.innerHTML = 'Delete'
                div.appendChild(p);
                div.appendChild(b2);
                document.getElementById('playerList').appendChild(div);

                b2.addEventListener('click', ()=>{
                    if (elementCounter.players > 1){
                        deleteDoc(doc(db, uid, 'defaultCentre','players', e))
                        .then(() => {
                            console.log("Document deleted successfully!");
                            elementCounter.players--;
                            loadPlayers();
                            
                        })
                        .catch((error) => {
                            console.error("Error deleting document: ", error);
                        });
                    }
                    else alert('There has to be at least one player!');
                })
            })
            console.log(elementCounter.players + " " + elementCounter.coaches + " " + elementCounter.courts + " " + elementCounter.scheduled);
        })
        .catch(error => {
            console.log("Error getting document:", error);
        });
}


function loadCourts(){
    document.getElementById('courtList').innerHTML = "<h4>Court list</h4>"
    document.getElementById('court').innerHTML = "";
    document.getElementById('courtFilter').innerHTML = "<option value=\"All\">All</option>"
    let courts = []
    elementCounter.courts = 0;
    getDocs(collection(db, uid, "defaultCentre", "courts"))
    .then((querySnapshot1)=> {
        querySnapshot1.forEach((doc) => {
            courts.push(doc.data().name);
            elementCounter.courts+=1;
        });
        courts.forEach((e)=>{

            const op = document.createElement('option');
            op.value = e;
            op.innerHTML = e;
            document.getElementById('court').appendChild(op);

            const op1 = document.createElement('option');
            op1.value = e;
            op1.innerHTML = e;
            document.getElementById('courtFilter').appendChild(op1);

            const div = document.createElement('div');
            div.classList.add('court');
            const p = document.createElement('p');
            p.innerHTML = e;
            const b2 = document.createElement('button')
            b2.innerHTML = 'Delete'
            div.appendChild(p);
            div.appendChild(b2);
            document.getElementById('courtList').appendChild(div);

            b2.addEventListener('click', ()=>{
                if (elementCounter.courts > 1){
                    deleteDoc(doc(db, uid, 'defaultCentre','courts', e))
                    .then(() => {
                        console.log("Document deleted successfully!");
                        elementCounter.courts--;
                        loadCourts();
                        
                    })
                    .catch((error) => {
                        console.error("Error deleting document: ", error);
                    });
                }
                else alert('There has to be at least one court!');
                
            })
        })
        console.log(elementCounter.players + " " + elementCounter.coaches + " " + elementCounter.courts + " " + elementCounter.scheduled);
    })
    .catch(error => {
        console.log("Error getting document:", error);
    });
}

newPlayer.addEventListener('click', (event)=>{
    const playerName = document.getElementById('newPlayerName').value
    const docRef = doc(db, uid, "defaultCentre", 'players', playerName);
    const data = {
        name: playerName
    }
    setDoc(docRef, data)
    loadPlayers();
})

newCoach.addEventListener('click', (event)=>{
    const coachName = document.getElementById('newCoachName').value
    const docRef = doc(db, uid, "defaultCentre", 'coaches', coachName);
    const data = {
        name: coachName
    }
    setDoc(docRef, data)
    loadCoaches()
})

newCourt.addEventListener('click', (event)=>{
    const courtName = document.getElementById('newCourtName').value
    const docRef = doc(db, uid, "defaultCentre", 'courts', courtName);
    const data = {
        name: courtName
    }
    setDoc(docRef, data)
    loadCourts()
})

createSession.addEventListener('click', (event)=>{
    const player1 = document.getElementById('player1').value
    const player2 = document.getElementById('player2').value
    const player3 = document.getElementById('player3').value
    const player4 = document.getElementById('player4').value
    const coach = document.getElementById('coach').value
    const court = document.getElementById('court').value
    const startTime = document.getElementById('startTime').value
    const endTime = document.getElementById('endTime').value
    const info = document.getElementById('info').value
    const sessionName = sessionID(player1, player2, startTime, endTime)
    const docRef = doc(db, uid, "defaultCentre", 'scheduled', sessionName);
    const data = {
        player1: player1,
        player2: player2,
        player3: player3,
        player4: player4,
        coach: coach,
        court: court,
        startTime: startTime,
        endTime: endTime,
        info: info
    }
    setDoc(docRef, data)
    resetScheduledList(number, filters);
    alert("Sucessfully added training session.")
})

// Management

document.getElementById('playerManagementButton').addEventListener('click', ()=>{
    switchDisplay('playerManagement');
    document.getElementById('playerManagementButton').classList.toggle('activeButton')
    
})
document.getElementById('coachManagementButton').addEventListener('click', ()=>{
    switchDisplay('coachManagement');
    document.getElementById('coachManagementButton').classList.toggle('activeButton')
})
document.getElementById('courtManagementButton').addEventListener('click', ()=>{
    switchDisplay('courtManagement');
    document.getElementById('courtManagementButton').classList.toggle('activeButton')
})


function programLoaded(){
    document.getElementById('programStatus').innerHTML = "Software loaded."
    document.getElementById('programStatus').style.color = "green"
}

function switchDisplay(elementId){
    document.getElementById(elementId).classList.toggle('inactive');
}

function resetScheduledList(sessionNumber, filters){
    document.getElementById('scheduledList').innerHTML = "<h3>Scheduled sessions</h2>";
    loadAllSessions(sessionNumber, filters);
}

function setDateTimePicker(){
    
    const now = new Date();

    // Get individual components of the current date and time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const hours1 = String(now.getHours() + 1).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Format the value as 'YYYY-MM-DDTHH:MM'
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    const formattedDateTime1 = `${year}-${month}-${day}T${hours1}:${minutes}`;
    
    document.getElementById('startTime').value = formattedDateTime;
    document.getElementById('endTime').value = formattedDateTime1;
}

function sessionID(a, b, c, d){
    const sessionName = a.toString() + b.toString() + c.toString() + d.toString();
    return sessionName.toString();
}


function loadAllSessions(sessionNumber, filters){
    let sessions = []
    elementCounter.scheduled = 0;
    let k = 0;
    getDocs(collection(db, uid, "defaultCentre", "scheduled"))
    .then((querySnapshot1)=> {
        querySnapshot1.forEach((doc) => {
            elementCounter.scheduled += 1;
            const sessionData = {
                player1: doc.data().player1,
                player2: doc.data().player2,
                player3: doc.data().player3,
                player4: doc.data().player4,
                coach: doc.data().coach,
                court: doc.data().court,
                info: doc.data().info,
                startTime: doc.data().startTime,
                endTime: doc.data().endTime,
                sessionId: doc.id
            }
            sessions.push(sessionData);
            
        });
        sessions.sort((a, b) => {
            let d1 = a.startTime;
            let d2 = b.startTime;
            if (getMillisecondsFromDateTime(d1) > getMillisecondsFromDateTime(d2)) return -1;
            else return 1;
        })
        sessions.forEach((e)=>{
            if (k <  sessionNumber && passesFilter(e, filters)){
                k=k+1;
                const div = document.createElement('div');
                div.classList.add('session');
                const p1 = document.createElement('p');
                const p2 = document.createElement('p');
                const p3 = document.createElement('p');
                const p4 = document.createElement('p');
                const p5 = document.createElement('p');
                const b2 = document.createElement('button');

                p1.innerHTML = e.player1 + ", " + e.player2 + ", " + e.player3 + ", " + e.player4;
                p2.innerHTML = e.coach;
                p3.innerHTML = e.court;
                p4.innerHTML = convertDateTimeToHumanFormat(e.startTime) + " - " + convertDateTimeToHumanFormat(e.endTime);
                p5.innerHTML = e.info;
                b2.innerHTML = "Delete";

                div.appendChild(p1);
                div.appendChild(p2);
                div.appendChild(p3);
                div.appendChild(p4);
                div.appendChild(p5);
                div.appendChild(b2);
                document.getElementById('scheduledList').appendChild(div);

                // Delete session
                b2.addEventListener('click', ()=>{
                    if (elementCounter.scheduled > 1){
                        deleteDoc(doc(db, uid, 'defaultCentre','scheduled', e.sessionId))
                        .then(() => {
                            console.log("Document deleted successfully!");
                            elementCounter.scheduled--;
                            resetScheduledList(number, filters);
                            
                        })
                        .catch((error) => {
                            console.error("Error deleting document: ", error);
                        });
                    }
                    else alert('There has to be at least one session scheduled!');
                })
            }
        })
        console.log(elementCounter.players + " " + elementCounter.coaches + " " + elementCounter.courts + " " + elementCounter.scheduled);
        console.log('started expired check')
        console.log('now: ' + Date.now())
        let tmp = sessions.slice().reverse();
        for(let i = 0; i < tmp.length; i++){
            let e = tmp[i];
            console.log(getMillisecondsFromDateTime(e.endTime))
            if (getMillisecondsFromDateTime(e.endTime) < Date.now()){
                console.log('expired ' + e.sessionId)
                if (elementCounter.scheduled > 1){
                    elementCounter.scheduled--;
                    deleteDoc(doc(db, uid, 'defaultCentre','scheduled', e.sessionId))
                    .then(() => {
                        console.log("Document deleted successfully (expired)!");
                        console.log(elementCounter.players + " " + elementCounter.coaches + " " + elementCounter.courts + " " + elementCounter.scheduled);
                    })
                    .catch((error) => {
                        console.error("Error deleting document: ", error);
                    });
                } else console.log('not deleting the last in the collection')
            }
        }
    })
    .catch(error => {
        console.log("Error getting document:", error);
    });
}


function logout(){
    const auth = getAuth();
    signOut(auth).then(() => {
        console.log('logout now')
    }).catch((error) => {
        console.log('error in logging out')
    });
}
window.logout = logout;