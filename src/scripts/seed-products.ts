import { faker } from '@faker-js/faker';
import axios from 'axios';

async function addInventoryToPipeProducts() {
  const shopId = '677d483d2cdd1493fbc51fc4'; // Replace with the actual shop ID
  const baseUrl = `http://localhost:3001/api/v1/shop/${shopId}`; // Replace with your API base URL
  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblR5cGUiOiJhY2Nlc3MtdG9rZW4iLCJ1c2VySWQiOiI2NzdkNDgxMjJjZGQxNDkzZmJjNTFmYmUiLCJzaG9wc01ldGEiOlt7InNob3AiOiI2NzdkNDgzZDJjZGQxNDkzZmJjNTFmYzQiLCJyb2xlcyI6WyJhZG1pbiJdfSx7InNob3AiOiI2N2VlZWQyNGJiNTBmMWFkYjFiYWM4NGEiLCJyb2xlcyI6WyJhZG1pbiJdfV0sImVtYWlsIjoibWFuaWtkaGFuamFsMjE3QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6Ik1hbmlrIiwibGFzdE5hbWUiOiJEaGFuamFsIiwiaWF0IjoxNzU5NzYwNDY0LCJleHAiOjE3NTk3NjA3NjR9.NCMVEfxIr8NAHOLjU98vOr-YxU0KGmKIC6JLA65TmfE';
  try {
    // Fetch all products
    const response = await axios.post(
      `${baseUrl}/product/paginated`,
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
      const inventoryToAdd = faker.number.int({ min: 2, max: 15 });
      for (let i = 0; i < inventoryToAdd; i++) {
        const currentQuantity = faker.number.int({ min: 1, max: 100 });
        const purchasePrice = faker.number.int({ min: 50, max: 200 });
        const updateResponse = await axios.post(
          `${baseUrl}/inventory`,
          {
            product: product._id,
            shop: shopId,
            purchasePrice: purchasePrice,
            sellPrice: purchasePrice + faker.number.int({ min: 10, max: 50 }),
            currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'INR']),
            supplier: '67ec62cec2444f865182f6f8',
            currentQuantity: currentQuantity,
            initialQuantity:
              currentQuantity +
              faker.number.int({
                min: 0,
                max: 100,
              }),
            unit: faker.helpers.arrayElement(['pcs', 'kg', 'liters']),
            invoiceUrl: faker.internet.url(),
            purchasedAt: faker.date.past(),
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        console.log(
          `Inventory added successfully to product: ${product.name} inventoryId: ${updateResponse.data._id}`,
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
