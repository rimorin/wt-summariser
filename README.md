# Watchtower Summarizer Backend

## Important Note

This program is not intended to replace personal study and meditation. While AI can assist in summarizing and answering questions based on the material, it cannot replicate the personal insights and spiritual growth that come from deep, thoughtful study and reflection. This tool is designed to be a supplementary aid, particularly for conductors of Watchtower study programs who may have limited time to prepare for their parts. It is essential to use this tool responsibly and in conjunction with personal study to ensure a balanced and comprehensive understanding of the material.

## Overview

The Watchtower Summarizer is a Node.js program designed to streamline the preparation process for conductors of Watchtower study programs. This program retrieves information from the Watchtower Online Library (WOL) and summarizes it, making it easier for study conductors to prepare for their parts. Currently, the program is designed to summarize only Watchtower articles.

The program leverages the Anthropic Sonnet model to generate summaries and answer questions related to the articles. This advanced AI model ensures that the summaries are concise and relevant, and the answers are accurate and insightful. By using the Anthropic Sonnet model, the program provides high-quality assistance in understanding and preparing the material, making the preparation process more efficient and effective.

## Why It Matters

AI has made significant advancements in recent years, enabling it to perform complex tasks such as summarization and question-answering for Watchtower articles. However, AI models are not infallible and can sometimes produce inaccurate or irrelevant results. This is often due to a lack of context or additional information that the model may not have access to. Crucial elements such as cited scriptures, images, footnotes, and additional information are essential for generating accurate summaries and answers. Furthermore, If not instructed properly, an AI model can include information from outside sources that may not align with the intended spiritual context.

The WT Summarizer addresses this challenge by using advanced web scraping techniques to extract all relevant information from the articles. This comprehensive data extraction ensures that the AI model has access to the full context, enabling it to generate more accurate and relevant summaries and answers. By incorporating this additional information, the WT Summarizer significantly enhances the quality of the generated content, making the preparation process for Watchtower study conductors more effective and efficient.

Conducting the magazine study often requires a deep examination of each scripture in the article and understanding how it relates to the questions and theme of the article. An article can contain many scriptures, and analyzing all of them to see how they connect to the theme can take hours or even days. The WT Summarizer aims to simplify this process by providing summaries of the scriptures and answers to the questions in the article, allowing conductors to focus on the most important points and prepare more effectively.

## How It Works

1. **Retrieve Current Week's Article**: The WT Summarizer retrieves the current week's Watchtower article from the WOL.
2. **Extract Key Elements**: The program processes the article to extract the title, theme, focus, paragraphs, images, footnote references, scripture references, and questions.
3. **Generate Summaries and Answers**: Using the Anthropic Sonnet model, the program generates concise summaries of the article and provides accurate answers to the questions.
4. **Store in Redis**: The summaries and answers are stored in Redis for quick retrieval.

## Prompt Design

The AI model requires specific prompts to generate accurate summaries and answers. These prompts provide detailed instructions on how to structure the input data and guide the model in generating the desired output.

Here are the prompts used for the Anthropic Sonnet model:

Question & Answer prompt

```javascript
const ANTHROPIC_QA_PROMPT = `
You will be provided with paragraphs from a study article, each followed by scripture references, footnote references, and a question. Answer EVERY SINGLE QUESTION without exception.

The format of the input will be:
Paragraph [x] Content: (Paragraph text)
Paragraph [x] Scripture References: [Scripture text]
Paragraph [x] Footnote References: [Footnote text]
Paragraph [x] Question: (Question text)
Paragraph [x] Additional Information: (Additional information text)

For each question, provide an answer in this format:
(Your answer)

Rules:
1. Answer ALL questions in the order they are presented.
2. Base your answer on the content of the corresponding paragraph, ALL scripture references, footnote references, and additional information if provided.
3. ALWAYS use ALL provided scriptural references to support your answer. Quote each scripture verbatim and explain in detail how it relates to the answer.
4. Ensure your explanations are thorough yet concise, directly addressing the question.
5. Do not skip any questions, scripture references, or additional information.
6. Start directly with the answer without any preamble or acknowledgment of instructions.
7. When quoting scripture, use quotation marks and cite the book, chapter, and verse.
8. After quoting each scripture, provide a thorough explanation of how the scripture supports or illustrates the answer, drawing clear connections between the text and the question.
9. Address each provided scripture separately in your explanation, ensuring none are omitted.
10. When explaining the scriptures, use "This scripture encourages us" or similar inclusive language instead of "This scripture encourages believers."
11. If there are footnote references, incorporate their content into your answer where relevant.
12. If the question comes with "(See also picture.)" or "(See also pictures.)", follow these steps:
    a. Describe the picture(s) in detail, including their main elements, setting, and any actions or emotions portrayed.
    b. Explain how the picture(s) relate to the question and support your answer.
    c. Draw connections between specific elements of the picture(s) and the scriptures or paragraph content.
    d. If the picture(s) illustrate a principle or concept, explain how they do so visually.
    e. Integrate the picture explanation seamlessly into your overall answer, using it to reinforce your main points.
