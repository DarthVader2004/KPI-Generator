import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai";
import { z } from "zod"

// Initialize the Google Generative AI client
const ai = new GoogleGenAI({});

const KPISchema = z.object({
  kpis: z.array(
    z.object({
      name: z.string().describe("Name of the KPI"),
      description: z.string().describe("Brief description of what this KPI measures"),
      tier: z.enum(["Strategic", "Tactical", "Operational", "Analytical"]).describe("KPI tier level"),
      sql: z.string().describe("SQL query to calculate this KPI"),
      pandas: z.string().describe("Pandas code to calculate this KPI"),
      dax: z.string().describe("DAX query for Power BI to calculate this KPI"),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const { domain, columns, tier } = await request.json()

     

    const tierFilter = tier === "all" ? "all tiers (Strategic, Tactical, Operational, and Analytical)" : `${tier} tier`

    const prompt = `You are a KPI expert analyst. Based on the provided dataset information, suggest the most relevant KPIs for ${tierFilter}.

Dataset Domain: ${domain}
Available Columns: ${columns}

KPI Tier Definitions:
- Strategic: Long-term company goals and vision (CEO/C-suite level)
- Tactical: Department-level performance metrics (Manager level) 
- Operational: Day-to-day tasks and individual contributions (Team/Individual level)
- Analytical: Deep data analysis to identify trends and provide insights for strategic decision-making

Requirements:
1. Generate 4-8 highly relevant KPIs based on the domain and available columns
2. Focus on ${tierFilter}
3. Ensure each KPI can be calculated using the provided columns
4. Provide practical SQL, Pandas, and DAX implementations
5. Make sure the queries are realistic and use actual column names provided
6. Consider the business context and industry best practices

For each KPI, provide:
- Clear name and description
- Appropriate tier classification
- SQL query using the actual column names
- Pandas code using DataFrame operations
- DAX query for Power BI

Make the queries practical and executable with the given column structure.

You must return a single JSON object that strictly adheres to the following JSON schema:
${JSON.stringify(KPISchema.shape, null, 2)}
`
     const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    console.log(result.text);




    // Extract JSON from the raw text response
    //@ts-ignore
    const jsonString = result.text.substring(result.text.indexOf("{"), result.text.lastIndexOf("}") + 1)
    
    // Parse the JSON and validate it against the Zod schema
    const parsedData = KPISchema.parse(JSON.parse(jsonString))

    
    
    return NextResponse.json(parsedData)

  } catch (error) {
    console.error("Error generating KPIs:", error)
    return NextResponse.json({ error: "Failed to generate KPIs" }, { status: 500 })
  }
}