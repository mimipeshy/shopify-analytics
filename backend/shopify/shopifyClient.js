import axios from "axios";

export const shopifyRequest = async({shop, accessToken,endpoint})=>{
    const url = `https://${shop}/admin/api/2023-10/${endpoint}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "X-Shopify-Access-Token": accessToken,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error making Shopify request:", error);
        throw error;
    }       
}