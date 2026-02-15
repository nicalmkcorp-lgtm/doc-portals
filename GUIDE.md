# Nica Lmk Corp: Android Build Guide

Follow these exact steps to turn this project into a native Android APK.

## 🚨 THE ULTIMATE FIX: "failureErrorWithLog" (esbuild error)
If you are still seeing the `esbuild` error in PowerShell, follow these steps in order:

### Step 1: Verify Node.js Architecture (CRITICAL)
Many Windows users accidentally install the 32-bit version of Node.js. `esbuild` **requires** 64-bit Node to run correctly on a 64-bit system.
1. Open PowerShell and run:
   `node -p "process.arch"`
2. If it says **`ia32`**, you MUST uninstall Node.js and download the **64-bit (x64) version** from nodejs.org.
3. If it says **`x64`**, proceed to Step 2.

### Step 2: Check for Antivirus / Windows Defender
Sometimes Windows blocks the `esbuild.exe` file from running. 
1. Open **Windows Security** > **Virus & threat protection**.
2. Click **Manage settings**.
3. Scroll to **Exclusions** and click **Add or remove exclusions**.
4. Add the folder where your project is located (the `lmk-cloud_offline_signed-v3` folder).

### Step 3: Run the Nuclear Repair Command
Open PowerShell as **Administrator** and run:
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Run the aggressive repair
npm run repair
```
*Note: We now use `npx rimraf` to ensure the cleanup tool is found even if your local installation is broken.*

---

## 🏗️ WHAT TO DO AFTER REPAIR (The Build Process)

### 1. Test the Web Build
Run this to ensure the tools are fixed:
```powershell
npm run build
```
*If this fails with the same error, restart your computer and try again.*

### 2. Sync to Android
Push your code into the Android container:
```powershell
npx cap add android   # Only if you haven't done this before
npx cap sync android  # Do this every time you change your code
```

### 3. Build the APK
1. Run `npx cap open android` to launch Android Studio.
2. In Android Studio, wait for the sync to finish.
3. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. When done, click **locate** in the popup to get your `.apk` file.

---

## 📊 CONNECTING YOUR GOOGLE SHEET
To make the "Name" and "Amount" columns work:

1.  Open your **Google Sheet**.
2.  Go to **Extensions > Apps Script**.
3.  Inside the App (on your phone or browser), go to **Settings** and tap **Copy Script Code**.
4.  Paste that code into the Apps Script editor, replacing everything.
5.  Click **Deploy > New Deployment**.
    *   **Type**: Web App
    *   **Execute as**: Me
    *   **Access**: **Anyone** (Required for the app to talk to the sheet)
6.  Copy the **Web App URL**.
7.  Paste this URL into the **Master Script URL** field in the app's settings.

---

## 🔴 FIXING: build.gradle Syntax Error
If you see `Unexpected input: '{' @ line 33`, you have a missing `}`. 
Open `android/app/build.gradle` and ensure it looks exactly like this around line 30-35:

```gradle
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    } 
} 

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
}
```