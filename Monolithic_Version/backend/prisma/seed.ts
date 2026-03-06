import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.product.createMany({
        data: [
            { name: 'Laptop', description: 'High performance laptop', price: 999.99, stock: 10 },
            { name: 'Smartphone', description: 'Latest flagship smartphone', price: 699.99, stock: 50 },
            { name: 'Wireless Headphones', description: 'Noise cancelling headphones', price: 199.99, stock: 100 },
        ]
    });
    console.log('Seeded products');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
