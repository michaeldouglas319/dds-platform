import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/posts/upload-image - Upload image to Supabase Storage
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'File must be less than 5MB' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_dds_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_dds_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const filename = `blog-images/${userId}/${timestamp}-${random}-${file.name}`

    // Upload file
    const buffer = await file.arrayBuffer()
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filename, buffer, {
        contentType: file.type,
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(data.path)

    return Response.json(
      { url: publicUrlData.publicUrl },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to upload image:', error)
    return Response.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
