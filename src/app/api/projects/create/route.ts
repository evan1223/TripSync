import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH, DATABASE } from '@/src/database/firebaseAdmin'

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token)
        return NextResponse.json({ loggedIn: false }, { status: 401 });

    try {
        const decoded = await AUTH.verifyIdToken(token);
        const userId = decoded.uid;
        const body = await req.json();

        const projectName = body.projectName;

        // Check if the project already exists for this user
        const existingProjectSnap = await DATABASE.collection('projects')
            .where('projectName', '==', projectName)
            .where('ownerId', '==', userId)
            .limit(1)
            .get();

        if (!existingProjectSnap.empty) {
            const existingProject = existingProjectSnap.docs[0];
            const projectId = existingProject.id;

            // update the project if needed here
            await existingProject.ref.update({
                projectDescription: body.projectDescription,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                peopleRequired: Number(body.peopleRequired),
                skillDescription: body.skillDescription,
                projectImageUrl: body.projectImageUrl,
                status: "open"
            });

            return NextResponse.json({ success: true, updated: true, projectId });
        }

        // Create projectType
        const projectTypeRef = await DATABASE.collection('projectTypes').add({
            projectTypeName: body.projectTypeName,
        });
        const projectTypeId = projectTypeRef.id;

        // Create skillTypes
        const skillTypeNames: string[] = body.skillTypeNames || [];
        const skillTypeId: string[] = [];
        for (const name of skillTypeNames) {
            const ref = await DATABASE.collection("skillTypes").add({ skillTypeName: name });
            skillTypeId.push(ref.id);
        }

        // Create new project
        const projectRef = await DATABASE.collection('projects').add({
            projectName,
            projectDescription: body.projectDescription,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            peopleRequired: Number(body.peopleRequired),
            skillTypeId,
            skillDescription: body.skillDescription,
            projectTypeId,
            projectImageUrl: body.projectImageUrl,
            ownerId: userId,
            status: "open",
        });

        return NextResponse.json({ success: true, created: true, projectId: projectRef.id });

    } catch (err: any) {
        console.error("Create or update project failed:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

