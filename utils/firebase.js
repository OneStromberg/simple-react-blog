import firebase from 'firebase/app';
import 'firebase/auth';

const secret = process.env["FIREBASE_CLIENT"];
if (secret) {
  const firebaseClient = JSON.parse(secret)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseClient);
    // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
  }
}

export default firebase;