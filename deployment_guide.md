# Full-Stack Deployment Guide

I have configured your application repository so that your React frontend and Node/Express backend act as a **unified application**. This means you only have to deploy a single Web Service! 

Here is the step-by-step process to deploy to **Render** (the easiest free cloud provider) and **MongoDB Atlas** (for your cloud database).

## 1. Set Up MongoDB Atlas (Cloud Database)
Local MongoDB (`127.0.0.1`) won't work in the cloud. You need a free cloud database:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign up/login.
2. Create a new **Free Shared Cluster** (M0).
3. Under **Security > Database Access**, create a user with a username and password. Remember this!
4. Under **Security > Network Access**, click "Add IP Address" and select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Go back to your Cluster, click **Connect > Connect your application**.
6. Copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/learning-tracker?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with the credentials from Step 3.

## 2. Deploy to Render
1. Push your current project repository to **GitHub**.
2. Go to [Render](https://render.com) and sign up with GitHub.
3. Click **New > Web Service**.
4. Select `Build and deploy from a Git repository` and link the GitHub repository you just created.
5. In the settings, fill out the following configuration:
   - **Name:** `learning-tracker` (or whatever you prefer)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Scroll down to **Environment Variables** and add:
   - **Key:** `MONGO_URI`
     **Value:** (Paste the connection string from Atlas here)
   - **Key:** `JWT_SECRET`
     **Value:** `your-super-secret-key-here`
7. Click **Create Web Service** at the bottom! 🚀

## How It Works
I updated your root `package.json` and your `backend/server.js` file:
1. When Render builds your app, it compiles your React Code (`vite build`) and installs both frontend and backend dependencies automatically.
2. When Render runs `npm start`, it runs `node backend/server.js` with `NODE_ENV=production`.
3. Lastly, instead of sending errors, the Express Backend has been updated to automatically send your React site to anyone who visits it!
