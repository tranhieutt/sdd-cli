# App Store Submission Checklist

**App Name**: [App name]
**Version**: [e.g., 1.2.0 (42)]
**Platform**: [ ] iOS App Store  [ ] Google Play Store  [ ] Both
**Submission Date**: [Target date]
**Release Manager**: [Name]
**Status**: [ ] GO / [ ] NO-GO

---

## Build Verification

- [ ] Production build compiles without warnings or errors
- [ ] Build signed with correct distribution certificate/keystore
- [ ] Version name and version code/build number are correct and incremented
- [ ] No debug flags, development endpoints, or test credentials in production build
- [ ] Crash-free rate > [99%] on staging/beta build
- [ ] All feature flags set to correct production values
- [ ] Bundle size within acceptable range: [actual] / [budget]

---

## Functional Testing

### Critical Flows
- [ ] Onboarding / first-run flow completes successfully
- [ ] Login, registration, password reset work correctly
- [ ] Core feature: [describe primary user action] works end-to-end
- [ ] In-app purchases / subscriptions process correctly (if applicable)
- [ ] Push notifications received and deep links navigate correctly
- [ ] Offline mode degrades gracefully (no crashes, informative error states)
- [ ] App resumes correctly after backgrounding (state preserved)

### Device Coverage
- [ ] Tested on minimum supported OS version (iOS [X] / Android API [Y])
- [ ] Tested on latest OS version
- [ ] Tested on small screen (e.g., iPhone SE / small Android)
- [ ] Tested on large screen (e.g., iPad / Android tablet) — if supported
- [ ] Tested on low-end device for performance

---

## iOS-Specific Checklist

### App Store Connect
- [ ] App record exists with correct Bundle ID
- [ ] App category set correctly
- [ ] Age rating questionnaire completed
- [ ] Privacy policy URL provided and accessible
- [ ] App Privacy (nutrition labels) filled out accurately in App Store Connect
- [ ] In-app purchase products approved (if applicable)

### Metadata
- [ ] App name (≤ 30 chars): `[name]`
- [ ] Subtitle (≤ 30 chars): `[subtitle]`
- [ ] Description (≤ 4000 chars) proofread and localized
- [ ] Keywords (≤ 100 chars total) optimized
- [ ] Support URL accessible
- [ ] Marketing URL accessible (if provided)

### Screenshots & Preview
- [ ] Screenshots for required sizes: 6.9", 6.5", 5.5" (and iPad if universal)
- [ ] Screenshots accurate to current UI — no old UI or placeholder text
- [ ] App preview video (optional but recommended) meets specs
- [ ] Screenshots localized for all supported locales

### Technical
- [ ] App Transport Security (ATS) — no arbitrary loads without justification
- [ ] Privacy usage description strings present for all requested permissions
  - [ ] Camera — `NSCameraUsageDescription`
  - [ ] Photos — `NSPhotoLibraryUsageDescription`
  - [ ] Location — `NSLocationWhenInUseUsageDescription`
  - [ ] [Other permissions]
- [ ] No private API usage
- [ ] Bitcode enabled (if required for target iOS version)
- [ ] Universal links / associated domains configured correctly (if used)
- [ ] TestFlight beta testing completed with external testers

---

## Android-Specific Checklist

### Play Console
- [ ] App created with correct Package Name / Application ID
- [ ] Content rating questionnaire completed (IARC)
- [ ] Privacy policy URL provided and accessible
- [ ] Data safety section filled out accurately
- [ ] Target API level meets current Google Play requirement (API [X]+)

### Metadata
- [ ] Short description (≤ 80 chars) proofread
- [ ] Full description (≤ 4000 chars) proofread and localized
- [ ] App category set correctly

### Screenshots & Graphics
- [ ] Screenshots for phone (min 2, max 8)
- [ ] Screenshots for 7" tablet and 10" tablet (if tablet supported)
- [ ] Feature graphic (1024×500) provided
- [ ] Screenshots accurate to current UI
- [ ] Screenshots localized for all supported locales

### Technical
- [ ] App Bundle (`.aab`) used instead of APK
- [ ] ProGuard / R8 minification enabled and mapping file uploaded
- [ ] All requested permissions declared in `AndroidManifest.xml` with justification
- [ ] Deep links / App Links verified
- [ ] Play Feature Delivery / Dynamic Delivery configured (if used)
- [ ] Internal testing track tested; promoted to closed/open testing before production

---

## Performance & Quality Gates

| Metric | Target | Actual | Pass? |
|--------|--------|--------|-------|
| Crash-free sessions | > [99%] | | [ ] |
| ANR rate (Android) | < [0.5%] | | [ ] |
| App cold start | < [2s] | | [ ] |
| Core action latency (p95) | < [1s] | | [ ] |
| Binary size | < [XMB] | | [ ] |

---

## Legal & Compliance

- [ ] Terms of Service accessible from app or store listing
- [ ] Privacy Policy updated to reflect all data collected in this version
- [ ] GDPR / CCPA compliance verified (consent flows, data deletion)
- [ ] COPPA compliance verified (if app is accessible to under-13s)
- [ ] Third-party SDK licenses included (open-source attribution)
- [ ] In-app purchase pricing complies with local tax regulations
- [ ] Export compliance (encryption declaration, if applicable)

---

## Post-Submission Readiness

- [ ] Analytics / telemetry verified to be receiving events in production
- [ ] Crash reporting service configured and tested ([Sentry / Crashlytics / etc.])
- [ ] Customer support team briefed on new features and known issues
- [ ] App Store review notes drafted (for reviewer: explains non-obvious flows)
- [ ] Rollback plan documented (previous version available to re-submit if needed)
- [ ] Marketing assets ready (release announcement, social posts)
- [ ] On-call schedule set for first 48 hours post-launch

---

## Sign-offs

| Role | Name | Status | Date |
|------|------|--------|------|
| QA Lead | | [ ] Approved | |
| Mobile Developer | | [ ] Approved | |
| Release Manager | | [ ] Approved | |
| Product Manager | | [ ] Approved | |

---

## Final Decision

**GO / NO-GO**: ____________

**Rationale**: [Summary of readiness. If NO-GO, list specific blocking items.]

**Known Issues Accepted** (document any known issues being shipped):

| Issue | Severity | Rationale for Shipping | Fix Target |
|-------|----------|----------------------|------------|
| | | | |
