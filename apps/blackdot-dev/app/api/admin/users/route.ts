import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/admin/users - List all users
 */
export async function GET() {
  try {
    await requireAdmin()

    const users = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accessLevel: true,
        createdAt: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit: 100,
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.accessLevel,
      createdAt: user.createdAt,
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
