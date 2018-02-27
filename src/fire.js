import firebase from 'firebase';
import 'firebase/firestore';

var config = {
    apiKey: "AIzaSyBibKbFOjEH6wfR89SmtZWkwXm9jkJsm6w",
    authDomain: "where-i-am-b3bd8.firebaseapp.com",
    databaseURL: "https://where-i-am-b3bd8.firebaseio.com",
    projectId: "where-i-am-b3bd8",
    storageBucket: "where-i-am-b3bd8.appspot.com",
    messagingSenderId: "995838248624"
};

var fire = firebase.initializeApp(config);

export default fire;
export const Firestore = new firebase.firestore();
