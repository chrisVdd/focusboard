#!/bin/bash

# Clear the terminal for a clean output
clear

echo "========================================="
echo " 🚀 Focusboard Release Manager"
echo "========================================="

# Fetch local branches for reference (optional, keeps the user informed)
git fetch --all --quiet

# Prompt the user for the target branch, defaulting to 'main'
read -p "Enter the branch name to deploy [default: main]: " TARGET_BRANCH
TARGET_BRANCH=${TARGET_BRANCH:-main}

echo "-----------------------------------------"
echo "[INFO] Preparing to trigger deployment..."
echo "[INFO] Target Branch: $TARGET_BRANCH"
echo "-----------------------------------------"

# Use GitHub CLI to trigger the workflow on the specified branch
gh workflow run deploy.yml --ref "$TARGET_BRANCH"

# Check the exit status of the GitHub CLI command
if [ $? -eq 0 ]; then
    echo "[SUCCESS] Deployment pipeline triggered successfully!"
    echo "[INFO] You can monitor the progress here:"
    echo "👉 https://github.com/chrisVdd/focusboard/actions"
else
    echo "[ERROR] Failed to trigger deployment."
    echo "[HINT] Please ensure the GitHub CLI (gh) is installed and authenticated."
fi

echo "========================================="