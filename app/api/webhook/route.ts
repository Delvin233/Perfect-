import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log webhook for debugging
    console.log("Webhook received:", {
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: new Date().toISOString(),
    });

    // Handle different webhook types
    const { type, data } = body;

    switch (type) {
      case "miniapp.added":
        // User added the mini app
        console.log("Mini app added by user:", data.user);
        // Could track this in analytics or database
        break;

      case "miniapp.removed":
        // User removed the mini app
        console.log("Mini app removed by user:", data.user);
        break;

      case "notification.clicked":
        // User clicked on a notification
        console.log("Notification clicked:", data);
        break;

      case "cast.created":
        // User shared the app
        console.log("Cast created with app:", data);
        break;

      default:
        console.log("Unknown webhook type:", type);
    }

    // Always return success to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return error but still acknowledge receipt
    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("challenge");

  if (challenge) {
    // Return challenge for webhook verification
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({
    message: "Perfect? Mini App Webhook Endpoint",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
