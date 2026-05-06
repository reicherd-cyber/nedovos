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
