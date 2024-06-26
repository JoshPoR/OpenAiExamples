# OpenAI Examples

This repository contains a suite of test scripts designed to evaluate the effectiveness of leveraging OpenAI's data.

## Setup

1. Copy `.env-template`
2. Rename to `.env`
3. Update the environment variables with your own
  1. `OPENAI_API_KEY`: Company provided OpenAI key. Must support `gpt-4o` model.

## Installation

Install the npm packages, run:
```
npm install
```

## Run Script

### Option 1 - VS Code Debugger
1. Open the Typescript file you would like to run.
2. Execute "Run TS File" debugger (Note, the `inquire` package cannot be prompted in this mode, so configure the `--example=` argument in `launch.json`)


### Option 2 - Run with debugger
1. `npx ts-node path-to-file/file.ts`

