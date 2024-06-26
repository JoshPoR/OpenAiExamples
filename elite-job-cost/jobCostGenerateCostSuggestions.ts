import OpenAI from "openai";
import * as dotenv from 'dotenv';
import { select } from '@inquirer/prompts';

dotenv.config();

const openAI = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

async function generateCostSuggestions(request: JobCostSuggestionRequest): Promise<string> {
  const prompt: string = JSON.stringify(request);

  const exampleResponse: JobCostSuggestionResponse = {
    groups: [
      {
        name: '',
        children: []
      }
    ]
  }
  
  try {
    const response: OpenAI.ChatCompletion = await openAI.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Output all responses in JSON. The response should follow the format like ${JSON.stringify(exampleResponse)}`
        },
        {
          role: "system",
          content: "You are designed to provide a collection of Cost Groups children Cost categories based on JobName, JobNotes, and existing Cost Groups and Cost. Come up with new ideas and occasionally use the information provided in the request to generate suggestions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_object"
      },
      n: 1,
      temperature: 0.3, // 0-2, lower the vale, the more deterministic the model
    }); 

    try {
      const suggestions = JSON.parse(response?.choices[0]?.message?.content ?? '{}');
      return suggestions;
    } catch (error) {
      throw new Error("Failed to parse response");
    }
  } catch (error) {
    console.error("Error generating cost suggestions:", error);
    throw new Error("Failed to generate cost suggestions");
  }
}

interface JobCostSuggestionRequest {
  company?: {
    /**
     * Brief description of the company and what type of services they provide
     */
    description: string;
  },
  job: {
    /**
     * Name of the job
     */
    name: string;
    /**
     * Additional notes about the job
     */
    notes: string;
  },
  /**
   * Collection of popular cost groups and their children cost categories
   */
  costGroups: {
    name: string;
    children: string[];
  }[]
}

interface JobCostSuggestionResponse {
  groups: {
    name: string,
    children: string[]
  }[]
}

/**
 * Example 1: Event Rental
 * Request with job name and notes but no existing cost groups or information about the company
 * 
 * Actual OpenAI Example Response:
 * ```
    {
      "groups": [
        {
          "name": "Venue and Setup",
          "children": [
            "Venue Rental",
            "Tent and Canopy Rental",
            "Seating and Tables",
            "Stage and Podium Setup",
            "Decorations"
          ]
        },
        {
          "name": "Audio and Visual",
          "children": [
            "Sound System Rental",
            "Microphones",
            "Projector and Screen",
            "Lighting"
          ]
        },
        {
          "name": "Catering",
          "children": [
            "Food and Beverages",
            "Catering Staff",
            "Utensils and Plates",
            "Beverage Station"
          ]
        },
        {
          "name": "Entertainment",
          "children": [
            "Live Band or DJ",
            "Guest Speaker Fees",
            "Interactive Activities"
          ]
        },
        {
          "name": "Miscellaneous",
          "children": [
            "Permits and Licenses",
            "Security",
            "Cleaning Services",
            "Insurance"
          ]
        }
      ]
    }
 * ```
 */
const example1: JobCostSuggestionRequest = {
  job: {
    name: 'Corporate Park Gathering',
    notes: "100 person outside gathering for a monthly town hall meeting"
  },
  costGroups: []
}

/**
 * Example 2: Heavy Equipment Rental
 * Request with job name, notes and information about the company. No information on existing cost groups
 * 
 * Actual OpenAI Example Response:
 * ```
  {
    "groups": [
      {
        "name": "Equipment Rental",
        "children": [
          {
            "name": "Bobcat Rental",
            "children": []
          },
          {
            "name": "Concrete Mixer Rental",
            "children": []
          }
        ]
      },
      {
        "name": "Delivery and Pickup",
        "children": [
          {
            "name": "Delivery Fee",
            "children": []
          },
          {
            "name": "Pickup Fee",
            "children": []
          }
        ]
      },
      {
        "name": "Labor",
        "children": [
          {
            "name": "Operator Wages",
            "children": []
          },
          {
            "name": "Overtime Charges",
            "children": []
          }
        ]
      },
      {
        "name": "Materials",
        "children": [
          {
            "name": "Fuel Costs",
            "children": []
          },
          {
            "name": "Concrete",
            "children": []
          }
        ]
      },
      {
        "name": "Permits and Fees",
        "children": [
          {
            "name": "City Permits",
            "children": []
          },
          {
            "name": "Inspection Fees",
            "children": []
          }
        ]
      }
    ]
  }
 * ```
 */
const example2: JobCostSuggestionRequest = {
  company: {
    description: "Heavy Rentals sells machinery like bobcats, excavators, and bulldozers"
  },
  job: {
    name: 'Multi-day Construction Project',
    notes: "Delivery of bobcat and concrete mixer for a 3 day construction project in downtown area."
  },
  costGroups: []
}

/**
 * Example 3: Heavy Equipment Rental
 * Request with job name, notes and existing cost groups.
 * The existing cost groups uses data from a customer example.
 * 
 * Actual OpenAI Example Response:
 * ```
  {
    "groups": [
      {
        "name": "Truck Delivery",
        "children": [
          "Truck 1",
          "Truck 2",
          "Bobcat Delivery",
          "Concrete Mixer Delivery"
        ]
      },
      {
        "name": "Delivery Labor",
        "children": [
          "DSR1",
          "DSR2",
          "Bobcat Operator",
          "Concrete Mixer Operator"
        ]
      },
      {
        "name": "Equipment Rental",
        "children": [
          "Bobcat Rental",
          "Concrete Mixer Rental"
        ]
      },
      {
        "name": "Site Preparation",
        "children": [
          "Site Inspection",
          "Site Clearing",
          "Safety Setup"
        ]
      },
      {
        "name": "Materials",
        "children": [
          "Concrete",
          "Rebar",
          "Gravel"
        ]
      }
    ]
  }
 * ```
 */
const example3: JobCostSuggestionRequest = {
  job: {
    name: 'Multi-day Construction Project',
    notes: "Delivery of bobcat and concrete mixer for a 3 day construction project in downtown area."
  },
  costGroups: [
    {
      name: 'Truck Delivery',
      children: [ 'Truck 1', 'Truck 2' ]
    },
    {
      name: 'Delivery Labor',
      children: [ 'DSR1', 'DSR2' ]
    }
  ]
}

// -----------------------------------
// -----------------------------------
// -----------------------------------
// -----------------------------------

const exampleToRequest: Record<string, JobCostSuggestionRequest> = {
  'E1: Job Name and Notes': example1,
  'E2: Job Name, Notes, and Company Description': example2,
  'E3: Job Name, Notes, and Existing Cost Groups': example3
}

async function main(): Promise<void> {
  const isOpenAIValid = openAI.apiKey !== undefined && openAI.apiKey !== '';
  if(!isOpenAIValid) {
    throw new Error("OpenAI API Key is not set");
  }

  let selectedExample: JobCostSuggestionRequest | undefined

  const exampleArg = process.argv.find(arg => arg.startsWith('--example='));
  if(exampleArg !== undefined) {
    const exampleNumber = +exampleArg.split('=')[1];
    selectedExample = Object.entries(exampleToRequest)?.find(([key, value], index) => (index + 1) === exampleNumber)?.[1];
  } else {
    selectedExample = await select({
      message: 'Select Job Cost suggestion example',
      choices: Object.entries(exampleToRequest).map(([key, value]) => ({
        name: key,
        value: value
      }))
    });
  }

  if(selectedExample === undefined) {
    throw new Error("No example selected");
  }

  try {
    const suggestions = await generateCostSuggestions(selectedExample);
    console.log(JSON.stringify(suggestions));
  } catch (error) {
    console.error(error);
  }
}

main();

