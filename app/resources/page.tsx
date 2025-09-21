import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ResourceSearch from "@/components/resource-search"

export default async function ResourcesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all skills for filtering
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  // Get user's skills for personalized recommendations
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (*)
    `)
    .eq("user_id", data.user.id)

  // Get initial resources
  const { data: resources } = await supabase
    .from("resources")
    .select(`
      *,
      skills (name, category),
      created_by (display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Learning Resources</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Smart Resource Discovery</h2>
          <p className="text-gray-600">
            Find curated learning materials tailored to your skills and interests, powered by AI recommendations.
          </p>
        </div>

        <ResourceSearch
          skills={skills || []}
          userSkills={userSkills || []}
          initialResources={resources || []}
          userId={data.user.id}
        />
      </main>
    </div>
  )
}
