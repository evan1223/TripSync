import {DATABASE} from './config.js';
import { v4 as uuidv4 } from 'uuid';
//node js 內建 func.

export async function initStatus(category, status_name){
  	const docRef = DATABASE.collection('statuses').doc(docId);
  	const docSnap = await docRef.get();

  	if (!docSnap.exists) {
    	await docRef.set({
    		status_id: uuidv4(),
      		category,
      		status_name
    	});
  	}	

  	return docId;
}

