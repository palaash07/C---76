import * as firebase from 'firebase';

require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyAWLOwknr2pJ947fuaKhdpj8Zfymm-XfBs",
    authDomain: "wily-ab3a7.firebaseapp.com",
    databaseURL: "https://wily-ab3a7.firebaseio.com",
    projectId: "wily-ab3a7",
    storageBucket: "wily-ab3a7.appspot.com",
    messagingSenderId: "995151871213",
    appId: "1:995151871213:web:56a26d1a55e4ea79ff20e4"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();