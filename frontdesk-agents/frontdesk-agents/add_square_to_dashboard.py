import re
import sys

filepath = '/c/Users/juani/frontdesk-agents/src/app/customer/dashboard/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert handleSquareCheckout function after handlePlanSelect function
old_marker = '''  }

  return (
    <div className={'''

square_func = '''  }

  const handleSquareCheckout = async (planId: string) => {
    setIsLoadingCheckout(true)
    try {
      const response = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const data = await response.json()
      if (data.success) {
        alert('Square payment successful! Redirecting...')
        window.location.href = '/customer/dashboard'
      } else {
        alert('Square payment failed. Please try again.')
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  return (
    <div className={'''

if old_marker in content:
    content = content.replace(old_marker, square_func, 1)
    print('Step 1: handleSquareCheckout function added')
else:
    print('ERROR: Could not find insertion point for handleSquareCheckout')
    sys.exit(1)

# 2. Add Square payment button after each pricing card's Stripe button
# Pattern for closing of the button + div closing
# Find the pattern: end of the button, then closing divs, then end of the map function
# We insert a Square button before the final closing divs that end each card

# Let's find: </button> then </div> then </div> then </div> then ))}
# This appears once per plan card (3 times)

old_pattern = '''                </button>
                      </div>
                    </div>
                  </div>
                ))}'''

square_button = '''                </button>
                      <button
                        onClick={() => handleSquareCheckout(plan.id)}
                        disabled={isLoadingCheckout}
                        className={`w-full py-2 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                          plan.popular
                            ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                            : isDark ? 'border-white/20 text-white/70 hover:border-white/40' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        } disabled:opacity-50`}
                      >
                        {isLoadingCheckout ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            Pay with Card
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}'''

count = content.count(old_pattern)
if count > 0:
    # Replace all occurrences (one per plan card)
    content = content.replace(old_pattern, square_button)
    print(f'Step 2: Added Square payment buttons ({count} cards)')
else:
    print('WARNING: Step 2 pattern not found - trying alternative approach')
    # Try just the closing divs part
    alt_pattern = '''                    </div>
                  </div>
                ))}'''
    alt_replacement = '''                    </div>
                  </div>
                ))}'''
    if alt_pattern in content:
        print('Alternative pattern found')

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS: Square payment integration complete!')
