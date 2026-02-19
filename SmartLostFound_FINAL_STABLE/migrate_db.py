import sqlite3
import os

db_path = 'database.db'

def migrate():
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE user ADD COLUMN profile_image TEXT")
        conn.commit()
        print("Successfully added profile_image column to user table.")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e):
            print("Column profile_image already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
