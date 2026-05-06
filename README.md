# Nedovos MVP

This is a branded front-end MVP for a donation and institution-management platform inspired by the functionality of the referenced site, without copying its branding or UI.

Included pages:

- `index.html` public marketing and product overview
- `donate.html` donor payment flow with one-time, recurring, bank, and Bit-style options
- `donor-portal.html` donor self-service area
- `admin.html` admin dashboard and operations workspace

Notes:

- Data is stored in browser `localStorage` under `nedovos-demo-state`
- Payments, authentication, receipt delivery, and SMS/voice services are mocked
- This can be used as the front-end base for a real implementation

To turn this into a production system, the next step is wiring:

1. real authentication
2. payment gateway APIs
3. receipt/invoice generation backend
4. donor and institution database models
5. admin permissions and audit logging

## Tests

Run the built-in server tests with:

`python -m unittest tests.test_dev_server`

## Auto Deploy

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

It runs on every push to `main` and:

1. runs the Python test suite
2. builds a deploy bundle from the site files
3. connects to your server over SSH
4. uploads the site into the target directory

Set these GitHub Actions secrets in the repository:

- `DEPLOY_HOST`: server hostname or IP
- `DEPLOY_USER`: SSH username on the server
- `DEPLOY_PATH`: absolute target path on the server
- `DEPLOY_SSH_KEY`: private SSH key used by GitHub Actions
- `DEPLOY_PORT`: optional SSH port, usually `22`

Repository path on GitHub:

`Settings -> Secrets and variables -> Actions`
