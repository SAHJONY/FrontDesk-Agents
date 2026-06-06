#!/usr/bin/env python3
"""Fix apostrophe escaping in legal research TypeScript files."""
import re, sys, os

def fix_file(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    original = content
    
    # Step 1: collapse 2 backslashes into 1 (b'\\\\' -> b'\\')
    content = re.sub(b'\\\\\\\\', b'\\\\', content)
    
    # Step 2: collapse remaining backslash+apostrophe into just apostrophe
    content = re.sub(b"\\\\'", b"'", content)
    
    if content != original:
        with open(path, 'wb') as f:
            f.write(content)
        old_count = original.count(b"\\\\'")
        sys.stdout.write(f'{os.path.basename(path)}: fixed {old_count} occurrences\n')
    else:
        sys.stdout.write(f'{os.path.basename(path)}: no change\n')

base = 'src/lib/agents/legal-research'
for fname in ['case-law-research.ts', 'judge-analysis.ts', 'court-procedures.ts']:
    fix_file(f'{base}/{fname}')