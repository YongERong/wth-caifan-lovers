#!/bin/bash

# Usage: ./new_project.bash <project_name>

if [ "$#" -ne 1 ]; then
    echo "Usage: $(basename "$0") <project_name>"
    exit 1
fi

project_name="$1"

# Duplicate template directory and enter it
cp -r template "$project_name"
cd "$project_name"

# Rename paths in files
sed -i '' "s/\[name\]/${project_name}/g" wokwi.toml .vscode/arduino.json README.md

# Rename files
mv template.ino "$project_name.ino"



