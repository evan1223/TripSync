import { doc, getDoc, getFirestore } from 'firebase/firestore';
import firebaseApp from './firebaseClient';
import { getUserData, processAvatarUrl } from './db';

const db = getFirestore(firebaseApp);

export interface Application {
  id: string;
  userId: string;
  projectId: string;
  applicationStatus: 'waiting' | 'accepted' | 'rejected';
  appliedAt: Date;
  userName?: string;
  userBio?: string;
  userAvatar?: string | null;
}

export const getApplication = async (applicationId: string): Promise<Application | null> => {
  try {
    const appRef = doc(db, 'applications', applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return null;
    }

    const appData = appSnap.data();
    const userId = appData.userId;

    // Get user data using the new database module
    const userData = await getUserData(userId);
    const avatarUrl = processAvatarUrl(userData?.avatarUrl || null);

    return {
      id: appSnap.id,
      ...appData,
      appliedAt: appData.appliedAt.toDate(),
      userName: userData?.name || '未知使用者',
      userBio: userData?.bio || '',
      userAvatar: avatarUrl,
    } as Application;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}; 