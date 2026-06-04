const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'frontend');
const targetDir = path.join(__dirname, '..', 'public');

async function copyRecursive(source, target) {
  await fs.promises.mkdir(target, { recursive: true });
  const entries = await fs.promises.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(sourcePath, targetPath);
    } else {
      await fs.promises.copyFile(sourcePath, targetPath);
    }
  }
}

(async () => {
  try {
    await fs.promises.rm(targetDir, { recursive: true, force: true });
    await copyRecursive(sourceDir, targetDir);
    console.log('Frontend copiado a public/ para despliegue.');
  } catch (error) {
    console.error('Error copiando frontend a public/:', error);
    process.exitCode = 1;
  }
})();
