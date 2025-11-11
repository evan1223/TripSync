import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import firebaseApp from './firebaseClient';

const db = getFirestore(firebaseApp);

export interface UserData {
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
  profilePicUrl?: string | null;
  socialMedia?: string;
  userCommunity?: string;
  user_pf_url?: string;
}

export type ApplicationStatus = 'waiting' | 'accepted' | 'rejected';

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    
    const data = userSnap.data() as UserData;
    // 如果 avatarUrl 不存在，使用 profilePicUrl
    if (!data.avatarUrl && data.profilePicUrl) {
      data.avatarUrl = data.profilePicUrl;
    }
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const processAvatarUrl = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.includes('firebasestorage.googleapis.com')) {
    return avatarUrl.includes('?alt=media') ? avatarUrl : `${avatarUrl}?alt=media`;
  }
  return avatarUrl;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus
): Promise<boolean> => {
  try {
    if (!applicationId) {
      console.error('Invalid application ID:', applicationId);
      return false;
    }

    const appRef = doc(db, 'applications', applicationId);
    
    // First check if the document exists
    const appSnap = await getDoc(appRef);
    if (!appSnap.exists()) {
      console.error('Application document does not exist:', applicationId);
      return false;
    }

    await updateDoc(appRef, { applicationStatus: status });
    console.log('Successfully updated application status:', { applicationId, status });
    return true;
  } catch (error) {
    console.error('Error updating application status:', {
      applicationId,
      status,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}; 