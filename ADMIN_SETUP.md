# Admin Access Configuration

## Adding Admin Wallet Addresses

To grant admin access to wallet addresses, edit `src/config/admins.ts`:

```typescript
export const ADMIN_ADDRESSES = [
  // Add wallet addresses in lowercase
  '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
  '0x853d955acef822db058eb8505911ed77f175b99e',
  // Add more addresses as needed
];
```

## Security Features

✅ **Wallet-Based Authentication** - Only permitted wallet addresses can access admin panel
✅ **Automatic Protection** - All admin routes are protected by default
✅ **Visual Feedback** - Non-admin users see clear access denied messages
✅ **Hidden Admin Button** - Admin button only shows for authorized wallets

## How It Works

1. User connects their wallet
2. System checks connected address against `ADMIN_ADDRESSES` list
3. If address matches, admin panel access is granted
4. If not, user sees "Access Denied" screen

## Testing Admin Access

1. Copy your wallet address from MetaMask or other wallet
2. Convert to lowercase (important!)
3. Add to `ADMIN_ADDRESSES` array in `src/config/admins.ts`
4. Connect your wallet
5. Admin button should appear in header

## Important Notes

⚠️ **Always use lowercase addresses** - The comparison is case-sensitive after conversion
⚠️ **Commit carefully** - Don't commit your personal wallet address to public repos
⚠️ **Use environment variables** - For production, consider loading from secure config

## Production Recommendations

For production deployments:
- Store admin addresses in secure environment variables
- Use a backend service to validate admin status
- Implement multi-signature admin controls
- Add audit logging for admin actions
- Consider time-based access tokens
