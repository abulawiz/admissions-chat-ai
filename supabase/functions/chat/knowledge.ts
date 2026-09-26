export const KNOWLEDGE = `NSUK Undergraduate Admission — Chatbot Knowledge Base
1. University identification

Institution: Nasarawa State University, Keffi (NSUK)
Location: Keffi, Nasarawa State, Nigeria
Official website: NSUK official website
Undergraduate application portal: NSUK Undergraduate Application Portal

NSUK was established in 2001, and academic activities commenced in 2002. The university describes itself as offering programmes across areas including administration/business, arts/humanities, science/technology, law/governance, agriculture/environment, and education/society.

2. Main undergraduate admission routes

Your chatbot should recognize at least these admission routes:

A. UTME / 100 Level

This is the normal route for candidates who have completed secondary education and are seeking admission into 100 level.

The candidate normally:

Registers for JAMB UTME.
Selects NSUK as an institution choice.
Takes the UTME.
Meets the relevant NSUK programme score requirement.
Meets the O'Level requirements for the chosen programme.
Applies for NSUK's Post-UTME/screening when the university opens the exercise.
Completes the screening/application process.
Monitors admission through JAMB CAPS and the university.
Accepts an admission offer where one is made.
Completes NSUK's subsequent registration procedures.

JAMB's CAPS system is the national system used to process tertiary admissions, including candidates' admission status and acceptance decisions.

B. Direct Entry (DE)

Direct Entry is for appropriately qualified candidates seeking admission beyond 100 level, subject to the programme and qualification requirements.

JAMB identifies qualifications such as A'Level, ND, HND, NCE, IJMB, JUPEB and Cambridge A'Level among recognized Direct Entry qualifications, subject to the specific programme's requirements.

Important chatbot rule: Never tell a candidate that possession of ND/HND/NCE automatically guarantees admission to a particular NSUK level. The entry level and eligibility depend on the programme and applicable requirements.

3. Basic O'Level requirement

For ordinary degree admission, JAMB's current general requirement states that a candidate needs at least five credit passes, including English and other relevant subjects, normally obtained in not more than two sittings. Mathematics is mandatory for Science, Technology and Social Science programmes under the stated general requirement.

The chatbot should therefore ask:

“Which course do you want to study?”

before giving a definitive O'Level subject combination.

This is important because the required subjects differ between programmes.

Example

A candidate applying for a science/engineering programme may need particular science subjects, while a candidate applying for a humanities or social-science programme may need a different combination.

For the authoritative course-specific combination, the chatbot should refer candidates to JAMB's IBASS Eligibility Checker, which allows a candidate to select institution, programme, O'Level credits/passes and UTME subjects.

JAMB IBASS Eligibility Checker

4. Number of O'Level sittings

The general JAMB degree requirement allows the specified five credits to be obtained in not more than two sittings.

Therefore, the chatbot can answer:

User: “Can I combine two O'Level results?”

Chatbot:

Yes, where the applicable programme and admission requirements permit it. The general degree requirement allows the required credits to be obtained in not more than two sittings. You should also verify the specific requirements for your chosen NSUK programme.

5. JAMB UTME requirement

For the 2025/2026 NSUK screening exercise, recent published admission notices reported the following programme-specific minimum UTME scores:

Programme group	Reported minimum
Law	200
Community Health Sciences	200
Health Information Management	180
Nutrition & Dietetics	180
Environmental Health Science	180
Civil Engineering	180
Chemical Engineering	180
Electrical/Electronics Engineering	180
Computer Science	180
Other programmes	170

These figures were reported for the 2025/2026 NSUK admission screening, not as permanent NSUK cut-offs.

Very important chatbot implementation rule

Do not hard-code:

“NSUK cut-off mark is 170.”

Instead use:

“For the 2025/2026 admission screening, NSUK published programme-specific minimum UTME scores ranging from 170 to 200. The required score depends on your programme. Tell me your intended course and admission session so I can give you the applicable requirement.”

That prevents your chatbot from becoming outdated.

6. First-choice institution requirement

For the 2025/2026 NSUK Post-UTME exercise, candidates were required to have selected Nasarawa State University, Keffi as their first-choice institution.

The chatbot should therefore recognize questions such as:

“Can I apply if NSUK is my second choice?”

A safe answer is:

For the 2025/2026 NSUK screening exercise, candidates were required to choose NSUK as their first choice. If you currently have another institution as your first choice, check JAMB's current change-of-institution procedure and the current NSUK admission notice before applying.

This is preferable to presenting the first-choice requirement as an eternal rule.

7. NSUK Post-UTME / screening

NSUK has used a screening/application process for prospective undergraduate candidates.

For the 2025/2026 session, the published registration period was reported as:

28 July 2025 – 29 August 2025.

Because admission dates change each year, the chatbot should never answer:

“NSUK Post-UTME registration always starts in July.”

Instead:

“The registration dates depend on the admission session. For example, the 2025/2026 exercise opened on 28 July 2025 and was initially scheduled to close on 29 August 2025. Check the official NSUK portal for the current session.”

8. NSUK application portal

The portal you originally gave me is confirmed as the NSUK undergraduate application portal:

Open NSUK Undergraduate Application Portal

The current portal presents a New application interface requiring an application type, email address, password and password confirmation. It also currently displays a notice that WAEC verification is unavailable because of an upstream service disruption, with applicants advised to try again later.

This is useful information for your chatbot because applicants may ask:

“Why can't I verify my WAEC?”

The chatbot should not assume the applicant entered the information incorrectly. The portal itself can report a system/service problem.

9. Suggested application workflow for the chatbot

Your chatbot should explain the process approximately like this:

Step 1 — Determine admission route

Ask:

“Are you applying through UTME or Direct Entry?”

Then branch accordingly.

Step 2 — Confirm academic programme

Ask:

“Which course/programme do you want to study?”

This is essential because UTME score and subject requirements can differ.

Step 3 — Check JAMB eligibility

For UTME:

Confirm UTME participation.
Confirm institution choice.
Check programme-specific score.
Check UTME subject combination.

JAMB's eligibility checker is particularly useful here.

Step 4 — Check O'Level

Ask for:

WAEC / NECO / NABTEB / GCE
subjects
grades
number of sittings

The chatbot should determine whether the relevant subjects appear to satisfy the selected programme.

Step 5 — Apply through NSUK

Direct the candidate to the official undergraduate portal:

NSUK Undergraduate Application Portal

Step 6 — Complete screening

The candidate should provide the information and documents requested by the current NSUK application/screening system.

Step 7 — Monitor admission

The candidate should monitor:

NSUK admission updates
NSUK application portal
JAMB CAPS

JAMB describes CAPS as the system that automates the tertiary admission process.

Step 8 — Accept admission

If JAMB offers admission, the candidate needs to respond appropriately through the JAMB admission process.

Step 9 — Complete university registration

After admission, the candidate follows NSUK's instructions for acceptance, clearance, registration and school fees.

Do not hard-code fee amounts into the chatbot unless you have verified the current session's official fee schedule.

10. Direct Entry knowledge

For DE applicants, your chatbot should ask:

What qualification do you have?
What institution awarded it?
What course did you study?
What grade/class did you obtain?
What year did you graduate?
Do you have the required O'Level subjects?
What NSUK programme are you applying for?

JAMB's 2026 DE requirements specify that candidates provide information such as the registration/matriculation number of the institution attended, qualification subjects, awarding institution, affiliated institution where applicable, and graduation year.

JAMB also advises DE candidates to pre-verify O'Level information and has specific rules concerning qualification verification.

11. What the chatbot should know about JAMB CAPS

This deserves its own knowledge-base category.

Possible user questions

“What is JAMB CAPS?”

JAMB CAPS is the Central Admissions Processing System used by JAMB to manage and automate admission processing for tertiary institutions.

“Where can I check my admission?”

You should check your JAMB admission status through your JAMB profile/CAPS and also follow NSUK's official admission announcements.

“What does admission in progress mean?”

The chatbot should explain that the candidate's admission status is still being processed and advise them to continue monitoring their JAMB CAPS and official NSUK updates rather than claiming that admission is guaranteed.

12. JAMB profile and result upload

The chatbot should tell candidates that O'Level results need to be properly supplied/uploaded to JAMB where required.

JAMB explicitly states that candidates awaiting results should upload their results once available, and that institutions' recommendations will not be considered by JAMB where the candidate has not uploaded the result on the Board's portal.

Therefore:

User: “I have WAEC awaiting result. What should I do?”

Chatbot:

If you registered with an awaiting result, upload the result to your JAMB profile as soon as it becomes available. Also follow NSUK's current instructions for O'Level verification.

13. Documents your chatbot should mention

The exact document list should be taken from the current NSUK admission notice/application portal, but the knowledge base should be prepared to handle:

UTME applicants
JAMB registration details/result
O'Level result
passport photograph
NSUK application/screening printout
relevant personal information
other documents specifically requested by NSUK
Direct Entry applicants

In addition to relevant O'Level documentation:

ND/NCE/HND/A'Level/IJMB/JUPEB or other applicable qualification
qualification details
institution attended
registration/matriculation information where applicable
certificate/result documentation

JAMB's current DE rules specifically require qualification and institution details during registration.

14. Programme/course changes

This is another area your chatbot should handle carefully.

During the 2025/2026 cycle, NSUK reportedly instructed candidates to make changes because of programme changes. For example, candidates affected by programme restructuring were directed toward other available programmes.

This demonstrates an important design principle:

The chatbot should not maintain a permanently fixed course list.

Instead, maintain:

Academic Session
        ↓
Available Programmes
        ↓
Programme Requirements
        ↓
UTME Subject Combination
        ↓
Minimum UTME Score
        ↓
Admission Status

That structure will make your NSUK chatbot much easier to maintain.

15. Questions your NSUK chatbot should be able to answer

I recommend creating at least these FAQ intents.

General
What is NSUK?
Where is NSUK located?
What courses does NSUK offer?
How do I apply to NSUK?
What is the official application portal?
Is NSUK currently accepting applications?
When will NSUK admission forms be available?
When does NSUK Post-UTME registration close?
UTME
What is the NSUK cut-off mark?
What is the cut-off mark for Law?
What is the cut-off for Computer Science?
What is the cut-off for Engineering?
What UTME subjects do I need?
Does NSUK accept second-choice candidates?
Can I change my institution to NSUK?
Can I combine two O'Level results?
Can I apply with awaiting result?
Direct Entry
Does NSUK accept Direct Entry?
What qualifications are accepted for DE?
Can an ND holder apply?
Can an NCE holder apply?
Can an HND holder apply?
Can IJMB candidates apply?
Can JUPEB candidates apply?
What level will I enter through DE?
What are the DE requirements for my course?
Application
How do I create an account?
How do I log in?
What documents do I need?
How do I verify my WAEC?
Why is WAEC verification not working?
How do I complete my application?
How do I print my application?
How do I correct an error?
Admission
How do I check my NSUK admission?
How do I check JAMB CAPS?
What does “Not Admitted” mean?
What does “Admission in Progress” mean?
What should I do after admission?
How do I accept admission?
What happens if I reject admission?
What happens after accepting admission?
Post-admission
What is the acceptance fee?
What are the school fees?
What documents are required for clearance?
How do I register as a new student?
When does school resume?
How do I get my matriculation number?

For fees and dates, your chatbot should retrieve session-specific information rather than relying on permanent answers.`;
