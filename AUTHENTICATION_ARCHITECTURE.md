# Authentication Architecture - Next.js Best Practices

## Overview

This habit tracker implements authentication following Next.js best practices from the latest guidelines, focusing on security, performance, and maintainability.

## Key Principles

### 1. **Middleware-First Protection**
- All route protection happens in `middleware.ts`
- Clean separation of protected vs public routes
- Single source of truth for authentication rules

### 2. **Data Access Layer (DAL) Pattern**
- ALL database operations go through DAL functions
- Every DAL function includes authentication checks
- Authorization checks for resource ownership

### 3. **Server Actions with Validation**
- Input validation using Zod schemas
- Delegated to DAL for database operations
- Proper error handling and user feedback

### 4. **Optimized Client Components**
- SessionProvider isolated to prevent affecting static rendering
- Client-only user info components
- Public pages remain statically rendered

## Architecture Components

### Middleware (`/middleware.ts`)
```typescript
// Protects routes at the edge
- /dashboard/* (all dashboard routes)
- /api/habits/* (habit operations)
- /api/entries/* (entry operations)
```

### Data Access Layer (`/lib/dal/`)
```
base.ts         - Authentication utilities
habits.ts       - Habit CRUD with auth checks
entries.ts      - Entry CRUD with ownership verification
```

**Critical Security Features:**
- `requireAuth()` - Verifies user is logged in
- `verifyOwnership()` - Ensures user owns the resource
- `requireProPlan()` - Checks subscription status

### Server Actions (`/app/actions/`)
```
habits.ts       - Create, update, delete habits
entries.ts      - Log, update, delete entries
```

**Features:**
- Zod validation for all inputs
- Delegates to DAL (never direct DB access)
- Returns typed errors for UI feedback

### Client Components
```
/components/providers/auth-provider.tsx  - Client-only SessionProvider
/components/user-info.tsx               - Client-side user display
```

## Security Best Practices Implemented

### ✅ Authentication Checks
- Middleware protects routes before they load
- DAL functions verify auth before ANY database operation
- Server actions validate auth through DAL

### ✅ Authorization Checks
- Ownership verification for edit/delete operations
- User can only access their own data
- Plan-based feature restrictions

### ✅ Input Validation
- Zod schemas for all server actions
- Type-safe form data parsing
- Sanitized user inputs

### ✅ Error Handling
- Typed error classes (UnauthorizedError, ForbiddenError)
- Consistent error messages
- No sensitive data in error responses

## Performance Optimizations

### Static Rendering Preserved
- Public pages (/, /pricing, etc.) remain static
- SessionProvider doesn't affect SSR
- Client components for user info

### Efficient Data Access
- Single authentication check per request
- Optimized Prisma queries
- Proper caching strategies

## Common Pitfalls Avoided

### ❌ Authentication in Layouts
**Problem:** Layouts don't re-render on navigation
**Solution:** Use middleware for route protection

### ❌ Missing Authorization Checks
**Problem:** User could edit/delete others' data
**Solution:** `verifyOwnership()` in all DAL functions

### ❌ Direct Database Access
**Problem:** Scattered auth checks, easy to miss
**Solution:** All DB access through DAL with built-in auth

### ❌ SessionProvider in Root
**Problem:** Makes all pages dynamically rendered
**Solution:** Client-only provider, minimal impact

## Usage Examples

### Creating a Habit (Server Action)
```typescript
// In a form component
<form action={createHabitAction}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

Flow:
1. Form submission → Server Action
2. Server Action validates input with Zod
3. Calls DAL function `createHabit()`
4. DAL verifies authentication
5. DAL checks user's plan limits
6. Creates habit in database
7. Returns success/error to UI

### Editing an Entry (Authorization Flow)
```typescript
// Server Action calls DAL
await updateEntry(entryId, newValue)
```

Flow:
1. DAL function `updateEntry()` called
2. Verify user is authenticated
3. Fetch entry from database
4. **Verify user owns the habit** (critical!)
5. Update entry if authorized
6. Return error if unauthorized

## Testing Authentication

### Test Users
- Fast login: `albinht@gmail.com` / `password123`
- Regular: `test@example.com` / `testpassword`

### Test Scenarios
1. **Protected Routes** - Try accessing /dashboard when logged out
2. **API Protection** - Call API routes without auth token
3. **Ownership** - Try editing another user's habit (should fail)
4. **Plan Limits** - Create habits as free user (max 3)

## Maintenance Guidelines

### Adding New Protected Routes
1. Add route pattern to middleware `protectedPaths`
2. Create DAL function with `requireAuth()`
3. Create server action with validation

### Adding New Features
1. Always use DAL pattern for database access
2. Include ownership checks for user-specific data
3. Add plan-based restrictions where appropriate

## Security Checklist

- [ ] All routes protected in middleware
- [ ] DAL functions include auth checks
- [ ] Edit/delete operations verify ownership
- [ ] Server actions validate input
- [ ] Client components don't expose sensitive data
- [ ] Error messages don't leak information
- [ ] Plan limits enforced
- [ ] Rate limiting on sensitive operations

## Conclusion

This architecture provides defense-in-depth security while maintaining excellent performance and developer experience. The DAL pattern ensures consistent authentication across the application, while middleware provides efficient route protection.