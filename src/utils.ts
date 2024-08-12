import {
  ImageBlockParam,
  TextBlock,
  TextBlockParam,
} from "@anthropic-ai/sdk/resources";
import anthropic from "./anthropic";
import {
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_MODEL,
  ANTHROPIC_QA_PROMPT,
  ANTHROPIC_SUMMARY_PROMPT,
  ANTHROPIC_SYS_INSTRUCTIONS_FOR_ANSWER,
  ANTHROPIC_SYS_INSTRUCTIONS_FOR_SUMMARY,
  USER_AGENTS,
} from "./constant";
import redis from "./redis";

export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
};

export function getRandomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

export const generateContent = async (
  content: string | Array<TextBlockParam | ImageBlockParam>,
  type: "summary" | "answer",
): Promise<string | null> => {
  const instructions =
    type === "summary"
      ? ANTHROPIC_SYS_INSTRUCTIONS_FOR_SUMMARY
      : ANTHROPIC_SYS_INSTRUCTIONS_FOR_ANSWER;

  try {
    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      system: instructions,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    });

    // Assuming the response structure has a 'content' property
    if (message?.content?.length > 0) {
      const textBlock = message.content[0] as TextBlock;
      return textBlock.text;
    }
  } catch (error) {
    console.error("Error generating content:", error);
  }

  return null;
};

export const getCurrentWeekOfTheYear = () => {
  const today = new Date();
  const year = today.getFullYear();

  // Create a date object for January 1st of the current year
  const firstDayOfYear = new Date(year, 0, 1);

  // Calculate the day of the week for January 1st (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = firstDayOfYear.getDay();

  // Adjust the day of the week so that Monday is considered the first day of the week
  const adjustedDayOfWeek = (dayOfWeek + 6) % 7;

  // Calculate the number of days that have passed since January 1st
  const pastDaysOfYear =
    (today.valueOf() - firstDayOfYear.valueOf()) / 86400000;

  // Calculate the ISO week number
  const weekNumber = Math.ceil((pastDaysOfYear + adjustedDayOfWeek + 1) / 7);

  // Adjust the week number if the first week of the year does not start on Monday
  const isoWeekNumber = weekNumber - (adjustedDayOfWeek > 3 ? 1 : 0);

  return { year, week: isoWeekNumber };
};
/**
 * Retrieves the cached response from Redis if available.
 *
 * @param {string} cacheKey - The key to look up in Redis.
 * @returns {Promise<any | null>} The parsed cached response or null if not found.
 */
export const getCachedResponse = async (
  cacheKey: string,
): Promise<any | null> => {
  try {
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      console.log("Retrieved cached response for key:", cacheKey);
      return JSON.parse(decodeURIComponent(cachedResponse));
    }
  } catch (error) {
    console.error("Error retrieving cached response:", error);
  }
  return null;
};

/**
 * Sets the response in Redis cache.
 *
 * @param {string} cacheKey - The key to store in Redis.
 * @param {any} data - The data to be cached.
 * @returns {Promise<void>}
 */
export const setCachedResponse = async (
  cacheKey: string,
  data: any,
): Promise<void> => {
  if (!data) {
    return;
  }
  try {
    const encodedData = encodeURIComponent(JSON.stringify(data));
    await redis.set(cacheKey, encodedData);
    console.log("Set cache for key:", cacheKey);
  } catch (error) {
    console.error(`Failed to set cache for key ${cacheKey}:`, error);
  }
};
