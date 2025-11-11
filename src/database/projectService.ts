import { collection, getDocs, query, doc, getDoc, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import db from "./firestore";
import { Project } from "../../types/project";

interface UserData {
  name?: string;
}

function getFirebaseImageUrl(url?: string) {
  if (!url) return "/project/project-image.jpg";

  // 處理Firebase Storage URL
  if (url.includes("firebasestorage.googleapis.com")) {
    if (url.includes("?alt=media")) return url;
    if (url.includes("?")) return url + "&alt=media";
    return url + "?alt=media";
  }

  if (url.startsWith("gs://")) {
    return url;
  }

  if (url.startsWith("temp/") || url.startsWith("projects/")) {
    return url;
  }

  if (url.includes("temp%2F") || url.includes("projects%2F")) {
    try {
      return decodeURIComponent(url);
    } catch (e) {
      console.warn("[WARNING] 解碼URL失敗:", e);
      return url;
    }
  }
  return url;
}

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const projectsQuery = query(collection(db, 'projects'));
    const querySnapshot = await getDocs(projectsQuery);
    
    const projectsData = await Promise.all(querySnapshot.docs.map(async (docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const projectData = docSnap.data();

      // Fetch owner name
      let ownerName = '未知';
      if (projectData.ownerId) {
        const userRef = doc(db, 'users', projectData.ownerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData && typeof userData === 'object' && userData !== null && 'name' in userData && typeof (userData as any).name === 'string') {
            ownerName = (userData as any).name;
          }
        }
      }

      // Fetch skill type names
      let skillTypeNames: string[] = [];
      if (Array.isArray(projectData.skillTypeId)) {
        const skillTypePromises = projectData.skillTypeId.map(async (skillTypeId: string) => {
          const skillTypeRef = doc(db, 'skillTypes', skillTypeId);
          const skillTypeSnap = await getDoc(skillTypeRef);
          if (skillTypeSnap.exists()) {
            const skillTypeData = skillTypeSnap.data();
            return skillTypeData.skillTypeName || '';
          }
          return '';
        });
        skillTypeNames = (await Promise.all(skillTypePromises)).filter(Boolean);
      }
      
      // Handle date range
      let dateRangeString = '';
      const startDate = projectData.startDate?.toDate();
      const endDate = projectData.endDate?.toDate();

      const validStartDate = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : null;
      const validEndDate = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : null;

      if (validStartDate && validEndDate) {
        const startFormatted = `${validStartDate.getFullYear()}.${validStartDate.getMonth() + 1}.${validStartDate.getDate()}`;
        const endFormatted = `${validEndDate.getFullYear()}.${validEndDate.getMonth() + 1}.${validEndDate.getDate()}`;
        dateRangeString = `${startFormatted} - ${endFormatted}`;
      } else if (validStartDate) {
        const startFormatted = `${validStartDate.getFullYear()}.${validStartDate.getMonth() + 1}.${validStartDate.getDate()}`;
        dateRangeString = startFormatted + ' - ';
      } else if (validEndDate) {
        const endFormatted = `${validEndDate.getFullYear()}.${validEndDate.getMonth() + 1}.${validEndDate.getDate()}`;
        dateRangeString = ' - ' + endFormatted;
      }

      return {
        id: docSnap.id,
        imageSrc: getFirebaseImageUrl(projectData.projectImageUrl),
        skillTypeName: skillTypeNames,
        title: typeof projectData.projectName === 'string' ? projectData.projectName : '',
        description: typeof projectData.projectDescription === 'string' ? projectData.projectDescription : '',
        dateRange: dateRangeString,
        owner: ownerName,
      } as Project;
    }));

    return projectsData;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}; 