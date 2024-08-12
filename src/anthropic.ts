import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;
