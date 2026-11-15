const fs = require('fs');
const path = require('path');

const BASE_DIR = '/Users/macbook/Desktop/HealthPath/IATRIC_wellnesss';
const DIRS_TO_SCAN = ['src', 'pages'];
const EXTENSIONS = ['.js', '.jsx', '.tsx', '.ts'];

let filesModified = 0;
let imagesConverted = 0;
const errors = [];

/**
 * Generate descriptive alt text from filename
 */
function generateAltText(originalAlt, srcPath) {
  if (originalAlt && originalAlt.trim() && originalAlt !== 'image' && originalAlt !== 'img' && originalAlt !== 'preview') {
    return originalAlt;
  }

  // Extract filename from src
  const filename = path.basename(srcPath).replace(/\.[^.]*$/, '');
  
  // Convert kebab-case/snake_case to Title Case
  const words = filename.split(/[-_]/).filter(w => w.length > 0);
  const titleCase = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  
  return titleCase || 'Image';
}

/**
 * Determine width and height based on image context
 */
function getImageDimensions(srcPath, filename) {
  // Hero/banner images
  if (filename.includes('hero') || filename.includes('banner') || filename.includes('cover')) {
    return { width: 1200, height: 600 };
  }
  
  // Thumbnails and avatars
  if (filename.includes('thumb') || filename.includes('avatar') || filename.includes('icon')) {
    return { width: 200, height: 200 };
  }
  
  // Doctor/team images
  if (filename.includes('doctor') || filename.includes('team') || filename.includes('staff')) {
    return { width: 300, height: 300 };
  }
  
  // Default
  return { width: 400, height: 300 };
}

/**
 * Convert img tag to Image component
 */
function convertImgTag(imgTag, fileContent) {
  // Extract attributes using regex
  const srcMatch = imgTag.match(/src=["']([^"']*)?["']/);
  const altMatch = imgTag.match(/alt=["']([^"']*)?["']/);
  const classMatch = imgTag.match(/className=["']([^"']*)?["']/);
  const styleMatch = imgTag.match(/style=\{([^}]+)\}/);
  const widthMatch = imgTag.match(/width=["'{]([^"'}]*)?["'}]/);
  const heightMatch = imgTag.match(/height=["'{]([^"'}]*)?["'}]/);
  
  let src = srcMatch ? srcMatch[1] : '';
  const alt = altMatch ? altMatch[1] : '';
  const className = classMatch ? classMatch[1] : '';
  const style = styleMatch ? styleMatch[1] : '';
  
  if (!src) {
    return null; // Skip if no src
  }

  // Add leading slash if not present and not a dynamic import
  if (!src.startsWith('/') && !src.startsWith('http') && !src.includes('{')) {
    src = '/' + src;
  }

  const filename = path.basename(src);
  const { width, height } = getImageDimensions(src, filename);
  const newAlt = generateAltText(alt, src);

  // Build the new Image tag
  let newTag = '<Image src="' + src + '"';
  newTag += ' alt="' + newAlt.replace(/"/g, '\\"') + '"';
  newTag += ' width={' + width + '}';
  newTag += ' height={' + height + '}';
  newTag += ' priority={false}';
  newTag += ' loading="lazy"';
  
  if (className) {
    newTag += ' className="' + className + '"';
  }
  
  if (style) {
    newTag += ' style={' + style + '}';
  }

  // Copy any other attributes (onClick, data-*, etc.)
  const otherAttrsMatch = imgTag.match(/\s((?:on[A-Z]\w+|data-[\w-]+)=["'{][^"'}]*["'}])/g);
  if (otherAttrsMatch) {
    otherAttrsMatch.forEach(attr => {
      newTag += ' ' + attr.trim();
    });
  }

  newTag += ' />';

  return newTag;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Find all <img tags
    const imgRegex = /<img[^>]*\/>/g;
    const imgTags = content.match(imgRegex);

    if (!imgTags || imgTags.length === 0) {
      return;
    }

    // Check if Image is already imported
    const hasImageImport = /import\s+Image\s+from\s+["']next\/image["']/.test(content);

    // Convert img tags
    let converted = 0;
    imgTags.forEach(imgTag => {
      // Skip if already an Image component
      if (imgTag.includes('<Image')) {
        return;
      }

      const newTag = convertImgTag(imgTag, content);
      if (newTag) {
        content = content.replace(imgTag, newTag);
        converted++;
      }
    });

    if (converted === 0) {
      return;
    }

    // Add Image import if needed
    if (!hasImageImport && converted > 0) {
      // Find the first import statement
      const importRegex = /^import\s+/m;
      if (importRegex.test(content)) {
        // Insert after the last import
        const lastImportMatch = content.match(/^import\s+.+?;$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const insertPoint = content.indexOf(lastImport) + lastImport.length;
          content = content.slice(0, insertPoint) + '\nimport Image from "next/image";' + content.slice(insertPoint);
        }
      } else {
        // No imports yet, add at the top after any comments/directives
        const firstLineEnd = content.indexOf('\n') || 0;
        content = 'import Image from "next/image";\n' + content;
      }
    }

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      imagesConverted += converted;
      console.log(`✓ ${filePath.replace(BASE_DIR, '')}: ${converted} image(s) converted`);
    }
  } catch (err) {
    errors.push(`${filePath}: ${err.message}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Image Conversion Script\n');

  DIRS_TO_SCAN.forEach(dir => {
    const dirPath = path.join(BASE_DIR, dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return;
    }

    // Recursively walk directory
    function walkDir(currentPath) {
      const files = fs.readdirSync(currentPath);

      files.forEach(file => {
        const filePath = path.join(currentPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Skip node_modules and hidden directories
          if (file !== 'node_modules' && !file.startsWith('.')) {
            walkDir(filePath);
          }
        } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
          processFile(filePath);
        }
      });
    }

    walkDir(dirPath);
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Files modified: ${filesModified}`);
  console.log(`✓ Images converted: ${imagesConverted}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${errors.length}`);
    errors.forEach(err => {
      console.log(`  - ${err}`);
    });
  } else {
    console.log(`✓ No errors encountered`);
  }
  
  console.log('='.repeat(60) + '\n');
}

main();
