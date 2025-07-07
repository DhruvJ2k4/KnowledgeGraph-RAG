import os

def create_directory(path: str):
    """Creates a directory if it doesn't exist."""
    try:
        os.makedirs(path, exist_ok=True)
        print(f"Directory '{path}' created successfully.")
    except Exception as e:
        print(f"Error creating directory '{path}': {e}")

def save_file(filepath: str, content: bytes):
    """Saves content to a file."""
    try:
        with open(filepath, 'wb') as f:
            f.write(content)
        print(f"File '{filepath}' saved successfully.")
    except Exception as e:
        print(f"Error saving file '{filepath}': {e}")

def delete_file(filepath: str):
    """Deletes a file."""
    try:
        os.remove(filepath)
        print(f"File '{filepath}' deleted successfully.")
    except Exception as e:
        print(f"Error deleting file '{filepath}': {e}")