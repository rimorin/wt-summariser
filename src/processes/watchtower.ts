import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import {
  ANTHROPIC_QA_PROMPT,
  ANTHROPIC_SUMMARY_PROMPT,
  WOL_MEETING_URL,
  WOL_ROOT_URL,
} from "../constant";
import { TextBlockParam, ImageBlockParam } from "@anthropic-ai/sdk/resources";
import {
  QuestionDetails,
  ParagraphData,
  ParagraphScriptureData,
  ParagraphFootnoteData,
} from "../types";
import {
  fetchImageAsBase64,
  generateContent,
  getCurrentWeekOfTheYear,
  getRandomUserAgent,
  setCachedResponse,
} from "../utils";

export const processWatchTower = async () => {
  try {
    const { year, week } = getCurrentWeekOfTheYear();

    let processedData: {
      questionList: QuestionDetails[];
      articleUrl: string;
      title: string;
      theme: string;
      focus: string;
    };

    const articleUrl = await fetchMeetingWeekData(year, week);
    const $ = await fetchArticleData(articleUrl);
    const { title, theme, focus } = extractArticleDetails($);
    const questionList = await extractQuestionsAndAnswers($);
    processedData = { questionList, articleUrl, title, theme, focus };

    const initialHeader = `Title: ${processedData.title}\nTheme: ${processedData.theme}\nFocus: ${processedData.focus}`;
    const questionPromises = processedData.questionList.map(
      async (question) => {
        const questionContent = buildQuestionContent(question);
        const answer = await getAnswer(
          `${initialHeader}\n\n${questionContent}`,
          question.image,
          question.imageCaption,
        );
        question.answer = answer;
        return question;
      },
    );

    processedData.questionList = await Promise.all(questionPromises);

    const summaryContent = processedData.questionList
      .map((question) => {
        const questionContent = buildQuestionContent(question, true);
        return questionContent;
      })
      .join("\n\n");

    const result = {
      url: processedData.articleUrl,
      title: processedData.title,
      theme: processedData.theme,
      focus: processedData.focus,
      data: {
        summary: await getSummary(`${initialHeader}\n\n${summaryContent}`),
        answers: processedData.questionList,
      },
    };
    const cacheKey = `content-${year}-${week}`;
    await setCachedResponse(cacheKey, result);
  } catch (error) {
    console.error("Error processing Watchtower data:", error);
  }
};

/**
 * Fetches the meeting week data from the specified year and week.
 * @param year - The year of the meeting week.
 * @param week - The week number of the meeting week.
 * @returns The URL of the meeting week data.
 */
async function fetchMeetingWeekData(year: number, week: number) {
  const meetingWeekUrl = `${WOL_MEETING_URL}${year}/${week}`;
  const meetingWeekData = await (await fetch(meetingWeekUrl)).text();
  const mtData = cheerio.load(meetingWeekData);
  const div = mtData("div[class*='pub-w'][class*='docId-']").first();
  const href = div.find("a.it").attr("href");
  return `${WOL_ROOT_URL}${href}`;
}

/**
 * Fetches article data from the specified URL.
 * @param url - The URL of the article to fetch.
 * @returns A Cheerio object representing the parsed HTML of the article.
 */
export const fetchArticleData = async (
  url: string,
): Promise<cheerio.CheerioAPI> => {
  const response = await fetch(url);
  const data = await response.text();
  const $ = cheerio.load(data);
  $("div.gen-field").remove();
  $("span.parNum").remove();
  return $;
};

/**
 * Extracts article details from a CheerioAPI object.
 *
 * @param $ - The CheerioAPI object representing the HTML document.
 * @returns An object containing the extracted article details: title, theme, and focus.
 */
export const extractArticleDetails = (
  $: cheerio.CheerioAPI,
): { title: string; theme: string; focus: string } => {
  const title = $("h1").text().trim();
  const theme = $("p.themeScrp").text().trim();
  const focus = $("div.du-borderStyle-inlineStart--solid")
    .text()
    .replace("FOCUS", "")
    .trim();
  return { title, theme, focus };
};

/**
 * Extracts questions and corresponding paragraphs from a CheerioAPI object.
 *
 * @param $ - The CheerioAPI object.
 * @returns A string containing the extracted questions and paragraphs.
 */
