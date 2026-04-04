import shutil
import os
from datetime import datetime

# Define absolute or relative paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'instance', 'app.db')
BACKUP_DIR = os.path.join(BASE_DIR, 'backups')

def backup_database():
    # Make sure the backup directory exists
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    # Check if the database actually exists before backing up
    if not os.path.exists(DB_PATH):
        print(f"Error: Could not find database at {DB_PATH}")
        return

    # Generate a timestamped backup name
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    backup_filename = f"app_db_backup_{timestamp}.sqlite3"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    try:
        # Copy the file
        shutil.copy2(DB_PATH, backup_path)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Success: Database backed up to {backup_path}")
        
        # Optional: Delete backups older than 7 days to save space!
        clean_old_backups(days_to_keep=7)
        
    except Exception as e:
        print(f"Error during backup: {e}")

def clean_old_backups(days_to_keep):
    current_time = datetime.now().timestamp()
    
    for filename in os.listdir(BACKUP_DIR):
        filepath = os.path.join(BACKUP_DIR, filename)
        
        if os.path.isfile(filepath):
            file_creation_time = os.path.getctime(filepath)
            
            # If the file is older than days_to_keep
            if (current_time - file_creation_time) > (days_to_keep * 86400):
                os.remove(filepath)
                print(f"Removed old backup: {filename}")

if __name__ == "__main__":
    backup_database()
