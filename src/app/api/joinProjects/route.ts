import { NextRequest, NextResponse } from "next/server";
import { DATABASE, AUTH } from "@/src/database/firebaseAdmin";

export async function GET(req: NextRequest) {
  //  const userId = "0fiXVjhBFKO84AVMEQYuURN8BWX2";

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {

      const decodedToken = await AUTH.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Find the user's all applications
      const appSnap = await DATABASE
      .collection('applications')
      .where('userId', '==', userId)
      .get();

      if (appSnap.empty) {
        return NextResponse.json([], { status: 200 });
      }
      // For each application, fetch the corresponding project
      const joinedProjects = await Promise.all(
        appSnap.docs.map(async (doc) => {
          const appData = doc.data();
          const projectRef = DATABASE.collection("projects").doc(appData.projectId);
          const projectSnap = await projectRef.get();

          if (!projectSnap.exists) return null;

          const projectData = projectSnap.data();
          return {
            id: projectSnap.id,
            ...projectData,
            appliedAt: appData.appliedAt.toDate(),
            applicationStatus: appData.applicationStatus,
          };
        })
      );

      // Filter out nulls (nonexistent projects)
      const results = joinedProjects.filter((p) => p !== null);

      return NextResponse.json(results, { status: 200 });
    } catch (error) {
      console.error("Error fetching joined projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch joined projects" },
        { status: 500 }
      );
    }
}


