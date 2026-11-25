# Edge Cases Tested

| #   | Situation                                         | Expected Behavior                                                     |
| --- | ------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Booker age < 18                                   | Form blocks submission. Server returns `VALIDATION` error.            |
| 2   | 11-year-old on Adult ticket                       | Form shows red warning and blocks. Server returns `VALIDATION`.       |
| 3   | 4-year-old on Child ticket                        | Form blocks. Server returns `VALIDATION`.                             |
| 4   | FLAT20 applied when subtotal is $10               | Total becomes $0 (never negative).                                    |
| 5   | KIDSFREE applied with no children                 | Promo rejects with specific error message.                            |
| 6   | Workshop on Nov 12                                | Form only shows Nov 11 and 13. Server rejects Nov 12.                 |
| 7   | Double-clicking "Pay"                             | Idempotency key ensures only one booking is created.                  |
| 8   | Two users booking last 2 workshop seats           | Database transaction ensures one gets 201, the other gets `SOLD_OUT`. |
| 9   | All-Day Pass Adult (Sold Out)                     | `+` button disabled in UI. Server rejects if sent via cURL.           |
| 10  | Dinner added for a person with no ticket that day | Server rejects via `validate()`.                                      |
