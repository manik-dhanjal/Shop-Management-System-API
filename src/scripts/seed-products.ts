import axios from 'axios';

async function addInventoryToPipeProducts() {
  const shopId = '677d483d2cdd1493fbc51fc4'; // Replace with the actual shop ID
  const baseUrl = `http://localhost:3001/api/v1/shop/${shopId}/product`; // Replace with your API base URL
  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblR5cGUiOiJhY2Nlc3MtdG9rZW4iLCJ1c2VySWQiOiI2NzdkNDgxMjJjZGQxNDkzZmJjNTFmYmUiLCJzaG9wc01ldGEiOlt7InNob3AiOiI2NzdkNDgzZDJjZGQxNDkzZmJjNTFmYzQiLCJyb2xlcyI6WyJhZG1pbiJdfV0sImVtYWlsIjoibWFuaWtkaGFuamFsMjE3QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6Ik1hbmlrIiwibGFzdE5hbWUiOiJEaGFuamFsIiwiaWF0IjoxNzQzNTQ1MTE2LCJleHAiOjE3NDM1NDU0MTZ9.ceGheZvQGPF-4JxicqJG6a0BRAjaRTrJBNqRo0nQsHk';
  try {
    // Fetch all products
    const response = await axios.post(
      `${baseUrl}/paginated`,
      {
        limit: 1000,
        skip: 0,
        page: 1,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    const products = response.data.docs;

    console.log(products);
    console.log(`Found ${products.length} products with the keyword .`);

    // Add random inventory to each pipe product
    for (const product of products) {
      const randomInventories = [
        {
          purchasePrice: Math.floor(Math.random() * 100) + 50, // Random purchase price between 50 and 150
          sellPrice: Math.floor(Math.random() * 100) + 100, // Random sell price between 100 and 200
          currency: 'USD',
          supplier: '67ec62cec2444f865182f6f8', // Replace with actual supplier ID 1
          quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
          unit: 'piece',
          invoiceUrl: `https://example.com/invoice-${product.sku}-supplier1.pdf`, // Generate a random invoice URL
        },
        {
          purchasePrice: Math.floor(Math.random() * 100) + 60, // Random purchase price between 60 and 160
          sellPrice: Math.floor(Math.random() * 100) + 120, // Random sell price between 120 and 220
          currency: 'USD',
          supplier: '67ec62cec2444f865182f6f8', // Replace with actual supplier ID 2
          quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
          unit: 'piece',
          invoiceUrl: `https://example.com/invoice-${product.sku}-supplier2.pdf`, // Generate a random invoice URL
        },
      ];

      try {
        const updateResponse = await axios.patch(
          `${baseUrl}/${product._id}`,
          { inventory: randomInventories },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        console.log(`Inventory added successfully to product: ${product.name}`);
      } catch (error) {
        console.error(
          `Failed to update product ${product.name}:`,
          error.response?.data || error.message,
        );
      }
    }
  } catch (error) {
    console.error(
      'Failed to fetch products:',
      error.response?.data || error.message,
    );
  }
}

addInventoryToPipeProducts().catch((error) => {
  console.error('Error adding inventory to pipe products:', error.message);
});
