const fs = require('fs');
const path = require('path');

const vaultDir = 'D:\\xoto_vault';
const gridDir = 'D:\\xoto_grid';
const sourceDir = 'D:\\xoto\\XOTO_FRONTEND_1_20_2026\\xoto_frontend_20jan';

// Exclude these when copying from Vault to avoid loops or conflicts
const vaultExclude = [
  'node_modules',
  '.git',
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'setup-grid-project.js',
  'copy-grid.js',
  'copy-vault-to-grid.js'
];

function copyRecursive(src, dest, exclude = []) {
  if (!fs.existsSync(src)) {
    console.error(`Source path does not exist: ${src}`);
    return;
  }

  const baseName = path.basename(src);
  if (exclude.includes(baseName)) {
    return;
  }

  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry), exclude);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('--- Step 1: Copying Vault Base Template to D:\\xoto_grid ---');
const vaultFiles = [
  'src',
  'public',
  'tsconfig.json',
  'tsconfig.node.json',
  'postcss.config.js',
  'tailwind.config.js',
  'index.html',
  '.env',
  '.env.production',
  '.gitignore'
];

for (const file of vaultFiles) {
  const srcPath = path.join(vaultDir, file);
  const destPath = path.join(gridDir, file);
  console.log(`Copying template: ${file}...`);
  copyRecursive(srcPath, destPath, vaultExclude);
}

console.log('\n--- Step 2: Copying Grid Source Files to D:\\xoto_grid ---');
const gridFolders = [
  { src: 'src/components/Grid', dest: 'src/components/Grid' },
  { src: 'src/components/GridReferralPartner', dest: 'src/components/GridReferralPartner' },
  { src: 'src/components/ecommerce', dest: 'src/components/ecommerce' },
  { src: 'src/components/CMS', dest: 'src/components/CMS' },
  { src: 'src/component', dest: 'src/component' },
  { src: 'src/manageApi', dest: 'src/manageApi' }
];

for (const folder of gridFolders) {
  const fullSrc = path.join(sourceDir, folder.src);
  const fullDest = path.join(gridDir, folder.dest);
  console.log(`Copying component: ${folder.src}...`);
  copyRecursive(fullSrc, fullDest);
}

console.log('\n--- Step 3: Running Post-Copy Configurations ---');

// 1. Modify package.json name to "xoto-grid"
const pkgPath = path.join(gridDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = 'xoto-grid';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  console.log('Updated package.json name to xoto-grid');
}

// 2. Modify custom.apiservice.js token references and baseURL dynamically
const apiServicePath = path.join(gridDir, 'src/manageApi/utils/custom.apiservice.js');
if (fs.existsSync(apiServicePath)) {
  let content = fs.readFileSync(apiServicePath, 'utf8');
  
  content = content.replace(
    /const API_BASE_URL = 'https:\/\/xoto\.ae\/api\/';/g,
    "const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/` : 'https://xoto.ae/api/';"
  );
  
  content = content.replace(
    /localStorage\.getItem\('token'\)/g,
    "(localStorage.getItem('vault_token') || localStorage.getItem('token'))"
  );
  
  fs.writeFileSync(apiServicePath, content, 'utf8');
  console.log('Updated custom.apiservice.js token references and base API URL dynamically!');
}

// 3. Rebrand VaultLogin.tsx for Grid specific branding and roles
const loginPagePath = path.join(gridDir, 'src/pages/login/VaultLogin.tsx');
if (fs.existsSync(loginPagePath)) {
  let content = fs.readFileSync(loginPagePath, 'utf8');
  
  // Make rolesList default to GRID_ROLES on the /login screen
  content = content.replace(
    /const rolesList = isGridMode \? GRID_ROLES : VAULT_ROLES;/g,
    "const rolesList = GRID_ROLES;"
  );

  // Change heading branding text
  content = content.replace(/Smarter Mortgage/g, "Smarter Property");
  content = content.replace(/Your complete platform for mortgage processing, lead tracking, and multi-role team collaboration\./g, "Your complete platform for property listings, lead tracking, deals, and commission management.");
  content = content.replace(/Xoto Vault/g, "Xoto Grid");
  content = content.replace(/Secure login · Xoto Vault v1.0/g, "Secure login · Xoto Grid v1.0");

  fs.writeFileSync(loginPagePath, content, 'utf8');
  console.log('Customized VaultLogin.tsx for Xoto Grid portal branding.');
}

// 4. Modify index.html title
const indexPath = path.join(gridDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  content = content.replace(/<title>.*<\/title>/g, "<title>Xoto Grid</title>");
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Updated index.html title to Xoto Grid.');
}

// 5. Modify Sidebar.tsx branding name
const sidebarPath = path.join(gridDir, 'src/components/layout/Sidebar.tsx');
if (fs.existsSync(sidebarPath)) {
  let content = fs.readFileSync(sidebarPath, 'utf8');
  content = content.replace(/alt="Xoto Vault"/g, 'alt="Xoto Grid"');
  fs.writeFileSync(sidebarPath, content, 'utf8');
  console.log('Updated Sidebar.tsx branding to Xoto Grid.');
}

console.log('\nGrid Setup and Migration Complete!');
console.log('Now go to D:\\xoto_grid and run "npm install" and "npm run dev".');
