import exp = require("constants");

type QuestionDetails = {
  pnumbers: string;
  question: string;
  paragraph: Array<ParagraphData>;
  scripture: Array<ParagraphScriptureData>;
  footnote: Array<ParagraphFootnoteData>;
  additionalInfo: Array<ParagraphData>;
  image: string;
  imageCaption: string;
  answer?: string;
};

type ParagraphData = {
  pnumber: number;
  content: string;
};

type ParagraphScriptureData = {
  pnumber: number;
  content: { scripture: string; content: string }[];
};

type ParagraphFootnoteData = {
  pnumber: number;
  content: { footnote: string; content: string }[];
};

export {
  QuestionDetails,
  ParagraphData,
  ParagraphScriptureData,
  ParagraphFootnoteData,
};
