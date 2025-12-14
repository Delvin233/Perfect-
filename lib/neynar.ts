// Neynar API integration for Farcaster user data
interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio?: string;
  verified_addresses?: {
    eth_addresses: string[];
  };
}

interface NeynarResponse {
  users: NeynarUser[];
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = "https://api.neynar.com/v2";

export async function getFarcasterUserByFid(
  fid: number,
): Promise<NeynarUser | null> {
  if (!NEYNAR_API_KEY) {
    console.warn("NEYNAR_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data: NeynarResponse = await response.json();
    return data.users[0] || null;
  } catch (error) {
    console.error("Failed to fetch Farcaster user:", error);
    return null;
  }
}

export async function getFarcasterUserByAddress(
  address: string,
): Promise<NeynarUser | null> {
  if (!NEYNAR_API_KEY) {
    console.warn("NEYNAR_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data: Record<string, NeynarUser[]> = await response.json();
    // Neynar returns users by address, get the first user for this address
    const addressData = data[address.toLowerCase()];
    return addressData && addressData.length > 0 ? addressData[0] : null;
  } catch (error) {
    console.error("Failed to fetch Farcaster user by address:", error);
    return null;
  }
}

export async function getFarcasterUsersBulk(
  fids: number[],
): Promise<NeynarUser[]> {
  if (!NEYNAR_API_KEY || fids.length === 0) {
    return [];
  }

  try {
    // Neynar supports up to 100 FIDs per request
    const chunks = [];
    for (let i = 0; i < fids.length; i += 100) {
      chunks.push(fids.slice(i, i + 100));
    }

    const allUsers: NeynarUser[] = [];

    for (const chunk of chunks) {
      const response = await fetch(
        `${NEYNAR_BASE_URL}/farcaster/user/bulk?fids=${chunk.join(",")}`,
        {
          headers: {
            accept: "application/json",
            api_key: NEYNAR_API_KEY,
          },
        },
      );

      if (response.ok) {
        const data: NeynarResponse = await response.json();
        allUsers.push(...data.users);
      }
    }

    return allUsers;
  } catch (error) {
    console.error("Failed to fetch Farcaster users bulk:", error);
    return [];
  }
}
