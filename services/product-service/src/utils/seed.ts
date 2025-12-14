import { prisma } from "@yashas40/db"
import { faker } from "@faker-js/faker";


const CATEGORIES = [
  "Electronics",
  "Footwear",
  "Clothing",
  "Books",
  "Home Appliances"
];

function generateSKU(
  category: string,
  name: string
) {
  const categoryCode = category.slice(0, 3).toUpperCase();

  const nameCode = name
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();

  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${categoryCode}-${nameCode}-${randomCode}`;
}

function generateProducts(count: number) {
  const products = [];
  const inventory = [];

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES);
    const name = faker.commerce.productName()
    const sku = generateSKU(category, name)
    products.push({
      name,
      description: faker.commerce.productDescription(),
      sku,
      price: Number(faker.commerce.price({ min: 500, max: 150000 })),
      category,
    });
  }

  return products;
}

async function main() {
  const PRODUCT_COUNT = faker.number.int({ min: 15, max: 20 });

  const products = generateProducts(PRODUCT_COUNT);

await prisma.$transaction(async (tx) => {
  for (const product of products) {
    await tx.product.create({
      data: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        category: product.category,
        inventory: {
          create: { totalQuantity: 100 },
        },
      },
    })
  }
},{
    maxWait: 10000,
    timeout: 50000
})
  console.log(`Seeded ${PRODUCT_COUNT} products`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed", error);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


