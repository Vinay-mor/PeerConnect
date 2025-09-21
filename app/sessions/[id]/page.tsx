import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SessionDetails from "@/components/session-details"

interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get session details
  const { data: session } = await supabase
    .from("peer_sessions")
    .select(`
      *,
      skills (name, category, description),
      mentor:mentor_id (display_name, bio, timezone),
      learner:learner_id (display_name, bio, timezone)
    `)
    .eq("id", id)
    .single()

  if (!session) {
    redirect("/sessions")
  }

  // Check if user is part of this session
  if (session.mentor_id !== data.user.id && session.learner_id !== data.user.id) {
    redirect("/sessions")
  }

  // Get chat messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select(`
      *,
      sender:sender_id (display_name)
    `)
    .eq("session_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Session: {session.skills?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <SessionDetails session={session} messages={messages || []} currentUserId={data.user.id} />
      </main>
    </div>
  )
}
