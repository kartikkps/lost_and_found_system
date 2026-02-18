try:
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy
    print("Imports successful")
except ImportError as e:
    print(f"Import failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
