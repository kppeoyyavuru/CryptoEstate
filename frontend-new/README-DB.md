# Database Setup Instructions

The CryptoEstates application now uses a real PostgreSQL database instead of mock data. Follow these steps to set up and use the database:

## Setup Steps

1. Make sure your PostgreSQL database is running and the connection string is properly set in your `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/your_db_name?schema=public"
   ```

2. Run the database fix script to create the tables and seed the initial properties:
   ```
   node scripts/fix-db.js
   ```

3. Remove mock data files (optional but recommended):
   ```
   node scripts/remove-mock-data.js
   ```

4. Run the application:
   ```
   npm run dev
   ```

## Database Structure

The database includes the following tables:
- `users` - Stores user information synchronized with Clerk authentication
- `properties` - Stores property listings including details like value, shares, location, etc.
- `investments` - Tracks user investments in properties

## Important Notes

- When a user makes their first investment, a user record is automatically created in the database
- Properties are pre-loaded from the PropertyList component
- The dashboard will show 0 investments until users make their first investment
- When an investment is made, the property's available shares are updated accordingly

## Troubleshooting

If you encounter database connection issues:

1. Check your PostgreSQL server is running
2. Verify your connection string in the .env file
3. Run the fix-db.js script again to reset the database
4. If tables already exist, the script will handle dropping and recreating them

## Development

When developing new features:
- All API routes now use the Prisma client to interact with the database
- No more reliance on mock data files
- You can see your database changes using a PostgreSQL client like pgAdmin 