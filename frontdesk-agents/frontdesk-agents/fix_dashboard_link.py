import os, sys

# Find the correct project root
cwd = os.getcwd()
candidates = [
    cwd,
    os.path.join(cwd, 'frontdesk-agents'),
    os.path.dirname(cwd),
]

for base in candidates:
    path = os.path.join(base, 'src/app/customer/dashboard/page.tsx')
    if os.path.exists(path):
        print(f'Found dashboard at: {path}')
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add Billing History link after Export CSV button
        old = '''              </button>
              <div className="w-px h-5 bg-white/10" />
              <button'''
        
        new = '''              </button>
              <Link
                href="/customer/billing"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap"
                title="View Billing History"
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Billing</span>
              </Link>
              <div className="w-px h-5 bg-white/10" />
              <button'''
        
        if old in content:
            # Check if already added
            if 'Billing</span>' in content:
                print('Billing link already exists, skipping')
            else:
                content = content.replace(old, new, 1)
                # Add Receipt import if needed
                if 'Receipt,' not in content:
                    content = content.replace(
                        '  Download, RefreshCw, DollarSign,',
                        '  Download, RefreshCw, DollarSign, Receipt,'
                    )
                    print('Added Receipt import')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print('Billing history link added successfully')
        else:
            print('WARNING: Could not find insertion point')
            idx = content.find('</button>\n              <div className="w-px h-5')
            if idx > 0:
                print(f'Found at offset {idx}')
                print(f'Context: {repr(content[idx:idx+100])}')
        
        # Verify
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'href="/customer/billing"' in content:
            print('VERIFIED: Link is present')
        else:
            print('FAILED: Link not found after write')
        
        sys.exit(0)

print('ERROR: Could not find dashboard page')
sys.exit(1)
