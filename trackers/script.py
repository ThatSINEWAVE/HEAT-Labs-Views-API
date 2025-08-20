import os

# Get the folder where the script is located
folder_path = os.path.dirname(os.path.abspath(__file__))

# Iterate over all files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".png") and "heatlabs" in filename:
        new_name = filename.replace("heatlabs", "pcwstats")
        old_path = os.path.join(folder_path, filename)
        new_path = os.path.join(folder_path, new_name)
        os.rename(old_path, new_path)
        print(f"Renamed: {filename} -> {new_name}")

print("Done!")
