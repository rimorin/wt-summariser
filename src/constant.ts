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

const ANTHROPIC_SYS_INSTRUCTIONS_FOR_SUMMARY =
  "As a conductor preparing for a Watchtower study, your objective is to succinctly summarize the key points and themes of the study article.";
const ANTHROPIC_SYS_INSTRUCTIONS_FOR_ANSWER =
  "As a student preparing for a Watchtower study, your objective is to provide clear and accurate answers to questions based on the content of the study article.";
const ANTHROPIC_MAX_TOKENS = 4096;
const ANTHROPIC_MODEL = "claude-3-5-sonnet-20240620";

const WOL_MEETING_URL = "https://wol.jw.org/en/wol/meetings/r1/lp-e/";
const WOL_ROOT_URL = "https://wol.jw.org";
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
];

const TASK_COMMANDS = {
  WATCHTOWER_MAGAZINE: "watchtower",
  BIBLE_READING: "bible-reading",
  CONGREGATION_BIBLE_STUDY: "congregation-bible-study",
};
export {
  ANTHROPIC_QA_PROMPT,
  ANTHROPIC_SUMMARY_PROMPT,
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_MODEL,
  WOL_MEETING_URL,
  WOL_ROOT_URL,
  USER_AGENTS,
  ANTHROPIC_SYS_INSTRUCTIONS_FOR_SUMMARY,
  ANTHROPIC_SYS_INSTRUCTIONS_FOR_ANSWER,
  TASK_COMMANDS,
};
