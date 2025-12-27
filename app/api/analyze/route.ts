import { NextRequest, NextResponse } from "next/server";
import { analyzeResume, generateCoverLetter } from "@/app/lib/openai";
import { parsePDF, parseDocx } from "@/app/lib/server-parsers";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const jobDescription = formData.get("jobDescription") as string;
        const file = formData.get("file") as File | null;
        const text = formData.get("text") as string | null;
        const includeCoverLetter = formData.get("includeCoverLetter") === "true";
        const aiConfigRaw = formData.get("aiConfig") as string | null;
        let aiConfig;
        if (aiConfigRaw && aiConfigRaw !== "undefined") {
            try {
                aiConfig = JSON.parse(aiConfigRaw);
            } catch (e) {
                console.warn("Invalid AI Config JSON");
            }
        }

        if (!jobDescription) {
            return NextResponse.json({ error: "Job description is required" }, { status: 400 });
        }

        let resumeText = "";

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            if (file.type === "application/pdf") {
                resumeText = await parsePDF(buffer);
            } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                resumeText = await parseDocx(buffer);
            } else {
                return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
            }
        } else if (text) {
            resumeText = text;
        } else {
            return NextResponse.json({ error: "Resume file or text is required" }, { status: 400 });
        }

        const result = await analyzeResume(resumeText, jobDescription, aiConfig);

        // Generate cover letter if requested
        if (includeCoverLetter) {
            const coverLetter = await generateCoverLetter(resumeText, jobDescription, aiConfig);
            result.coverLetter = coverLetter;
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
