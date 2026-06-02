import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Case type to practice area mapping
const CASE_TYPE_MAP: Record<string, string[]> = {
  "Criminal Law": ["Criminal Law"],
  "Civil Litigation": ["Civil Law"],
  "Family Law": ["Family Law"],
  "Property Disputes": ["Property Law"],
  "Consumer Law": ["Consumer Law"],
  "Corporate Law": ["Corporate Law"],
  "Labour Law": ["Labour Law"],
  "Cyber Law": ["Cyber Law"],
  "Intellectual Property": ["Corporate Law"],
  "Startup & MSME Law": ["Corporate Law"],
  "Tax Law": ["Tax Law"],
  "Employment": ["Labour Law"],
  "Tenant Dispute": ["Property Law", "Civil Law"],
  "Other": [],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user's JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { case_id, action } = await req.json();

    // Use service role client for data operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (action === "match") {
      // Fetch the case
      const { data: caseData, error: caseErr } = await supabase
        .from("cases")
        .select("*")
        .eq("id", case_id)
        .single();

      if (caseErr || !caseData) {
        return new Response(JSON.stringify({ error: "Case not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify the caller is the case owner or an admin
      const isOwner = caseData.client_id === userId;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!isOwner && !isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get practice areas for case type
      const practiceAreas = CASE_TYPE_MAP[caseData.case_type] || [];

      // Fetch all verified lawyers with their profiles
      const { data: lawyers } = await supabase
        .from("lawyer_profiles")
        .select("*")
        .eq("verification_status", "verified")
        .eq("profile_visible", true);

      if (!lawyers || lawyers.length === 0) {
        return new Response(JSON.stringify({ matches: [], message: "No verified lawyers available" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch profiles for location matching
      const lawyerIds = lawyers.map((l) => l.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", lawyerIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p) => { profileMap[p.id] = p; });

      // Count active cases per lawyer
      const { data: activeCases } = await supabase
        .from("cases")
        .select("lawyer_id")
        .in("status", ["accepted", "in_progress", "under_review", "consultation_scheduled", "waiting_for_client"])
        .in("lawyer_id", lawyerIds);

      const caseCountMap: Record<string, number> = {};
      activeCases?.forEach((c) => {
        caseCountMap[c.lawyer_id] = (caseCountMap[c.lawyer_id] || 0) + 1;
      });

      // Score each lawyer
      const scored = lawyers.map((lawyer) => {
        const profile = profileMap[lawyer.user_id];
        let score = 0;
        const reasons: string[] = [];

        // Specialization match (40 points)
        if (practiceAreas.length > 0) {
          const matchingAreas = (lawyer.practice_areas || []).filter((a: string) =>
            practiceAreas.some((pa) => a.toLowerCase().includes(pa.toLowerCase()) || pa.toLowerCase().includes(a.toLowerCase()))
          );
          if (matchingAreas.length > 0) {
            score += 40;
            reasons.push(`Specializes in ${matchingAreas.join(", ")}`);
          }
        }

        // Location match (20 points)
        if (profile && caseData.client_location_state) {
          if (profile.state === caseData.client_location_state) {
            score += 15;
            reasons.push("Same state");
          }
          if (profile.city && caseData.client_location_city && profile.city === caseData.client_location_city) {
            score += 5;
            reasons.push("Same city");
          }
        }

        // Experience (15 points)
        const exp = lawyer.experience || 0;
        if (exp >= 10) {
          score += 15;
          reasons.push(`${exp}+ years experience`);
        } else if (exp >= 5) {
          score += 10;
          reasons.push(`${exp} years experience`);
        } else if (exp > 0) {
          score += 5;
          reasons.push(`${exp} years experience`);
        }

        // Rating (15 points)
        const rating = lawyer.rating || 0;
        if (rating >= 4.5) {
          score += 15;
          reasons.push(`High rating: ${rating}`);
        } else if (rating >= 3.5) {
          score += 10;
          reasons.push(`Good rating: ${rating}`);
        } else if (rating > 0) {
          score += 5;
        }

        // Language match (5 points)
        if (profile?.preferred_language && lawyer.languages_spoken?.length > 0) {
          if (lawyer.languages_spoken.includes(profile.preferred_language)) {
            score += 5;
            reasons.push("Language match");
          }
        }

        // Availability (5 points)
        const maxCases = lawyer.max_active_cases || 10;
        const currentCases = caseCountMap[lawyer.user_id] || 0;
        if (currentCases < maxCases) {
          score += 5;
          reasons.push("Available");
        } else {
          score -= 20; // Penalize overloaded lawyers
          reasons.push("At capacity");
        }

        return {
          lawyer_id: lawyer.user_id,
          match_score: Math.max(0, score),
          match_reasons: reasons,
          lawyer,
          profile,
          active_cases: currentCases,
        };
      });

      // Sort by score descending, take top 5
      scored.sort((a, b) => b.match_score - a.match_score);
      const topMatches = scored.filter((s) => s.match_score > 0).slice(0, 5);

      // Insert matches into case_matches
      if (topMatches.length > 0) {
        const matchInserts = topMatches.map((m) => ({
          case_id,
          lawyer_id: m.lawyer_id,
          match_score: m.match_score,
          match_reasons: m.match_reasons,
          status: "notified",
        }));

        await supabase.from("case_matches").insert(matchInserts);

        // Update case match_status
        await supabase.from("cases").update({
          match_status: "matched",
          response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }).eq("id", case_id);

        // Send notifications to matched lawyers
        for (const m of topMatches) {
          await supabase.from("notifications").insert({
            user_id: m.lawyer_id,
            title: "New Case Match",
            message: `A ${caseData.case_type} case matches your profile. Score: ${m.match_score}%. Respond within 24 hours.`,
            type: "case_match",
            related_case_id: case_id,
          });
        }

        // Auto-assign if urgent and high-score match
        if (caseData.priority === "urgent" && topMatches[0].match_score >= 60) {
          await supabase.from("cases").update({
            lawyer_id: topMatches[0].lawyer_id,
            auto_assigned: true,
            status: "accepted",
            accepted_at: new Date().toISOString(),
            match_status: "auto_assigned",
          }).eq("id", case_id);

          await supabase.from("case_matches").update({ status: "auto_assigned" })
            .eq("case_id", case_id).eq("lawyer_id", topMatches[0].lawyer_id);

          await supabase.from("notifications").insert({
            user_id: topMatches[0].lawyer_id,
            title: "Urgent Case Auto-Assigned",
            message: `An urgent ${caseData.case_type} case has been auto-assigned to you.`,
            type: "case_auto_assign",
            related_case_id: case_id,
          });

          await supabase.from("notifications").insert({
            user_id: caseData.client_id,
            title: "Lawyer Assigned",
            message: `A lawyer has been auto-assigned for your urgent case.`,
            type: "case_update",
            related_case_id: case_id,
          });
        }
      }

      // Use AI to classify if case_type is "Other"
      let classification = caseData.case_type;
      if (caseData.case_type === "Other") {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          try {
            const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  {
                    role: "system",
                    content: "You are a legal case classifier for India. Given a case description, return ONLY the category name from this list: Criminal Law, Civil Litigation, Family Law, Property Disputes, Consumer Law, Corporate Law, Labour Law, Cyber Law, Intellectual Property, Tax Law, Startup & MSME Law. Return only the category name, nothing else.",
                  },
                  { role: "user", content: `Title: ${caseData.title}\nDescription: ${caseData.description}` },
                ],
              }),
            });
            if (aiResp.ok) {
              const aiData = await aiResp.json();
              classification = aiData.choices?.[0]?.message?.content?.trim() || classification;
              // Update case type if classified
              if (classification !== "Other") {
                await supabase.from("cases").update({ case_type: classification }).eq("id", case_id);
              }
            }
          } catch (e) {
            console.error("AI classification failed:", e);
          }
        }
      }

      return new Response(JSON.stringify({
        matches: topMatches.map((m) => ({
          lawyer_id: m.lawyer_id,
          match_score: m.match_score,
          match_reasons: m.match_reasons,
          name: m.profile?.name,
          experience: m.lawyer.experience,
          rating: m.lawyer.rating,
          specialization: m.lawyer.specialization,
          practice_areas: m.lawyer.practice_areas,
          consultation_fee: m.lawyer.consultation_fee,
          city: m.profile?.city,
          state: m.profile?.state,
          role_type: m.lawyer.role_type,
          active_cases: m.active_cases,
        })),
        classification,
        auto_assigned: caseData.priority === "urgent" && topMatches.length > 0 && topMatches[0].match_score >= 60,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-lawyers error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
