# Deployment Guide 🚀

This project is set up to be deployed on **Firebase Hosting** and uses **Firebase Firestore** for database access. Follow these instructions to deploy your application.

---

## 📋 Prerequisites

1. Install the **Firebase CLI** globally:
   ```bash
   npm install -g firebase-tools
   ```
2. Log into your Firebase account:
   ```bash
   firebase login
   ```

---

## 🛠️ Environment Variables Configuration

We have configured the application to use Vite environment variables (`import.meta.env`) instead of hardcoding secret keys. 

1. **Local Development**:
   A `.env` file has been created locally. Do **not** commit this file to Git. If you configure a new development environment, copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

2. **Hosting Environment**:
   Vite injects environment variables *at build time*. 
   - If deploying manually from your terminal, make sure your `.env` file exists locally so the variables are correctly bundled into `dist/`.
   - If deploying via a CI/CD platform (e.g., GitHub Actions), you must define these environment variables as repository Secrets or variables, and have the build step access them.

---

## 🚢 Deployment Steps

Deploying is fully automated using the script added to `package.json`:

```bash
npm run deploy
```

This command will:
1. Run `npm run build` to compile the Vite application into static files (`dist/` directory).
2. Deploy the static build files to **Firebase Hosting**.
3. Apply the security rules defined in `firestore.rules` to **Cloud Firestore**.

### Manual Firebase CLI Commands (Alternative)

If you prefer to run steps individually:
```bash
# 1. Build project
npm run build

# 2. Deploy to Firebase
firebase deploy
```

---

## 🛡️ Database Rules (`firestore.rules`)

The `firestore.rules` file ensures that your database is secure in production:
- **Wishes**: Anyone can read individual wishes by ID (for sharing cards).
- **Creation**: Only logged-in users can create wishes.
- **Modification/Deletions**: Only the owner of a wish document can modify or delete it.

---

## 🤖 Automating with GitHub Actions (Optional)

If you push this project to GitHub, you can set up continuous delivery:
```bash
firebase init hosting:github
```
This CLI wizard will guide you to set up a Service Account and configure a GitHub Workflow file under `.github/workflows/` to automatically deploy every time you push code to your main branch.
