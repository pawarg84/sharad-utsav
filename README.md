# Sharad Utsav 2026 — Booking System

**Live URL:** https://sharad-utsav-five.vercel.app

## How to run locally

1. `pnpm install`
2. Create a `.env` with `DATABASE_URL` pointing to a Postgres database (Neon, Supabase, etc.).
3. `pnpm prisma migrate dev`
4. `pnpm db:seed`
5. `pnpm dev`

## Environment Variables set on Vercel

- `DATABASE_URL`: The production PostgreSQL connection string.

## API Contract

| Method | Endpoint                 | Body                                      | Returns                                            |
| ------ | ------------------------ | ----------------------------------------- | -------------------------------------------------- |
| GET    | `/api/config`            | -                                         | Festival metadata, prices, stock levels.           |
| POST   | `/api/quote`             | `BookingInput`                            | Server-calculated integer cents, promo validation. |
| POST   | `/api/bookings`          | `BookingInput` + `idempotency-key` header | Creates pending booking, atomic stock decrement.   |
| POST   | `/api/bookings/[id]/pay` | -                                         | Marks booking as paid (idempotent).                |
| GET    | `/api/bookings/[id]`     | -                                         | Retrieves booking confirmation.                    |

## Decisions I made

1. **Reference Dates:** Attendee age is calculated on the festival start date (Nov 10, 2026). The booker's 18+ check uses the booking date.
2. **Stock & Idempotency:** Stock is reserved using an atomic `UPDATE ... WHERE remaining >= qty` query. The `idempotencyKey` prevents double bookings and double stock decrements.
3. **Promo Codes:**
   - One code per booking.
   - `FLAT20` floors the total at $0 (no negative balances).
   - `KIDSFREE` rejects the code if there are no child tickets in the cart.
   - `SEVA10` applies to the subtotal before any other discounts.
4. **Extras:** Dinner and Workshop toggles are locked to the specific dates the attendee is ticketed for.
5. **Validation:** Form validation exists on the client for UX, but the server is the ultimate authority.

## Unfinished

- **Real Stripe:** Simulated payment only.
- **Abandoned Carts:** If a user creates a booking but never pays, the stock remains reserved. I would add a Redis/BullMQ cron job to release `pending` stock after 15 minutes.
