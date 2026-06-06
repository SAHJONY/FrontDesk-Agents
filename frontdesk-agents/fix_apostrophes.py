#!/usr/bin/env python3
"""Fix apostrophe escaping in legal research TypeScript files."""
import re, sys, os

def fix_file(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    original = content
    
    # The file has \\\\ (two backslashes) before apostrophes
    # We want to replace \\\\ + ' with just '
    # Pattern: 2 backslashes followed by apostrophe -> just apostrophe
    # In regex bytes: b'\\\\\\\\' (4 backslashes in source = 2 in file) + b"'" -> b"'"
    
    # Step 1: collapse 2 backslashes into 1 (b'\\\\' -> b'\\')
    content = re.sub(b'\\\\\\\\', b'\\\\', content)
    
    # Step 2: collapse remaining backslash+apostrophe into just apostrophe
    # b'\\' + b"'" -> b"'"
    content = re.sub(b"\\\\'", b"'", content)
    
    if content != original:
        with open(path, 'wb') as f:
            f.write(content)
        # Count replacements
        old_count = len(re.findall(b"\\\\\\\\'", original))
        sys.stdout.write(f'{os.path.basename(path)}: fixed {old_count} occurrences\n')
    else:
        sys.stdout.write(f'{os.path.basename(path)}: no change\n')

base = 'src/lib/agents/legal-research'
for fname in ['case-law-research.ts', 'judge-analysis.ts', 'court-procedures.ts']:
    fix_file(f'{base}/{fname}')