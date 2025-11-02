# ⚠️ IMPORTANT: Set Environment Variable in Vercel

The code will try to auto-detect the production environment, but **the most reliable way is to set the environment variable in Vercel**.

## 🔧 How to Set VITE_API_URL in Vercel

1. Go to your **`redcross-cleint`** project in Vercel
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://redcross-server.vercel.app`
   - **Environment**: Select **Production** (and Preview if you want)
5. Click **Save**
6. **Go to Deployments tab** and click **"Redeploy"** on the latest deployment
7. Make sure to select **"Use existing Build Cache"** = **OFF** to rebuild with new env vars

## ✅ Why This is Important

While the code tries to auto-detect, environment variables are:
- ✅ Guaranteed to work
- ✅ Can be changed without code updates
- ✅ Works in all build scenarios
- ✅ Best practice for production apps

## 🧪 After Setting Environment Variable

After redeploying, check the browser console. The API calls should go to:
- `https://redcross-server.vercel.app/api/...`

Instead of:
- `http://localhost:4000/api/...`

## 📝 Alternative: Check Build Mode

If environment variable is not set, the code checks:
1. `import.meta.env.VITE_API_URL` (environment variable)
2. `import.meta.env.PROD` (Vite production mode)
3. Hostname contains `vercel.app` or `vercel.com`

But setting the environment variable is the recommended approach!