13. If multiple scriptures or footnotes seem to address different aspects of the question, synthesize the information to provide a comprehensive answer.
14. Ensure that your answer demonstrates how all provided scriptures work together to address the question, even if they seem to cover different points.
15. If scriptures appear contradictory, explain how they can be reconciled or how they provide different perspectives on the same issue.
16. If additional information is provided, incorporate it into your answer where relevant, ensuring it supports and enhances your response.
`;
```

Summarization prompt

```javascript
const ANTHROPIC_SUMMARY_PROMPT = `
  Please summarize the content of the study article. 
  Your summary should be detailed yet simple. Follow these guidelines:

  1. Capture the main points and key details.
  2. Align with the article's theme and focus.
  3. Highlight significant arguments or conclusions.
  4. Identify the article's purpose and target audience.
  5. Mention notable sources or evidence.
  6. Avoid personal opinions or interpretations.
  7. Use clear and accessible language.
  8. Organize information logically with paragraph breaks for readability.
  9. Quote and use scriptural references where relevant.
  10. Conclude with a summary of the article's overall message and its implications for the reader.
  
  Start with a brief sentence that encapsulates the study article's theme and focus. Ensure each point is explained clearly and concisely.`;
```

## Frontend Integration

A frontend application can be built to interact with the Redis database and display the summaries and answers to the user. This frontend application can be used by study conductors to prepare for their parts and gain a deeper understanding of the article content.

## Pre-requisites

- Node.js v20.0.0 or higher
- npm v10.0.0 or higher
- Redis v7.0.0 or higher
- Anthropic API key

## Usage

1. Clone the repository from GitHub:

```bash
git clone
```

2. Install the dependencies:

```bash
npm install
```

3. Set up the environment variables:

Create a `.env` file in the root directory of the project and add the following environment variables:

```bash
ANTHROPIC_API_KEY=your_api_key
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
COMMAND=your_command
```

The COMMAND environment variable is crucial as it determines which process the program will run. Depending on the value set for COMMAND, the program can perform different tasks such as Watchtower summarization, bible reading plan generation, or other custom tasks. This is defaulted to `watchtower` if not set.

4. Start the program:

```bash
npm start
```

## Deployment

The summarizer is a one-time process that can be run manually or scheduled to run at specific intervals. You can deploy the program on a server or cloud platform to automate the summarization process. Since it summarizes the current week's Watchtower article, it is recommended to run the task at the beginning of each week to ensure that the summaries are up to date.

## Process Flow

1. The program first checks Redis to see if there is existing information for the current week article.
2. If the article information is not found in Redis, the program retrieves the article from the Watchtower Online Library (WOL).
3. The article is processed to extract key elements such as the theme, focus, paragraphs, images, footnotes, and questions.
4. The extracted information is stored in Redis for efficient access.
5. The Anthropic Sonnet model is utilized to generate concise summaries of the article and provide answers to the questions. Summaries and answers are generated based on the paragraphs, scripture references, footnote references, images, and questions.
6. The generated summaries and answers are stored as a JSON object in Redis for quick retrieval.

## Output

Check sample_summaries.json for a sample output of the summaries and answers generated by the program.

## Technologies Used

- **Node.js**: The runtime environment used to build and run the backend program.
- **Redis**: An in-memory data structure store used for caching article information to improve performance and reduce redundant data fetching.
- **Anthropic Sonnet Model**: An advanced AI model used to generate concise summaries and provide accurate answers to questions related to the articles.
- **Cheerio**: A fast, flexible, and lean implementation of core jQuery designed specifically for the server, used for parsing static WOL content.
- **Puppeteer**: A Node library that provides a high-level API to control headless Chrome or Chromium, used for retrieving dynamic WOL content.
- **Docker**: A platform used to containerize the program for easy deployment.
