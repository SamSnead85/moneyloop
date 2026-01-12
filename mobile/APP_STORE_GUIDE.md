# MoneyLoop Mobile App Store Deployment Guide

## Prerequisites

### iOS (App Store)
1. Apple Developer Account ($99/year)
2. App Store Connect access
3. App-specific password for CI/CD

### Android (Google Play)
1. Google Play Developer Account ($25 one-time)
2. Service account JSON key for API access

---

## Setup Steps

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure Project
```bash
cd mobile
eas build:configure
```

### 3. Set Environment Variables
```bash
# iOS
eas secret:create --name APPLE_ID --value "your-apple-id@email.com"
eas secret:create --name ASC_APP_ID --value "your-app-id"
eas secret:create --name APPLE_TEAM_ID --value "your-team-id"

# Android
# Upload google-service-account.json to project
```

---

## Build Commands

### Development Build (for testing)
```bash
# iOS Simulator
eas build --profile preview --platform ios

# Android APK
eas build --profile preview --platform android
```

### Production Build
```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

---

## Submit to App Stores

### App Store (iOS)
```bash
eas submit --platform ios --latest
```

### Google Play (Android)
```bash
eas submit --platform android --latest
```

---

## App Store Listing Requirements

### iOS App Store
- [ ] App Icon (1024x1024 PNG)
- [ ] Screenshots (6.5", 5.5", 12.9" iPad)
- [ ] App Description (up to 4000 characters)
- [ ] Keywords (100 characters)
- [ ] Privacy Policy URL
- [ ] Support URL

### Google Play
- [ ] Feature Graphic (1024x500)
- [ ] Screenshots (phone & tablet)
- [ ] Short Description (80 characters)
- [ ] Full Description (4000 characters)
- [ ] Privacy Policy URL
- [ ] Content Rating Questionnaire

---

## Recommended App Description

**MoneyLoop - Family Financial Command Center**

Take control of your family's finances with MoneyLoop, the AI-powered financial management app that makes collaboration effortless.

**Features:**
• Collaborative bill management - Assign and track who pays what
• Personal/Business separation - Keep finances organized for tax time
• Smart task system - Signal vs Noise prioritization
• Real-time sync - Everyone stays updated instantly
• AI insights - Get personalized spending recommendations
• Allowance tracking - Teach kids financial responsibility

**Privacy First:**
Your data is encrypted and never sold. Bank-level security with Face ID/Touch ID support.

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | TBD | Initial release |
