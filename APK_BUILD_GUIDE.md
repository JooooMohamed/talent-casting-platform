# Android APK Build Guide — MVP Presentation

## Prerequisites

Make sure you have:
- Android Studio installed (https://developer.android.com/studio)
- `ANDROID_HOME` environment variable set
- Java 17+ installed (`java -version`)
- Connected Android device OR Android emulator running

---

## Step 1 — Update the API URL for Production

Before building, point the mobile app to your deployed Vercel API.

Edit `apps/mobile/src/services/api.ts`:

```ts
const API_BASE = __DEV__
  ? 'http://10.0.2.2:4000/api/v1'       // local dev (Android emulator)
  : 'https://YOUR-APP.vercel.app/api/v1'; // ← replace with your Vercel URL
```

---

## Step 2 — Generate a Keystore (one-time setup)

```bash
cd apps/mobile/android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore talent-casting-release.keystore \
  -alias talent-casting \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

> Keep the keystore file safe — you need it for every future release.

---

## Step 3 — Configure Signing in Gradle

Edit `apps/mobile/android/gradle.properties`, add:

```properties
TALENT_CASTING_UPLOAD_STORE_FILE=talent-casting-release.keystore
TALENT_CASTING_UPLOAD_KEY_ALIAS=talent-casting
TALENT_CASTING_UPLOAD_STORE_PASSWORD=your_keystore_password
TALENT_CASTING_UPLOAD_KEY_PASSWORD=your_key_password
```

Edit `apps/mobile/android/app/build.gradle`, find `signingConfigs` and add:

```gradle
signingConfigs {
    release {
        storeFile file(TALENT_CASTING_UPLOAD_STORE_FILE)
        storePassword TALENT_CASTING_UPLOAD_STORE_PASSWORD
        keyAlias TALENT_CASTING_UPLOAD_KEY_ALIAS
        keyPassword TALENT_CASTING_UPLOAD_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

---

## Step 4 — Build the Release APK

```bash
cd apps/mobile/android

# Clean previous build
./gradlew clean

# Build release APK
./gradlew assembleRelease
```

Output APK will be at:
```
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## Step 5 — Install on Device / Share

```bash
# Install directly on connected device
adb install apps/mobile/android/app/build/outputs/apk/release/app-release.apk

# Or share the APK file via Google Drive / WhatsApp / email
```

---

## Quick Debug Run (emulator / device)

```bash
# Start Metro bundler
cd apps/mobile && npm start

# Run on Android (separate terminal)
npm run android
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `SDK location not found` | Set `ANDROID_HOME` in `~/.bash_profile` or `~/.zshrc` |
| `Gradle build failed` | Run `./gradlew clean` then retry |
| `App crashes on launch` | Check Metro logs for JS errors (`npm start`) |
| `Camera not working` | Accept permissions prompt on first launch |
| `Video not playing` | Check Cloudinary URL is accessible + video is approved |
| `API unreachable` | Verify Vercel URL in `api.ts` and CORS config in `.env` |

---

## Vercel Deployment

### Deploy API

```bash
cd apps/api

# Install Vercel CLI
npm i -g vercel

# Set environment variables on Vercel dashboard first, then:
vercel --prod
```

### Set Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

```
MONGODB_URI          = mongodb+srv://...
MONGODB_DB_NAME      = talent-casting
JWT_ACCESS_SECRET    = your_secret
JWT_REFRESH_SECRET   = your_refresh_secret
CLOUDINARY_CLOUD_NAME = your_cloud
CLOUDINARY_API_KEY   = your_key
CLOUDINARY_API_SECRET = your_secret
ALLOWED_ORIGINS      = https://your-web.vercel.app
```

### Deploy Web

```bash
cd apps/web

# Set NEXT_PUBLIC_API_URL on Vercel dashboard, then:
vercel --prod
```

---

## Run Seed Script (Populate Demo Data)

Once your API is running locally:

```bash
cd apps/api
npm run seed
```

This creates:
- ✅ Admin: `admin@talentcasting.com` / `Admin@123456`
- ✅ Casting: `casting@studioone.com` / `Casting@123456`
- ✅ 6 talent profiles (approved, ready to browse)
- ✅ 5 casting calls (open on the board)