const extractQuestionsAndAnswers = async (
  $: cheerio.CheerioAPI,
): Promise<QuestionDetails[]> => {
  const questions = $("p.qu[data-pid]");
  let paragraphNumber = 1;
  let imageIndex = 1;
  let questionList = Array<QuestionDetails>();

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
    ],
  });

  try {
    const page = await browser.newPage();
    page.setUserAgent(getRandomUserAgent());
    page.setDefaultNavigationTimeout(60000); // 60 seconds
    page.setDefaultTimeout(30000); // 30 seconds

    for (const question of questions.toArray()) {
      const data = {
        pnumbers: "",
        paragraph: Array<ParagraphData>(),
        scripture: Array<ParagraphScriptureData>(),
        footnote: Array<ParagraphFootnoteData>(),
        question: "",
        image: "",
        imageCaption: "",
        additionalInfo: Array<ParagraphData>(),
        subheading: "",
      };
      let paragraphInput = Array<ParagraphData>();
      let paragraphScriptureRefs = Array<ParagraphScriptureData>();
      let paragraphFootnoteRefs = Array<ParagraphFootnoteData>();
      let paragraphQuestions = "";
      let paragraphAdditionalInfo = Array<ParagraphData>();
      const paragraphNumbers: string[] = [];
      const questionElement = $(question);
      // Check if the is a <h2> before this question element.
      const previousElement = questionElement.prev();
      // log text if it is a <h2> element
      if (previousElement.is("h2")) {
        data.subheading = previousElement.text().trim();
      }
      questionElement.find("strong").remove();

      const questionText = questionElement.text().trim();
      const questionPid = questionElement.attr("data-pid");
      const paragraphs = $(`p[data-rel-pid='[${questionPid}]']`);

      // Look for text, (See also picture.) or (See also pictures.). If found, extract the picture from div with id f{imageIndex}
      const pictureIndex = questionText.search(
        /\(See also picture\.?\)|\(See also pictures\.?\)/,
      );
      if (pictureIndex !== -1) {
        const pictureDiv = $(`div#f${imageIndex}`);
        const pictureUrl = pictureDiv.find("img").attr("src");
        data.image = `${WOL_ROOT_URL}${pictureUrl}`;
        imageIndex++;

        // get <figcaption> text
        const pictureCaption = pictureDiv.find("figcaption").text().trim();
        data.imageCaption = pictureCaption;
      }

      // in a question, there maybe <a> tags with class="it" that contains additional information
      // get the href and use puppeteer to extract the content

      const additionalInfo = questionElement.find("a.it");
      if (additionalInfo.length) {
        for (const info of additionalInfo.toArray()) {
          const infoUrl = $(info).attr("href");
          if (infoUrl) {
            try {
              await page.goto(WOL_ROOT_URL + infoUrl);
              const infoData = await page.content();
              const info$ = cheerio.load(infoData);
              const informationElement = info$(
                "p.jwac-textHighlight, span.jwac-textHighlight, div.jwac-textHighlight",
              );
              let additionalInfoText = "";
              if (informationElement.length) {
                for (const info of informationElement.toArray()) {
                  additionalInfoText += $(info).text().trim() + "\n";
                }
              }
              paragraphAdditionalInfo.push({
                pnumber: paragraphNumber,
                content: additionalInfoText,
              });
            } catch (error) {
              console.error(
                `Error fetching additional info from ${infoUrl}:`,
                error,
              );
            }
          }
        }
      }

      if (paragraphs.length) {
        for (const paragraph of paragraphs.toArray()) {
          const paragraphElement = $(paragraph);
          const paragraphText = paragraphElement.text().trim();
          let paragraphScriptureReferences: {
            scripture: string;
            content: string;
          }[] = [];
          let paragraphFootnoteReferences: {
            footnote: string;
            content: string;
          }[] = [];

          // Look out for <a> tags that has data-bid attribute
          // These are scripture references that need to be extracted
          const scriptureReferences = paragraphElement.find("a[data-bid]");
          // get the href attribute of the <a> tag
          if (scriptureReferences.length) {
            for (const scriptureReference of scriptureReferences.toArray()) {
              const scriptureUrl = $(scriptureReference).attr("href");
              const scriptureText = $(scriptureReference).text().trim();
              if (scriptureUrl) {
                try {
                  await page.goto(WOL_ROOT_URL + scriptureUrl);
                  const scriptureData = await page.content();
                  const scripture$ = cheerio.load(scriptureData);
                  // find p or span with class="jwac-textHighlight"
                  const verseElement = scripture$(
                    "p.jwac-textHighlight, span.jwac-textHighlight",
                  );
                  if (verseElement.length) {
                    // remove class with vl or cl
                    verseElement.find("a.vl, a.cl").remove();
                    const verseText = verseElement.text().trim();

                    // include scripture text in the paragraph text. Add quotes to the scripture text
                    paragraphScriptureReferences.push({
                      scripture: scriptureText,
                      content: verseText,
                    });
                  }
                } catch (error) {
                  console.error(
                    `Error fetching scripture from ${scriptureUrl}:`,
                    error,
                  );
                }
              }
            }
          }

          // sometimes paragraphs have footnote references. This can be found by looking for <a> with data-fnid attribute
          // If there is a footnote, retrieve the corresponding footnote text that can be found using <div> with data-fnid attribute
          // and class fn-ref
          const footnoteReferences = $(paragraph).find("a[data-fnid]");
          if (footnoteReferences.length) {
            for (const footnoteReference of footnoteReferences.toArray()) {
              const footnoteId = $(footnoteReference).attr("data-fnid");
              // find the div and first <a> tag with class fn-symbol and remove it
              const footnoteText = $(`div.fn-ref[data-fnid='${footnoteId}']`)
                .find("a.fn-symbol")
                .remove()
                .end()
                .text();

              paragraphFootnoteReferences.push({
                footnote: footnoteId as string,
                content: footnoteText,
              });
            }
          }
          paragraphInput.push({
            pnumber: paragraphNumber,
            content: paragraphText,
          });
          if (
            paragraphScriptureReferences &&
            paragraphScriptureReferences.length
          ) {
            paragraphScriptureRefs.push({
              pnumber: paragraphNumber,
              content: paragraphScriptureReferences,
            });
          }

          if (
            paragraphFootnoteReferences &&
            paragraphFootnoteReferences.length
          ) {
            paragraphFootnoteRefs.push({
              pnumber: paragraphNumber,
              content: paragraphFootnoteReferences,
            });
          }
          paragraphNumbers.push(paragraphNumber.toString());
          paragraphNumber++;
        }

        paragraphQuestions = questionText;
      }
      data.pnumbers = paragraphNumbers.join(", ");
      data.paragraph = paragraphInput;
      data.scripture = paragraphScriptureRefs;
      data.footnote = paragraphFootnoteRefs;
      data.question = paragraphQuestions;
      data.additionalInfo = paragraphAdditionalInfo;
      questionList.push(data);
    }
  } finally {
    await browser.close();
  }
  return questionList;
};

