import { TASK_COMMANDS } from "./src/constant";
import { processWatchTower } from "./src/processes/watchtower";
import redis from "./src/redis";

// Retrieve the command from environment variables
const command = process.env.COMMAND || TASK_COMMANDS.WATCHTOWER_MAGAZINE;

// Function to handle different commands
const runCommand = async (command: string | undefined) => {
  switch (command) {
    case TASK_COMMANDS.WATCHTOWER_MAGAZINE:
      await processWatchTower();
      break;
    case TASK_COMMANDS.BIBLE_READING:
      console.error("Bible reading not implemented.");
      break;
    case TASK_COMMANDS.CONGREGATION_BIBLE_STUDY:
      console.error("Congregation Bible Study not implemented.");
      break;
    default:
      console.error(`Unknown or undefined command: ${command}`);
  }
};

// Run the command and handle errors
runCommand(command)
  .catch((error) => {
    console.error(`Error processing command ${command}:`, error);
  })
  .finally(() => {
    redis.quit();
    console.info(`Finished processing command ${command}`);
  });
