# AdixLoop authentication and upload findings

Branch: `fix/auth-upload-diagnostics`

## Confirmed from the current repository

- The current login page uses Internet Identity via `@caffeineai/core-infrastructure` and `useInternetIdentity`.
- There is no phone-number OTP flow or Firebase phone-auth integration in the current login code. This is not merely an OTP delivery bug: the provider and verification flow have not been implemented in this repository.
- The create flow uploads media through `@caffeineai/object-storage`, then saves the returned direct URL using the Internet Computer backend actor.
- Upload configuration comes from `loadConfig()`: backend host, bucket name, storage gateway URL, backend canister ID, and project ID.

## Changes in this branch

- Validate selected file type and size before reading the entire file into memory (videos up to 100 MB; photos up to 15 MB).
- Handle missing storage configuration, invalid storage responses, and local root-key failures as visible upload errors instead of silently ignoring them.
- Keep progress bounded to 0–100 and show file size limits in the upload UI.
- Catch synchronous/asynchronous sign-in errors and explain that this repository currently supports Internet Identity only.

## Required next step for phone OTP

To add phone OTP, choose and configure an authentication provider (for example Firebase Authentication Phone) and implement its SMS send/verification flow. This also needs a deliberate identity mapping between the provider's user and the Internet Computer backend; a Firebase user is not automatically an Internet Identity principal. Do not pretend OTP is working until a real SMS verification succeeds.

## Verification still required

Run `pnpm typecheck`, `pnpm --dir src/frontend test`, and `pnpm build` in the project environment. Exercise upload against the configured storage gateway with a real small video and photo. This GitHub review did not run those commands or verify live SMS/storage credentials.
