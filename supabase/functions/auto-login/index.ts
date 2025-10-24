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
    
    // First, check if user exists in auth
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser?.users.find(u => u.email === normalizedEmail);

    console.log(`User ${user ? 'exists' : 'does not exist'} in auth`);

    let userId: string;

    if (!user) {
      // Create new user with auto-confirmed email
      console.log(`Creating new user for ${normalizedEmail}`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
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
      userId = user.id;
      console.log(`Using existing user with ID: ${userId}`);
    }

    // Generate a magic link which contains the access tokens
    console.log(`Generating magic link for ${normalizedEmail}`);
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    });

    if (linkError || !linkData) {
      console.error('Error generating link:', linkError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error generating session tokens',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Magic link generated successfully');

    // Get purchase data for welcome message
    const { data: purchaseData } = await supabase
      .from('purchases')
      .select('user_name, basket_name, basket_category')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    console.log(`Session created for ${normalizedEmail}`);

    // Log linkData structure for debugging
    console.log('Link data properties:', JSON.stringify(linkData.properties));

    // Extract tokens - they come in the linkData properties directly
    const accessToken = linkData.properties.hashed_token;
    const refreshToken = linkData.properties.hashed_token; // For magic link, same token is used

    if (!accessToken) {
      console.error('Missing token in generated link');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error extracting session tokens',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: hasCompletedOrder ? 'Customer has purchased' : 'Customer has received a gift',
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
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