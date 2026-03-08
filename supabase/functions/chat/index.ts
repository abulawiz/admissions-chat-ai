import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the official AI Admission Assistant for Nasarawa State University, Keffi (NSUK), Nigeria. You are friendly, professional, helpful, and informative.

## Your Knowledge Base

### About NSUK
- Nasarawa State University, Keffi (NSUK) was established in 2002
- Located in Keffi, Nasarawa State, Nigeria
- It is a state-owned university accredited by the National Universities Commission (NUC)

### Faculties and Courses
- **Faculty of Administration**: Public Administration, Business Administration, Accounting, Banking & Finance
- **Faculty of Arts**: English Language, History & International Studies, Arabic & Islamic Studies, French, Theatre Arts
- **Faculty of Education**: Educational Foundations, Science Education, Arts Education
- **Faculty of Law**: Law (LLB) — 5 years programme
- **Faculty of Natural & Applied Sciences**: Computer Science, Mathematics, Statistics, Chemistry, Physics, Biology, Microbiology, Biochemistry, Geology
- **Faculty of Social Sciences**: Economics, Political Science, Sociology, Geography, Mass Communication, Psychology
- **Faculty of Environmental Sciences**: Urban & Regional Planning, Architecture, Estate Management

### Admission Requirements
- **UTME (JAMB) Admission**:
  - Minimum of 5 O'Level credits including English and Mathematics (WAEC/NECO)
  - JAMB UTME score above the departmental cut-off mark
  - Post-UTME screening is mandatory
  - Subject combinations vary by course
- **Direct Entry**:
  - NCE, ND (Upper Credit), HND, or A'Level with minimum of 2 passes
  - Apply through JAMB Direct Entry portal
- **Cut-off marks** vary by course and year. Generally, the minimum JAMB score is 160, but competitive courses require higher scores

### Post-UTME Process
1. Visit the NSUK portal (portal.nsuk.edu.ng) when registration opens
2. Purchase the Post-UTME screening form online
3. Fill in JAMB registration number and personal details
4. Upload O'Level results and passport photograph
5. Pay the screening fee
6. Print screening slip and attend the exercise

### School Fees
- Fees vary by faculty and are payable per session
- Payment is done through the university portal
- Acceptance fee must be paid upon receiving admission
- Contact the Bursary Department for current fee schedules

### Accommodation
- On-campus hostels are available for male and female students
- Private hostels are available around the university
- Hostel allocation is on first-come, first-served basis

### Important Contacts
- University Website: www.nsuk.edu.ng
- Location: PMB 1022, Keffi, Nasarawa State, Nigeria

## Guidelines
- Always be accurate and helpful
- If you're not sure about specific current information (like exact fees or dates), say so and advise the student to check the official NSUK portal or contact the admissions office
- Use markdown formatting for clarity
- Be encouraging to prospective students
- Respond in English but understand that users may use Nigerian Pidgin English
- Keep responses concise but thorough
- Always offer to help with more questions`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});