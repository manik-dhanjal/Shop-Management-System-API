import { faker } from '@faker-js/faker';
import axios, { AxiosError } from 'axios';

async function addCustomers() {
  const shopId = '677d483d2cdd1493fbc51fc4'; // target shop
  const baseUrl = `http://localhost:3000/api/v1/shop/${shopId}`;
  // NOTE: replace this token with a valid, non-expired one before running
  const token =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblR5cGUiOiJhY2Nlc3MtdG9rZW4iLCJ1c2VySWQiOiI2NzdkNDgxMjJjZGQxNDkzZmJjNTFmYmUiLCJzaG9wc01ldGEiOlt7InNob3AiOiI2NzdkNDgzZDJjZGQxNDkzZmJjNTFmYzQiLCJyb2xlcyI6WyJhZG1pbiJdfSx7InNob3AiOiI2N2VlZWQyNGJiNTBmMWFkYjFiYWM4NGEiLCJyb2xlcyI6WyJhZG1pbiJdfV0sImVtYWlsIjoibWFuaWtkaGFuamFsMjE3QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6Ik1hbmlrIiwibGFzdE5hbWUiOiJEaGFuamFsIiwiaWF0IjoxNzcyMTY3OTAzLCJleHAiOjE3NzIxNjgyMDN9.8Dtzs1SfoCK4YyCP-gPz0QqRJnZQIPtnXBRzV77xPTc';

  try {
    for (let i = 0; i < 50; i++) {
      const payload = {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        shop: shopId,
        email: faker.internet.email(),
        billingAddress: {
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          pinCode: faker.location.zipCode(),
        },
      };

      const response = await axios.post(`${baseUrl}/customer`, payload, {
        headers: { Authorization: token },
      });
      console.log(`Created customer: ${response.data._id} - ${payload.name}`);
    }
  } catch (err) {
    console.error(
      'Error creating customers:',
      (err as AxiosError).response?.data || (err as AxiosError).message,
    );
  }
}

addCustomers().catch((e) => console.error(e));
