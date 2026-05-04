import { Webhook } from "svix"
import { headers } from "next/headers"
import { clerkClient } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { users as usersTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { autoJoinGlobalWorkspace } from "@/lib/services/workspace-autojoin.service"

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured")
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  // Verify webhook signature
  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    )
  }

  const body = await req.text()

  try {
    const wh = new Webhook(webhookSecret)
    const evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent

    // Handle user.created event
    if (evt.type === "user.created") {
      try {
        // Get clerk client instance
        const client = await clerkClient()
        // Get total user count to determine if this is the first user
        const users = await client.users.getUserList({ limit: 1 })
        const isFirstUser = (users.totalCount ?? 0) === 1

        // Set role based on whether this is the first user
        const role = isFirstUser ? "admin" : "member"

        // Update user metadata with role
        await client.users.updateUser(evt.data.id, {
          publicMetadata: { role }
        })

        console.log(`User ${evt.data.id} created with role: ${role}`)
      } catch (error) {
        console.error("Error updating user metadata:", error)
        // Don't fail the webhook - let Clerk know we received it
      }

      // Sync user to database
      try {
        const userData = evt.data as any
        const accessLevel = userData.publicMetadata?.role === "admin" ? "admin" : "member"

        await db.insert(usersTable).values({
          id: userData.id,
          clerkId: userData.id,
          email: userData.email_addresses?.[0]?.email_address || "",
          firstName: userData.first_name || null,
          lastName: userData.last_name || null,
          avatarUrl: userData.image_url || null,
          accessLevel: accessLevel as any,
        }).onConflictDoUpdate({
          target: usersTable.clerkId,
          set: {
            email: userData.email_addresses?.[0]?.email_address || "",
            firstName: userData.first_name || null,
            lastName: userData.last_name || null,
            avatarUrl: userData.image_url || null,
            accessLevel: accessLevel as any,
          }
        })

        console.log(`User ${userData.id} synced to database`)

        // Auto-join global workspace if user has Member+ access
        if (accessLevel !== "member") {
          const result = await autoJoinGlobalWorkspace(userData.id, accessLevel as any)
          console.log(`Auto-join global workspace for user ${userData.id}:`, result)
        }
      } catch (error) {
        console.error("Error syncing user to database:", error)
        // Don't fail the webhook - let Clerk know we received it
      }
    }

    // Handle user.updated event
    if (evt.type === "user.updated") {
      try {
        const userData = evt.data as any
        const existingUser = await db.query.users.findFirst({
          where: eq(usersTable.clerkId, userData.id),
        })

        if (existingUser) {
          // Check if access level has changed by looking at the role in public metadata
          const newAccessLevel = userData.publicMetadata?.role === "admin" ? "admin" : "member"

          await db.update(usersTable)
            .set({
              email: userData.email_addresses?.[0]?.email_address || existingUser.email,
              firstName: userData.first_name || existingUser.firstName,
              lastName: userData.last_name || existingUser.lastName,
              avatarUrl: userData.image_url || existingUser.avatarUrl,
              accessLevel: newAccessLevel as any,
              updatedAt: new Date(),
            })
            .where(eq(usersTable.clerkId, userData.id))

          console.log(`User ${userData.id} updated in database`)

          // Handle global workspace access if access level changed
          const oldAccessLevel = existingUser.accessLevel
          if (oldAccessLevel !== newAccessLevel) {
            const result = await autoJoinGlobalWorkspace(userData.id, newAccessLevel as any)
            console.log(`Updated global workspace access for user ${userData.id}:`, result)
          }
        }
      } catch (error) {
        console.error("Error updating user in database:", error)
      }
    }

    // Handle user.deleted event
    if (evt.type === "user.deleted") {
      try {
        const userData = evt.data as any
        await db.delete(usersTable)
          .where(eq(usersTable.clerkId, userData.id))

        console.log(`User ${userData.id} deleted from database`)
      } catch (error) {
        console.error("Error deleting user from database:", error)
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Webhook verification failed:", error)
    return Response.json(
      { error: "Webhook verification failed" },
      { status: 401 }
    )
  }
}

interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses?: Array<{ email_address: string }>
    first_name?: string | null
    last_name?: string | null
    image_url?: string | null
    publicMetadata?: Record<string, unknown>
    [key: string]: unknown
  }
  [key: string]: unknown
}
