## Purpose
Place all hardware folders here
Include any installation instructions if required.
Intended to speed up development and testing of hardware in VSCode.

## Usage
1. Install Arduino Community Edition and Wokwi Simulator extensions in VSCode.
2. Follow along the guides https://www.espboards.dev/blog/compile-esp32-arduino-core-projects-in-vscode/ and https://www.espboards.dev/blog/use-wokwi-in-vscode-esp32/  to setup extensions.
3. Use the new_project.bash script to create a new project
```bash
cd hardware
chmod +x new_project.bash
bash new_project.bash project_name
```
4. Start building.

## FAQ
### How to edit diagram.json?
Go to https://wokwi.com, draw it out and copy and paste over