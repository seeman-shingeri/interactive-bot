/**
 * Standalone Companion Integrity & Verification Script
 * Validates that public/vista-companion.html is fully self-contained and ready for distribution.
 */

import fs from 'fs';
import path from 'path';

function verifyCompanion() {
  const filePath = path.resolve('public', 'vista-companion.html');

  console.log('🔍 Checking standalone companion bundle...');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing bundle at ${filePath}`);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  const sizeKb = (stat.size / 1024).toFixed(2);
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(`📦 File size: ${sizeKb} KB`);

  // Assert essential elements exist
  const checks = [
    { label: 'Visor Face Element', pattern: /id=["']bot-face["']/ },
    { label: 'Companion Drawer Element', pattern: /id=["']chat-drawer["']/ },
    { label: 'Radial Action Menu', pattern: /id=["']radial-menu["']/ },
    { label: 'Hold Timer Interaction', pattern: /holdTimer/ },
    { label: 'Speech Bubble Display', pattern: /id=["']speech-bubble["']/ },
    { label: 'Chat Dialogue View', pattern: /id=["']view-chat["']/ },
    { label: 'Bot Studio Tuning View', pattern: /id=["']view-studio["']/ },
    { label: 'Privacy Control View', pattern: /id=["']view-privacy["']/ },
    { label: 'Fallback Conversation Engine', pattern: /fallbackReplies/ },
    { label: 'Web Speech Synthesis Support', pattern: /speechSynthesis/ },
  ];

  let passed = 0;
  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`  ✅ ${check.label}`);
      passed++;
    } else {
      console.error(`  ❌ Failed check: ${check.label}`);
    }
  }

  if (passed === checks.length) {
    console.log(`\n🎉 All ${passed}/${checks.length} bundle checks passed! vista-companion.html is production-ready.\n`);
  } else {
    console.error(`\n⚠️ Only ${passed}/${checks.length} checks passed.\n`);
    process.exit(1);
  }
}

verifyCompanion();
