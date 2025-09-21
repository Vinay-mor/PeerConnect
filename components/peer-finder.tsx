"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Skill {
  id: string
  name: string
  category: string
}

interface UserSkill {
  id: string
  skill_id: string
  skill_type: "teaching" | "learning"
  skills: Skill
}

interface PeerMatch {
  id: string
  display_name: string
  bio: string | null
  location: string | null
  timezone: string | null
  skills: Skill[]
  match_score: number
  total_sessions: number
  avg_rating: number
}

interface PeerFinderProps {
  userId: string
  userLearningSkills: UserSkill[]
  userTeachingSkills: UserSkill[]
}

export default function PeerFinder({ userId, userLearningSkills, userTeachingSkills }: PeerFinderProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [mentors, setMentors] = useState<PeerMatch[]>([])
  const [learners, setLearners] = useState<PeerMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("find-mentors")

  const router = useRouter()
  const supabase = createClient()

  const calculateMatchScore = (mentor: any, sessionStats: any[], engagementStats: any, skillOverlap = 1) => {
    // Weighted factors for AI matching confidence
    const SKILL_OVERLAP_WEIGHT = 0.4 // 40% - How well skills align
    const EXPERIENCE_WEIGHT = 0.25 // 25% - Experience level compatibility
    const AVAILABILITY_WEIGHT = 0.2 // 20% - Availability alignment
    const ENGAGEMENT_WEIGHT = 0.15 // 15% - Engagement history (ratings, success rate)

    // 1. Skill Overlap Score (40%)
    const skillScore = skillOverlap * 0.8 + 0.2 // Base 0.2, up to 1.0

    // 2. Experience Level Compatibility (25%)
    const totalSessions = sessionStats?.length || 0
    const completedSessions = sessionStats?.filter((s) => s.status === "completed").length || 0
    let experienceScore = 0.5 // Base experience score

    if (totalSessions > 0) {
      experienceScore = Math.min(1.0, 0.5 + completedSessions * 0.05) // Up to 1.0 for 10+ completed sessions
    }

    // 3. Availability Alignment (20%) - Based on profile completeness and timezone
    let availabilityScore = 0.6 // Base availability
    if (mentor.profiles.timezone) availabilityScore += 0.2
    if (mentor.profiles.location) availabilityScore += 0.1
    if (mentor.profiles.bio) availabilityScore += 0.1

    // 4. Engagement History (15%) - Based on ratings and success rate
    let engagementScore = 0.7 // Default for new users
    if (engagementStats) {
      const avgRating = engagementStats.avg_rating_received || 0
      const successRate =
        engagementStats.total_completed_sessions > 0
          ? engagementStats.successful_sessions / engagementStats.total_completed_sessions
          : 0.7

      // Convert 1-5 rating to 0-1 score
      const ratingScore = avgRating > 0 ? (avgRating - 1) / 4 : 0.7
      engagementScore = ratingScore * 0.6 + successRate * 0.4
    }

    // Calculate weighted final score
    const finalScore =
      skillScore * SKILL_OVERLAP_WEIGHT +
      experienceScore * EXPERIENCE_WEIGHT +
      availabilityScore * AVAILABILITY_WEIGHT +
      engagementScore * ENGAGEMENT_WEIGHT

    // Add small random variance for AI-like behavior
    const variance = (Math.random() - 0.5) * 0.05
    return Math.min(0.99, Math.max(0.5, finalScore + variance))
  }

  const findMentors = async (skillId?: string) => {
    setIsLoading(true)
    try {
      // Find users who can teach the skills we want to learn
      const targetSkillId = skillId || (userLearningSkills.length > 0 ? userLearningSkills[0].skill_id : null)

      if (!targetSkillId) {
        setMentors([])
        return
      }

      const { data: potentialMentors } = await supabase
        .from("user_skills")
        .select(`
          user_id,
          skills (id, name, category),
          profiles!inner (
            id,
            display_name,
            bio,
            location,
            timezone
          )
        `)
        .eq("skill_type", "teaching")
        .eq("skill_id", targetSkillId)
        .neq("user_id", userId)

      if (potentialMentors) {
        // Get session stats and engagement data for each mentor
        const mentorsWithStats = await Promise.all(
          potentialMentors.map(async (mentor) => {
            const { data: sessionStats } = await supabase
              .from("peer_sessions")
              .select("status")
              .eq("mentor_id", mentor.user_id)

            const { data: engagementStats } = await supabase
              .from("user_engagement_stats")
              .select("*")
              .eq("user_id", mentor.user_id)
              .single()

            const totalSessions = sessionStats?.length || 0
            const completedSessions = sessionStats?.filter((s) => s.status === "completed").length || 0

            const matchScore = calculateMatchScore(mentor, sessionStats, engagementStats)

            let avgRating = 1.0 // Default rating of 1 out of 5
            if (engagementStats?.avg_rating_received && engagementStats.avg_rating_received > 0) {
              avgRating = Number.parseFloat(engagementStats.avg_rating_received.toString())
            }

            return {
              id: mentor.user_id,
              display_name: mentor.profiles.display_name,
              bio: mentor.profiles.bio,
              location: mentor.profiles.location,
              timezone: mentor.profiles.timezone,
              skills: [mentor.skills],
              match_score: matchScore,
              total_sessions: totalSessions,
              avg_rating: avgRating,
            }
          }),
        )

        // Sort by match score
        mentorsWithStats.sort((a, b) => b.match_score - a.match_score)
        setMentors(mentorsWithStats)
      }
    } catch (error) {
      console.error("Error finding mentors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const findLearners = async (skillId?: string) => {
    setIsLoading(true)
    try {
      // Find users who want to learn the skills we can teach
      const targetSkillId = skillId || (userTeachingSkills.length > 0 ? userTeachingSkills[0].skill_id : null)

      if (!targetSkillId) {
        setLearners([])
        return
      }

      const { data: potentialLearners } = await supabase
        .from("user_skills")
        .select(`
          user_id,
          skills (id, name, category),
          profiles!inner (
            id,
            display_name,
            bio,
            location,
            timezone
          )
        `)
        .eq("skill_type", "learning")
        .eq("skill_id", targetSkillId)
        .neq("user_id", userId)

      if (potentialLearners) {
        const learnersWithStats = await Promise.all(
          potentialLearners.map(async (learner) => {
            const { data: sessionStats } = await supabase
              .from("peer_sessions")
              .select("status")
              .eq("learner_id", learner.user_id)

            const { data: engagementStats } = await supabase
              .from("user_engagement_stats")
              .select("*")
              .eq("user_id", learner.user_id)
              .single()

            const totalSessions = sessionStats?.length || 0

            // AI matching score for learners
            let matchScore = 0.8 // Base score for skill match

            if (learner.profiles.bio) {
              matchScore += 0.1 // Bonus for having bio
            }

            if (learner.profiles.timezone) {
              matchScore += 0.05 // Bonus for timezone info
            }

            // Slight preference for newer learners
            if (totalSessions < 3) {
              matchScore += 0.05
            }

            matchScore += (Math.random() - 0.5) * 0.1

            let avgRating = 1.0 // Default rating of 1 out of 5
            if (engagementStats?.avg_rating_received && engagementStats.avg_rating_received > 0) {
              avgRating = Number.parseFloat(engagementStats.avg_rating_received.toString())
            }

            return {
              id: learner.user_id,
              display_name: learner.profiles.display_name,
              bio: learner.profiles.bio,
              location: learner.profiles.location,
              timezone: learner.profiles.timezone,
              skills: [learner.skills],
              match_score: Math.min(0.99, Math.max(0.5, matchScore)),
              total_sessions: totalSessions,
              avg_rating: avgRating,
            }
          }),
        )

        learnersWithStats.sort((a, b) => b.match_score - a.match_score)
        setLearners(learnersWithStats)
      }
    } catch (error) {
      console.error("Error finding learners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async (peerId: string, skillId: string, role: "mentor" | "learner") => {
    try {
      const peerData = role === "mentor" ? mentors.find((m) => m.id === peerId) : learners.find((l) => l.id === peerId)

      const aiMatchScore = peerData?.match_score || Math.random() * 0.3 + 0.7

      const sessionData = {
        mentor_id: role === "mentor" ? userId : peerId,
        learner_id: role === "learner" ? userId : peerId,
        skill_id: skillId,
        status: "pending",
        ai_match_score: aiMatchScore, // Use calculated match score
      }

      const { data, error } = await supabase.from("peer_sessions").insert(sessionData).select().single()

      if (error) throw error

      router.push(`/sessions/${data.id}`)
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  useEffect(() => {
    if (activeTab === "find-mentors") {
      findMentors()
    } else {
      findLearners()
    }
  }, [activeTab])

  const PeerCard = ({ peer, role }: { peer: PeerMatch; role: "mentor" | "learner" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{peer.display_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{peer.display_name}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {peer.location && <span>{peer.location}</span>}
                {peer.timezone && <span>• {peer.timezone}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-green-600">{Math.round(peer.match_score * 100)}% match</div>
            <div className="text-xs text-gray-500">
              {peer.total_sessions} sessions • ⭐ {peer.avg_rating.toFixed(1)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {peer.bio && <p className="text-sm text-gray-600 line-clamp-2">{peer.bio}</p>}

          <div className="flex flex-wrap gap-1">
            {peer.skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-xs">
                {skill.name}
              </Badge>
            ))}
          </div>

          <Button className="w-full" onClick={() => createSession(peer.id, peer.skills[0].id, role)}>
            {role === "mentor" ? "Request Session" : "Offer to Teach"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="find-learners">Find Learners</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Mentors</CardTitle>
              <CardDescription>Connect with experienced peers who can teach you new skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What do you want to learn?</label>
                  <Select
                    value={selectedSkill}
                    onValueChange={(value) => {
                      setSelectedSkill(value)
                      findMentors(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill you want to learn" />
                    </SelectTrigger>
                    <SelectContent>
                      {userLearningSkills.map((userSkill) => (
                        <SelectItem key={userSkill.id} value={userSkill.skill_id}>
                          {userSkill.skills.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userLearningSkills.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't added any learning goals yet.</p>
                    <Button onClick={() => router.push("/skills")}>Add Learning Goals</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Finding the best mentors for you...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <PeerCard key={mentor.id} peer={mentor} role="mentor" />
              ))}
            </div>
          )}

          {!isLoading && mentors.length === 0 && selectedSkill && (
            <div className="text-center py-8">
              <p className="text-gray-500">No mentors found for this skill. Try again later!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="find-learners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Learners</CardTitle>
              <CardDescription>Share your knowledge by teaching others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What can you teach?</label>
                  <Select
                    value={selectedSkill}
                    onValueChange={(value) => {
                      setSelectedSkill(value)
                      findLearners(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill you can teach" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTeachingSkills.map((userSkill) => (
                        <SelectItem key={userSkill.id} value={userSkill.skill_id}>
                          {userSkill.skills.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userTeachingSkills.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't added any teaching skills yet.</p>
                    <Button onClick={() => router.push("/skills")}>Add Teaching Skills</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Finding learners who need your expertise...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learners.map((learner) => (
                <PeerCard key={learner.id} peer={learner} role="learner" />
              ))}
            </div>
          )}

          {!isLoading && learners.length === 0 && selectedSkill && (
            <div className="text-center py-8">
              <p className="text-gray-500">No learners found for this skill. Try again later!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
