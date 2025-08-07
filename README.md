# GitInspect
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/devnetworking/GitInspect)

GitInspect is an intelligent web application that provides deep insights into GitHub repositories. By leveraging the power of the DeepSeek AI, it automatically generates concise technical summaries, visual architecture diagrams, and actionable recommendations to help developers quickly understand complex codebases.

## Features

*   **AI-Powered Analysis**: Utilizes AI to analyze repository metadata and structure.
*   **Visual Architecture Diagrams**: Generates interactive HTML/CSS diagrams to visualize the project's structure.
*   **Technical Summaries**: Provides concise, point-by-point summaries of a repository's purpose and technology.
*   **Actionable Recommendations**: Offers suggestions for improvement, such as adding documentation, tests, or optimizations.
*   **Real-time Data**: Fetches up-to-date repository information directly from the GitHub API.
*   **Secure by Design**: Implements essential security practices using Helmet, CORS, and rate limiting.

## How It Works

The application follows a simple yet powerful workflow:

1.  A user navigates to the inspection URL, providing a repository owner and name (e.g., `/inspect/expressjs/express`).
2.  The **GitHubService** fetches the specified repository's public metadata, including its primary language, description, and key statistics.
3.  The **AIService** constructs a detailed prompt with the repository information and sends it to the DeepSeek AI API.
4.  The AI analyzes the information and returns a structured response containing a technical summary, an HTML/CSS architecture diagram, and a list of recommendations.
5.  The **repoController** receives the formatted data from both services and renders it using a dynamic EJS template for the user to view.

## Technology Stack

*   **Backend**: Node.js, Express.js
*   **Templating Engine**: EJS (Embedded JavaScript)
*   **External APIs**: GitHub REST API, DeepSeek AI API
*   **API Clients**: Axios, node-fetch
*   **Security**: Helmet, Express Rate Limit, CORS

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   Node.js (v14 or later)
*   npm
*   A DeepSeek AI API Key

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/devnetworking/GitInspect.git
    cd GitInspect
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Open the `.env` file and add the following required variables:

    ```ini
    # The port your server will run on (e.g., 3000)
    PORT=3000

    # Your API key for the DeepSeek AI service
    DEEPSEEK_API_KEY="your_deepseek_api_key_here"

    # Comma-separated list of allowed origins for CORS (e.g., http://localhost:3000)
    ALLOWED_ORIGINS="http://localhost:3000"
    ```

4.  **Run the application:**
    ```sh
    node app.js
    ```
    The server will start on the port you defined (e.g., `http://localhost:3000`).

## Usage

Once the server is running, you can analyze a public GitHub repository by navigating to the following URL format in your browser:

```
http://localhost:3000/inspect/{owner}/{repo}
```

**Example:**

To analyze the Express.js repository, use the following URL:
`http://localhost:3000/inspect/expressjs/express`

## Project Structure

The repository is organized to separate concerns and improve maintainability:

```plaintext
/
├── app.js              # Main application entry point
├── package.json        # Project dependencies and scripts
├── .env.example        # Example environment variables file
├── LICENSE             # Project license
│
├── config/             # Configuration files (e.g., security settings)
├── controllers/        # Express route handlers that orchestrate service calls
├── middlewares/        # Custom middleware for security, error handling, etc.
├── services/           # Business logic for interacting with external APIs (GitHub, AI)
├── utils/              # Helper utilities like logging and validation
└── views/              # EJS templates for rendering HTML pages
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.