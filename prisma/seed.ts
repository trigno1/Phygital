import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NFT data...");

  const nfts = [
    {
      id: "test",
      name: "Test NFT",
      description: "Just a sample NFT",
      image: "https://placekitten.com/400/400",
      minted: false,
    },
    {
      id: "cm2u3mgoz0008jap9x0xbxnjw",
      name: "Red Hexagon",
      description: "A red hexagon NFT from the Shapes Collection",
      image: "ipfs://QmPL8z4axPydaRK9wq3Pso2z5gfnDVcgTjf6yx88v3amr2/red_hexagon.png",
      attributes: { color: "Red", shape: "Hexagon", collection: "Shapes" },
    },
    {
      id: "cm2u3mgp1000njap93bmmon1q",
      name: "Red Star",
      description: "A red star NFT from the Shapes Collection",
      image: "ipfs://QmPL8z4axPydaRK9wq3Pso2z5gfnDVcgTjf6yx88v3amr2/red_star.png",
      attributes: { color: "Red", shape: "Star", collection: "Shapes" },
    },
    {
      id: "cm2u3mgp1000qjap9li2baa6d",
      name: "Green Triangle",
      description: "A green triangle NFT from the Shapes Collection",
      image: "ipfs://QmPL8z4axPydaRK9wq3Pso2z5gfnDVcgTjf6yx88v3amr2/green_triangle.png",
      attributes: { color: "Green", shape: "Triangle", collection: "Shapes" },
    },
    {
      id: "cm2u3mgp0000kjap9a5s5g3yg",
      name: "Blue Star",
      description: "A blue star NFT from the Shapes Collection",
      image: "ipfs://QmPL8z4axPydaRK9wq3Pso2z5gfnDVcgTjf6yx88v3amr2/blue_star.png",
      attributes: { color: "Blue", shape: "Star", collection: "Shapes" },
    },
  ];

  await prisma.nFT.createMany({
    data: nfts.map((nft) => ({
      id: nft.id,
      name: nft.name,
      description: nft.description,
      image: nft.image,
      attributes: nft.attributes,
      minted: false,
    })),
    skipDuplicates: true,
  });

  console.log("✅ NFT data seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Seed error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
