# Accounts Portal (Firebase project: annsms)
Pages: login, classes (academic years + classes), admission (creates Auth user + students doc + enrollment),
enrollment (add existing students to a class), billing (invoices, payments, void).

Setup
1. Deploy the bundled `firestore.rules` (the same project-wide file as the Admin Dashboard's; includes the `accounts` role, classes/enrollments, billing and audit-log rules).
2. Firebase Console -> Authentication: enable Email/Password.
3. Accounts officers are created by an admin: Admin Dashboard -> Accounts -> "Accounts Officers" tab (creates the login + accounts/{uid} doc together).
4. Host the folder (Firebase Hosting / any static host). Add the host domain to Auth -> Authorized domains.
