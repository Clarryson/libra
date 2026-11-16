// Loads DATABASE_URL from .env, because the generated client does not do it for you.
import 'dotenv/config';

// Import from the generated folder, NOT from '@prisma/client'.
// Path: prisma/seed.ts -> up one level -> generated/prisma/client
import { PrismaClient, Role } from '@prisma/client';

// The seed runs OUTSIDE Nest as a plain script, so we create our own client.
const prisma = new PrismaClient();

// Raw data: genre name -> list of books in that genre.
// Record<string, X[]> = an object with string keys and arrays of X as values.
const catalog: Record<
  string,
  { title: string; author: string; publishedYear: number }[]
> = {
  Fiction: [
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', publishedYear: 1960 },
    { title: 'Things Fall Apart', author: 'Chinua Achebe', publishedYear: 1958 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publishedYear: 1925 },
    { title: 'Petals of Blood', author: "Ngũgĩ wa Thiong'o", publishedYear: 1977 },
  ],
  'Science Fiction': [
    { title: 'Dune', author: 'Frank Herbert', publishedYear: 1965 },
    { title: 'Neuromancer', author: 'William Gibson', publishedYear: 1984 },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', publishedYear: 1969 },
    { title: 'Foundation', author: 'Isaac Asimov', publishedYear: 1951 },
  ],
  Mystery: [
    { title: 'And Then There Were None', author: 'Agatha Christie', publishedYear: 1939 },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', publishedYear: 2005 },
    { title: 'Gone Girl', author: 'Gillian Flynn', publishedYear: 2012 },
    { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', publishedYear: 1902 },
  ],
  'Non-Fiction': [
    { title: 'Sapiens', author: 'Yuval Noah Harari', publishedYear: 2011 },
    { title: 'Atomic Habits', author: 'James Clear', publishedYear: 2018 },
    { title: 'Educated', author: 'Tara Westover', publishedYear: 2018 },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', publishedYear: 1988 },
  ],
};

async function main() {
  // STEP 1: wipe old data so re-running never creates duplicates.
  // Children first, parents last: a foreign key blocks deleting a row
  // that another row still points at.
  // (Delete the review line if you did NOT add the Review model.)
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // STEP 2: two users to demonstrate the Role enum.
  await prisma.user.createMany({
    data: [
      { email: 'librarian@example.com', name: 'Lina Librarian', role: Role.LIBRARIAN },
      { email: 'patron@example.com', name: 'Paul Patron', role: Role.PATRON },
    ],
  });

  // STEP 3: create each genre together with its books (nested write).
  // Prisma inserts the genre first, then each book with genreId filled in.
  for (const [genreName, books] of Object.entries(catalog)) {
    await prisma.genre.create({
      data: {
        name: genreName,
        books: { create: books },
      },
    });
  }

  console.log('Seeded 2 users, 4 genres and 16 books');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1); // exit code 1 = failed
  })
  .finally(() => prisma.$disconnect()); // always close the connection