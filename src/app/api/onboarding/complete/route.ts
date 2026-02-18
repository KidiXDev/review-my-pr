import { db } from "@/index";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Update user in DB
    await db
      .update(user)
      .set({ onboardingCompleted: true })
      .where(eq(user.id, session.user.id));

    // Create response with cookie
    const response = NextResponse.json({ success: true });

    // Set a long-lived cookie for middleware performance
    response.cookies.set("onboarding-completed", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: false, // Accessible to client if needed, but mainly for middleware
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
