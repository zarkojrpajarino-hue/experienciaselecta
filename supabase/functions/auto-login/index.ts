import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find customer by normalized email
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    let hasCompletedOrder = false;

    if (customer) {
      // Check for at least one completed order
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('status', 'completed')
        .limit(1);

      if (ordersError) throw ordersError;
      hasCompletedOrder = !!(orders && orders.length > 0);
    }

    // Also check if user has received gifts
    const { data: gifts, error: giftsError } = await supabase
      .from('pending_gifts')
      .select('id')
      .eq('recipient_email', normalizedEmail)
      .limit(1);

    if (giftsError) throw giftsError;

    const hasReceivedGift = !!(gifts && gifts.length > 0);
    const hasAccess = hasCompletedOrder || hasReceivedGift;

    console.log(
      `Auto-login check for ${normalizedEmail}: ${hasAccess} (order: ${hasCompletedOrder}, gift: ${hasReceivedGift})`
    );

    if (!hasAccess) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No purchases or gifts found',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User has access - create or get auth user and generate session
    console.log(`User has access, generating session for ${normalizedEmail}`);
    
    // Generate a temporary password for this session
    const tempPassword = crypto.randomUUID();
    
    // First, check if user exists in auth
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser?.users.find(u => u.email === normalizedEmail);

    console.log(`User ${user ? 'exists' : 'does not exist'} in auth`);

    let userId: string;

    if (!user) {
      // Create new user with password and auto-confirmed email
      console.log(`Creating new user for ${normalizedEmail}`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { auto_created: true }
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Error creating user session',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = newUser.user.id;
      console.log(`User created with ID: ${userId}`);
    } else {
      // Update existing user with new temp password
      userId = user.id;
      console.log(`Updating password for existing user with ID: ${userId}`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
      );
      
      if (updateError) {
        console.error('Error updating user password:', updateError);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Error updating user',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Now sign in with the temporary password to get real session tokens
    console.log(`Signing in to get session tokens for ${normalizedEmail}`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: tempPassword,
    });

    if (signInError || !signInData.session) {
      console.error('Error signing in:', signInError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error generating session',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Session tokens generated successfully');

    // Get purchase data for welcome message
    const { data: purchaseData } = await supabase
      .from('purchases')
      .select('user_name, basket_name, basket_category')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        message: hasCompletedOrder ? 'Customer has purchased' : 'Customer has received a gift',
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        },
        purchaseData: purchaseData || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});