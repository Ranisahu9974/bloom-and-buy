#!/usr/bin/env bash
# exit on error
set -o errexit

# Install setuptools first to handle pkg_resources dependencies (like razorpay)
pip install setuptools

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
