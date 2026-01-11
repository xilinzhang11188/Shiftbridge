"""
Automated script to convert PostgreSQL ARRAY types to SQLite-compatible JSON types
Run this script to make the backend compatible with SQLite
"""
import os
import re

def fix_file(filepath, replacements):
    """Apply replacements to a file"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Apply each replacement
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath}")
        return True
    else:
        print(f"  - No changes needed in {filepath}")
        return False

def main():
    print("="*60)
    print("ShiftBridge SQLite Compatibility Fix")
    print("="*60)
    print("\nThis script will convert ARRAY types to JSON for SQLite compatibility.\n")
    
    # Get the app directory
    app_dir = os.path.join(os.path.dirname(__file__), 'app', 'models')
    
    changes_made = False
    
    # Fix user.py
    user_file = os.path.join(app_dir, 'user.py')
    user_replacements = [
        # Add JSON import if not present
        (r'from sqlalchemy import (Column[^)]+)\n', 
         r'from sqlalchemy import \1, JSON\n'),
        # Remove ARRAY from imports if present
        (r', ARRAY', ''),
        # Fix Client.requested_services
        (r'requested_services = Column\(ARRAY\(Integer\), default=\[\]\)',
         'requested_services = Column(JSON, default=list)'),
        # Fix Worker.licensed_states
        (r'licensed_states = Column\(ARRAY\(String\), nullable=False\)',
         'licensed_states = Column(JSON, nullable=False)'),
        # Fix Worker.services_offered
        (r'services_offered = Column\(ARRAY\(Integer\), nullable=False\)',
         'services_offered = Column(JSON, nullable=False)'),
    ]
    if fix_file(user_file, user_replacements):
        changes_made = True
    
    # Fix site.py
    site_file = os.path.join(app_dir, 'site.py')
    site_replacements = [
        # Add JSON import if not present
        (r'from sqlalchemy import (Column[^)]+)\n',
         r'from sqlalchemy import \1, JSON\n'),
        # Remove ARRAY from imports if present
        (r', ARRAY', ''),
        # Fix Site.services_available
        (r'services_available = Column\(ARRAY\(Integer\), default=\[\]\)',
         'services_available = Column(JSON, default=list)'),
    ]
    if fix_file(site_file, site_replacements):
        changes_made = True
    
    # Fix shift.py
    shift_file = os.path.join(app_dir, 'shift.py')
    shift_replacements = [
        # Add JSON import if not present
        (r'from sqlalchemy import (Column[^)]+)\n',
         r'from sqlalchemy import \1, JSON\n'),
        # Remove ARRAY from imports if present
        (r', ARRAY', ''),
        # Fix Shift.service_ids
        (r'service_ids = Column\(ARRAY\(Integer\), nullable=False\)',
         'service_ids = Column(JSON, nullable=False)'),
    ]
    if fix_file(shift_file, shift_replacements):
        changes_made = True
    
    print("\n" + "="*60)
    if changes_made:
        print("✓ Conversion complete!")
        print("\nNext steps:")
        print("1. Delete old database: del shiftbridge.db")
        print("2. Run the application: python main.py")
        print("3. Seed the database: python seed_data.py")
    else:
        print("✓ All files are already SQLite-compatible!")
    print("="*60)

if __name__ == "__main__":
    main()