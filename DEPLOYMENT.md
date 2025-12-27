# Deployment Guide

## 1. Running Locally (Development)
To run the app on your machine for testing or development:

1.  Double-click **`run_local.bat`**.
2.  Open [http://localhost:3000](http://localhost:3000).

*Note: This uses "Development Mode" which supports all features including file parsing.*

## 2. Deploying (Production)

### Option A: Vercel (Recommended)
Fastest way to deploy Next.js apps.

#### Prerequisites
1.  **GitHub Account**: [Sign up here](https://github.com/join)
2.  **Vercel Account**: [Sign up here](https://vercel.com/signup)

#### Step 1: Push to GitHub
1.  Initialize Git (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

#### Step 2: Import in Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository and click **"Import"**.

#### Step 3: Configure Environment Variables
In the "Configure Project" screen, expand the **"Environment Variables"** section and add:

| Key | Value |
| --- | --- |
| `AZURE_OPENAI_API_KEY` | *(Your Azure API Key)* |
| `AZURE_OPENAI_ENDPOINT` | *(Your Azure Endpoint URL)* |
| `AZURE_OPENAI_DEPLOYMENT_NAME`| *(Your Deployment Name)* |

*Note: If you have Google/Anthropic keys, add those too (e.g., `GOOGLE_API_KEY`).*

4.  Click **"Deploy"**.

---

### Option B: Docker (Container)
Recommended for enterprise/on-premise.
1.  Ensure **Docker Desktop** is installed and running.
2.  Double-click **`deploy_docker.bat`** to build the image.
3.  Run the container:
    ```bash
    docker run -p 3000:3000 -e AZURE_OPENAI_API_KEY=... resume-ats-analyzer
    ```
