import prisma from "../lib/prisma.js";

async function main() {
  const images = await prisma.projectImage.findMany();
  let updatedCount = 0;

  for (const img of images) {
    const isVideo =
      img.url.includes("/video/upload/") ||
      Boolean(img.url.match(/\.(mp4|mov|webm|ogv|m4v)(\?.*)?$/i));

    if (isVideo && img.mediaType !== "VIDEO") {
      await prisma.projectImage.update({
        where: { id: img.id },
        data: { mediaType: "VIDEO" },
      });
      console.log(`Updated ProjectImage [${img.id}] ("${img.altText}") mediaType -> VIDEO`);
      updatedCount++;
    }
  }

  console.log(`Finished updating DB. Total video mediaType records updated: ${updatedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
