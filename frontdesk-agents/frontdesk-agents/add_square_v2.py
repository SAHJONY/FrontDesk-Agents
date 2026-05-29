import re

filepath = 'src/app/customer/dashboard/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the exact pattern: closing button tag, then closing divs, then end of map
old = '''                       </button>
                     </div>
                   ))}
                 </div>
                 <p className={`text-center text-sm'''

square = '''                       </button>
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
                          <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
                        ) : (
                          <><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> Pay with Card</>
                        )}
                      </button>
                     </div>
                   ))}
                 </div>
                 <p className={`text-center text-sm'''

if old in content:
    count = content.count(old)
    content = content.replace(old, square, count)
    print(f'Added Square buttons to {count} plan cards')
else:
    print('ERROR: Pattern not found')
    print('First 80 chars of pattern:', repr(old[:80]))
    exit(1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS')
