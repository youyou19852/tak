export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Missing code" });

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI
  });

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get access token", details: tokenData });
    }

    // Fetch user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
