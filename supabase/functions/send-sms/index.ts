const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSMSRequest {
  to: string;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message }: SendSMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Twilio configuration is incomplete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the request to Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);

    // Create Basic Auth header
    const auth = btoa(`${accountSid}:${authToken}`);

    console.log(`Sending SMS to ${to}: ${message.substring(0, 50)}...`);

    // Send SMS via Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await twilioResponse.text();
    console.log('Twilio response:', responseText);

    if (!twilioResponse.ok) {
      console.error('Twilio error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS', 
          details: responseText 
        }),
        { status: twilioResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioData = JSON.parse(responseText);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioData.sid,
        status: twilioData.status 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
