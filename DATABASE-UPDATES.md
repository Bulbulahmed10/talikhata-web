# Database Updates for Transaction Features

## Overview
This document outlines the changes made to support new transaction features including time tracking, refund functionality, and enhanced transaction management.

## Changes Made

### 1. Reports Page Updates
- **Removed**: Preview stats (total given, total received, total due, total transactions, average transaction)
- **Added**: Dashboard stats (net receivable, net payable, total customers, customers with due)
- **Updated**: Stats calculation to match dashboard logic

### 2. Transaction Form Enhancements
- **Added**: Time field for transaction timing
- **Added**: Refund amount field for partial returns
- **Added**: Refund note field for refund descriptions
- **Updated**: Balance calculation to account for refunds
- **Enhanced**: Form validation for refund amounts

### 3. Customer Detail Page Updates
- **Added**: Transaction time display
- **Added**: Edit transaction functionality
- **Added**: Delete transaction functionality
- **Added**: Refund information display
- **Updated**: Transaction sorting by date and time
- **Enhanced**: Transaction display with refund details

### 4. Database Schema Changes
- **Added**: `time` field (TIME type) to transactions table
- **Added**: `refund_amount` field (DECIMAL) to transactions table
- **Added**: `refund_note` field (TEXT) to transactions table
- **Updated**: Database trigger to handle refund calculations
- **Added**: Indexes for performance optimization

## Database Migration

### Manual Application
If you cannot use Supabase CLI, apply the database changes manually by running the SQL commands in `database-updates.sql`:

1. Connect to your Supabase database
2. Run the SQL commands from `database-updates.sql`
3. Verify the changes are applied correctly

### Using Supabase CLI
```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the changes
npx supabase db push
```

## New Features

### 1. Transaction Time Tracking
- All transactions now include a time field
- Transactions are sorted by date and time
- Time is displayed in the customer detail page

### 2. Refund System
- Users can specify refund amounts for transactions
- Refund notes provide context for refunds
- Net amount calculation (original amount - refund)
- Refund information is displayed in transaction history

### 3. Enhanced Transaction Management
- Edit existing transactions
- Delete transactions with confirmation
- Real-time balance updates
- Improved transaction display with refund details

### 4. Updated Reports
- Reports now show the same stats as the dashboard
- Consistent calculation logic across the application
- Better user experience with familiar metrics

## TypeScript Types
The types have been updated in `src/integrations/supabase/types.ts` to include:
- `time: string | null`
- `refund_amount: number | null`
- `refund_note: string | null`

## Testing
After applying the database changes:
1. Test creating new transactions with time and refund fields
2. Test editing existing transactions
3. Test deleting transactions
4. Verify balance calculations are correct
5. Check that reports display the correct stats

## Rollback
If you need to rollback these changes:
1. Drop the new columns from the transactions table
2. Revert the trigger function to the original version
3. Update the application code to remove the new features
4. Revert the type definitions

## Notes
- Existing transactions will have their time set to the current time
- Refund amounts default to 0 for existing transactions
- The trigger function now handles INSERT, DELETE, and UPDATE operations
- All changes are backward compatible with existing data
