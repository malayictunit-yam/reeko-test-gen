import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  subject: z.string().min(1).max(80),
  gradeLevel: z.string().min(1).max(40),
  pointers: z.string().min(5).max(4000),
  count: z.number().int().min(3).max(25),
  language: z.enum(["en", "tl", "mix"]),
});

const questionSchema = z.object({
  stem: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.number().int().min(0).max(3),
  explanation: z.string().default(""),
});

const payloadSchema = z.object({
  title: z.string(),
  questions: z.array(questionSchema).min(1),
});

const LANG_RULE: Record<string, string> = {
  en: "Write everything in clear, simple English suitable for grade school pupils.",
  tl: "Isulat ang lahat sa malinaw at simpleng Filipino/Tagalog na angkop sa mga batang mag-aaral.",
  mix: "Write in natural conversational Taglish (mixed English and Tagalog) the way Filipino grade school teachers speak in class.",
};

export const generateTest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured yet.");

    const prompt = `You are an experienced Filipino grade school teacher writing a sample test.

Subject: ${data.subject}
Grade level: ${data.gradeLevel}
Lesson pointers from the teacher:
"""
${data.pointers}
"""

Write exactly ${data.count} multiple-choice questions. Rules:
- Each question has exactly 4 options and one correct answer.
- ${LANG_RULE[data.language]}
- Age-appropriate vocabulary and sentence length for ${data.gradeLevel}.
- Cover the pointers evenly; no duplicate questions; no trick questions.
- Vary which option letter is correct.
- Add a one-sentence explanation for the correct answer.
- Also give a short test title (max 6 words).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "return_test",
              description: "Return the generated sample test",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        stem: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 4,
                          maxItems: 4,
                        },
                        answer: { type: "integer", description: "0-3 index of correct option" },
                        explanation: { type: "string" },
                      },
                      required: ["stem", "options", "answer", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_test" } },
      }),
    });

    if (res.status === 429) throw new Error("Too many requests right now. Please try again in a minute.");
    if (res.status === 402) throw new Error("AI credits are used up. Please top up to keep generating.");
    if (!res.ok) throw new Error("The test generator had trouble. Please try again.");

    const json = (await res.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("The test generator returned nothing. Please try again.");

    const parsed = payloadSchema.parse(JSON.parse(args));
    return {
      title: parsed.title,
      questions: parsed.questions.slice(0, data.count).map((q) => ({
        stem: q.stem,
        options: q.options as [string, string, string, string],
        answer: q.answer as 0 | 1 | 2 | 3,
        explanation: q.explanation ?? "",
      })),
    };
  });
