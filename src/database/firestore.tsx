import firebaseApp from "./firebaseClient";
import { getFirestore } from "firebase/firestore";


//	Sets up and exports the Firestore database instance.
const db = getFirestore(firebaseApp);


export default db;

