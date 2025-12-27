import { NextRequest, NextResponse } from "next/server";
import { refineResume } from "@/app/lib/openai";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { currentResume, feedback, jobDescription, aiConfig } = body;

        if (!currentResume || !feedback) {
            return NextResponse.json({ error: "Resume and feedback are required" }, { status: 400 });
        }

        const result = await refineResume(currentResume, feedback, jobDescription || "", aiConfig);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Refine API Error:", error);
        return NextResponse.json({ error: "Failed to refine resume" }, { status: 500 });
    }
}
