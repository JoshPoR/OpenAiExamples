import OpenAI from "openai";
import * as dotenv from 'dotenv';
dotenv.config();

const openAI = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function generateCostSuggestions(jobDetails: string): Promise<string> {
  const prompt = `Generate cost groups and costs for the following job details: ${jobDetails}`;
  
  try {
    const response: OpenAI.Completions.Completion = await openAI.completions.create({
      model: "gpt-3.5-turbo",
      prompt: prompt,
      max_tokens: 150,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    return 'okay';

    // if (response.data.choices && response.data.choices.length > 0) {
    //   return response.data.choices[0].text?.trim() || "No suggestions generated.";
    // } else {
    //   return "No suggestions generated.";
    // }
  } catch (error) {
    console.error("Error generating cost suggestions:", error);
    throw new Error("Failed to generate cost suggestions");
  }
}

// Example usage
const jobDetails = "Rental of heavy machinery for construction project in downtown area, expected duration 3 months, involves equipment such as excavators, bulldozers, and cranes.";

generateCostSuggestions(jobDetails).then(suggestions => {
  console.log(suggestions);
}).catch(error => {
  console.error(error);
});