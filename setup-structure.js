// setup-structure.js
const fs = require('fs');
const path = require('path');

// ساختار درختی مورد نظر (پوشه‌ها و فایل‌های خالی)
const structure = {
  'src': {
    'app': {
      'api': {
        'transcribe': {
          'route.ts': '',
        },
        'structure': {
          'route.ts': '',
        },
      },
      'layout.tsx': '',
      'page.tsx': '',
      'globals.css': '',
    },
    'components': {
      'recorder': {
        'RecordButton.tsx': '',
        'Waveform.tsx': '',
      },
      'review': {
        'ApprovalList.tsx': '',
        'ItemCard.tsx': '',
      },
      'history': {
        'HistoryList.tsx': '',
      },
      'ui': {
        'Button.tsx': '',
        'Card.tsx': '',
        'Modal.tsx': '',
      },
    },
    'lib': {
      'ai': {
        'client.ts': '',
        'prompts.ts': '',
      },
      'storage': {
        'db.ts': '',
        'repository.ts': '',
      },
      'types': {
        'index.ts': '',
      },
      'utils': {
        'helpers.ts': '',
      },
    },
    'hooks': {
      'useRecorder.ts': '',
      'useItems.ts': '',
    },
    'stores': {
      'itemStore.ts': '',
    },
  },
  'public': {
    'icon-192.png': '', // بعداً خودت عکس بگذار
    'icon-512.png': '',
    'manifest.json': '',
  },
  '.env.local': '',
  'next.config.js': '',
  'tailwind.config.js': '',
  'tsconfig.json': '',
  'vercel.json': '',
  '.gitignore': '',
};

// تابع بازگشتی برای ساخت پوشه‌ها و فایل‌ها
function createStructure(basePath, struct) {
  for (const key in struct) {
    const fullPath = path.join(basePath, key);
    const value = struct[key];

    if (typeof value === 'string') {
      // فایل
      fs.writeFileSync(fullPath, value, 'utf8');
      console.log(`✅ فایل ایجاد شد: ${fullPath}`);
    } else if (typeof value === 'object' && value !== null) {
      // پوشه
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 پوشه ایجاد شد: ${fullPath}`);
      }
      createStructure(fullPath, value);
    }
  }
}

// شروع از پوشه‌ی جاری
createStructure(process.cwd(), structure);
console.log('🎯 ساختار پروژه با موفقیت ایجاد شد.');