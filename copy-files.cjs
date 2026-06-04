const fs = require('fs');
const path = require('path');

const vaultDir = 'D:\\xoto_vault';
const gridDir = 'D:\\xoto_grid';
const sourceDir = 'D:\\xoto\\XOTO_FRONTEND_1_20_2026\\xoto_frontend_20jan';

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    return;
  }
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else fs.copyFileSync(src, dest);
}

console.log('Step 1: Copy base Vault template...');
['src','public','tsconfig.json','tsconfig.node.json','postcss.config.js','tailwind.config.js','index.html','.env','.env.production','.gitignore'].forEach(f => copyRecursive(path.join(vaultDir, f), path.join(gridDir, f)));
console.log('Step 1 complete!');

console.log('Step 2: Copy Grid-specific components from source...');
[
  'src/components/Grid', 
  'src/components/GridReferralPartner', 
  'src/components/ecommerce', 
  'src/components/CMS', 
  'src/component',
  'src/manageApi'
].forEach(folder => copyRecursive(path.join(sourceDir, folder), path.join(gridDir, folder)));
console.log('Step 2 complete!');

console.log('Step 3: Configure Grid branding and roles...');
// Update index.html
const indexPath = path.join(gridDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  content = content.replace(/<title>.*<\/title>/, '<title>Xoto Grid</title>');
  fs.writeFileSync(indexPath, content, 'utf8');
}

// Update login page
const loginPath = path.join(gridDir, 'src/pages/login/VaultLogin.tsx');
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf8');
  content = content.replace(/const rolesList = isGridMode \? GRID_ROLES : VAULT_ROLES;/, "const rolesList = GRID_ROLES;");
  content = content.replace(/Smarter Mortgage/g, 'Smarter Property');
  content = content.replace(/Xoto Vault/g, 'Xoto Grid');
  content = content.replace(
    /const GRID_ROLES = \[.*?\];/s,
    `const GRID_ROLES = [
      { code: -25, name: "Grid Admin", path: "grid-admin", description: "Full platform management" },
      { code: 24, name: "Grid Advisor", path: "grid-advisor", description: "Advisor role" },
      { code: 17, name: "Grid Partner", path: "grid-partner", description: "Partner role" },
      { code: 16, name: "Referral Partner", path: "referral-partner", description: "Referral Partner" },
      { code: 15, name: "Grid Agent", path: "grid-agent", description: "Agent role" },
      { code: 1, name: "Super Admin", path: "super-admin", description: "Super Admin" }
    ];`
  );
  fs.writeFileSync(loginPath, content, 'utf8');
}

console.log('Step 3 complete! All files copied and configured!');
console.log('Now run: cd D:\\xoto_grid && npm install && npm run dev');
