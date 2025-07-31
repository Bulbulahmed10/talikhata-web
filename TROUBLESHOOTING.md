# Troubleshooting Guide for TallyKhata

## 🚨 Critical Issues & Solutions

### 1. Website Not Showing on Reload (Service Worker Issue)

**Problem**: Service worker is caching Vite dev server assets, causing blank page on reload.

**Solution**: ✅ **FIXED** - Updated `public/service-worker.js` to exclude development assets:
- Added checks to skip `@vite/client`, `/node_modules/`, `?t=` parameters
- Added check for localhost development URLs

**Test**: Reload the website - it should now work properly.

### 2. Photo Upload Not Working

**Problem**: Cannot upload photos to customer or profile forms.

**Solution**: Follow these steps:

1. **Create Storage Buckets** (if not done):
   - Go to Supabase Dashboard → Storage
   - Create bucket: `profile-photos` (Public, 5MB limit, image/*)
   - Create bucket: `customer-photos` (Public, 5MB limit, image/*)

2. **Run Storage Policies**:
   - Copy content from `storage-setup.sql`
   - Run in Supabase SQL Editor

3. **Test Upload**:
   - Try uploading a photo in User Profile or Customer Form
   - Check browser console for errors

### 3. Profile Updates Not Syncing Across Browsers

**Problem**: Profile changes on mobile don't appear on PC browser.

**Solution**: 
1. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or clear cache
2. **Check Database**: Ensure profile data is actually saved
3. **Force Refresh**: The app should auto-refresh, but manual refresh may be needed

### 4. Customer Fields Not Showing

**Problem**: Only name and phone fields visible when adding customer.

**Solution**: ✅ **FIXED** - Updated `src/pages/Customers.tsx`:
- Replaced old form with `CustomerForm` component
- Added all new fields (email, address, photo, description)
- Updated customer cards to show new fields

**Test**: Add a new customer - you should now see all fields.

### 5. OAuth Redirect Issues on Localhost

**Problem**: Google login not redirecting properly on localhost.

**Solution**:

1. **Check Supabase OAuth Settings**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Add `http://localhost:8080` to Site URL
   - Add `http://localhost:8080/auth/callback` to Redirect URLs

2. **Check Google Console**:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Add `http://localhost:8080` to Authorized JavaScript origins
   - Add `http://localhost:8080/auth/callback` to Authorized redirect URIs

3. **Test OAuth**:
   - Try Google login again
   - Check browser console for errors

### 6. Database Migration Issues

**Problem**: New fields not appearing in database.

**Solution**:
1. **Run Database Migration**:
   - Copy content from `database-setup.sql`
   - Run in Supabase SQL Editor
   - Check for any errors

2. **Verify Migration**:
   - Go to Supabase Dashboard → Table Editor
   - Check if new columns exist in `profiles`, `customers`, `transactions` tables

## 🔧 Quick Fix Commands

### Clear Service Worker Cache
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
location.reload();
```

### Force Clear All Caches
```javascript
// Run in browser console
caches.keys().then(function(names) {
  for (let name of names) {
    caches.delete(name);
  }
});
location.reload();
```

## 📱 Mobile Testing Checklist

### PWA Installation
- [ ] Install button appears on mobile
- [ ] App installs successfully
- [ ] App works offline
- [ ] App icon appears on home screen

### Photo Upload
- [ ] Can select photo from gallery
- [ ] Can take photo with camera
- [ ] Photo uploads successfully
- [ ] Photo displays correctly

### Responsive Design
- [ ] All forms work on mobile
- [ ] Navigation works properly
- [ ] Text is readable
- [ ] Buttons are tappable

## 🐛 Common Error Messages & Solutions

### "Service Worker: Serving from cache"
**Cause**: Service worker caching dev assets
**Solution**: ✅ Fixed - Updated service worker

### "Cannot find module 'lucide-react'"
**Cause**: Missing import
**Solution**: ✅ Fixed - Removed Google icon import

### "column 'full_name' does not exist"
**Cause**: Database migration not run
**Solution**: Run `database-setup.sql` in Supabase

### "Storage bucket not found"
**Cause**: Storage buckets not created
**Solution**: Create `profile-photos` and `customer-photos` buckets

### "OAuth redirect error"
**Cause**: Incorrect redirect URLs
**Solution**: Update Supabase and Google Console settings

## 🚀 Development Server Issues

### Hot Reload Not Working
1. Stop dev server: `Ctrl+C`
2. Clear cache: `npm run build && npm run dev`
3. Hard refresh browser: `Ctrl+F5`

### Service Worker Conflicts
1. Open DevTools → Application → Service Workers
2. Click "Unregister" for existing service workers
3. Reload page

## 📊 Testing Checklist

### Core Features
- [ ] User registration/login
- [ ] Google OAuth login
- [ ] Password reset
- [ ] Dark mode toggle
- [ ] Customer management
- [ ] Transaction management
- [ ] Photo uploads
- [ ] Profile management

### PWA Features
- [ ] Install prompt appears
- [ ] App installs on mobile
- [ ] Works offline
- [ ] Service worker functions

### Database Features
- [ ] All new fields save correctly
- [ ] Photo URLs store properly
- [ ] Profile updates persist
- [ ] Customer data syncs

## 🆘 Still Having Issues?

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API calls are successful
3. **Check Supabase Logs**: Look for database errors
4. **Clear All Data**: 
   - Clear browser cache
   - Unregister service workers
   - Restart development server

## 📞 Support

If issues persist:
1. Check browser console for specific error messages
2. Verify all setup steps are completed
3. Test on different browsers/devices
4. Check Supabase dashboard for any errors 