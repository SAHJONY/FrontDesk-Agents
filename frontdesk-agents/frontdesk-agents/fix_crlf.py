#!/usr/bin/env python3
"""Fix CRLF line endings in TypeScript files."""
import sys, os

def fix_file(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    original = content
    # Replace CRLF (\r\n) with LF (\n)
    fixed = content.replace(b'\r\n', b'\n')
    # Replace orphaned CR (\r not followed by \n) with LF
    fixed = fixed.replace(b'\r', b'\n')
    
    if fixed != content:
        with open(path, 'wb') as f:
            f.write(fixed)
        crlf = original.count(b'\r\n')
        cr = original.count(b'\r') - crlf
        sys.stdout.write(f'{os.path.basename(path)}: fixed {crlf} CRLF, {cr} CR\n')
    else:
        sys.stdout.write(f'{os.path.basename(path)}: clean\n')

base = 'src/lib/agents/legal-research'
for fname in ['types.ts', 'case-law-research.ts', 'judge-analysis.ts', 'court-procedures.ts']:
    fix_file(f'{base}/{fname}')

api_base = 'src/app/api/legal'
for subdir in ['judge-analysis', 'case-law', 'court-analysis']:
    fix_file(f'{api_base}/{subdir}/route.ts')

fix_file('src/lib/agents/receptionist-agents.ts')
fix_file('src/app/api/analytics/vertical-outcomes/route.ts')