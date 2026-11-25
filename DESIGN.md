# Design Note — Sharad Utsav 2026

## 1. How I am modelling tickets, people, dates, and prices

- **Money:** Stored and calculated strictly in integer cents. No floats.
- **People:** Differentiated by `Person` type. The booker requires an email/phone. Attendees only need a name and DOB. Age is derived dynamically based on the festival start date (`2026-11-10`), so a child doesn't "age out" mid-festival.
- **Dates:** Day passes accept an array of ISO date strings. All-Day passes represent the full 5-day set. Family passes group 2 adults and 2 children under a single `familyId` and a single date.
- **Pricing:** A pure function `calculateQuote()` takes the raw inputs and the catalogue, and outputs line items and the final total. It never trusts the client's math.

## 2. The endpoints I intend to build

- `GET /api/config`: Returns festival dates, prices, and current stock.
- `POST /api/quote`: Validates the cart and returns the server-calculated price.
- `POST /api/bookings`: Creates a `pending` booking, atomically reserves stock, and checks idempotency.
- `POST /api/bookings/:id/pay`: Simulates payment, marks the booking `paid`.
- `GET /api/bookings/:id`: Retrieves the confirmation.

## 3. Tricky cases spotted

- **Age boundaries:** Exactly 12 on festival start = Adult. Exactly 5 = Child.
- **Extras coupling:** Dinner and Workshop require a valid ticket for that specific day. Workshop is only valid on Nov 11 & 13.
- **Promo codes:** `FLAT20` should never make the total negative. `KIDSFREE` should error if there are no child tickets.
- **Concurrency:** Two users booking the last 2 workshop seats simultaneously.
- **Double-pay:** A user clicking "Pay" twice.

## 4. What I have decided not to do (and why)

- **Real Stripe:** Simulated payment is sufficient for this scope.
- **Abandoned cart cleanup:** If a user reserves stock and closes the tab, that stock stays reserved. In production, I would add a BullMQ cron job to release stock from `pending` bookings after 15 minutes.
