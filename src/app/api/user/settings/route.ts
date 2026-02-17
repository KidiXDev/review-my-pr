import { NextResponse } from "next/server";
import { db } from "@/index";
import { userSettings, user as userTable, account } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user settings
    let [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    // If no settings exist, create them
    if (!settings) {
      [settings] = await db
        .insert(userSettings)
        .values({
          userId: userId,
          emailNotifications: true,
          pushNotifications: true,
        })
        .returning();
    }

    // Fetch user accounts to check for provider
    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId));

    const isGoogleUser = userAccounts.some(
      (acc) => acc.providerId === "google",
    );

    return NextResponse.json({
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        isGoogleUser,
      },
      settings,
    });
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, emailNotifications, pushNotifications } = await req.json();

    // Update user name if provided
    if (name) {
      await db.update(userTable).set({ name }).where(eq(userTable.id, userId));
    }

    // Update settings
    const [updatedSettings] = await db
      .update(userSettings)
      .set({
        emailNotifications,
        pushNotifications,
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
