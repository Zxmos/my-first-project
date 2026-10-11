# Supabase configuration notes for ERecPass

The Supabase backend already created for the ERecPass project should be used with this mobile client.

Project URL:
https://vqllkxewvxxnybunmtbc.supabase.co

Use the Supabase publishable client key in the client application when wiring the Supabase SDK. Do not add a secret/service_role key to the mobile app.

Recommended client architecture:

Mobile UI -> Supabase Auth -> PostgreSQL tables protected by RLS
                              -> Storage (if needed)
                              -> Edge Functions (server-side operations / AI)

Before demoing database features, test each operation with a normal authenticated user and confirm RLS prevents one user from reading another user's records.
