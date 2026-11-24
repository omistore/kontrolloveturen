# VeturëCheck

VeturëCheck is an independent Albanian-language vehicle-history platform. Its branding and UI are original. Vehicle-history data is not generated or scraped; a report is shown only when an authorized provider returns it.

## Requirements

- Node.js 20+
- PostgreSQL 13+
- A local `.env` file based on `.env.example`

## Local development

1. Install packages:

   ```sh
   npm install
   ```

2. For local development, start the included PostgreSQL container:

   ```sh
   docker compose up -d db
   ```

   The local `.env` file supplies a private database password and connection URL. The database port is bound to localhost only, and data persists in a Docker volume. If Docker Desktop is not installed, install and start it first.

   If you use an existing PostgreSQL server instead, set its `DATABASE_URL` in `.env`. For hosted PostgreSQL that requires TLS, set `DATABASE_SSL=true`. The application creates the `users`, `orders`, `payments` and `reports` tables on API startup.

3. Set a strong, private admin token in `.env`:

   ```env
   ADMIN_ACCESS_TOKEN=<a-long-random-secret>
   ```

   Generate a unique token for each environment. Never commit `.env` or use the example file as production secrets.

4. Start the API and frontend in separate terminals:

   ```sh
   npm run dev:api
   npm run dev
   ```

   Open the Vite URL printed in the frontend terminal. Vite proxies `/api` requests to `http://localhost:3001`.

5. Run checks and create a production frontend build:

   ```sh
   npm run lint
   npm run build
   ```

   Run the API with `npm run start:api`. Deploy the API and frontend behind HTTPS, and configure `CORS_ORIGIN` to the exact frontend origin when they are hosted on separate origins.

## Integrations requiring authorization and credentials

### CheckCar.VIN vehicle data

- The platform does **not** scrape CheckCar.VIN and does not assume an API endpoint, authentication format, reseller contract, or response schema.
- `CHECKCAR_VIN_ENABLED` defaults to `false`. The API key and API URL are server-side environment placeholders only; they are never bundled into the frontend.
- `server/services/vehicleDataProvider.ts` defines the provider contract and the intentionally disabled adapter. The adapter will not make network requests even when toggled: its explicit integration point must be implemented against CheckCar.VIN's official documentation after written API access and reseller permission are obtained.
- After authorization, implement its request, authentication, response validation, field mapping, timeout, and error handling there. Only persist and display fields actually returned by the provider. Keep missing report fields empty/unavailable rather than inferring values.

### Online payments

- `server/services/paymentProvider.ts` defines the checkout provider contract. It is intentionally unconfigured and returns HTTP 503; no payment is simulated or marked successful.
- Select a supported payment provider, configure its server-side API key and webhook secret, and implement checkout creation plus signature-verified payment webhooks before accepting payments.
- Only a verified provider webhook should transition a payment to `paid` and allow report retrieval. Do not mark an order paid based on a browser redirect.

## Security notes

- VIN format is validated in the browser and revalidated by the API (17 uppercase alphanumeric characters; `I`, `O`, and `Q` are excluded).
- Public order and report responses mask the VIN. Full VINs, customer names, phone numbers, emails, vehicle types, and order history are returned only to an administrator authenticated with `ADMIN_ACCESS_TOKEN`.
- The admin token is held in browser `sessionStorage` only for the current tab session. Rotate it if exposed.
- Helmet security headers, request-size limits, rate limits, SQL parameter binding, and PostgreSQL foreign keys are enabled. Use HTTPS and a managed secrets store in production.
- Do not log request bodies, VINs, access tokens, provider keys, or payment secrets.

## Included pages

- Albanian landing page with responsive navigation and an order-request form for VIN, customer name, vehicle type, phone number, and email. Requests are visible in the protected admin dashboard; the form does not process payments or generate reports.
- Order/report status page that does not fabricate vehicle data or payment completion.
- Token-protected admin dashboard with order history and revenue based only on payment rows marked `paid`.
