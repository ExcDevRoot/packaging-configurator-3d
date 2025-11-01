#!/usr/bin/env python3
import re

# Read the file
with open('client/src/data/templates.ts', 'r') as f:
    content = f.read()

# Define the replacement pattern - match the entire labelTransform block
old_pattern = r'labelTransform: \{[^}]*logo:[^}]*\},[^}]*productName:[^}]*\},[^}]*description:[^}]*\},[^}]*ingredients:[^}]*\},[^}]*volume:[^}]*\},\s*\}'

new_transform = '''labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      }'''

# Replace all occurrences
content = re.sub(old_pattern, new_transform, content, flags=re.MULTILINE | re.DOTALL)

# Write back
with open('client/src/data/templates.ts', 'w') as f:
    f.write(content)

print("Fixed templates.ts with logo + textGroup structure")
