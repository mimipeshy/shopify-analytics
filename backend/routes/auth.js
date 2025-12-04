// backend/routes/auth.js
import express from "express";
import crypto from "crypto";
import axios from "axios";
import { getSupabaseClient } from "../supabase/client.js";

const router = express.Router();

/**
 * Verifies HMAC signature from Shopify OAuth request
 */
const verifyHmac = (query, secret) => {
  const { hmac, ...rest } = query;

  const message = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join("&");

  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  return generatedHmac === hmac;
};

/**
 * OAuth callback route
 */
router.get("/callback", async (req, res) => {
  const { shop, code, hmac } = req.query;

  // Step 1: Verify HMAC
  if (!verifyHmac(req.query, process.env.SHOPIFY_API_SECRET)) {
    console.warn(`⚠️ HMAC verification failed for shop: ${shop}`);
    return res.status(400).send("HMAC validation failed");
  }

  try {
    // Step 2: Exchange code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    });

    const accessToken = tokenResponse.data.access_token;

    // Step 3: Store shop and token in Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("stores")
      .upsert(
        { shop_domain: shop, access_token: accessToken },
        { onConflict: "shop_domain" }
      );

    if (error) {
      console.error("❌ Supabase upsert error:", error);
      return res.status(500).send("Failed to save shop token");
    }

    console.log(`✅ App installed successfully for shop: ${shop}`);
    res.status(200).send("App installed successfully");
  } catch (err) {
    console.error("❌ OAuth callback error:", err.response?.data || err.message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
