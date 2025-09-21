import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AchievementsDisplay from "@/components/achievements-display"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievements (*)
    `)
    .eq("user_id", data.user.id)

  // Get all available achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("points_required", { ascending: true })

  // Get user stats for progress calculation
  const { data: userPoints } = await supabase.from("user_points").select("*").eq("user_id", data.user.id).single()

  const { data: sessionStats } = await supabase
    .from("peer_sessions")
    .select("status, mentor_id, learner_id")
    .or(`mentor_id.eq.${data.user.id},learner_id.eq.${data.user.id}`)
    .eq("status", "completed")

  const { data: skillStats } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (category)
    `)
    .eq("user_id", data.user.id)

  const { data: resourceStats } = await supabase.from("resources").select("id").eq("created_by", data.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Achievements</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Achievements</h2>
          <p className="text-gray-600">Track your progress and unlock rewards as you learn and teach on PeerConnect.</p>
        </div>

        <AchievementsDisplay
          userAchievements={userAchievements || []}
          allAchievements={allAchievements || []}
          userStats={{
            points: userPoints?.points || 0,
            level: userPoints?.level || 1,
            sessionsLearned: sessionStats?.filter((s) => s.learner_id === data.user.id).length || 0,
            sessionsTaught: sessionStats?.filter((s) => s.mentor_id === data.user.id).length || 0,
            totalSkills: skillStats?.length || 0,
            skillCategories: new Set(skillStats?.map((s) => s.skills?.category).filter(Boolean)).size || 0,
            resourcesAdded: resourceStats?.length || 0,
          }}
        />
      </main>
    </div>
  )
}
