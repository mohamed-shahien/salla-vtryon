const fs = require('fs');
const path = require('path');

const dir = 'src/components/ui';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/\"src\/components\/hooks\//g, '\"@/hooks/');
    content = content.replace(/\"src\/components\/lib\//g, '\"@/lib/');
    content = content.replace(/\"src\/components\/ui\//g, '\"@/components/ui/');
    content = content.replace(/\"src\/lib\//g, '\"@/lib/');
    content = content.replace(/\"src\/hooks\//g, '\"@/hooks/');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});