/**
 * Builds the question content based on the provided question details.
 *
 * @param question - The question details.
 * @param isSummary - Indicates whether the content is for a summary.
 * @returns The built question content.
 */
const buildQuestionContent = (
  question: QuestionDetails,
  isSummary = false,
): string => {
  const contentParts: string[] = [];

  const paragraphContent = question.paragraph
    .map((p) => {
      return `Paragraph [${p.pnumber}] Content: ${p.content}`;
    })
    .join("\n\n");
  if (paragraphContent) {
    contentParts.push(paragraphContent);
  }

  const scriptureContent = question.scripture
    .map((s) => {
      const scriptureReferences = s.content.map((c) => {
        return `${c.scripture} - ${c.content}`;
      });
      return `Paragraph [${s.pnumber}] Scripture References: ${scriptureReferences.join(
        ", ",
      )}`;
    })
    .join("\n\n");
  if (scriptureContent) {
    contentParts.push(scriptureContent);
  }

  const additionalInfoContent = question.additionalInfo
    .map((a) => {
      return `Paragraph [${a.pnumber}] Additional Information: ${a.content}`;
    })
    .join("\n\n");

  if (additionalInfoContent) {
    contentParts.push(additionalInfoContent);
  }

  const imageCaption = question.imageCaption;
  if (imageCaption) {
    contentParts.push(
      `Paragraph [${question.pnumbers}] Image Caption: ${imageCaption}`,
    );
  }

  if (!isSummary) {
    const footnoteContent = question.footnote
      .map((f) => {
        return `Paragraph [${f.pnumber}] Footnote References: ${f.content}`;
      })
      .join("\n\n");
    if (footnoteContent) {
      contentParts.push(footnoteContent);
    }

    const questionContent = `Paragraph [${question.pnumbers}] Question: ${question.question}`;
    if (questionContent) {
      contentParts.push(questionContent);
    }
  }

  return contentParts.join("\n\n");
};

/**
 * Retrieves an answer from the Anthropic model based on the provided input.
 *
 * @param input - The input string representing the question or prompt.
 * @param imageUrl - Optional. The URL of an image to include in the prompt.
 * @param imageCaption - Optional. The caption for the image.
 * @returns A Promise that resolves to a string representing the answer, or undefined if an error occurs.
 */
const getAnswer = async (
  input: string,
  imageUrl?: string,
  imageCaption?: string,
): Promise<string | undefined> => {
  let answer = "No answer.";
  try {
    const contentList = [
      {
        type: "text",
        text: `${input}\n\n${ANTHROPIC_QA_PROMPT}`,
      },
    ] as Array<TextBlockParam | ImageBlockParam>;

    if (imageUrl && imageCaption) {
      const base64Image = await fetchImageAsBase64(imageUrl);
      const imagePrompt = {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64Image,
        },
      };
      contentList.unshift({
        type: "text",
        text: `Image Caption: ${imageCaption}`,
      } as TextBlockParam);

      contentList.unshift(imagePrompt as ImageBlockParam);
    }
    answer = (await generateContent(contentList, "answer")) || "No answer.";
    return answer;
  } catch (error) {
    console.error("Error calling Anthropic:", error);
  } finally {
    console.log(`Input: ${input}\nAnswer: ${answer}`);
  }
  return undefined;
};

/**
 * Retrieves a summary from the given input using the Anthropic API.
 *
 * @param input - The input text to be summarized.
 * @returns A promise that resolves to the summary string, or undefined if an error occurs.
 */
const getSummary = async (input: string): Promise<string | undefined> => {
  let summary = "No summary.";
  try {
    summary =
      (await generateContent(
        `${input}\n\n${ANTHROPIC_SUMMARY_PROMPT}`,
        "summary",
      )) ||
      undefined ||
      "No summary.";

    return summary;
  } catch (error) {
    console.error("Error calling Anthropic:", error);
  } finally {
    console.log(`Input: ${input}\nSummary: ${summary}`);
  }
  return undefined;
};
