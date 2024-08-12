# Use the official Node.js image for the specified platform.
FROM --platform=linux/amd64 node:20 

# Install latest Chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai, and a few others).
# Note: This installs the necessary libraries to make the bundled version of Chromium that Puppeteer installs work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory to /usr/src/app.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Build the TypeScript code.
RUN npm run build

# Run the program on container startup.
CMD [ "node", "dist/index.js" ]