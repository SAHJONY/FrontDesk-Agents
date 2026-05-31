import os, sys

# Determine target directory
script_dir = os.path.dirname(os.path.abspath(__file__))
target_dir = script_dir  # The nested path where write_file puts files

# Try the double-nested path (actual project root)
alt_dir = os.path.dirname(script_dir)  # Go up one level

for base_dir in [script_dir, alt_dir]:
    path = os.path.join(base_dir, 'src/app/customer/billing/page.tsx')
    if os.path.exists(path):
        print(f'Found file at: {path}')
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        changes = 0
        
        # Fix 1: Add getStatusColor function after getStatusIcon
        if 'function getStatusColor' not in content:
            old = 'function getBillingReasonLabel'
            new = """function getStatusColor(status: BillingRecord["status"]) {
  switch (status) {
    case "succeeded":
      return "text-green-400 bg-green-500/10 border-green-500/20"
    case "failed":
      return "text-red-400 bg-red-500/10 border-red-500/20"
    case "refunded":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    case "pending":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20"
  }
}

function getBillingReasonLabel"""
            if old in content:
                content = content.replace(old, new, 1)
                changes += 1
                print('Added getStatusColor function')
            else:
                print('WARNING: Could not find getBillingReasonLabel to insert after')
                # Try finding it differently
                idx = content.find('function getBillingReasonLabel')
                if idx > 0:
                    # Find the line before it
                    before = content.rfind('\n', 0, idx)
                    print(f'Found at index {before}-{idx}')
                    print(f'Context: {repr(content[before:idx+50])}')
        else:
            print('getStatusColor already exists')
        
        # Fix 2: Remove unused Filter import
        filter_import = 'Search, Filter,'
        if filter_import in content:
            content = content.replace(filter_import, 'Search,')
            changes += 1
            print('Removed unused Filter import')
        elif 'Search,' in content and 'Filter,' not in content:
            print('Filter already removed')
        else:
            print('Checking for Filter import in other patterns...')
            if 'Filter' in content:
                # Check in the import statement
                import_line = [l for l in content.split('\n') if 'Filter' in l]
                if import_line:
                    print(f'Filter found in: {import_line[0]}')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        verify = 'getStatusColor' in content and 'Filter,' not in content
        print(f'\nChanges applied: {changes}')
        print(f'Status verified: {"PASS" if verify else "FAIL"}')
        print(f'File size: {len(content)} bytes')
        sys.exit(0)

print('ERROR: Could not find billing page at any known path')
sys.exit(1)
