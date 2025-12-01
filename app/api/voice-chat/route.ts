import { generateText } from "ai"
import { mockBloodUnits } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Create context about available blood units
    const bloodContext = mockBloodUnits
      .map(
        (unit) =>
          `${unit.bloodBank} in ${unit.city} has ${unit.quantity} units of ${unit.bloodType} blood. Phone: ${unit.phone}, Hours: ${unit.hours}`,
      )
      .join("\n")

    const systemPrompt = `You are a helpful AI assistant for a blood unit finder service. You help users find blood units in their area.

Available blood units:
${bloodContext}

When users ask about blood availability:
1. Search through the available blood units
2. Provide specific information about blood banks, blood types, quantities, and contact details
3. If they ask for a specific location or blood type, filter the results accordingly
4. Be helpful and provide actionable information
5. If information is not available, suggest they contact the blood banks directly

Keep responses concise and friendly.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
      maxTokens: 300,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error("Error in voice chat:", error)
    return Response.json({ error: "Failed to process your request" }, { status: 500 })
  }
}
