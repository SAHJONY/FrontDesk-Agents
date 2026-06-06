#!/usr/bin/env python3
"""Fix line endings in legal research TypeScript files - replace CRLF with LF."""
import sys, os

def fix_file(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    # Replace CRLF (\r\n) with LF (\n)
    fixed = content.replace(b'\r\n', b'\n')
    # Also replace orphaned CR (\r not followed by \n) with LF
    # Only when it's at the end of a logical line (before \n or at EOF)
    # Simple approach: replace all \r with \n
    fixed = fixed.replace(b'\r', b'\n')
    
    if fixed != content:
        with open(path, 'wb') as f:
            f.write(fixed)
        crlf_count = content.count(b'\r\n')
        cr_count = content.count(b'\r') - crlf_count
        sys.stdout.write(f'{os.path.basename(path)}: fixed {crlf_count} CRLF, {cr_count} CR\n')
    else:
        sys.stdout.write(f'{os.path.basename(path)}: no change\n')

base = 'src/lib/agents/legal-research'
for fname in ['types.ts', 'case-law-research.ts', 'judge-analysis.ts', 'court-procedures.ts']:
    fix_file(f'{base}/{fname}')

# Also fix the API routes
for fname in ['judge-analysis.ts', 'case-law.ts', 'court-analysis.ts']:
    fix_file(f'src/app/api/legal/{fname}/route.ts')