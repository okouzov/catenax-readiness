# GATE Catena-X Readiness

English-language landing page for GATE Institute’s Catena-X Readiness Service
for Bulgarian automotive companies.

The page presents:

- the Catena-X opportunity and initial eligibility criteria;
- the Data Space Accelerator and EDIH InnovationAmp;
- GATE Institute’s data-space and interoperability expertise;
- the complete six-work-package service offering;
- an interactive expression-of-interest form backed by Firebase Firestore.

## Run locally

Requirements: Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm dev
```

Create a production build with:

```bash
pnpm build
```

## Connect Firebase

1. Create or select a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web App to that project.
3. Enable Firestore Database.
4. Copy `.env.example` to `.env.local`.
5. Paste the Firebase Web App configuration values into `.env.local`.
6. Deploy the included create-only security rules:

```bash
npx firebase-tools login
npx firebase-tools use YOUR_PROJECT_ID
npx firebase-tools deploy --only firestore:rules
```

The browser form writes new records to the `leads` collection. Public clients
can create a tightly validated lead record, but cannot read, update or delete
records. The records remain available to authorised project users in:

`Firebase Console → Firestore Database → Data → leads`

For a public campaign, enabling
[Firebase App Check](https://firebase.google.com/docs/app-check) is also
recommended as an additional anti-abuse layer.

## Form data

Each Firestore record includes:

- full name, company, email, phone and job title;
- employee and annual-revenue bands;
- primary Catena-X interest area and optional notes;
- consent flag, source, status and server timestamp.

The form uses native HTML validation plus live email-format validation and a
honeypot field. It never stores submissions in browser storage.

## Password-protected team access

The site includes a read-only review page at:

`https://YOUR-SITE/submissions`

Colleagues enter one shared password. They do not need Firebase Console access,
Google Cloud roles, individual accounts, email notifications or a Blaze plan.
The page provides live Firestore results, search and CSV export.

The password is verified by Firebase Authentication and is never stored in this
repository or sent as plain text to Firestore.

Configure the shared login:

1. In Firebase Console, open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Open **Authentication → Users → Add user**.
4. Enter `catenax-review@gate.local` as the account email. This is only a login
   identifier and does not need to be a real mailbox.
5. Set the shared password you want the team to use. Do not add it to `.env`,
   GitHub or this README.
6. Deploy the included `firestore.rules`.
7. Open `/submissions` and enter the shared password.

The Firestore rules allow reads only when Firebase has authenticated this exact
shared account. Public visitors can submit the form, but cannot read, update or
delete any lead. The review page is also read-only.

To revoke access, disable/delete the shared Authentication user or change its
password in Firebase Console.

Email/password Authentication and the normal Firestore no-cost quotas are
available on the Spark plan. A deliberately weak shared password is not
recommended because anyone who learns it can read every submission.

Official references:

- [Firebase password authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Firestore authenticated security rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firebase Spark plan](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)

## Publishing with GitHub Pages

The repository includes a GitHub Actions workflow that builds a static export
for `https://okouzov.github.io/catenax-readiness/`.

1. In the GitHub repository, open **Settings → Secrets and variables → Actions
   → Variables**.
2. Add the six `NEXT_PUBLIC_FIREBASE_*` values listed in `.env.example` as
   repository variables.
3. Open **Settings → Pages** and select **GitHub Actions** as the source.
4. Push to `main`, then follow the deployment in the **Actions** tab.

The workflow builds and publishes the `out` directory automatically. Do not
select `Deploy from a branch`: that mode publishes this README instead of
building the application.

Do not commit `.env.local`; it is intentionally ignored. Firebase Web App
configuration is included in the browser bundle by design, while access to
stored submissions is enforced by the included Firestore rules and Firebase
Authentication.

## Content sources

The core proposition and all six work packages come from the supplied
`GATE CatenaX Readiness Service Proposal (2).pptx`.

Additional current programme context is linked directly from:

- [Catena-X official ecosystem overview](https://catena-x.net/ecosystem/overview/)
- [Data Space Accelerator](https://data-space-accelerator.com/)
- [InnovationAmp](https://innovationamp.eu/en/)
- [GATE Institute](https://www.gate-ai.eu/en/home/)

Programme availability, remuneration and final eligibility remain subject to
the official tender and programme rules.
