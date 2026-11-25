import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateQuote, validate } from "@/domain/pricing";

const Person = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const Input = z.object({
  booker: Person,
  attendees: z.array(Person),
  tickets: z.object({
    dayAdult: z.array(
      z.object({ personId: z.string(), dates: z.array(z.string()) }),
    ),
    dayChild: z.array(
      z.object({ personId: z.string(), dates: z.array(z.string()) }),
    ),
    allDayAdult: z.array(z.object({ personId: z.string() })),
    allDayChild: z.array(z.object({ personId: z.string() })),
    family: z.array(
      z.object({
        adultIds: z.tuple([z.string(), z.string()]),
        childIds: z.tuple([z.string(), z.string()]),
        date: z.string(),
      }),
    ),
  }),
  extras: z.object({
    dandiya: z.number().int().min(0),
    dinners: z.array(z.object({ personId: z.string(), date: z.string() })),
    workshops: z.array(z.object({ personId: z.string(), date: z.string() })),
  }),
  promoCode: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Input.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  const errors = validate(parsed.data);
  const quote = calculateQuote(parsed.data);
  return NextResponse.json({ errors, quote });
}
