import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseApp from './firebaseClient';

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export interface UserProfile {
  bio?: string;
  socialMedia?: string;
  userCommunity?: string;
  user_pf_url?: string;
  portfolio_url?: string;
  profilePicUrl?: string | null;
  avatar?: string | null;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, profileData, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadUserAvatar = async (file: File): Promise<string> => {
  try {
    // 生成唯一的文件名
    const timestamp = Date.now();
    const fileName = `avatars/${timestamp}_${file.name}`;
    console.log('準備上傳文件到路徑:', fileName);
    
    // 創建 storage reference
    const storageRef = ref(storage, fileName);
    
    // 上傳文件
    console.log('開始上傳文件...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('文件上傳成功，元數據:', {
      fullPath: snapshot.ref.fullPath,
      size: snapshot.metadata.size,
      contentType: snapshot.metadata.contentType
    });
    
    // 獲取下載 URL
    console.log('正在獲取下載 URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('成功獲取下載 URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('上傳頭像時發生錯誤:', error);
    throw new Error(`上傳頭像失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}; 
